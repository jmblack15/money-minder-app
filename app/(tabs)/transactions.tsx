import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GestureHandlerRootView,
  Swipeable,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Colors } from '@/constants/colors';
import { useTransactions, useDeleteTransaction, flattenTransactions } from '@/hooks/useTransactions';
import { useFinanceStore } from '@/store/financeStore';
import { useCurrency } from '@/hooks/useCurrency';
import { Card } from '@/components/ui/Card';
import { AmountText } from '@/components/ui/AmountText';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { TransactionSkeleton } from '@/components/ui/SkeletonLoader';
import { Transaction, TransactionType } from '@/constants/types';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';

const TYPE_LABELS: Record<TransactionType, string> = {
  INCOME: 'Ingreso',
  EXPENSE: 'Gasto',
  TRANSFER: 'Transferencia',
};

const TYPE_COLORS: Record<TransactionType, string> = {
  INCOME: Colors.income,
  EXPENSE: Colors.expense,
  TRANSFER: Colors.info,
};

// ─── Swipe Delete Action ──────────────────────────────────────────────────────

function DeleteAction({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.deleteAction} onPress={onPress}>
      <Text style={styles.deleteIcon}>🗑️</Text>
      <Text style={styles.deleteText}>Eliminar</Text>
    </TouchableOpacity>
  );
}

// ─── Transaction Item ─────────────────────────────────────────────────────────

function TransactionItem({
  tx,
  onDelete,
}: {
  tx: Transaction;
  onDelete: (id: string) => void;
}) {
  const swipeableRef = React.useRef<Swipeable>(null);

  function handleDelete() {
    swipeableRef.current?.close();
    Alert.alert('Eliminar transacción', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          onDelete(tx.id);
        },
      },
    ]);
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={() => <DeleteAction onPress={handleDelete} />}
      rightThreshold={80}
      friction={2}
    >
      <Pressable
        onPress={() => router.push(`/transaction/${tx.id}` as never)}
        style={({ pressed }) => [styles.txItem, pressed && styles.txItemPressed]}
      >
        <View style={[styles.txIcon, { backgroundColor: `${tx.category?.color ?? Colors.primary}22` }]}>
          <Text style={styles.txEmoji}>{tx.category?.icon ?? '💰'}</Text>
        </View>
        <View style={styles.txInfo}>
          <View style={styles.txRow}>
            <Text style={styles.txDescription} numberOfLines={1}>{tx.description}</Text>
            <AmountText amount={tx.amount} type={tx.type} showSign size="sm" />
          </View>
          <View style={styles.txMeta}>
            <Badge label={TYPE_LABELS[tx.type]} color={TYPE_COLORS[tx.type]} size="sm" />
            {tx.category && (
              <Text style={styles.txCategory}>{tx.category.name}</Text>
            )}
            <Text style={styles.txDate}>
              {format(parseISO(tx.date), 'dd MMM yyyy', { locale: es })}
            </Text>
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );
}

// ─── Filters Sheet ────────────────────────────────────────────────────────────

function FiltersSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { activeFilters, setActiveFilters, resetFilters } = useFinanceStore();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();

  const types: TransactionType[] = ['INCOME', 'EXPENSE', 'TRANSFER'];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filtros">
      <Text style={filterStyles.label}>Tipo</Text>
      <View style={filterStyles.chipRow}>
        <TouchableOpacity
          style={[filterStyles.chip, !activeFilters.type && filterStyles.chipActive]}
          onPress={() => setActiveFilters({ type: undefined })}
        >
          <Text style={[filterStyles.chipText, !activeFilters.type && filterStyles.chipTextActive]}>Todos</Text>
        </TouchableOpacity>
        {types.map((t) => (
          <TouchableOpacity
            key={t}
            style={[filterStyles.chip, activeFilters.type === t && filterStyles.chipActive]}
            onPress={() => setActiveFilters({ type: t })}
          >
            <Text style={[filterStyles.chipText, activeFilters.type === t && filterStyles.chipTextActive]}>
              {TYPE_LABELS[t]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={filterStyles.label}>Cuenta</Text>
      <View style={filterStyles.chipRow}>
        <TouchableOpacity
          style={[filterStyles.chip, !activeFilters.accountId && filterStyles.chipActive]}
          onPress={() => setActiveFilters({ accountId: undefined })}
        >
          <Text style={[filterStyles.chipText, !activeFilters.accountId && filterStyles.chipTextActive]}>Todas</Text>
        </TouchableOpacity>
        {accounts.map((a) => (
          <TouchableOpacity
            key={a.id}
            style={[filterStyles.chip, activeFilters.accountId === a.id && filterStyles.chipActive]}
            onPress={() => setActiveFilters({ accountId: a.id })}
          >
            <Text style={[filterStyles.chipText, activeFilters.accountId === a.id && filterStyles.chipTextActive]}>
              {a.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={filterStyles.label}>Categoría</Text>
      <View style={filterStyles.chipRow}>
        <TouchableOpacity
          style={[filterStyles.chip, !activeFilters.categoryId && filterStyles.chipActive]}
          onPress={() => setActiveFilters({ categoryId: undefined })}
        >
          <Text style={[filterStyles.chipText, !activeFilters.categoryId && filterStyles.chipTextActive]}>Todas</Text>
        </TouchableOpacity>
        {categories.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[filterStyles.chip, activeFilters.categoryId === c.id && filterStyles.chipActive]}
            onPress={() => setActiveFilters({ categoryId: c.id })}
          >
            <Text style={[filterStyles.chipText, activeFilters.categoryId === c.id && filterStyles.chipTextActive]}>
              {c.icon} {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={filterStyles.actions}>
        <Button label="Limpiar filtros" variant="ghost" onPress={() => { resetFilters(); onClose(); }} />
        <Button label="Aplicar" onPress={onClose} style={filterStyles.applyBtn} />
      </View>
    </BottomSheet>
  );
}

// ─── Transactions Screen ──────────────────────────────────────────────────────

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const { activeFilters } = useFinanceStore();
  const { mutate: deleteTransaction } = useDeleteTransaction();
  const { format: fmt } = useCurrency();

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useTransactions(activeFilters);

  const transactions = flattenTransactions(data);
  const activeFilterCount = Object.entries(activeFilters).filter(
    ([k, v]) => !['page', 'limit'].includes(k) && v !== undefined,
  ).length;

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  function handleLoadMore() {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Transacciones</Text>
          <TouchableOpacity
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
            onPress={() => setFiltersVisible(true)}
          >
            <Text style={styles.filterIcon}>⚙️</Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View>
            {[1, 2, 3, 4, 5].map((i) => <TransactionSkeleton key={i} />)}
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(tx) => tx.id}
            renderItem={({ item }) => (
              <View style={styles.itemWrapper}>
                <TransactionItem
                  tx={item}
                  onDelete={(id) => deleteTransaction(id)}
                />
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListEmptyComponent={
              <EmptyState
                icon="💸"
                title="Sin transacciones"
                description="Registra tu primera transacción con el botón +"
                actionLabel="Agregar transacción"
                onAction={() => router.push('/transaction/new' as never)}
              />
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator color={Colors.primary} style={{ padding: 16 }} />
              ) : null
            }
          />
        )}

        {/* FAB */}
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 80 }]}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/transaction/new' as never);
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>

        <FiltersSheet visible={filtersVisible} onClose={() => setFiltersVisible(false)} />
      </View>
    </GestureHandlerRootView>
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
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}20` },
  filterIcon: { fontSize: 18 },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { fontSize: 10, color: Colors.text, fontWeight: '700' },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
  itemWrapper: { backgroundColor: Colors.surface, borderRadius: 16, overflow: 'hidden' },
  separator: { height: 8 },
  txItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  txItemPressed: { backgroundColor: Colors.surfaceAlt },
  txIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  txEmoji: { fontSize: 20 },
  txInfo: { flex: 1 },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  txDescription: { fontSize: 14, fontWeight: '600', color: Colors.text, flex: 1, marginRight: 8 },
  txMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  txCategory: { fontSize: 12, color: Colors.textSecondary },
  txDate: { fontSize: 12, color: Colors.textMuted, marginLeft: 'auto' },
  deleteAction: {
    backgroundColor: Colors.expense,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 16,
    marginLeft: 8,
  },
  deleteIcon: { fontSize: 20 },
  deleteText: { fontSize: 11, color: Colors.text, marginTop: 2, fontWeight: '600' },
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

const filterStyles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8, marginTop: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: `${Colors.primary}20`, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  applyBtn: { flex: 1 },
});
