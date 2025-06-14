import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:receipt_scanner_flutter/providers/language_provider.dart';
import 'package:receipt_scanner_flutter/providers/budget_provider.dart';
import 'package:receipt_scanner_flutter/providers/receipt_provider.dart';
import 'package:receipt_scanner_flutter/models/category.dart';
import 'package:receipt_scanner_flutter/utils/currency_formatter.dart';

class BudgetScreen extends StatefulWidget {
  const BudgetScreen({super.key});

  @override
  State<BudgetScreen> createState() => _BudgetScreenState();
}

class _BudgetScreenState extends State<BudgetScreen> {
  DateTime _selectedMonth = DateTime.now();
  bool _isEditing = false;
  final Map<String, TextEditingController> _controllers = {};

  @override
  void dispose() {
    for (final controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  String get _monthKey {
    return '${_selectedMonth.year}-${_selectedMonth.month.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final languageProvider = Provider.of<LanguageProvider>(context);
    final budgetProvider = Provider.of<BudgetProvider>(context);
    final receiptProvider = Provider.of<ReceiptProvider>(context);
    final categories = CategoryService.getDefaultCategories();

    final currentBudget = budgetProvider.getBudgetForMonth(_monthKey);
    final totalBudget = budgetProvider.getTotalBudgetForMonth(_monthKey);
    final monthlySpending = receiptProvider.getMonthlySpending(_selectedMonth);

    return Scaffold(
      appBar: AppBar(
        title: Text(languageProvider.translate('budget')),
        actions: [
          if (_isEditing)
            TextButton(
              onPressed: _saveBudget,
              child: Text(languageProvider.translate('save')),
            )
          else
            IconButton(
              onPressed: () {
                setState(() {
                  _isEditing = true;
                });
                _initializeControllers(currentBudget, categories);
              },
              icon: const Icon(LucideIcons.edit),
            ),
        ],
      ),
      body: Column(
        children: [
          // Month Selector
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  onPressed: () {
                    setState(() {
                      _selectedMonth = DateTime(
                        _selectedMonth.year,
                        _selectedMonth.month - 1,
                      );
                    });
                  },
                  icon: const Icon(LucideIcons.chevronLeft),
                ),
                Column(
                  children: [
                    Text(
                      _getMonthName(_selectedMonth),
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (_isCurrentMonth())
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.primary,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          'Current',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                  ],
                ),
                IconButton(
                  onPressed: () {
                    setState(() {
                      _selectedMonth = DateTime(
                        _selectedMonth.year,
                        _selectedMonth.month + 1,
                      );
                    });
                  },
                  icon: const Icon(LucideIcons.chevronRight),
                ),
              ],
            ),
          ),
          
          // Budget Summary
          Card(
            margin: const EdgeInsets.all(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Text(
                    'Total Monthly Budget',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        CurrencyFormatter.format(monthlySpending),
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        ' / ${CurrencyFormatter.format(totalBudget)}',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  LinearProgressIndicator(
                    value: totalBudget > 0 ? (monthlySpending / totalBudget).clamp(0.0, 1.0) : 0.0,
                    backgroundColor: Colors.grey[300],
                    valueColor: AlwaysStoppedAnimation<Color>(
                      _getProgressColor(monthlySpending, totalBudget),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    totalBudget > 0 
                        ? '${((monthlySpending / totalBudget) * 100).toStringAsFixed(1)}% used'
                        : 'No budget set',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Categories List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: categories.length,
              itemBuilder: (context, index) {
                final category = categories[index];
                final budgetItem = currentBudget.firstWhere(
                  (item) => item.categoryId == category.id,
                  orElse: () => BudgetItem(categoryId: category.id, amount: 0),
                );
                
                final categorySpending = receiptProvider.receipts
                    .where((receipt) => 
                        receipt.category == category.id &&
                        receipt.date.year == _selectedMonth.year &&
                        receipt.date.month == _selectedMonth.month)
                    .fold(0.0, (sum, receipt) => sum + receipt.totalAmount);

                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: category.color.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Center(
                                child: Text(
                                  category.icon,
                                  style: const TextStyle(fontSize: 18),
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    category.name,
                                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  Text(
                                    '${CurrencyFormatter.format(categorySpending)} / ${CurrencyFormatter.format(budgetItem.amount)}',
                                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            if (_isEditing)
                              SizedBox(
                                width: 100,
                                child: TextFormField(
                                  controller: _controllers[category.id],
                                  decoration: const InputDecoration(
                                    prefixText: '\$',
                                    border: OutlineInputBorder(),
                                    contentPadding: EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 8,
                                    ),
                                  ),
                                  keyboardType: TextInputType.number,
                                  textAlign: TextAlign.right,
                                ),
                              )
                            else
                              Text(
                                budgetItem.amount > 0 
                                    ? '${((categorySpending / budgetItem.amount) * 100).toStringAsFixed(0)}%'
                                    : '0%',
                                style: TextStyle(
                                  color: _getProgressColor(categorySpending, budgetItem.amount),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                          ],
                        ),
                        if (budgetItem.amount > 0) ...[
                          const SizedBox(height: 12),
                          LinearProgressIndicator(
                            value: (categorySpending / budgetItem.amount).clamp(0.0, 1.0),
                            backgroundColor: Colors.grey[300],
                            valueColor: AlwaysStoppedAnimation<Color>(
                              _getProgressColor(categorySpending, budgetItem.amount),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _initializeControllers(List<BudgetItem> currentBudget, List<Category> categories) {
    _controllers.clear();
    for (final category in categories) {
      final budgetItem = currentBudget.firstWhere(
        (item) => item.categoryId == category.id,
        orElse: () => BudgetItem(categoryId: category.id, amount: 0),
      );
      _controllers[category.id] = TextEditingController(
        text: budgetItem.amount > 0 ? budgetItem.amount.toStringAsFixed(0) : '',
      );
    }
  }

  Future<void> _saveBudget() async {
    final budgetProvider = Provider.of<BudgetProvider>(context, listen: false);
    final categories = CategoryService.getDefaultCategories();
    
    final budgetItems = categories.map((category) {
      final controller = _controllers[category.id];
      final amount = double.tryParse(controller?.text ?? '') ?? 0.0;
      return BudgetItem(categoryId: category.id, amount: amount);
    }).toList();

    await budgetProvider.setBudgetForMonth(_monthKey, budgetItems);
    
    setState(() {
      _isEditing = false;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Budget saved successfully!'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  String _getMonthName(DateTime date) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return '${months[date.month - 1]} ${date.year}';
  }

  bool _isCurrentMonth() {
    final now = DateTime.now();
    return _selectedMonth.year == now.year && _selectedMonth.month == now.month;
  }

  Color _getProgressColor(double spent, double budget) {
    if (budget == 0) return Colors.grey;
    final percentage = spent / budget;
    if (percentage >= 1.0) return Colors.red;
    if (percentage >= 0.8) return Colors.orange;
    return Colors.green;
  }
}