import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category } from '@/app/lib/types';
import { getAllCategories } from '@/app/lib/storage';
import { useTheme } from '@/app/themes/ThemeContext';
import HeaderBar from '@/app/components/HeaderBar';

interface BudgetItem {
  categoryId: string;
  amount: number;
}

interface MonthlyBudget {
  month: string; // Format: 'YYYY-MM'
  items: BudgetItem[];
}

export default function BudgetScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentBudget, setCurrentBudget] = useState<BudgetItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadCategories();
    loadBudget();
  }, [selectedMonth]);

  const loadCategories = async () => {
    try {
      const allCategories = await getAllCategories();
      setCategories(allCategories);
      // Initialize budget items for all categories if empty
      if (currentBudget.length === 0) {
        setCurrentBudget(
          allCategories.map(cat => ({
            categoryId: cat.id,
            amount: 0
          }))
        );
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadBudget = async () => {
    try {
      const storedBudget = await AsyncStorage.getItem(`budget_${selectedMonth}`);
      if (storedBudget) {
        setCurrentBudget(JSON.parse(storedBudget));
      }
    } catch (error) {
      console.error('Error loading budget:', error);
    }
  };

  const saveBudget = async () => {
    try {
      await AsyncStorage.setItem(
        `budget_${selectedMonth}`,
        JSON.stringify(currentBudget)
      );
      setIsEditing(false);
      Alert.alert('Succès', 'Budget sauvegardé avec succès');
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le budget');
    }
  };

  const updateBudgetAmount = (categoryId: string, amount: string) => {
    setCurrentBudget(prev =>
      prev.map(item =>
        item.categoryId === categoryId
          ? { ...item, amount: parseFloat(amount) || 0 }
          : item
      )
    );
  };

  const selectPreviousMonth = () => {
    const date = new Date(selectedMonth + '-01');
    date.setMonth(date.getMonth() - 1);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const selectNextMonth = () => {
    const date = new Date(selectedMonth + '-01');
    date.setMonth(date.getMonth() + 1);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const formatMonth = (dateString: string) => {
    const date = new Date(dateString + '-01');
    return date.toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar title="Budget" />

      <ScrollView style={styles.scrollView}>
        {categories.map(category => {
          const budgetItem = currentBudget.find(
            item => item.categoryId === category.id
          );
          return (
            <View key={category.id} style={[styles.budgetItem, { backgroundColor: theme.card }]}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[styles.categoryName, { color: theme.text }]}>
                  {category.name}
                </Text>
              </View>
              {isEditing ? (
                <TextInput
                  style={[styles.input, { 
                    borderColor: theme.border,
                    color: theme.text,
                    backgroundColor: theme.background
                  }]}
                  keyboardType="numeric"
                  value={budgetItem?.amount.toString() || '0'}
                  onChangeText={(text) => updateBudgetAmount(category.id, text)}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                />
              ) : (
                <Text style={[styles.amount, { color: theme.accent }]}>
                  {budgetItem?.amount?.toFixed(2) || '0.00'} $
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { 
        backgroundColor: theme.card,
        borderTopColor: theme.border
      }]}>
        {isEditing ? (
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.accent }]} 
            onPress={saveBudget}
          >
            <Text style={styles.buttonText}>Sauvegarder</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#4CAF50' }]}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.buttonText}>Modifier</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  budgetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginVertical: 1,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    width: 100,
    textAlign: 'right',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 