import React from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '@/store/authStore';
import { useAccounts } from '@/hooks/useAccounts';
import { useRecentTransactions } from '@/hooks/useTransactions';
import { useReportSummary, getPeriodDates } from '@/hooks/useReports';
import { Card } from '@/components/ui/Card';
import { AmountText } from '@/components/ui/AmountText';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TransactionCard } from '@/components/transactions/TransactionCard';
import { CardSkeleton, TransactionSkeleton } from '@/components/ui/SkeletonLoader';
import { Colors } from '@/constants/colors';
import { Account } from '@/types';

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `¡Buenos días, ${name}! 🌅`;
  if (hour < 18) return `¡Buenas tardes, ${name}! ☀️`;
  return `¡Buenas noches, ${name}! 🌙`;
}

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const period = getPeriodDates('this_month');

  const {
    data: accounts = [],
    isLoading: accountsLoading,
    refetch: refetchAccounts,
  } = useAccounts();

  const {
    data: recentData,
    isLoading: txLoading,
    refetch: refetchTx,
  } = useRecentTransactions(5);

  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useReportSummary(period);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const recentTx = recentData?.items ?? [];

  const isRefreshing = false;
  const onRefresh = () => {
    refetchAccounts();
    refetchTx();
    refetchSummary();
  };

  const incomeProgress =
    summary && summary.total_income + summary.total_expenses > 0
      ? (summary.total_income / (summary.total_income + summary.total_expenses)) * 100
      : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>
              {getGreeting(user?.name?.split(' ')[0] ?? 'Usuario')}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(app)/accounts/index')}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: Colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <Ionicons name="wallet-outline" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>

        {/* Total Balance */}
        <Card elevated style={{ alignItems: 'center', gap: 4, paddingVertical: 24 }}>
          <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>Balance total</Text>
          <AmountText amount={totalBalance} size={36} />
          <Text style={{ color: Colors.textSecondary, fontSize: 13, marginTop: 4 }}>
            {accounts.length} {accounts.length === 1 ? 'cuenta' : 'cuentas'}
          </Text>
        </Card>

        {/* Accounts scroll */}
        {accountsLoading ? (
          <CardSkeleton />
        ) : accounts.length > 0 ? (
          <View>
            <Text style={{ color: Colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>
              Mis cuentas
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {accounts.map((account: Account) => (
                <Pressable
                  key={account.id}
                  onPress={() => router.push('/(app)/accounts/index')}
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 16,
                    padding: 16,
                    minWidth: 160,
                    gap: 8,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    borderTopWidth: 3,
                    borderTopColor: account.color,
                  }}
                >
                  <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>{account.type}</Text>
                  <Text
                    style={{ color: Colors.textPrimary, fontSize: 15, fontWeight: '700' }}
                    numberOfLines={1}
                  >
                    {account.name}
                  </Text>
                  <AmountText amount={account.balance} size={18} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Month Summary */}
        {summaryLoading ? (
          <CardSkeleton />
        ) : summary ? (
          <Card style={{ gap: 14 }}>
            <Text style={{ color: Colors.textPrimary, fontSize: 16, fontWeight: '700' }}>
              Resumen del mes
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>Ingresos</Text>
                <AmountText amount={summary.total_income} type="income" size={18} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>Gastos</Text>
                <AmountText amount={summary.total_expenses} type="expense" size={18} />
              </View>
            </View>
            <ProgressBar percentage={incomeProgress} height={10} />
          </Card>
        ) : null}

        {/* Recent Transactions */}
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: Colors.textPrimary, fontSize: 16, fontWeight: '700' }}>
              Últimas transacciones
            </Text>
            <Pressable onPress={() => router.push('/(app)/transactions/index')}>
              <Text style={{ color: Colors.primary, fontSize: 14 }}>Ver todas</Text>
            </Pressable>
          </View>

          {txLoading ? (
            <View style={{ gap: 8 }}>
              {[1, 2, 3].map((i) => (
                <TransactionSkeleton key={i} />
              ))}
            </View>
          ) : recentTx.length > 0 ? (
            <View style={{ gap: 8 }}>
              {recentTx.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
                  onPress={() => router.push(`/(app)/transactions/${tx.id}`)}
                />
              ))}
            </View>
          ) : (
            <Text style={{ color: Colors.textSecondary, textAlign: 'center', paddingVertical: 20 }}>
              Aún no hay transacciones
            </Text>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => router.push('/(app)/transactions/new')}
        style={({ pressed }) => ({
          position: 'absolute',
          bottom: 90,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: Colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.85 : 1,
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        })}
      >
        <Ionicons name="add" size={28} color={Colors.textPrimary} />
      </Pressable>
    </SafeAreaView>
  );
}
