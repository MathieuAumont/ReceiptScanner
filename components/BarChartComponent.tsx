import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { formatCurrency } from '@/app/lib/formatting';

interface BarChartData {
  label: string;
  value: number;
  id: string;
}

interface BarChartProps {
  data: BarChartData[];
}

export default function BarChartComponent({ data }: BarChartProps) {
  // Find the max value for scaling
  const maxValue = Math.max(...data.map(item => item.value), 0);
  
  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {data.map((item) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * 150 : 0;
          
          return (
            <View key={item.id} style={styles.barContainer}>
              <Text style={styles.barValue}>
                {formatCurrency(item.value)}
              </Text>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: Math.max(barHeight, 4),
                      backgroundColor: '#007AFF'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.barLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
  },
  barValue: {
    fontSize: 10,
    fontFamily: 'Roboto-Medium',
    color: '#8E8E93',
    marginBottom: 4,
  },
  barWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    fontFamily: 'Roboto-Regular',
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
});