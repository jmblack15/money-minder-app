import React from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useBudgets } from '@/hooks/useBudgets';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';
import { Colors } from '@/constants/colors';

export default function BudgetsScreen() {
  const { data: budgets = [], isLoading, refetch } = useBudgets();

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
          Presupuestos
        </Text>
        <Pressable
          onPress={() => router.push('/(app)/budgets/new')}
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
        ) : budgets.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="Sin presupuestos"
            subtitle="Crea presupuestos por categoría para controlar mejor tus gastos."
            actionLabel="Crear presupuesto"
            onAction={() => router.push('/(app)/budgets/new')}
          />
        ) : (
          budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
