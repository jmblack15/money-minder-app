import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { useTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/useTransactions';
import { Card } from '@/components/ui/Card';
import { AmountText } from '@/components/ui/AmountText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/colors';

const TYPE_LABEL: Record<string, { label: string; color: string }> = {
  income: { label: 'Ingreso', color: Colors.income },
  expense: { label: 'Gasto', color: Colors.expense },
  transfer: { label: 'Transferencia', color: Colors.primary },
};

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: transaction, isLoading } = useTransaction(id);
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const handleEdit = () => {
    setDescription(transaction?.description ?? '');
    setNotes(transaction?.notes ?? '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!transaction) return;
    try {
      await updateTransaction.mutateAsync({
        id: transaction.id,
        payload: { description, notes },
      });
      setIsEditing(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar';
      Alert.alert('Error', msg);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar transacción',
      '¿Estás seguro de que deseas eliminar esta transacción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (!transaction) return;
            try {
              await deleteTransaction.mutateAsync(transaction.id);
              router.back();
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Error al eliminar';
              Alert.alert('Error', msg);
            }
          },
        },
      ],
    );
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!transaction) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: Colors.textSecondary }}>Transacción no encontrada</Text>
      </SafeAreaView>
    );
  }

  const typeInfo = TYPE_LABEL[transaction.type] ?? TYPE_LABEL.expense;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          gap: 12,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textSecondary} />
        </Pressable>
        <Text style={{ color: Colors.textPrimary, fontSize: 20, fontWeight: '700', flex: 1 }}>
          Detalle
        </Text>
        <Pressable onPress={handleEdit}>
          <Ionicons name="pencil-outline" size={22} color={Colors.primary} />
        </Pressable>
        <Pressable onPress={handleDelete}>
          <Ionicons name="trash-outline" size={22} color={Colors.expense} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        {/* Main card */}
        <Card elevated style={{ alignItems: 'center', gap: 12, paddingVertical: 28 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: `${transaction.category?.color ?? Colors.primary}22`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 30 }}>{transaction.category?.icon ?? '💰'}</Text>
          </View>
          <Badge
            label={typeInfo.label}
            backgroundColor={`${typeInfo.color}22`}
            color={typeInfo.color}
          />
          <AmountText
            amount={transaction.amount}
            type={transaction.type === 'income' ? 'income' : transaction.type === 'expense' ? 'expense' : 'neutral'}
            size={36}
            showSign
          />
          <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>
            {format(new Date(transaction.date), "EEEE, dd 'de' MMMM yyyy", { locale: es })}
          </Text>
        </Card>

        {/* Details */}
        <Card style={{ gap: 14 }}>
          <DetailRow
            label="Categoría"
            value={`${transaction.category?.icon ?? ''} ${transaction.category?.name ?? 'Sin categoría'}`}
          />
          <DetailRow label="Cuenta" value={transaction.account?.name ?? 'Sin cuenta'} />

          {isEditing ? (
            <>
              <View style={{ gap: 6 }}>
                <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>Descripción</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  style={{
                    backgroundColor: Colors.surfaceElevated,
                    borderRadius: 12,
                    padding: 12,
                    color: Colors.textPrimary,
                    fontSize: 15,
                    borderWidth: 1,
                    borderColor: Colors.border,
                  }}
                />
              </View>
              <View style={{ gap: 6 }}>
                <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>Notas</Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  style={{
                    backgroundColor: Colors.surfaceElevated,
                    borderRadius: 12,
                    padding: 12,
                    color: Colors.textPrimary,
                    fontSize: 15,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    minHeight: 80,
                    textAlignVertical: 'top',
                  }}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Button label="Cancelar" variant="secondary" onPress={() => setIsEditing(false)} size="sm" />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Guardar"
                    onPress={handleSave}
                    loading={updateTransaction.isPending}
                    size="sm"
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              {transaction.description && (
                <DetailRow label="Descripción" value={transaction.description} />
              )}
              {transaction.notes && (
                <DetailRow label="Notas" value={transaction.notes} />
              )}
            </>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
      <Text style={{ color: Colors.textSecondary, fontSize: 14, flex: 1 }}>{label}</Text>
      <Text style={{ color: Colors.textPrimary, fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'right' }}>
        {value}
      </Text>
    </View>
  );
}
