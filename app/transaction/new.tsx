import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { Colors } from '@/constants/colors';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { TransactionType } from '@/constants/types';
import type { ViewStyle } from 'react-native';

const TYPES: { key: TransactionType; label: string; color: string }[] = [
  { key: 'EXPENSE', label: '↓ Gasto', color: Colors.expense },
  { key: 'INCOME', label: '↑ Ingreso', color: Colors.income },
  { key: 'TRANSFER', label: '⇄ Transfer', color: Colors.info },
];

export default function NewTransactionScreen() {
  const insets = useSafeAreaInsets();
  const { mutateAsync: createTransaction, isPending } = useCreateTransaction();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [toAccountId, setToAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date] = useState(format(new Date(), 'yyyy-MM-dd'));

  const filteredCategories = categories.filter((c) =>
    type === 'TRANSFER' ? true : c.type === (type as string),
  );

  async function handleSubmit() {
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Ingresa una descripción');
      return;
    }
    if (!accountId) {
      Alert.alert('Error', 'Selecciona una cuenta');
      return;
    }
    if (type === 'TRANSFER' && !toAccountId) {
      Alert.alert('Error', 'Selecciona la cuenta destino');
      return;
    }

    try {
      await createTransaction({
        type,
        amount: parsedAmount,
        description: description.trim(),
        notes: notes.trim() || undefined,
        date,
        accountId,
        categoryId: categoryId || undefined,
        toAccountId: type === 'TRANSFER' ? toAccountId : undefined,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error: unknown) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg = error instanceof Error ? error.message : 'Error al crear transacción';
      Alert.alert('Error', msg);
    }
  }

  const typeConfig = TYPES.find((t) => t.key === type)!;

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
          <Text style={styles.title}>Nueva transacción</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Type Selector */}
          <Card padding={6} style={styles.typeCard}>
            <View style={styles.typeRow}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.typeBtn, type === t.key && { backgroundColor: `${t.color}20`, borderColor: t.color }]}
                  onPress={() => setType(t.key)}
                >
                  <Text style={[styles.typeBtnText, type === t.key && { color: t.color }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Amount */}
          <Card padding={24} style={styles.amountCard}>
            <Text style={styles.amountLabel}>Monto</Text>
            <View style={styles.amountRow}>
              <Text style={[styles.currency, { color: typeConfig.color }]}>$</Text>
              <TextInput
                style={[styles.amountInput, { color: typeConfig.color }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
                autoFocus
              />
            </View>
          </Card>

          {/* Description */}
          <Input
            label="Descripción"
            placeholder="Ej: Supermercado, salario, etc."
            value={description}
            onChangeText={setDescription}
            autoCapitalize="sentences"
          />

          {/* Account */}
          <Text style={styles.fieldLabel}>Cuenta {type === 'TRANSFER' ? 'origen' : ''}</Text>
          <View style={styles.chipGrid}>
            {accounts.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={[styles.chip, accountId === a.id && styles.chipActive]}
                onPress={() => setAccountId(a.id)}
              >
                <View style={[styles.chipDot, { backgroundColor: a.color }]} />
                <Text style={[styles.chipText, accountId === a.id && styles.chipTextActive]}>{a.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Destination Account (transfer only) */}
          {type === 'TRANSFER' && (
            <>
              <Text style={styles.fieldLabel}>Cuenta destino</Text>
              <View style={styles.chipGrid}>
                {accounts.filter((a) => a.id !== accountId).map((a) => (
                  <TouchableOpacity
                    key={a.id}
                    style={[styles.chip, toAccountId === a.id && styles.chipActive]}
                    onPress={() => setToAccountId(a.id)}
                  >
                    <View style={[styles.chipDot, { backgroundColor: a.color }]} />
                    <Text style={[styles.chipText, toAccountId === a.id && styles.chipTextActive]}>{a.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Category */}
          {type !== 'TRANSFER' && filteredCategories.length > 0 && (
            <>
              <Text style={styles.fieldLabel}>Categoría</Text>
              <View style={styles.categoryGrid}>
                {filteredCategories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.categoryItem,
                      categoryId === c.id && { backgroundColor: `${c.color}20`, borderColor: c.color },
                    ]}
                    onPress={() => setCategoryId(categoryId === c.id ? '' : c.id)}
                  >
                    <Text style={styles.categoryEmoji}>{c.icon}</Text>
                    <Text
                      style={[styles.categoryLabel, categoryId === c.id && { color: c.color }]}
                      numberOfLines={1}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Notes */}
          <Input
            label="Notas (opcional)"
            placeholder="Agrega una nota..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.notesInput}
          />

          <Button
            label="Guardar transacción"
            onPress={handleSubmit}
            loading={isPending}
            fullWidth
            size="lg"
            style={StyleSheet.flatten([styles.submitBtn, { backgroundColor: typeConfig.color }])}
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  typeCard: { marginBottom: 16, borderRadius: 16 },
  typeRow: { flexDirection: 'row', gap: 4 },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  typeBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  amountCard: { marginBottom: 20, alignItems: 'center' },
  amountLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currency: { fontSize: 28, fontWeight: '700', marginRight: 6 },
  amountInput: { fontSize: 48, fontWeight: '800', minWidth: 120, textAlign: 'center' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8, marginTop: 4 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 6,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}20` },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontSize: 13, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary, fontWeight: '600' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  categoryItem: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  categoryEmoji: { fontSize: 22, marginBottom: 4 },
  categoryLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },
  notesInput: { textAlignVertical: 'top', paddingTop: 14, minHeight: 80 },
  submitBtn: { marginTop: 8 },
});
