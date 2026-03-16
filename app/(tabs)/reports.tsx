import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Rect, G, Text as SvgText } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { useReports } from '@/hooks/useReports';
import { useCurrency } from '@/hooks/useCurrency';
import { Card } from '@/components/ui/Card';
import { AmountText } from '@/components/ui/AmountText';
import { SkeletonBox } from '@/components/ui/SkeletonLoader';
import { ReportPeriod, CategorySummary, MonthlyTrend } from '@/constants/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 200;

const PERIODS: { key: ReportPeriod; label: string }[] = [
  { key: 'this_month', label: 'Este mes' },
  { key: 'last_month', label: 'Mes anterior' },
  { key: 'last_3_months', label: 'Últimos 3 meses' },
];

// ─── Pie Chart ────────────────────────────────────────────────────────────────

function PieChart({ data }: { data: CategorySummary[] }) {
  if (!data?.length) return null;

  const total = data.reduce((s, d) => s + d.total, 0);
  const cx = CHART_WIDTH / 2;
  const cy = 100;
  const r = 75;
  const innerR = 45;

  let startAngle = -Math.PI / 2;

  const arcs = data.slice(0, 6).map((item) => {
    const fraction = item.total / total;
    const angle = fraction * 2 * Math.PI;
    const endAngle = startAngle + angle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(startAngle);
    const iy1 = cy + innerR * Math.sin(startAngle);
    const ix2 = cx + innerR * Math.cos(endAngle);
    const iy2 = cy + innerR * Math.sin(endAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1}`,
      'Z',
    ].join(' ');

    startAngle = endAngle;
    return { path, color: item.categoryColor, name: item.categoryName, fraction };
  });

  return (
    <Svg width={CHART_WIDTH} height={200}>
      {arcs.map((arc, i) => (
        <G key={i}>
          <SvgText
            x={cx}
            y={cy + 5}
            fill={Colors.textSecondary}
            fontSize={10}
            textAnchor="middle"
          />
        </G>
      ))}
      {arcs.map((arc, i) => (
        <React.Fragment key={i}>
          <SvgText x={0} y={0} fill="transparent" fontSize={1}>{arc.path}</SvgText>
        </React.Fragment>
      ))}
      {/* Render manually as React Native SVG path */}
      {arcs.map((arc, i) => (
        <G key={`arc-${i}`}>
          <SvgText
            x={cx + (r + 15) * Math.cos((arcs.slice(0, i).reduce((s, a) => s + a.fraction, 0) + arc.fraction / 2) * 2 * Math.PI - Math.PI / 2)}
            y={cy + (r + 15) * Math.sin((arcs.slice(0, i).reduce((s, a) => s + a.fraction, 0) + arc.fraction / 2) * 2 * Math.PI - Math.PI / 2)}
            fill={Colors.textMuted}
            fontSize={8}
            textAnchor="middle"
          />
        </G>
      ))}
    </Svg>
  );
}

// ─── Simple Pie using filled circles ─────────────────────────────────────────

function SimplePieChart({ data }: { data: CategorySummary[] }) {
  const { format: fmt } = useCurrency();
  if (!data?.length) return <Text style={chartStyles.empty}>Sin datos de gastos</Text>;

  const top5 = data.slice(0, 5);
  const total = top5.reduce((s, d) => s + d.total, 0);

  return (
    <View>
      {/* Donut-style bars */}
      {top5.map((item, idx) => (
        <View key={item.categoryId} style={chartStyles.pieRow}>
          <View style={chartStyles.pieLeft}>
            <Text style={chartStyles.pieIcon}>{item.categoryIcon}</Text>
            <Text style={chartStyles.pieName}>{item.categoryName}</Text>
          </View>
          <View style={chartStyles.pieBarWrapper}>
            <View
              style={[
                chartStyles.pieBar,
                {
                  width: `${Math.max((item.total / (total || 1)) * 100, 2)}%`,
                  backgroundColor: item.categoryColor || Colors.primary,
                },
              ]}
            />
          </View>
          <Text style={chartStyles.pieAmount}>{item.percentage.toFixed(0)}%</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarChart({ data }: { data: MonthlyTrend[] }) {
  const { format: fmt } = useCurrency();
  if (!data?.length) return <Text style={chartStyles.empty}>Sin datos históricos</Text>;

  const maxVal = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1);
  const BAR_WIDTH = (CHART_WIDTH - 40) / (data.length * 2 + data.length - 1);

  return (
    <View>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT + 30}>
        {data.map((d, i) => {
          const incomeH = (d.income / maxVal) * CHART_HEIGHT;
          const expenseH = (d.expense / maxVal) * CHART_HEIGHT;
          const x = 20 + i * (BAR_WIDTH * 2 + BAR_WIDTH);

          return (
            <G key={i}>
              {/* Income bar */}
              <Rect
                x={x}
                y={CHART_HEIGHT - incomeH}
                width={BAR_WIDTH}
                height={incomeH}
                fill={Colors.income}
                rx={4}
              />
              {/* Expense bar */}
              <Rect
                x={x + BAR_WIDTH + 2}
                y={CHART_HEIGHT - expenseH}
                width={BAR_WIDTH}
                height={expenseH}
                fill={Colors.expense}
                rx={4}
              />
              {/* Month label */}
              <SvgText
                x={x + BAR_WIDTH}
                y={CHART_HEIGHT + 16}
                fill={Colors.textMuted}
                fontSize={9}
                textAnchor="middle"
              >
                {d.month}
              </SvgText>
            </G>
          );
        })}
      </Svg>

      {/* Legend */}
      <View style={chartStyles.legend}>
        <View style={chartStyles.legendItem}>
          <View style={[chartStyles.legendDot, { backgroundColor: Colors.income }]} />
          <Text style={chartStyles.legendText}>Ingresos</Text>
        </View>
        <View style={chartStyles.legendItem}>
          <View style={[chartStyles.legendDot, { backgroundColor: Colors.expense }]} />
          <Text style={chartStyles.legendText}>Gastos</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Reports Screen ───────────────────────────────────────────────────────────

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<ReportPeriod>('this_month');
  const { data, isLoading, refetch } = useReports(period);
  const { format: fmt } = useCurrency();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <Text style={styles.title}>Reportes</Text>

        {/* Period Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodScroll}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}
              onPress={() => setPeriod(p.key)}
            >
              <Text style={[styles.periodBtnText, period === p.key && styles.periodBtnTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isLoading ? (
          <>
            <SkeletonBox height={100} borderRadius={20} style={styles.mb16} />
            <SkeletonBox height={250} borderRadius={20} style={styles.mb16} />
            <SkeletonBox height={220} borderRadius={20} style={styles.mb16} />
          </>
        ) : (
          <>
            {/* Summary */}
            <Card padding={20} style={styles.mb16}>
              <Text style={styles.sectionTitle}>Resumen del período</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Ingresos</Text>
                  <AmountText amount={data?.summary.totalIncome ?? 0} type="INCOME" size="lg" />
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Gastos</Text>
                  <AmountText amount={data?.summary.totalExpense ?? 0} type="EXPENSE" size="lg" />
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Neto</Text>
                  <AmountText
                    amount={Math.abs(data?.summary.net ?? 0)}
                    type={(data?.summary.net ?? 0) >= 0 ? 'INCOME' : 'EXPENSE'}
                    size="lg"
                  />
                </View>
              </View>
            </Card>

            {/* Expense Breakdown */}
            <Card padding={20} style={styles.mb16}>
              <Text style={styles.sectionTitle}>Gastos por categoría</Text>
              <SimplePieChart data={data?.byCategory ?? []} />
            </Card>

            {/* Monthly Trend */}
            {(data?.monthlyTrends?.length ?? 0) > 0 && (
              <Card padding={20} style={styles.mb16}>
                <Text style={styles.sectionTitle}>Tendencia mensual</Text>
                <BarChart data={data?.monthlyTrends ?? []} />
              </Card>
            )}

            {/* Top Categories */}
            <Card padding={20} style={styles.mb16}>
              <Text style={styles.sectionTitle}>Top 5 categorías con más gasto</Text>
              {(data?.byCategory ?? []).slice(0, 5).map((item, idx) => (
                <View key={item.categoryId} style={styles.topRow}>
                  <Text style={styles.topRank}>#{idx + 1}</Text>
                  <Text style={styles.topIcon}>{item.categoryIcon}</Text>
                  <Text style={styles.topName}>{item.categoryName}</Text>
                  <AmountText amount={item.total} type="EXPENSE" size="sm" />
                </View>
              ))}
              {(data?.byCategory?.length ?? 0) === 0 && (
                <Text style={styles.emptyText}>Sin datos de gastos para este período</Text>
              )}
            </Card>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, paddingVertical: 16 },
  periodScroll: { marginBottom: 16 },
  periodBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 100,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  periodBtnActive: { backgroundColor: `${Colors.primary}20`, borderColor: Colors.primary },
  periodBtnText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  periodBtnTextActive: { color: Colors.primary, fontWeight: '600' },
  mb16: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },
  summaryDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  topRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  topRank: { fontSize: 12, color: Colors.textMuted, width: 24 },
  topIcon: { fontSize: 18 },
  topName: { flex: 1, fontSize: 14, color: Colors.text },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', padding: 16 },
});

const chartStyles = StyleSheet.create({
  pieRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  pieLeft: { flexDirection: 'row', alignItems: 'center', width: 140, gap: 6 },
  pieIcon: { fontSize: 16 },
  pieName: { fontSize: 12, color: Colors.text, flex: 1 },
  pieBarWrapper: { flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: 4 },
  pieBar: { height: 8, borderRadius: 4 },
  pieAmount: { fontSize: 12, color: Colors.textSecondary, width: 36, textAlign: 'right' },
  legend: { flexDirection: 'row', gap: 20, justifyContent: 'center', marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: Colors.textSecondary },
  empty: { color: Colors.textSecondary, textAlign: 'center', paddingVertical: 24, fontSize: 14 },
});
