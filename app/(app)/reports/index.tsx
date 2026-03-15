import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useReportSummary,
  useReportByCategory,
  useMonthlyTrend,
  getPeriodDates,
} from '@/hooks/useReports';
import { Card } from '@/components/ui/Card';
import { AmountText } from '@/components/ui/AmountText';
import { CategoryPieChart } from '@/components/charts/PieChart';
import { MonthlyBarChart } from '@/components/charts/BarChart';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { formatAmount } from '@/components/ui/AmountText';

type Preset = 'this_month' | 'last_month' | 'last_3_months';

const PRESETS: { label: string; value: Preset }[] = [
  { label: 'Este mes', value: 'this_month' },
  { label: 'Mes anterior', value: 'last_month' },
  { label: 'Últimos 3 meses', value: 'last_3_months' },
];

export default function ReportsScreen() {
  const [preset, setPreset] = useState<Preset>('this_month');
  const currency = useAuthStore((s) => s.user?.currency ?? 'USD');
  const period = getPeriodDates(preset);

  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useReportSummary(period);
  const { data: categoryData = [], isLoading: catLoading, refetch: refetchCat } = useReportByCategory(period);
  const { data: trendData = [], isLoading: trendLoading, refetch: refetchTrend } = useMonthlyTrend();

  const onRefresh = () => {
    refetchSummary();
    refetchCat();
    refetchTrend();
  };

  const top5 = [...categoryData].sort((a, b) => b.total - a.total).slice(0, 5);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <Text style={{ color: Colors.textPrimary, fontSize: 22, fontWeight: '800' }}>
          Reportes
        </Text>

        {/* Period selector */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {PRESETS.map((p) => (
            <Pressable
              key={p.value}
              onPress={() => setPreset(p.value)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: preset === p.value ? Colors.primary : Colors.surface,
                borderWidth: 1,
                borderColor: preset === p.value ? Colors.primary : Colors.border,
              }}
            >
              <Text
                style={{
                  color: preset === p.value ? Colors.textPrimary : Colors.textSecondary,
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Summary */}
        {summaryLoading ? (
          <CardSkeleton />
        ) : summary ? (
          <Card style={{ gap: 16 }}>
            <Text style={{ color: Colors.textPrimary, fontSize: 16, fontWeight: '700' }}>
              Resumen
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: `${Colors.income}11`,
                  borderRadius: 16,
                  padding: 14,
                  gap: 4,
                }}
              >
                <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>Ingresos</Text>
                <AmountText amount={summary.total_income} type="income" size={18} />
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: `${Colors.expense}11`,
                  borderRadius: 16,
                  padding: 14,
                  gap: 4,
                }}
              >
                <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>Gastos</Text>
                <AmountText amount={summary.total_expenses} type="expense" size={18} />
              </View>
            </View>
            <View
              style={{
                backgroundColor: summary.net >= 0 ? `${Colors.income}11` : `${Colors.expense}11`,
                borderRadius: 16,
                padding: 14,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>Balance neto</Text>
              <AmountText
                amount={Math.abs(summary.net)}
                type={summary.net >= 0 ? 'income' : 'expense'}
                size={18}
                showSign={false}
              />
            </View>
          </Card>
        ) : null}

        {/* Pie chart */}
        {catLoading ? (
          <CardSkeleton />
        ) : categoryData.length > 0 ? (
          <Card style={{ gap: 16 }}>
            <Text style={{ color: Colors.textPrimary, fontSize: 16, fontWeight: '700' }}>
              Gastos por categoría
            </Text>
            <CategoryPieChart data={categoryData} />
          </Card>
        ) : null}

        {/* Bar chart */}
        {trendLoading ? (
          <CardSkeleton />
        ) : trendData.length > 0 ? (
          <Card style={{ gap: 16 }}>
            <Text style={{ color: Colors.textPrimary, fontSize: 16, fontWeight: '700' }}>
              Tendencia mensual
            </Text>
            <MonthlyBarChart data={trendData} />
          </Card>
        ) : null}

        {/* Top 5 categories */}
        {top5.length > 0 && (
          <Card style={{ gap: 12 }}>
            <Text style={{ color: Colors.textPrimary, fontSize: 16, fontWeight: '700' }}>
              Top categorías
            </Text>
            {top5.map((cat, idx) => (
              <View
                key={cat.category_id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Text
                  style={{
                    color: Colors.textSecondary,
                    fontSize: 13,
                    fontWeight: '700',
                    width: 20,
                  }}
                >
                  #{idx + 1}
                </Text>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: `${cat.category_color}22`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{cat.category_icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: Colors.textPrimary, fontSize: 14, fontWeight: '600' }}>
                    {cat.category_name}
                  </Text>
                  <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>
                    {cat.percentage.toFixed(1)}% del gasto total
                  </Text>
                </View>
                <AmountText amount={cat.total} type="expense" size={14} />
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
