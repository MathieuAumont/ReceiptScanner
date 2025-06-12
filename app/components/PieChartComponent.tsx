import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { formatCurrency } from '@/app/lib/formatting';

export interface PieChartData {
  id: string;
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface PieChartComponentProps {
  data?: PieChartData[];
}

export default function PieChartComponent({ data = [] }: PieChartComponentProps) {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>Aucune donnée à afficher</Text>
      </View>
    );
  }

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  const renderPieSlices = () => {
    return data.map((item, index) => {
      const sliceStyle = {
        backgroundColor: item.color,
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 8,
      };
      
      return (
        <View key={item.id} style={styles.legendItem}>
          <View style={sliceStyle} />
          <View style={styles.legendTextContainer}>
            <Text style={styles.legendName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.legendAmount}>
              {formatCurrency(item.amount, 'CAD')} ({item.percentage.toFixed(1)}%)
            </Text>
          </View>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Simple circular representation */}
      <View style={styles.chartCircle}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>
          {formatCurrency(total, 'CAD')}
        </Text>
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        {renderPieSlices()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  chartCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  legend: {
    width: '100%',
    maxWidth: 300,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  legendAmount: {
    fontSize: 12,
    color: '#666',
  },
});