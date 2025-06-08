import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Circle, Path, G } from 'react-native-svg';

interface PieChartData {
  id: string;
  name: string;
  amount: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
}

export default function PieChartComponent({ data }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  
  const renderPieChart = () => {
    const size = 160;
    const radius = size / 2;
    const center = size / 2;
    
    let startAngle = 0;
    
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, index) => {
          const percentage = item.amount / total;
          const angle = percentage * 360;
          const endAngle = startAngle + angle;
          
          // Calculate the path
          const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
          const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
          const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
          const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);
          
          // Large arc flag is 1 if angle is >= 180 degrees
          const largeArcFlag = angle >= 180 ? 1 : 0;
          
          // Path for the slice
          const path = `
            M ${center},${center}
            L ${x1},${y1}
            A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2}
            Z
          `;
          
          const result = (
            <Path
              key={index}
              d={path}
              fill={item.color}
            />
          );
          
          startAngle = endAngle;
          return result;
        })}
        
        {/* Center circle for donut chart */}
        <Circle cx={center} cy={center} r={radius / 2} fill="white" />
      </Svg>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {renderPieChart()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  chartContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
});