import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useDashboardSummary } from '@/hooks/useReports';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions, flattenTransactions } from '@/hooks/useTransactions';
import { useCurrency } from '@/hooks/useCurrency';
import { Card } from '@/components/ui/Card';
import { AmountText } from '@/components/ui/AmountText';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { CardSkeleton, TransactionSkeleton } from '@/components/ui/SkeletonLoader';
import { Transaction, Account } from '@/constants/types';
import type { ViewStyle } from 'react-native';

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  BANK: 'Banco',
  CASH: 'Efectivo',
  CREDIT_CARD: 'Crédito',
  SAVINGS: 'Ahorro',
};

function AccountCard({ account }: { account: Account }) {
  const { format: fmt } = useCurrency();
  return (
    <Card style={StyleSheet.flatten([styles.accountCard, { borderColor: `${account.color}40` }])} padding={18}>
      <View style={[styles.accountDot, { backgroundColor: account.color }]} />
      <Text style={styles.accountName} numberOfLines={1}>{account.name}</Text>
      <Badge
        label={ACCOUNT_TYPE_LABELS[account.type] ?? account.type}
        color={account.color}
        size="sm"
        style={styles.accountBadge}
      />
      <Text style={styles.accountBalance}>{fmt(account.balance)}</Text>
    </Card>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  return (
    <Pressable
      onPress={() => router.push(`/transaction/${tx.id}` as never)}
      style={({ pressed }) => [styles.txRow, pressed && styles.txRowPressed]}
    >
      <View style={[styles.txIcon, { backgroundColor: `${tx.category?.color ?? Colors.primary}22` }]}>
        <Text style={styles.txEmoji}>{tx.category?.icon ?? '💰'}</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txDescription} numberOfLines={1}>{tx.description}</Text>
        <Text style={styles.txMeta}>
          {tx.account?.name} · {format(parseISO(tx.date), 'dd MMM', { locale: es })}
        </Text>
      </View>
      <AmountText amount={tx.amount} type={tx.type} showSign size="sm" />
    </Pressable>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { format: fmt } = useCurrency();

  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useDashboardSummary();
  const { data: accountsData, isLoading: accountsLoading, refetch: refetchAccounts } = useAccounts();
  const { data: txData, isLoading: txLoading, refetch: refetchTx } = useTransactions({ limit: 5 });

  const transactions = flattenTransactions(txData).slice(0, 5);
  const accounts = accountsData ?? [];

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const monthIncome = summary?.totalIncome ?? 0;
  const monthExpense = summary?.totalExpense ?? 0;
  const expenseProgress = monthIncome > 0 ? (monthExpense / monthIncome) * 100 : 0;

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refetchAccounts(), refetchTx()]);
    setRefreshing(false);
  }, [refetchSummary, refetchAccounts, refetchTx]);

  async function handleFAB() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/transaction/new' as never);
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

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
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.userName}>{user?.name ?? 'Usuario'} 👋</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/accounts' as never)} style={styles.avatarBtn}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? 'U'}</Text>
          </TouchableOpacity>
        </View>

        {/* Total Balance */}
        <Card style={styles.balanceCard} padding={24}>
          <Text style={styles.balanceLabel}>Balance total</Text>
          {summaryLoading ? (
            <View style={{ height: 44, marginBottom: 20 }} />
          ) : (
            <Text style={styles.balanceAmount}>{fmt(totalBalance)}</Text>
          )}
          <View style={styles.balanceRow}>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>↑ Ingresos</Text>
              <Text style={[styles.balanceStatValue, { color: Colors.income }]}>{fmt(monthIncome)}</Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>↓ Gastos</Text>
              <Text style={[styles.balanceStatValue, { color: Colors.expense }]}>{fmt(monthExpense)}</Text>
            </View>
          </View>
        </Card>

        {/* Accounts */}
        <Text style={styles.sectionTitle}>Cuentas</Text>
        {accountsLoading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.accountsRow}>
            {[1, 2].map((i) => <CardSkeleton key={i} />)}
          </ScrollView>
        ) : (
          <FlatList
            data={accounts}
            keyExtractor={(a) => a.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.accountsRow}
            renderItem={({ item }) => <AccountCard account={item} />}
            ListEmptyComponent={
              <TouchableOpacity onPress={() => router.push('/(tabs)/accounts' as never)} style={styles.addAccountCard}>
                <Text style={styles.addAccountText}>+ Agregar cuenta</Text>
              </TouchableOpacity>
            }
          />
        )}

        {/* Monthly Summary */}
        <Text style={styles.sectionTitle}>Resumen del mes</Text>
        <Card padding={20} style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Gastos vs Ingresos</Text>
            <Text style={styles.summaryPercent}>{expenseProgress.toFixed(0)}%</Text>
          </View>
          <ProgressBar progress={expenseProgress} style={styles.progressBar} />
          <View style={styles.summaryLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.income }]} />
              <Text style={styles.legendText}>Ingresos: {fmt(monthIncome)}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.expense }]} />
              <Text style={styles.legendText}>Gastos: {fmt(monthExpense)}</Text>
            </View>
          </View>
        </Card>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimas transacciones</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/transactions' as never)}>
            <Text style={styles.seeAll}>Ver todas →</Text>
          </TouchableOpacity>
        </View>

        <Card padding={0}>
          {txLoading ? (
            [1, 2, 3].map((i) => <TransactionSkeleton key={i} />)
          ) : transactions.length === 0 ? (
            <Text style={styles.emptyTx}>Sin transacciones recientes</Text>
          ) : (
            transactions.map((tx, idx) => (
              <View key={tx.id}>
                <TransactionRow tx={tx} />
                {idx < transactions.length - 1 && <View style={styles.txDivider} />}
              </View>
            ))
          )}
        </Card>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 80 }]} onPress={handleFAB} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  greeting: { fontSize: 14, color: Colors.textSecondary },
  userName: { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 2 },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.text, fontWeight: '700', fontSize: 16 },
  balanceCard: { marginBottom: 24, borderColor: `${Colors.primary}30` },
  balanceLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  balanceAmount: { fontSize: 36, fontWeight: '800', color: Colors.text, marginBottom: 20 },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  balanceStat: { flex: 1, alignItems: 'center' },
  balanceStatLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  balanceStatValue: { fontSize: 16, fontWeight: '700' },
  balanceDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  accountsRow: { paddingRight: 20, gap: 12, marginBottom: 24 },
  accountCard: { width: 160, marginBottom: 0 },
  accountDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 10 },
  accountName: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  accountBadge: { marginBottom: 12 },
  accountBalance: { fontSize: 18, fontWeight: '800', color: Colors.text },
  addAccountCard: {
    width: 160,
    height: 120,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAccountText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  summaryCard: { marginBottom: 24 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: Colors.textSecondary },
  summaryPercent: { fontSize: 14, fontWeight: '700', color: Colors.text },
  progressBar: { marginBottom: 16 },
  summaryLegend: { flexDirection: 'row', gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: Colors.textSecondary },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  txRowPressed: { backgroundColor: Colors.surfaceAlt },
  txIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  txEmoji: { fontSize: 20 },
  txInfo: { flex: 1 },
  txDescription: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 3 },
  txMeta: { fontSize: 12, color: Colors.textSecondary },
  txDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  emptyTx: { color: Colors.textSecondary, textAlign: 'center', padding: 24, fontSize: 14 },
  fab: {
    position: 'absolute',
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  fabIcon: { fontSize: 28, color: Colors.text, lineHeight: 30 },
});
