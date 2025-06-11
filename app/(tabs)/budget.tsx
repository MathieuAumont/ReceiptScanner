import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category } from '@/app/lib/types';
import { getAllCategories, getReceipts } from '@/app/lib/storage';
import { useTheme } from '@/app/themes/ThemeContext';
import HeaderBar from '@/app/components/HeaderBar';
import { formatCurrency } from '@/app/lib/formatting';
import { TrendingUp, TrendingDown, TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface BudgetItem {
  categoryId: string;
  amount: number;
}

interface CategorySpending {
  categoryId: string;
  budgeted: number;
  spent: number;
  percentage: number;
  status: 'good' | 'warning' | 'danger';
}

export default function BudgetScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentBudget, setCurrentBudget] = useState<BudgetItem[]>([]);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [isEditing, setIsEditing] = useState(false);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    loadCategories();
    loadBudget();
  }, [selectedMonth]);

  useEffect(() => {
    if (categories.length > 0 && currentBudget.length > 0) {
      calculateSpending();
    }
  }, [categories, currentBudget, selectedMonth]);

  const loadCategories = async () => {
    try {
      const allCategories = await getAllCategories();
      setCategories(allCategories);
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
        const budget = JSON.parse(storedBudget);
        setCurrentBudget(budget);
      } else {
        const allCategories = await getAllCategories();
        const emptyBudget = allCategories.map(cat => ({
          categoryId: cat.id,
          amount: 0
        }));
        setCurrentBudget(emptyBudget);
      }
    } catch (error) {
      console.error('Error loading budget:', error);
    }
  };

  const calculateSpending = async () => {
    try {
      const receipts = await getReceipts();
      const [year, month] = selectedMonth.split('-');
      
      const monthReceipts = receipts.filter(receipt => {
        const receiptDate = new Date(receipt.date);
        return receiptDate.getFullYear() === parseInt(year) && 
               receiptDate.getMonth() === parseInt(month) - 1;
      });

      const spendingByCategory = monthReceipts.reduce((acc, receipt) => {
        const categoryId = receipt.category;
        acc[categoryId] = (acc[categoryId] || 0) + receipt.totalAmount;
        return acc;
      }, {} as { [key: string]: number });

      const categorySpendingData = categories.map(category => {
        const budgetItem = currentBudget.find(item => item.categoryId === category.id);
        const budgeted = budgetItem?.amount || 0;
        const spent = spendingByCategory[category.id] || 0;
        const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;
        
        let status: 'good' | 'warning' | 'danger' = 'good';
        if (percentage >= 100) {
          status = 'danger';
        } else if (percentage >= 80) {
          status = 'warning';
        }

        return {
          categoryId: category.id,
          budgeted,
          spent,
          percentage,
          status
        };
      });

      setCategorySpending(categorySpendingData);
      
      const totalBudgetAmount = currentBudget.reduce((sum, item) => sum + item.amount, 0);
      const totalSpentAmount = Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0);
      
      setTotalBudget(totalBudgetAmount);
      setTotalSpent(totalSpentAmount);
    } catch (error) {
      console.error('Error calculating spending:', error);
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
      calculateSpending();
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

  const getStatusColor = (status: 'good' | 'warning' | 'danger') => {
    switch (status) {
      case 'good':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'danger':
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'danger') => {
    switch (status) {
      case 'good':
        return <TrendingUp size={14} color="#4CAF50" />;
      case 'warning':
        return <AlertTriangle size={14} color="#FF9800" />;
      case 'danger':
        return <TrendingDown size={14} color={theme.error} />;
      default:
        return null;
    }
  };

  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const overallStatus = overallPercentage >= 100 ? 'danger' : overallPercentage >= 80 ? 'warning' : 'good';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar title="Budget" />

      {/* Compact Month Selector */}
      <View style={[styles.monthSelector, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={selectPreviousMonth} style={styles.monthButton}>
          <Text style={[styles.monthButtonText, { color: theme.accent }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.monthText, { color: theme.text }]}>
          {formatMonth(selectedMonth)}
        </Text>
        <TouchableOpacity onPress={selectNextMonth} style={styles.monthButton}>
          <Text style={[styles.monthButtonText, { color: theme.accent }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Compact Overall Progress */}
      <View style={[styles.overallProgress, { backgroundColor: theme.card }]}>
        <View style={styles.overallRow}>
          <View style={styles.overallAmounts}>
            <Text style={[styles.overallSpent, { color: theme.text }]}>
              {formatCurrency(totalSpent, 'CAD')}
            </Text>
            <Text style={[styles.overallBudget, { color: theme.textSecondary }]}>
              / {formatCurrency(totalBudget, 'CAD')}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            {getStatusIcon(overallStatus)}
            <Text style={[styles.percentageText, { color: getStatusColor(overallStatus) }]}>
              {overallPercentage.toFixed(0)}%
            </Text>
          </View>
        </View>
        <View style={[styles.progressBarContainer, { backgroundColor: theme.border }]}>
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${Math.min(overallPercentage, 100)}%`,
                backgroundColor: getStatusColor(overallStatus)
              }
            ]} 
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {categorySpending.map(categoryData => {
          const category = categories.find(cat => cat.id === categoryData.categoryId);
          if (!category) return null;

          const budgetItem = currentBudget.find(item => item.categoryId === category.id);

          return (
            <View key={category.id} style={[styles.budgetItem, { backgroundColor: theme.card }]}>
              <View style={styles.categoryRow}>
                <View style={styles.categoryLeft}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <View style={styles.categoryDetails}>
                    <Text style={[styles.categoryName, { color: theme.text }]}>
                      {category.name}
                    </Text>
                    <View style={styles.amountRow}>
                      <Text style={[styles.spentAmount, { color: theme.text }]}>
                        {formatCurrency(categoryData.spent, 'CAD')}
                      </Text>
                      <Text style={[styles.budgetAmount, { color: theme.textSecondary }]}>
                        / {formatCurrency(categoryData.budgeted, 'CAD')}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.categoryRight}>
                  {isEditing ? (
                    <TextInput
                      style={[styles.compactInput, { 
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
                    <View style={styles.statusContainer}>
                      {getStatusIcon(categoryData.status)}
                      <Text style={[styles.percentageText, { color: getStatusColor(categoryData.status) }]}>
                        {categoryData.percentage.toFixed(0)}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Compact Progress Bar */}
              <View style={[styles.progressBarContainer, { backgroundColor: theme.border }]}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${Math.min(categoryData.percentage, 100)}%`,
                      backgroundColor: getStatusColor(categoryData.status)
                    }
                  ]} 
                />
              </View>

              {/* Remaining Amount - Only show if budget > 0 and not editing */}
              {!isEditing && categoryData.budgeted > 0 && (
                <Text style={[
                  styles.remainingText, 
                  { color: categoryData.budgeted - categoryData.spent >= 0 ? '#4CAF50' : theme.error }
                ]}>
                  Restant: {formatCurrency(categoryData.budgeted - categoryData.spent, 'CAD')}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Compact Footer */}
      <View style={[styles.footer, { 
        backgroundColor: theme.card,
        borderTopColor: theme.border
      }]}>
        {isEditing ? (
          <View style={styles.editingFooter}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={() => {
                setIsEditing(false);
                loadBudget();
              }}
            >
              <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton, { backgroundColor: theme.accent }]} 
              onPress={saveBudget}
            >
              <Text style={styles.buttonText}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>
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
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  monthButton: {
    padding: 6,
  },
  monthButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
  },
  overallProgress: {
    margin: 16,
    padding: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  overallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  overallAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  overallSpent: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 4,
  },
  overallBudget: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  budgetItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  spentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  budgetAmount: {
    fontSize: 12,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  compactInput: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    width: 80,
    textAlign: 'right',
  },
  remainingText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
  },
  editingFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  saveButton: {
    flex: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});