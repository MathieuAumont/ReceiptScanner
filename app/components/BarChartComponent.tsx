import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

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

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 2,
    formatYLabel: (value: string) => `${parseFloat(value).toFixed(2)} $`,
  };

  const chartData = {
    labels: data.map(item => {
      const [year, month] = item.label.split('-');
      return `${month}/${year.slice(2)}`;
    }),
    datasets: [
      {
        data: data.map(item => item.value),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <BarChart
        data={chartData}
        width={Dimensions.get('window').width - 32}
        height={220}
        yAxisLabel=""
        yAxisSuffix=" $"
        chartConfig={chartConfig}
        verticalLabelRotation={30}
        showValuesOnTopOfBars={true}
        fromZero={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  emptyContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
}); 