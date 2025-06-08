import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { Receipt, Category } from '@/app/lib/types';
import { formatCurrency } from '@/app/lib/formatting';
import { getAllCategories } from '@/app/lib/storage';
import PieChartComponent from '@/app/components/PieChartComponent';
import { PieChartData } from '@/app/lib/chart-types';
import { useTheme } from '@/app/themes/ThemeContext';

interface CustomReportViewProps {
  receipts: Receipt[];
  startDate: Date;
  endDate: Date;
}

export default function CustomReportView({ receipts, startDate, endDate }: CustomReportViewProps) {
  const { theme } = useTheme();
  const [categoryData, setCategoryData] = useState<PieChartData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const loadedCategories = await getAllCategories();
      setCategories(loadedCategories);
      calculateCategoryData(loadedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const calculateCategoryData = (categories: Category[]) => {
    const totalAmount = receipts.reduce((sum, receipt) => sum + receipt.totalAmount, 0);
    
    const categoryBreakdown = categories.map(category => {
      const receiptsInCategory = receipts.filter(r => r.category === category.id);
      const amount = receiptsInCategory.reduce((sum, r) => sum + r.totalAmount, 0);
      const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;

      return {
        id: category.id,
        name: category.name,
        amount,
        color: category.color,
        percentage,
      };
    }).filter(cat => cat.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    setCategoryData(categoryBreakdown);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTotalSpent = () => {
    return receipts.reduce((total, receipt) => total + receipt.totalAmount, 0);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.dateRange, { color: theme.text }]}>
          Du {formatDate(startDate)} au {formatDate(endDate)}
        </Text>
        <Text style={[styles.total, { color: theme.text }]}>
          Total dépensé: {formatCurrency(getTotalSpent(), 'CAD')}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Répartition par catégorie</Text>
        {categoryData.length > 0 ? (
          <>
            <View style={styles.chartContainer}>
              <PieChartComponent data={categoryData} />
            </View>
            <View style={styles.categoryList}>
              {categoryData.map(category => (
                <View key={category.id} style={[styles.categoryItem, { backgroundColor: theme.background }]}>
                  <View style={styles.categoryHeader}>
                    <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                    <Text style={[styles.categoryName, { color: theme.text }]}>{category.name}</Text>
                  </View>
                  <View style={styles.categoryDetails}>
                    <Text style={[styles.categoryAmount, { color: theme.text }]}>
                      {formatCurrency(category.amount, 'CAD')}
                    </Text>
                    <Text style={[styles.categoryPercentage, { color: theme.textSecondary }]}>
                      {category.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={[styles.noData, { color: theme.textSecondary }]}>Aucune donnée disponible</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  dateRange: {
    fontSize: 16,
    marginBottom: 8,
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    marginBottom: 16,
  },
  categoryList: {
    gap: 12,
  },
  categoryItem: {
    padding: 12,
    borderRadius: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryPercentage: {
    fontSize: 14,
  },
  noData: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 32,
  },
}); 