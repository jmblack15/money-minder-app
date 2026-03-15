import React from 'react';
import { Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { CategoryReport } from '@/types';
import { Colors } from '@/constants/colors';

interface CategoryPieChartProps {
  data: CategoryReport[];
  size?: number;
}

export function CategoryPieChart({ data, size = 180 }: CategoryPieChartProps) {
  if (!data.length) return null;

  const chartData = data.map((item) => ({
    value: item.total,
    color: item.category_color,
    text: `${item.percentage.toFixed(0)}%`,
  }));

  return (
    <View style={{ alignItems: 'center', gap: 20 }}>
      <PieChart
        data={chartData}
        donut
        radius={size / 2}
        innerRadius={size / 4}
        innerCircleColor={Colors.surface}
        centerLabelComponent={() => (
          <Text style={{ color: Colors.textSecondary, fontSize: 12, textAlign: 'center' }}>
            Gastos
          </Text>
        )}
        focusOnPress
        toggleFocusOnPress
      />

      {/* Legend */}
      <View style={{ gap: 10, width: '100%' }}>
        {data.slice(0, 5).map((item) => (
          <View
            key={item.category_id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: item.category_color,
                }}
              />
              <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>
                {item.category_icon} {item.category_name}
              </Text>
            </View>
            <Text style={{ color: Colors.textPrimary, fontSize: 13, fontWeight: '600' }}>
              {item.percentage.toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
