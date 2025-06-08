import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { formatCurrency } from '@/app/lib/formatting';
import { useTheme } from '@/app/themes/ThemeContext';

export interface CategoryStats {
  id: string;
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface CategoryStatsProps {
  data: CategoryStats[];
  totalAmount: number;
}

export default function CategoryStats({ data, totalAmount }: CategoryStatsProps) {
  const { theme } = useTheme();

  return (
    <ScrollView style={styles.container}>
      {data.map((category) => (
        <View key={category.id} style={styles.categoryItem}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryInfo}>
              <View style={[styles.colorDot, { backgroundColor: category.color }]} />
              <Text style={[styles.categoryName, { color: theme.text }]}>
                {category.name}
              </Text>
            </View>
            <Text style={[styles.percentage, { color: theme.text }]}>
              {category.percentage.toFixed(1)}%
            </Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={[styles.amount, { color: theme.text }]}>
              {formatCurrency(category.amount, 'CAD')}
            </Text>
          </View>

          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: category.color,
                  width: `${category.percentage}%`,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '500',
  },
  amountContainer: {
    marginBottom: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: '600',
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