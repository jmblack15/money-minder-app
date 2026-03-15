import React from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAccounts, useDeleteAccount } from '@/hooks/useAccounts';
import { Card } from '@/components/ui/Card';
import { AmountText } from '@/components/ui/AmountText';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';
import { Colors } from '@/constants/colors';
import { ACCOUNT_TYPES } from '@/constants/categories';
import { Account } from '@/types';

function getAccountIcon(type: string): string {
  return ACCOUNT_TYPES.find((t) => t.id === type)?.icon ?? '🏦';
}

export default function AccountsScreen() {
  const { data: accounts = [], isLoading, refetch } = useAccounts();
  const deleteAccount = useDeleteAccount();

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const handleDelete = (account: Account) => {
    Alert.alert('Eliminar cuenta', `¿Eliminar "${account.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => deleteAccount.mutate(account.id),
      },
    ]);
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
          </Pressable>
          <Text style={{ color: Colors.textPrimary, fontSize: 22, fontWeight: '800' }}>
            Mis cuentas
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/(app)/accounts/new')}
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

      {/* Total balance */}
      {accounts.length > 0 && (
        <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
          <Card elevated style={{ alignItems: 'center', gap: 4, paddingVertical: 20 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>Balance total</Text>
            <AmountText amount={totalBalance} size={30} />
          </Card>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 12, flexGrow: 1, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} tintColor={Colors.primary} />
        }
      >
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : accounts.length === 0 ? (
          <EmptyState
            icon="🏦"
            title="Sin cuentas"
            subtitle="Agrega tu primera cuenta para empezar a rastrear tus finanzas."
            actionLabel="Agregar cuenta"
            onAction={() => router.push('/(app)/accounts/new')}
          />
        ) : (
          accounts.map((account) => (
            <Card
              key={account.id}
              style={{
                gap: 12,
                borderTopWidth: 3,
                borderTopColor: account.color,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: `${account.color}22`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{getAccountIcon(account.type)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: Colors.textPrimary, fontSize: 16, fontWeight: '700' }}>
                    {account.name}
                  </Text>
                  <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>
                    {ACCOUNT_TYPES.find((t) => t.id === account.type)?.name ?? account.type}
                  </Text>
                </View>
                <Pressable onPress={() => handleDelete(account)} style={{ padding: 6 }}>
                  <Ionicons name="trash-outline" size={18} color={Colors.expense} />
                </Pressable>
              </View>
              <AmountText amount={account.balance} size={22} />
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
