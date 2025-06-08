import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { Receipt } from '@/app/lib/types';
import { categories } from '@/app/lib/categories';

interface ReceiptFormProps {
  receipt: Receipt;
  onUpdate: (receipt: Receipt) => void;
}

const DEFAULT_ITEM = { name: '', quantity: 1, price: 0 };

export default function ReceiptForm({ receipt, onUpdate }: ReceiptFormProps) {
  const updateField = <K extends keyof Receipt>(field: K, value: Receipt[K]) => {
    onUpdate({
      ...receipt,
      [field]: value,
    });
  };

  const updateItem = (index: number, field: keyof Receipt['items'][0], value: any) => {
    const updatedItems = [...receipt.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'price' || field === 'quantity' ? Number(value) : value,
    };
    updateField('items', updatedItems);

    // Recalculer les totaux
    const subtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    updateField('subtotal', subtotal);
    updateField('totalAmount', subtotal + (receipt.tax || 0));
  };

  const updateTax = (value: string) => {
    const tax = Number(value) || 0;
    updateField('tax', tax);
    updateField('totalAmount', receipt.subtotal + tax);
  };

  const addItem = () => {
    updateField('items', [...receipt.items, { ...DEFAULT_ITEM }]);
  };

  const removeItem = (index: number) => {
    const updatedItems = receipt.items.filter((_, i) => i !== index);
    updateField('items', updatedItems);
    
    // Recalculer les totaux
    const subtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    updateField('subtotal', subtotal);
    updateField('totalAmount', subtotal + (receipt.tax || 0));
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            mode="outlined"
            value={new Date(receipt.date).toISOString().split('T')[0]}
            onChangeText={(value) => updateField('date', value)}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Magasin</Text>
          <TextInput
            mode="outlined"
            value={receipt.storeName}
            onChangeText={(value) => updateField('storeName', value)}
            placeholder="Nom du magasin"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Catégorie</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScrollView}
          >
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    receipt.category === category.id && styles.categoryButtonSelected
                  ]}
                  onPress={() => updateField('category', category.id)}
                >
                  <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                  <Text style={[
                    styles.categoryButtonText,
                    receipt.category === category.id && styles.categoryButtonTextSelected
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Articles</Text>
            <TouchableOpacity onPress={addItem} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>
          
          {receipt.items.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <View style={styles.itemInputs}>
                <TextInput
                  mode="outlined"
                  style={styles.itemNameInput}
                  value={item.name}
                  onChangeText={(value) => updateItem(index, 'name', value)}
                  placeholder="Nom de l'article"
                />
                <TextInput
                  mode="outlined"
                  style={styles.itemPriceInput}
                  value={item.price.toString()}
                  onChangeText={(value) => updateItem(index, 'price', value)}
                  keyboardType="numeric"
                  placeholder="Prix"
                />
                <TextInput
                  mode="outlined"
                  style={styles.itemQuantityInput}
                  value={item.quantity.toString()}
                  onChangeText={(value) => updateItem(index, 'quantity', value)}
                  keyboardType="numeric"
                  placeholder="Qté"
                />
              </View>
              <TouchableOpacity 
                onPress={() => removeItem(index)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Taxes</Text>
          <TextInput
            mode="outlined"
            value={receipt.tax?.toString() || '0'}
            onChangeText={updateTax}
            keyboardType="numeric"
            placeholder="0.00"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            mode="outlined"
            value={receipt.notes}
            onChangeText={(value) => updateField('notes', value)}
            placeholder="Notes additionnelles"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total</Text>
            <Text style={styles.totalValue}>{receipt.subtotal.toFixed(2)} CAD</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Taxes</Text>
            <Text style={styles.totalValue}>{(receipt.tax || 0).toFixed(2)} CAD</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{receipt.totalAmount.toFixed(2)} CAD</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  categoryScrollView: {
    marginHorizontal: -16,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#007AFF',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#000000',
  },
  categoryButtonTextSelected: {
    color: '#FFFFFF',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInputs: {
    flex: 1,
    flexDirection: 'row',
  },
  itemNameInput: {
    flex: 2,
    marginRight: 8,
  },
  itemPriceInput: {
    flex: 1,
    marginRight: 8,
  },
  itemQuantityInput: {
    width: 80,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666666',
  },
  totalValue: {
    fontSize: 16,
    color: '#000000',
  },
  grandTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
}); 