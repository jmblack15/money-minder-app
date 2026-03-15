import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions';
import { useFinanceStore } from '@/store/financeStore';
import { TransactionList } from '@/components/transactions/TransactionList';
import { Badge } from '@/components/ui/Badge';
import { Colors } from '@/constants/colors';
import { Transaction } from '@/types';

const TYPE_FILTERS = [
  { label: 'Todos', value: undefined },
  { label: 'Gastos', value: 'expense' as const },
  { label: 'Ingresos', value: 'income' as const },
  { label: 'Transferencias', value: 'transfer' as const },
];

export default function TransactionsScreen() {
  const { activeFilters, setActiveFilters } = useFinanceStore();
  const [selectedType, setSelectedType] = useState<'expense' | 'income' | 'transfer' | undefined>(
    activeFilters.type,
  );

  const { data, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useTransactions({ type: selectedType });

  const deleteTransaction = useDeleteTransaction();

  const transactions: Transaction[] = data?.pages.flatMap((p) => p.items) ?? [];

  const handleTypeFilter = (type: typeof selectedType) => {
    setSelectedType(type);
    setActiveFilters({ type });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
      >
        <Text style={{ color: Colors.textPrimary, fontSize: 22, fontWeight: '800' }}>
          Transacciones
        </Text>
        <Pressable
          onPress={() => router.push('/(app)/transactions/new')}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: Colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="add" size={22} color={Colors.textPrimary} />
        </Pressable>
      </View>

      {/* Type filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingBottom: 12 }}
      >
        {TYPE_FILTERS.map((f) => {
          const isActive = selectedType === f.value;
          return (
            <Pressable
              key={f.label}
              onPress={() => handleTypeFilter(f.value)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 100,
                backgroundColor: isActive ? Colors.primary : Colors.surface,
                borderWidth: 1,
                borderColor: isActive ? Colors.primary : Colors.border,
              }}
            >
              <Text
                style={{
                  color: isActive ? Colors.textPrimary : Colors.textSecondary,
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* List */}
      <TransactionList
        transactions={transactions}
        isLoading={isLoading}
        isRefreshing={false}
        onRefresh={() => refetch()}
        onLoadMore={handleLoadMore}
      />
    </SafeAreaView>
  );
}
