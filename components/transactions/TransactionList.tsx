import React from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { Transaction } from '@/types';
import { TransactionCard } from './TransactionCard';
import { TransactionSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors } from '@/constants/colors';
import { router } from 'expo-router';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  ListHeaderComponent?: React.ComponentType | React.ReactElement;
}

export function TransactionList({
  transactions,
  isLoading,
  isRefreshing,
  onRefresh,
  onLoadMore,
  ListHeaderComponent,
}: TransactionListProps) {
  if (isLoading && transactions.length === 0) {
    return (
      <View style={{ gap: 8, padding: 16 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <TransactionSkeleton key={i} />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TransactionCard
          transaction={item}
          onPress={() => router.push(`/(app)/transactions/${item.id}`)}
        />
      )}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 100,
        flexGrow: 1,
      }}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        <EmptyState
          icon="💸"
          title="Sin transacciones"
          subtitle="Aún no tienes transacciones registradas."
          actionLabel="Agregar transacción"
          onAction={() => router.push('/(app)/transactions/new')}
        />
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.4}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing ?? false}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        ) : undefined
      }
    />
  );
}
