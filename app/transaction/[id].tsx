import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Colors } from '@/constants/colors';
import { useTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/useTransactions';
import { useCurrency } from '@/hooks/useCurrency';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AmountText } from '@/components/ui/AmountText';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TransactionType } from '@/constants/types';

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

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: tx, isLoading } = useTransaction(id);
  const { mutateAsync: deleteTransaction, isPending: isDeleting } = useDeleteTransaction();

  async function handleDelete() {
    Alert.alert('Eliminar transacción', '¿Estás seguro? Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTransaction(id);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.back();
          } catch {
            Alert.alert('Error', 'No se pudo eliminar la transacción');
          }
        },
      },
    ]);
  }

  if (isLoading || !tx) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Detalle</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Amount Hero */}
          <Card padding={28} style={styles.heroCard}>
            <View style={[styles.heroIcon, { backgroundColor: `${tx.category?.color ?? Colors.primary}22` }]}>
              <Text style={styles.heroEmoji}>{tx.category?.icon ?? '💰'}</Text>
            </View>
            <AmountText amount={tx.amount} type={tx.type} showSign size="xl" style={styles.heroAmount} />
            <Text style={styles.heroDescription}>{tx.description}</Text>
            <Badge
              label={TYPE_LABELS[tx.type]}
              color={TYPE_COLORS[tx.type]}
              style={styles.heroBadge}
            />
          </Card>

          {/* Details */}
          <Card padding={20} style={styles.detailsCard}>
            <DetailRow
              label="Fecha"
              value={format(parseISO(tx.date), "EEEE, d 'de' MMMM yyyy", { locale: es })}
            />
            <DetailRow label="Cuenta" value={tx.account?.name ?? '—'} />
            {tx.category && <DetailRow label="Categoría" value={`${tx.category.icon} ${tx.category.name}`} />}
            {tx.toAccount && <DetailRow label="Cuenta destino" value={tx.toAccount.name} />}
            {tx.notes && <DetailRow label="Notas" value={tx.notes} />}
            <DetailRow
              label="Registrado"
              value={format(parseISO(tx.createdAt), 'dd/MM/yyyy HH:mm')}
            />
          </Card>

          {/* Delete */}
          <Button
            label="Eliminar transacción"
            variant="danger"
            onPress={handleDelete}
            loading={isDeleting}
            fullWidth
            style={styles.deleteBtn}
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: { fontSize: 16, color: Colors.textSecondary },
  title: { fontSize: 17, fontWeight: '700', color: Colors.text },
  scrollContent: { paddingHorizontal: 20 },
  heroCard: { alignItems: 'center', marginBottom: 16 },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroEmoji: { fontSize: 36 },
  heroAmount: { marginBottom: 8 },
  heroDescription: { fontSize: 16, color: Colors.textSecondary, marginBottom: 16 },
  heroBadge: { alignSelf: 'center' },
  detailsCard: { marginBottom: 24 },
  deleteBtn: { marginBottom: 16 },
});

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  value: { fontSize: 14, color: Colors.text, fontWeight: '500', flex: 2, textAlign: 'right' },
});
