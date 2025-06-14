import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:receipt_scanner_flutter/providers/language_provider.dart';
import 'package:receipt_scanner_flutter/providers/receipt_provider.dart';
import 'package:receipt_scanner_flutter/models/receipt.dart';
import 'package:receipt_scanner_flutter/models/category.dart';
import 'package:receipt_scanner_flutter/utils/currency_formatter.dart';

class ManualEntryScreen extends StatefulWidget {
  const ManualEntryScreen({super.key});

  @override
  State<ManualEntryScreen> createState() => _ManualEntryScreenState();
}

class _ManualEntryScreenState extends State<ManualEntryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _companyController = TextEditingController();
  final _notesController = TextEditingController();
  
  DateTime _selectedDate = DateTime.now();
  String _selectedCategory = 'shopping';
  List<ReceiptItem> _items = [
    ReceiptItem(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: '',
      price: 0.0,
      quantity: 1,
    ),
  ];
  
  bool _pricesIncludeTax = false;
  bool _isLoading = false;

  @override
  void dispose() {
    _companyController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _addItem() {
    setState(() {
      _items.add(
        ReceiptItem(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          name: '',
          price: 0.0,
          quantity: 1,
        ),
      );
    });
  }

  void _removeItem(int index) {
    if (_items.length > 1) {
      setState(() {
        _items.removeAt(index);
      });
    }
  }

  double _calculateSubtotal() {
    double total = _items.fold(0.0, (sum, item) => sum + (item.price * item.quantity));
    
    if (_pricesIncludeTax) {
      // Remove taxes from total to get subtotal
      return total / 1.14975; // 1 + 0.05 + 0.09975
    }
    
    return total;
  }

  double _calculateTPS() {
    return _calculateSubtotal() * 0.05;
  }

  double _calculateTVQ() {
    return _calculateSubtotal() * 0.09975;
  }

  double _calculateTotal() {
    return _calculateSubtotal() + _calculateTPS() + _calculateTVQ();
  }

  Future<void> _saveReceipt() async {
    if (!_formKey.currentState!.validate()) return;
    
    // Check if at least one item has a name and price
    final validItems = _items.where((item) => 
      item.name.isNotEmpty && item.price > 0
    ).toList();
    
    if (validItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please add at least one item with a name and price'),
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final receipt = Receipt(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        company: _companyController.text.trim(),
        date: _selectedDate,
        items: validItems,
        subtotal: _calculateSubtotal(),
        taxes: Taxes(
          tps: _calculateTPS(),
          tvq: _calculateTVQ(),
        ),
        totalAmount: _calculateTotal(),
        category: _selectedCategory,
        notes: _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
        metadata: ReceiptMetadata(
          processedAt: DateTime.now(),
          ocrEngine: 'manual',
          version: '1.0',
          confidence: 1.0,
        ),
      );

      await Provider.of<ReceiptProvider>(context, listen: false).addReceipt(receipt);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Receipt saved successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        context.go('/');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error saving receipt: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final languageProvider = Provider.of<LanguageProvider>(context);
    final categories = CategoryService.getDefaultCategories();

    return Scaffold(
      appBar: AppBar(
        title: Text(languageProvider.translate('add_receipt')),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => context.go('/'),
        ),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // General Information Section
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'General Information',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      // Date Picker
                      ListTile(
                        leading: const Icon(LucideIcons.calendar),
                        title: Text(languageProvider.translate('date')),
                        subtitle: Text(
                          '${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}',
                        ),
                        onTap: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: _selectedDate,
                            firstDate: DateTime(2020),
                            lastDate: DateTime.now(),
                          );
                          if (date != null) {
                            setState(() {
                              _selectedDate = date;
                            });
                          }
                        },
                      ),
                      
                      const SizedBox(height: 16),
                      
                      // Store Name
                      TextFormField(
                        controller: _companyController,
                        decoration: InputDecoration(
                          labelText: languageProvider.translate('store_name'),
                          border: const OutlineInputBorder(),
                          prefixIcon: const Icon(LucideIcons.store),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Please enter the store name';
                          }
                          return null;
                        },
                      ),
                      
                      const SizedBox(height: 16),
                      
                      // Category Selection
                      Text(
                        languageProvider.translate('category'),
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                      const SizedBox(height: 8),
                      SizedBox(
                        height: 60,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: categories.length,
                          itemBuilder: (context, index) {
                            final category = categories[index];
                            final isSelected = _selectedCategory == category.id;
                            
                            return Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: FilterChip(
                                selected: isSelected,
                                label: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(category.icon),
                                    const SizedBox(width: 4),
                                    Text(category.name),
                                  ],
                                ),
                                onSelected: (selected) {
                                  setState(() {
                                    _selectedCategory = category.id;
                                  });
                                },
                                selectedColor: category.color.withOpacity(0.3),
                                checkmarkColor: category.color,
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 16),
              
              // Items Section
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            languageProvider.translate('items'),
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          TextButton.icon(
                            onPressed: _addItem,
                            icon: const Icon(LucideIcons.plus),
                            label: Text(languageProvider.translate('add_item')),
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 16),
                      
                      // Tax Toggle
                      SwitchListTile(
                        title: const Text('Prices include tax'),
                        value: _pricesIncludeTax,
                        onChanged: (value) {
                          setState(() {
                            _pricesIncludeTax = value;
                          });
                        },
                      ),
                      
                      const SizedBox(height: 16),
                      
                      // Items List
                      ...List.generate(_items.length, (index) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: Row(
                            children: [
                              // Item Name
                              Expanded(
                                flex: 2,
                                child: TextFormField(
                                  initialValue: _items[index].name,
                                  decoration: InputDecoration(
                                    labelText: languageProvider.translate('item_name'),
                                    border: const OutlineInputBorder(),
                                  ),
                                  onChanged: (value) {
                                    setState(() {
                                      _items[index] = ReceiptItem(
                                        id: _items[index].id,
                                        name: value,
                                        price: _items[index].price,
                                        quantity: _items[index].quantity,
                                      );
                                    });
                                  },
                                ),
                              ),
                              
                              const SizedBox(width: 8),
                              
                              // Price
                              Expanded(
                                child: TextFormField(
                                  initialValue: _items[index].price == 0 ? '' : _items[index].price.toString(),
                                  decoration: InputDecoration(
                                    labelText: languageProvider.translate('price'),
                                    border: const OutlineInputBorder(),
                                    prefixText: '\$',
                                  ),
                                  keyboardType: TextInputType.number,
                                  onChanged: (value) {
                                    setState(() {
                                      _items[index] = ReceiptItem(
                                        id: _items[index].id,
                                        name: _items[index].name,
                                        price: double.tryParse(value) ?? 0.0,
                                        quantity: _items[index].quantity,
                                      );
                                    });
                                  },
                                ),
                              ),
                              
                              const SizedBox(width: 8),
                              
                              // Quantity
                              SizedBox(
                                width: 60,
                                child: TextFormField(
                                  initialValue: _items[index].quantity.toString(),
                                  decoration: const InputDecoration(
                                    labelText: 'Qty',
                                    border: OutlineInputBorder(),
                                  ),
                                  keyboardType: TextInputType.number,
                                  onChanged: (value) {
                                    setState(() {
                                      _items[index] = ReceiptItem(
                                        id: _items[index].id,
                                        name: _items[index].name,
                                        price: _items[index].price,
                                        quantity: int.tryParse(value) ?? 1,
                                      );
                                    });
                                  },
                                ),
                              ),
                              
                              // Remove Button
                              if (_items.length > 1)
                                IconButton(
                                  onPressed: () => _removeItem(index),
                                  icon: const Icon(LucideIcons.trash2),
                                  color: Colors.red,
                                ),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 16),
              
              // Summary Section
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Summary',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      _buildSummaryRow(
                        languageProvider.translate('subtotal'),
                        CurrencyFormatter.format(_calculateSubtotal()),
                      ),
                      _buildSummaryRow(
                        languageProvider.translate('tps'),
                        CurrencyFormatter.format(_calculateTPS()),
                      ),
                      _buildSummaryRow(
                        languageProvider.translate('tvq'),
                        CurrencyFormatter.format(_calculateTVQ()),
                      ),
                      const Divider(),
                      _buildSummaryRow(
                        languageProvider.translate('total'),
                        CurrencyFormatter.format(_calculateTotal()),
                        isTotal: true,
                      ),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 16),
              
              // Notes Section
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: TextFormField(
                    controller: _notesController,
                    decoration: const InputDecoration(
                      labelText: 'Notes (optional)',
                      border: OutlineInputBorder(),
                      alignLabelWithHint: true,
                    ),
                    maxLines: 3,
                  ),
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Save Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _saveReceipt,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.all(16),
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator()
                      : Text(
                          languageProvider.translate('save'),
                          style: const TextStyle(fontSize: 16),
                        ),
                ),
              ),
              
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              color: isTotal ? Theme.of(context).colorScheme.primary : null,
            ),
          ),
        ],
      ),
    );
  }
}