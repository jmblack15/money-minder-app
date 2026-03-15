import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { differenceInDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

import { useSavings, useContributeToGoal, useDeleteSavingsGoal } from '@/hooks/useSavings';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { AmountText, formatAmount } from '@/components/ui/AmountText';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';
import { Colors } from '@/constants/colors';
import { SavingsGoal } from '@/types';
import { useAuthStore } from '@/store/authStore';

export default function SavingsScreen() {
  const { data: goals = [], isLoading, refetch } = useSavings();
  const contribute = useContributeToGoal();
  const deleteGoal = useDeleteSavingsGoal();
  const currency = useAuthStore((s) => s.user?.currency ?? 'USD');

  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [showContributeModal, setShowContributeModal] = useState(false);

  const handleContribute = async () => {
    if (!selectedGoal) return;
    const amount = parseFloat(contributeAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }
    try {
      await contribute.mutateAsync({ id: selectedGoal.id, payload: { amount } });
      setShowContributeModal(false);
      setContributeAmount('');
      setSelectedGoal(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al abonar';
      Alert.alert('Error', msg);
    }
  };

  const handleDelete = (goal: SavingsGoal) => {
    Alert.alert('Eliminar meta', `¿Eliminar "${goal.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => deleteGoal.mutate(goal.id),
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
        <Text style={{ color: Colors.textPrimary, fontSize: 22, fontWeight: '800' }}>
          Metas de ahorro
        </Text>
        <Pressable
          onPress={() => router.push('/(app)/savings/new')}
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
          </>
        ) : goals.length === 0 ? (
          <EmptyState
            icon="🏆"
            title="Sin metas de ahorro"
            subtitle="Define metas para alcanzar tus objetivos financieros."
            actionLabel="Crear meta"
            onAction={() => router.push('/(app)/savings/new')}
          />
        ) : (
          goals.map((goal) => {
            const percentage = goal.target_amount > 0
              ? (goal.current_amount / goal.target_amount) * 100
              : 0;
            const daysLeft = differenceInDays(new Date(goal.deadline), new Date());

            return (
              <Card key={goal.id} style={{ gap: 14 }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: Colors.textPrimary, fontSize: 16, fontWeight: '700' }}>
                      🎯 {goal.name}
                    </Text>
                    <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>
                      {daysLeft > 0 ? `${daysLeft} días restantes` : 'Vencido'} •{' '}
                      {format(new Date(goal.deadline), 'dd MMM yyyy', { locale: es })}
                    </Text>
                  </View>
                  <Pressable onPress={() => handleDelete(goal)} style={{ padding: 4 }}>
                    <Ionicons name="trash-outline" size={18} color={Colors.expense} />
                  </Pressable>
                </View>

                {/* Progress */}
                <ProgressBar percentage={percentage} height={12} />

                {/* Amounts */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>Ahorrado</Text>
                    <AmountText amount={goal.current_amount} type="income" size={16} />
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>Meta</Text>
                    <AmountText amount={goal.target_amount} size={16} />
                  </View>
                </View>

                <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: '600' }}>
                  {percentage.toFixed(1)}% completado
                </Text>

                {/* Contribute button */}
                {goal.status === 'active' && (
                  <Button
                    label="Abonar a meta"
                    variant="secondary"
                    size="sm"
                    onPress={() => {
                      setSelectedGoal(goal);
                      setShowContributeModal(true);
                    }}
                  />
                )}
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Contribute modal */}
      <Modal
        visible={showContributeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowContributeModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#00000088',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 24,
              padding: 24,
              width: '100%',
              gap: 16,
            }}
          >
            <Text style={{ color: Colors.textPrimary, fontSize: 18, fontWeight: '700' }}>
              Abonar a "{selectedGoal?.name}"
            </Text>
            <TextInput
              value={contributeAmount}
              onChangeText={setContributeAmount}
              keyboardType="decimal-pad"
              placeholder="Monto a abonar"
              placeholderTextColor={Colors.textSecondary}
              autoFocus
              style={{
                backgroundColor: Colors.surfaceElevated,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: Colors.border,
                padding: 14,
                color: Colors.textPrimary,
                fontSize: 20,
                fontWeight: '700',
                textAlign: 'center',
              }}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Button
                  label="Cancelar"
                  variant="secondary"
                  onPress={() => {
                    setShowContributeModal(false);
                    setContributeAmount('');
                    setSelectedGoal(null);
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  label="Abonar"
                  onPress={handleContribute}
                  loading={contribute.isPending}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
