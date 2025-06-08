import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

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

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(2)} $`;
  };

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 2,
  };

  const chartData = data
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .map(item => ({
      name: `${item.name}\n${formatAmount(item.amount)}`,
      population: item.amount,
      color: item.color,
      legendFontColor: '#000000',
      legendFontSize: 12,
    }));

  if (chartData.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>Aucune donnée à afficher</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PieChart
        data={chartData}
        width={Dimensions.get('window').width - 32}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
      <View style={styles.legend}>
        {data.map((item) => (
          <View key={item.id} style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: item.color }]} />
            <View style={styles.legendText}>
              <Text style={styles.categoryName}>{item.name}</Text>
              <Text style={styles.amount}>{formatAmount(item.amount)}</Text>
              <Text style={styles.percentage}>({item.percentage.toFixed(2)}%)</Text>
            </View>
          </View>
        ))}
      </View>
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
  legend: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorBox: {
    width: 16,
    height: 16,
    marginRight: 8,
    borderRadius: 4,
  },
  legendText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
  },
  amount: {
    fontSize: 14,
    marginHorizontal: 8,
  },
  percentage: {
    fontSize: 14,
    color: '#666666',
    width: 80,
    textAlign: 'right',
  },
}); 