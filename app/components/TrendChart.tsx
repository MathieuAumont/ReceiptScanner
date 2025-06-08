import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

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
  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#007AFF',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#E5E5EA',
    },
  };

  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        data: data.map(item => item.amount),
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 32}
        height={height}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withDots={showDots}
        withShadow={false}
        withInnerLines={true}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        fromZero
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
}); 