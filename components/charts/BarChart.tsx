import React from 'react';
import { Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { MonthlyTrend } from '@/types';
import { Colors } from '@/constants/colors';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';

interface MonthlyBarChartProps {
  data: MonthlyTrend[];
  width?: number;
}

export function MonthlyBarChart({ data, width = 320 }: MonthlyBarChartProps) {
  if (!data.length) return null;

  // gifted-charts renders grouped bars by interleaving items with spacing
  const chartData = data.flatMap((d) => {
    const label = (() => {
      try {
        return format(parse(d.month, 'yyyy-MM', new Date()), 'MMM', { locale: es });
      } catch {
        return d.month;
      }
    })();

    return [
      {
        value: d.income,
        frontColor: Colors.income,
        label,
        spacing: 4,
        labelTextStyle: { color: Colors.textSecondary, fontSize: 10 },
      },
      {
        value: d.expenses,
        frontColor: Colors.expense,
        spacing: 16,
        labelTextStyle: { color: Colors.textSecondary, fontSize: 10 },
      },
    ];
  });

  return (
    <View style={{ gap: 16 }}>
      <BarChart
        data={chartData}
        width={width}
        height={180}
        barWidth={16}
        barBorderRadius={4}
        noOfSections={4}
        yAxisTextStyle={{ color: Colors.textSecondary, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: Colors.textSecondary, fontSize: 10 }}
        yAxisColor={Colors.border}
        xAxisColor={Colors.border}
        rulesColor={Colors.border}
        rulesType="solid"
        hideRules={false}
        isAnimated
        animationDuration={600}
        maxValue={Math.max(...data.map((d) => Math.max(d.income, d.expenses)), 1) * 1.2}
        roundedTop
        disableScroll
      />

      {/* Legend */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.income }} />
          <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>Ingresos</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.expense }} />
          <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>Gastos</Text>
        </View>
      </View>
    </View>
  );
}
