import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch, Platform, Keyboard, KeyboardEvent, KeyboardAvoidingView, Dimensions, BackHandler } from 'react-native';
import { Plus, X, Calendar } from 'lucide-react-native';
import { Portal, Modal, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { generateId } from '@/app/lib/helpers';
import { Receipt, Category } from '@/app/lib/types';
import { saveCustomCategories, getAllCategories } from '@/app/lib/storage';
import { useTheme } from '@/app/themes/ThemeContext';
import { useLanguage } from '@/app/contexts/LanguageContext';

// Taux de taxes au Québec
const TPS_RATE = 0.05; // 5%
const TVQ_RATE = 0.09975; // 9.975%

// Couleurs prédéfinies pour les nouvelles catégories
const PRESET_COLORS = [
  '#007AFF', // Bleu
  '#4CAF50', // Vert
  '#FF9800', // Orange
  '#9C27B0', // Violet
  '#F44336', // Rouge
  '#795548', // Marron
  '#00BCD4', // Cyan
  '#FF4081', // Rose
  '#8BC34A', // Vert clair
  '#FFC107', // Jaune
  '#673AB7', // Violet foncé
  '#FF5722', // Orange foncé
];

interface Item {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ReceiptFormProps {
  initialReceipt?: Receipt;
  categories: Category[];
  onUpdateCategories: (categories: Category[]) => void;
  onSave: (receipt: Receipt) => void;
  onReset?: () => void;
}

export default function ReceiptForm({ 
  initialReceipt,
  categories,
  onUpdateCategories,
  onSave,
  onReset
}: ReceiptFormProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [focusedInputY, setFocusedInputY] = useState(0);
  const windowHeight = Dimensions.get('window').height;
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const [company, setCompany] = useState(initialReceipt?.company || '');
  const [date, setDate] = useState<Date>(() => {
    if (initialReceipt?.date) {
      return new Date(initialReceipt.date);
    }
    return new Date();
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [items, setItems] = useState<Item[]>(() => {
    if (initialReceipt?.items) {
      return initialReceipt.items.map(item => ({
        ...item,
        id: item.id || generateId()
      }));
    }
    return [{ id: generateId(), name: '', price: 0, quantity: 1 }];
  });
  const [tps, setTPS] = useState(initialReceipt?.taxes.tps || 0);
  const [tvq, setTVQ] = useState(initialReceipt?.taxes.tvq || 0);
  const [category, setCategory] = useState(initialReceipt?.category || categories[0]?.id);
  const [currency] = useState(initialReceipt?.currency || 'CAD');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [pricesIncludeTax, setPricesIncludeTax] = useState(false);
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: KeyboardEvent) => {
        setKeyboardHeight(e.endCoordinates.height);
        
        // Auto-scroll to focused input on Android
        if (Platform.OS === 'android' && focusedInputY > 0) {
          setTimeout(() => {
            const visibleAreaHeight = windowHeight - e.endCoordinates.height;
            const scrollToY = Math.max(0, focusedInputY - visibleAreaHeight * 0.3);
            scrollViewRef.current?.scrollTo({ y: scrollToY, animated: true });
          }, 100);
        }
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [focusedInputY, windowHeight]);

  // Calculer le sous-total (prix sans taxes)
  const calculateSubtotal = () => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (pricesIncludeTax) {
      // Si les prix incluent les taxes, on les retire pour avoir le sous-total
      return total / (1 + TPS_RATE + TVQ_RATE);
    }
    
    return total;
  };

  // Calculer les taxes automatiquement
  useEffect(() => {
    const subtotal = calculateSubtotal();
    const tpsAmount = subtotal * TPS_RATE;
    const tvqAmount = subtotal * TVQ_RATE;
    setTPS(Number(tpsAmount.toFixed(2)));
    setTVQ(Number(tvqAmount.toFixed(2)));
  }, [items, pricesIncludeTax]);

  const calculateTotal = () => {
    return calculateSubtotal() + tps + tvq;
  };

  const addItem = () => {
    const newItem = { 
      id: generateId(), 
      name: '', 
      price: 0, 
      quantity: 1 
    };
    setItems(prevItems => [...prevItems, newItem]);
  };

  const removeItem = (itemId: string) => {
    if (items.length === 1) {
      // If it's the last item, just clear it instead of removing
      setItems([{ id: generateId(), name: '', price: 0, quantity: 1 }]);
      return;
    }
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateItem = (id: string, field: keyof Item, value: string | number) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        return {
          ...item,
          [field]: field === 'name' ? value : Number(value) || 0
        };
      }
      return item;
    }));
  };

  // Faire défiler jusqu'au champ actif
  const scrollToInput = (node: any) => {
    if (!node || !scrollViewRef.current) return;
    
    node.measureLayout(
      scrollViewRef.current,
      (_x: number, y: number) => {
        // Sauvegarder la position Y du champ pour les calculs
        setFocusedInputY(y);
        
        // Sur iOS, le scroll automatique fonctionne bien
        if (Platform.OS === 'ios') {
          // Calculer si le champ sera caché par le clavier
          const inputBottom = y + 60; // Hauteur approximative du champ + marge
          const visibleAreaHeight = windowHeight - keyboardHeight;
          
          if (inputBottom > visibleAreaHeight - 20) { // 20px de marge
            const scrollAmount = Math.min(
              y - (visibleAreaHeight * 0.4), // Positionner le champ à 40% de la hauteur visible
              y
            );
            
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, scrollAmount),
              animated: true
            });
          }
        }
      },
      () => {}
    );
  };

  const focusNextInput = (currentId: string, nextId: string) => {
    if (inputRefs.current[nextId]) {
      inputRefs.current[nextId]?.focus();
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert(t.error, language === 'fr' ? 'Veuillez entrer un nom pour la catégorie' : 'Please enter a category name');
      return;
    }

    const newCategory: Category = {
      id: `custom-${Date.now()}`,
      name: newCategoryName.trim(),
      icon: '📝',
      color: selectedColor,
      isCustom: true
    };

    const updatedCategories = [...categories, newCategory];
    onUpdateCategories(updatedCategories);
    setCategory(newCategory.id);
    setNewCategoryName('');
    setSelectedColor(PRESET_COLORS[0]);
    setShowCategoryModal(false);

    try {
      await saveCustomCategories(updatedCategories.filter(cat => cat.isCustom));
    } catch (error) {
      console.error('Error saving custom categories:', error);
      Alert.alert(t.error, language === 'fr' ? 'Impossible de sauvegarder la catégorie' : 'Unable to save category');
    }
  };

  const handleSave = () => {
    // Validation
    if (!company.trim()) {
      Alert.alert(language === 'fr' ? 'Information manquante' : 'Missing Information', t.missingStoreName);
      return;
    }

    if (items.every(item => !item.name.trim() || item.price === 0)) {
      Alert.alert(language === 'fr' ? 'Information manquante' : 'Missing Information', t.missingItems);
      return;
    }

    // Créer l'objet reçu
    const receiptData: Receipt = {
      id: initialReceipt?.id || generateId(),
      company: company.trim(),
      date,
      items: items.filter(item => item.name.trim() && item.price > 0),
      totalAmount: calculateTotal(),
      subtotal: calculateSubtotal(),
      taxes: {
        tps,
        tvq
      },
      category: category || categories[0].id,
      currency,
      metadata: {
        processedAt: new Date(),
        ocrEngine: initialReceipt?.metadata?.ocrEngine || 'manual',
        version: '1.0',
        confidence: 1.0,
        originalText: initialReceipt?.metadata?.originalText
      }
    };

    onSave(receiptData);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Internal form reset - only clears state
  const resetForm = () => {
    setCompany('');
    setDate(new Date());
    setItems([{ id: generateId(), name: '', price: 0, quantity: 1 }]);
    setTPS(0);
    setTVQ(0);
    setCategory(categories[0]?.id);
    setPricesIncludeTax(false);
    setShowDatePicker(false);
    setShowCategoryModal(false);
    setNewCategoryName('');
    setSelectedColor(PRESET_COLORS[0]);
  };

  // Handle reset button press - calls resetForm and then onReset
  const handleResetButtonPress = () => {
    resetForm();
    if (onReset) {
      onReset();
    }
  };

  // Add useEffect for cleanup - only calls resetForm, not onReset
  useEffect(() => {
    return () => {
      resetForm();
    };
  }, []);

  // Add useEffect for handling navigation reset - only calls resetForm, not onReset
  useEffect(() => {
    if (Platform.OS === 'android') {
      const handleBackPress = () => {
        resetForm();
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => subscription.remove();
    }
  }, []);

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.formSection, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.generalInfo}</Text>
          
          <TouchableOpacity 
            style={[styles.datePickerButton, { backgroundColor: theme.background, borderColor: theme.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color={theme.text} />
            <Text style={[styles.dateText, { color: theme.text }]}>
              {date instanceof Date ? date.toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA') : new Date().toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA')}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border, marginTop: 12 }]}
            placeholder={t.storeName}
            placeholderTextColor={theme.textSecondary}
            value={company}
            onChangeText={setCompany}
            ref={(el) => { inputRefs.current['company'] = el }}
            onSubmitEditing={() => focusNextInput('company', 'item-0-name')}
            onFocus={(e) => scrollToInput(e.target)}
          />

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={[styles.categoryContainer, { backgroundColor: theme.background }]}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: category === cat.id ? cat.color : theme.background,
                    borderWidth: 1,
                    borderColor: cat.color,
                  }
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Text style={[styles.categoryIcon, { color: category === cat.id ? theme.card : cat.color }]}>{cat.icon}</Text>
                <Text style={[
                  styles.categoryButtonText,
                  { color: category === cat.id ? theme.card : cat.color }
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.categoryButton,
                styles.addCategoryButton,
                { backgroundColor: theme.background, borderColor: theme.border }
              ]}
              onPress={() => setShowCategoryModal(true)}
            >
              <Plus size={24} color={theme.accent} />
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={[styles.formSection, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.items}</Text>
          
          <View style={[styles.taxToggleContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.taxToggleLabel, { color: theme.text }]}>{t.pricesIncludeTax}</Text>
            <Switch
              value={pricesIncludeTax}
              onValueChange={setPricesIncludeTax}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {items.map((item, index) => (
            <View key={item.id} style={[styles.itemContainer, { backgroundColor: theme.background }]}>
              <TextInput
                style={[styles.input, styles.itemNameInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder={t.itemName}
                placeholderTextColor={theme.textSecondary}
                value={item.name}
                onChangeText={(value) => updateItem(item.id, 'name', value)}
                ref={(el) => { inputRefs.current[`item-${index}-name`] = el }}
                onSubmitEditing={() => focusNextInput(`item-${index}-name`, `item-${index}-price`)}
                onFocus={(e) => scrollToInput(e.target)}
              />
              
              <TextInput
                style={[styles.input, styles.itemPriceInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder={t.price}
                placeholderTextColor={theme.textSecondary}
                value={item.price === 0 ? '' : item.price.toString()}
                onChangeText={(value) => updateItem(item.id, 'price', value)}
                keyboardType="decimal-pad"
                ref={(el) => { inputRefs.current[`item-${index}-price`] = el }}
                onSubmitEditing={() => focusNextInput(`item-${index}-price`, `item-${index}-quantity`)}
                onFocus={(e) => scrollToInput(e.target)}
              />
              
              <TextInput
                style={[styles.input, styles.itemQuantityInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder={t.quantity}
                placeholderTextColor={theme.textSecondary}
                value={item.quantity.toString()}
                onChangeText={(value) => updateItem(item.id, 'quantity', value)}
                keyboardType="numeric"
                ref={(el) => { inputRefs.current[`item-${index}-quantity`] = el }}
                onSubmitEditing={() => {
                  const nextIndex = index + 1;
                  if (nextIndex < items.length) {
                    focusNextInput(`item-${index}-quantity`, `item-${nextIndex}-name`);
                  }
                }}
                onFocus={(e) => scrollToInput(e.target)}
              />
              
              <TouchableOpacity
                style={[styles.removeItemButton, { backgroundColor: theme.background }]}
                onPress={() => removeItem(item.id)}
              >
                <Text style={[styles.removeItemText, { color: theme.error }]}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity 
            style={[styles.addItemButton, { backgroundColor: theme.background, borderColor: theme.border }]} 
            onPress={addItem}
          >
            <Text style={[styles.addItemText, { color: theme.accent }]}>{t.addItem}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.formSection, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.summary}</Text>
          
          <View style={[styles.totalContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>{t.subtotal}:</Text>
            <Text style={[styles.totalAmount, { color: theme.text }]}>${calculateSubtotal().toFixed(2)}</Text>
          </View>
          
          <View style={[styles.totalContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>{t.tps}:</Text>
            <Text style={[styles.totalAmount, { color: theme.text }]}>${tps.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.totalContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>{t.tvq}:</Text>
            <Text style={[styles.totalAmount, { color: theme.text }]}>${tvq.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.totalContainer, styles.grandTotal, { backgroundColor: theme.background }]}>
            <Text style={[styles.totalLabel, styles.grandTotalLabel, { color: theme.text }]}>{t.total}:</Text>
            <Text style={[styles.totalAmount, styles.grandTotalAmount, { color: theme.text }]}>
              ${calculateTotal().toFixed(2)}
            </Text>
          </View>
        </View>
        
        <View style={[styles.buttonContainer, { backgroundColor: theme.background }]}>
          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: '#B71C1C' }]}
            onPress={handleResetButtonPress}
          >
            <Text style={[styles.resetButtonText, { color: '#FFFFFF' }]}>{t.reset}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.accent }]}
            onPress={handleSave}
          >
            <Text style={[styles.buttonText, { color: theme.card }]}>{t.save}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Portal>
        <Modal
          visible={showCategoryModal}
          onDismiss={() => setShowCategoryModal(false)}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.card }]}
        >
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            {language === 'fr' ? 'Nouvelle catégorie' : 'New Category'}
          </Text>
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder={language === 'fr' ? 'Nom de la catégorie' : 'Category name'}
            placeholderTextColor={theme.textSecondary}
            value={newCategoryName}
            onChangeText={setNewCategoryName}
          />

          <View style={[styles.colorPickerContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.colorLabel, { color: theme.text }]}>
              {language === 'fr' ? 'Couleur' : 'Color'}
            </Text>
            <View style={[styles.colorGrid, { backgroundColor: theme.background }]}>
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && [
                      styles.colorOptionSelected,
                      { borderColor: theme.text }
                    ]
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>

          <View style={[styles.modalActions, { backgroundColor: theme.background }]}>
            <Button 
              mode="outlined" 
              onPress={() => setShowCategoryModal(false)}
              style={[styles.button, { borderColor: theme.error }]}
              textColor={theme.error}
            >
              {t.cancel}
            </Button>
            <Button 
              mode="contained" 
              onPress={handleAddCategory}
              style={[styles.button, { backgroundColor: theme.accent }]}
              disabled={!newCategoryName.trim()}
            >
              {language === 'fr' ? 'Ajouter' : 'Add'}
            </Button>
          </View>
        </Modal>
      </Portal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    paddingBottom: 40,
  },
  formSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addCategoryButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    paddingHorizontal: 0,
  },
  taxToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  taxToggleLabel: {
    fontSize: 14,
    color: '#666666',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  itemNameInput: {
    flex: 2,
    marginBottom: 0,
  },
  itemPriceInput: {
    flex: 1,
    marginBottom: 0,
  },
  itemQuantityInput: {
    width: 60,
    marginBottom: 0,
  },
  removeItemButton: {
    padding: 8,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addItemText: {
    marginLeft: 8,
    color: '#007AFF',
    fontSize: 16,
  },
  taxContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  taxInputContainer: {
    flex: 1,
  },
  taxLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  taxInput: {
    marginBottom: 0,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666666',
  },
  totalAmount: {
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
  grandTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    gap: 16,
  },
  resetButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  colorPickerContainer: {
    marginVertical: 16,
  },
  colorLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorOptionSelected: {
    borderWidth: 3,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  button: {
    minWidth: 100,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 16,
  },
  removeItemText: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: 'bold',
  },
});