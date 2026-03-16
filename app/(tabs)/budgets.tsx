import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useBudgets, useCreateBudget, useDeleteBudget, useBudgetProgress } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useCurrency } from '@/hooks/useCurrency';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { SkeletonBox } from '@/components/ui/SkeletonLoader';
import { Budget, BudgetPeriod } from '@/constants/types';

const PERIOD_LABELS: Record<BudgetPeriod, string> = {
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensual',
};

// ─── Budget Card ──────────────────────────────────────────────────────────────

function BudgetCard({ budget, onDelete }: { budget: Budget; onDelete: (id: string) => void }) {
  const { format: fmt } = useCurrency();
  const { percentage, isWarning, isDanger, isExceeded, rawPercentage } = useBudgetProgress(budget);

  const barColor = isDanger ? Colors.progressDanger : isWarning ? Colors.progressWarning : Colors.progressSafe;
  const statusColor = isDanger ? Colors.expense : isWarning ? Colors.warning : Colors.income;

  return (
    <Card padding={18} style={styles.budgetCard}>
      <View style={styles.budgetHeader}>
        <View style={styles.budgetLeft}>
          <View style={[styles.categoryIcon, { backgroundColor: `${budget.category?.color ?? Colors.primary}20` }]}>
            <Text style={styles.categoryEmoji}>{budget.category?.icon ?? '💰'}</Text>
          </View>
          <View>
            <Text style={styles.categoryName}>{budget.category?.name ?? 'Sin categoría'}</Text>
            <Badge label={PERIOD_LABELS[budget.period]} size="sm" color={Colors.primary} />
          </View>
        </View>
        <TouchableOpacity onPress={() => onDelete(budget.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {isExceeded && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>⚠️ Presupuesto superado</Text>
        </View>
      )}

      <View style={styles.amountRow}>
        <Text style={styles.spentAmount}>{fmt(budget.spent)}</Text>
        <Text style={styles.totalAmount}> / {fmt(budget.amount)}</Text>
      </View>

      <ProgressBar progress={percentage} color={barColor} height={10} style={styles.progressBar} />

      <View style={styles.budgetFooter}>
        <Text style={[styles.percentText, { color: statusColor }]}>{rawPercentage.toFixed(0)}% usado</Text>
        <Text style={styles.remainingText}>
          {fmt(Math.max(budget.amount - budget.spent, 0))} disponible
        </Text>
      </View>
    </Card>
  );
}

// ─── Create Budget Sheet ──────────────────────────────────────────────────────

function CreateBudgetSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { mutateAsync: createBudget, isPending } = useCreateBudget();
  const { data: categories = [] } = useCategories('EXPENSE');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<BudgetPeriod>('MONTHLY');

  async function handleCreate() {
    if (!categoryId) return Alert.alert('Error', 'Selecciona una categoría');
    const parsed = parseFloat(amount.replace(',', '.'));
    if (!parsed || parsed <= 0) return Alert.alert('Error', 'Ingresa un monto válido');

    try {
      await createBudget({ categoryId, amount: parsed, period, startDate: new Date().toISOString().slice(0, 10) });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
      setCategoryId('');
      setAmount('');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al crear presupuesto';
      Alert.alert('Error', msg);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Nuevo presupuesto">
      <Text style={sheetStyles.label}>Período</Text>
      <View style={sheetStyles.chipRow}>
        {(['MONTHLY', 'WEEKLY'] as BudgetPeriod[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[sheetStyles.chip, period === p && sheetStyles.chipActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[sheetStyles.chipText, period === p && sheetStyles.chipTextActive]}>
              {PERIOD_LABELS[p]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={sheetStyles.label}>Categoría</Text>
      <View style={sheetStyles.categoryGrid}>
        {categories.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[sheetStyles.categoryItem, categoryId === c.id && { backgroundColor: `${c.color}20`, borderColor: c.color }]}
            onPress={() => setCategoryId(c.id)}
          >
            <Text style={sheetStyles.categoryEmoji}>{c.icon}</Text>
            <Text style={[sheetStyles.categoryLabel, categoryId === c.id && { color: c.color }]} numberOfLines={1}>
              {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={sheetStyles.label}>Monto límite</Text>
      <View style={sheetStyles.amountInput}>
        <Text style={sheetStyles.currencySign}>$</Text>
        <Text
          style={sheetStyles.amountText}
          onPress={() => {}}
          suppressHighlighting
        >
          {amount || '0.00'}
        </Text>
      </View>
      <View style={sheetStyles.numpad}>
        {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map((key) => (
          <TouchableOpacity
            key={key}
            style={sheetStyles.numKey}
            onPress={() => {
              if (key === '⌫') setAmount((v) => v.slice(0, -1));
              else if (key === '.' && amount.includes('.')) return;
              else setAmount((v) => v + key);
            }}
          >
            <Text style={sheetStyles.numKeyText}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button label="Crear presupuesto" onPress={handleCreate} loading={isPending} fullWidth style={sheetStyles.btn} />
    </BottomSheet>
  );
}

// ─── Budgets Screen ───────────────────────────────────────────────────────────

export default function BudgetsScreen() {
  const insets = useSafeAreaInsets();
  const [createVisible, setCreateVisible] = useState(false);
  const { data: budgets, isLoading, refetch } = useBudgets();
  const { mutate: deleteBudget } = useDeleteBudget();
  const { format: fmt } = useCurrency();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  function handleDelete(id: string) {
    Alert.alert('Eliminar presupuesto', '¿Eliminar este presupuesto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          deleteBudget(id);
        },
      },
    ]);
  }

  const totalBudget = budgets?.reduce((s, b) => s + b.amount, 0) ?? 0;
  const totalSpent = budgets?.reduce((s, b) => s + b.spent, 0) ?? 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Presupuestos</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCreateVisible(true);
          }}
        >
          <Text style={styles.addBtnText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      {!isLoading && (budgets?.length ?? 0) > 0 && (
        <View style={styles.summaryPadding}>
          <Card padding={16} style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{fmt(totalBudget)}</Text>
                <Text style={styles.statLabel}>Total presupuestado</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: totalSpent > totalBudget ? Colors.expense : Colors.income }]}>
                  {fmt(totalSpent)}
                </Text>
                <Text style={styles.statLabel}>Total gastado</Text>
              </View>
            </View>
          </Card>
        </View>
      )}

      {isLoading ? (
        <View style={styles.listPadding}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.budgetCard, { marginBottom: 12 }]}>
              <SkeletonBox height={120} borderRadius={20} />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={budgets}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => (
            <BudgetCard budget={item} onDelete={handleDelete} />
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="🎯"
              title="Sin presupuestos"
              description="Crea presupuestos para controlar tus gastos por categoría"
              actionLabel="Crear presupuesto"
              onAction={() => setCreateVisible(true)}
            />
          }
        />
      )}

      <CreateBudgetSheet visible={createVisible} onClose={() => setCreateVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: `${Colors.primary}20`,
  },
  addBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  summaryPadding: { paddingHorizontal: 20, marginBottom: 12 },
  summaryCard: {},
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  statLabel: { fontSize: 12, color: Colors.textSecondary },
  statDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  listPadding: { paddingHorizontal: 20 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  budgetCard: {},
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  budgetLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  categoryIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  categoryEmoji: { fontSize: 20 },
  categoryName: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  deleteBtn: { padding: 6 },
  deleteIcon: { fontSize: 16 },
  alertBanner: {
    backgroundColor: `${Colors.expense}20`,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  alertText: { fontSize: 12, color: Colors.expense, fontWeight: '600' },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 },
  spentAmount: { fontSize: 22, fontWeight: '800', color: Colors.text },
  totalAmount: { fontSize: 15, color: Colors.textSecondary },
  progressBar: { marginBottom: 8 },
  budgetFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  percentText: { fontSize: 12, fontWeight: '600' },
  remainingText: { fontSize: 12, color: Colors.textSecondary },
});

const sheetStyles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8, marginTop: 16 },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: `${Colors.primary}20`, borderColor: Colors.primary },
  chipText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: Colors.primary, fontWeight: '600' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryItem: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  categoryEmoji: { fontSize: 22, marginBottom: 4 },
  categoryLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  currencySign: { fontSize: 24, color: Colors.textSecondary, marginRight: 8 },
  amountText: { fontSize: 32, fontWeight: '700', color: Colors.text, flex: 1 },
  numpad: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  numKey: {
    width: '30%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
  },
  numKeyText: { fontSize: 18, color: Colors.text, fontWeight: '500' },
  btn: { marginTop: 16 },
});
