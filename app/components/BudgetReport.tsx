import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Receipt, Category } from '@/app/lib/types';
import { getReceipts } from '@/app/lib/storage';
import { useTheme } from '@/app/themes/ThemeContext';

interface BudgetItem {
  categoryId: string;
  amount: number;
}

interface SpendingAnalysis {
  categoryId: string;
  budgeted: number;
  spent: number;
  difference: number;
  percentageUsed: number;
}

interface BudgetReportProps {
  month: string;
  categories: Category[];
}

export default function BudgetReport({ month, categories }: BudgetReportProps) {
  const { theme } = useTheme();
  const [analysis, setAnalysis] = useState<SpendingAnalysis[]>([]);
  const [totalBudgeted, setTotalBudgeted] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    analyzeBudget();
  }, [month]);

  const analyzeBudget = async () => {
    try {
      // Charger le budget du mois
      const storedBudget = await AsyncStorage.getItem(`budget_${month}`);
      const budget: BudgetItem[] = storedBudget ? JSON.parse(storedBudget) : [];

      // Charger tous les reçus
      const allReceipts = await getReceipts();
      
      // Filtrer les reçus pour le mois en cours
      const monthReceipts = allReceipts.filter((receipt: Receipt) => {
        const receiptDate = new Date(receipt.date);
        return receiptDate.toISOString().slice(0, 7) === month;
      });

      // Calculer les dépenses par catégorie
      const spendingByCategory = monthReceipts.reduce((acc: { [key: string]: number }, receipt: Receipt) => {
        const categoryId = receipt.category;
        acc[categoryId] = (acc[categoryId] || 0) + receipt.totalAmount;
        return acc;
      }, {});

      // Créer l'analyse
      const budgetAnalysis = categories.map(category => {
        const budgetItem = budget.find(item => item.categoryId === category.id);
        const budgeted = budgetItem?.amount || 0;
        const spent = spendingByCategory[category.id] || 0;
        const difference = budgeted - spent;
        const percentageUsed = budgeted > 0 ? (spent / budgeted) * 100 : 0;

        return {
          categoryId: category.id,
          budgeted,
          spent,
          difference,
          percentageUsed,
        };
      });

      // Calculer les totaux
      const totals = budgetAnalysis.reduce(
        (acc, item) => {
          acc.budgeted += item.budgeted;
          acc.spent += item.spent;
          return acc;
        },
        { budgeted: 0, spent: 0 }
      );

      setAnalysis(budgetAnalysis);
      setTotalBudgeted(totals.budgeted);
      setTotalSpent(totals.spent);
    } catch (error) {
      console.error('Error analyzing budget:', error);
    }
  };

  const getStatusColor = (percentageUsed: number): string => {
    if (percentageUsed <= 80) return '#4CAF50';
    if (percentageUsed <= 100) return '#FF9800';
    return theme.error;
  };

  const formatCurrency = (amount: number): string => {
    return amount.toFixed(2) + ' $';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.summaryContainer, { backgroundColor: theme.card }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Budget total</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>
            {formatCurrency(totalBudgeted)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Dépensé</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>
            {formatCurrency(totalSpent)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Différence</Text>
          <Text style={[
            styles.summaryValue,
            { color: totalBudgeted - totalSpent >= 0 ? '#4CAF50' : theme.error }
          ]}>
            {formatCurrency(totalBudgeted - totalSpent)}
          </Text>
        </View>
      </View>

      {analysis.map(item => {
        const category = categories.find(cat => cat.id === item.categoryId);
        if (!category) return null;

        return (
          <View key={item.categoryId} style={[styles.categoryReport, { backgroundColor: theme.card }]}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryIcon, { color: theme.text }]}>{category.icon}</Text>
                <Text style={[styles.categoryName, { color: theme.text }]}>{category.name}</Text>
              </View>
              <Text style={[
                styles.percentageText,
                { color: getStatusColor(item.percentageUsed) }
              ]}>
                {item.percentageUsed.toFixed(1)}%
              </Text>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Budget</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {formatCurrency(item.budgeted)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Dépensé</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {formatCurrency(item.spent)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Reste</Text>
                <Text style={[
                  styles.detailValue,
                  { color: item.difference >= 0 ? '#4CAF50' : theme.error }
                ]}>
                  {formatCurrency(item.difference)}
                </Text>
              </View>
            </View>

            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
              <View style={[
                styles.progressFill,
                {
                  backgroundColor: getStatusColor(item.percentageUsed),
                  width: `${Math.min(item.percentageUsed, 100)}%`
                }
              ]} />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoryReport: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
}); 