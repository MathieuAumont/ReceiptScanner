import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { formatCurrency } from '@/app/lib/formatting';

export interface TrendData {
  date: string;
  amount: number;
}

interface TrendChartProps {
  data: TrendData[];
  height?: number;
  showDots?: boolean;
}

export default function TrendChart({ 
  data, 
  height = 220, 
  showDots = true 
}: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(item => item.amount));
  const minValue = Math.min(...data.map(item => item.amount));

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.chartArea}>
        {data.map((item, index) => {
          const normalizedHeight = maxValue > minValue 
            ? ((item.amount - minValue) / (maxValue - minValue)) * (height - 80)
            : height / 2;
          
          return (
            <View key={index} style={styles.dataPoint}>
              <Text style={styles.valueText}>
                {formatCurrency(item.amount, 'CAD')}
              </Text>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: Math.max(normalizedHeight, 4),
                    backgroundColor: '#007AFF'
                  }
                ]} 
              />
              <Text style={styles.labelText}>{item.date}</Text>
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
    paddingHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 50,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flex: 1,
    paddingBottom: 30,
  },
  dataPoint: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  valueText: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  bar: {
    width: '80%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    minHeight: 4,
  },
  labelText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});