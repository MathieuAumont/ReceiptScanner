import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { formatCurrency } from '@/app/lib/formatting';

export interface BarChartData {
  label: string;
  value: number;
}

interface BarChartComponentProps {
  data?: BarChartData[];
}

export default function BarChartComponent({ data = [] }: BarChartComponentProps) {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>Aucune donnée à afficher</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value), 0);
  const chartWidth = Dimensions.get('window').width - 64; // Account for padding
  const barWidth = Math.max((chartWidth - (data.length - 1) * 8) / data.length, 40); // Minimum 40px width

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? Math.max((item.value / maxValue) * 150, 4) : 4;
          
          return (
            <View key={`${item.label}-${index}`} style={[styles.barContainer, { width: barWidth }]}>
              <Text style={styles.barValue} numberOfLines={1}>
                {formatCurrency(item.value, 'CAD')}
              </Text>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: barHeight,
                      backgroundColor: '#007AFF',
                      width: '100%'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.barLabel} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    paddingHorizontal: 8,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  barWrapper: {
    width: '80%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});