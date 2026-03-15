import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

import { useCreateTransaction } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { Account, Category } from '@/types';

type TxType = 'expense' | 'income' | 'transfer';

const schema = z.object({
  amount: z.string().min(1, 'Ingresa un monto').refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
    message: 'Monto inválido',
  }),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewTransactionScreen() {
  const [txType, setTxType] = useState<TxType>('expense');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const createTransaction = useCreateTransaction();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();

  const filteredCategories = categories.filter(
    (c) => c.type === txType || c.type === 'both',
  );

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', description: '', notes: '' },
  });

  const onSubmit = async (data: FormData) => {
    if (!selectedAccount) {
      Alert.alert('Error', 'Selecciona una cuenta');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Error', 'Selecciona una categoría');
      return;
    }

    try {
      await createTransaction.mutateAsync({
        account_id: selectedAccount.id,
        category_id: selectedCategory.id,
        amount: parseFloat(data.amount),
        type: txType,
        description: data.description ?? selectedCategory.name,
        notes: data.notes,
        date: format(selectedDate, 'yyyy-MM-dd'),
      });
      router.back();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      Alert.alert('Error', msg);
    }
  };

  const TYPE_TABS: { label: string; value: TxType; color: string }[] = [
    { label: 'Gasto', value: 'expense', color: Colors.expense },
    { label: 'Ingreso', value: 'income', color: Colors.income },
    { label: 'Transferencia', value: 'transfer', color: Colors.primary },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </Pressable>
          <Text style={{ color: Colors.textPrimary, fontSize: 20, fontWeight: '700', flex: 1 }}>
            Nueva transacción
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type selector */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: Colors.surface,
              borderRadius: 16,
              padding: 4,
              gap: 4,
            }}
          >
            {TYPE_TABS.map((tab) => (
              <Pressable
                key={tab.value}
                onPress={() => setTxType(tab.value)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: txType === tab.value ? tab.color : Colors.transparent,
                }}
              >
                <Text
                  style={{
                    color: txType === tab.value ? Colors.textPrimary : Colors.textSecondary,
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Amount input — big and prominent */}
          <Card elevated style={{ alignItems: 'center', paddingVertical: 24, gap: 8 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>Monto</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={Colors.border}
                  style={{
                    color:
                      txType === 'income'
                        ? Colors.income
                        : txType === 'expense'
                          ? Colors.expense
                          : Colors.primary,
                    fontSize: 48,
                    fontWeight: '800',
                    textAlign: 'center',
                    minWidth: 200,
                  }}
                />
              )}
            />
            {errors.amount && (
              <Text style={{ color: Colors.danger, fontSize: 12 }}>{errors.amount.message}</Text>
            )}
          </Card>

          {/* Account selector */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
              Cuenta
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {accounts.map((account) => (
                <Pressable
                  key={account.id}
                  onPress={() => setSelectedAccount(account)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 14,
                    backgroundColor:
                      selectedAccount?.id === account.id ? account.color : Colors.surface,
                    borderWidth: 1,
                    borderColor:
                      selectedAccount?.id === account.id ? account.color : Colors.border,
                    gap: 2,
                  }}
                >
                  <Text
                    style={{
                      color:
                        selectedAccount?.id === account.id
                          ? Colors.textPrimary
                          : Colors.textSecondary,
                      fontSize: 13,
                      fontWeight: '600',
                    }}
                  >
                    {account.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Category grid */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
              Categoría
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {filteredCategories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 12,
                    backgroundColor:
                      selectedCategory?.id === cat.id ? `${cat.color}33` : Colors.surface,
                    borderWidth: 1,
                    borderColor:
                      selectedCategory?.id === cat.id ? cat.color : Colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
                  <Text
                    style={{
                      color:
                        selectedCategory?.id === cat.id ? Colors.textPrimary : Colors.textSecondary,
                      fontSize: 13,
                      fontWeight: '500',
                    }}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
              Descripción (opcional)
            </Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="¿En qué gastaste?"
                  placeholderTextColor={Colors.textSecondary}
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    color: Colors.textPrimary,
                    fontSize: 15,
                  }}
                />
              )}
            />
          </View>

          {/* Notes */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
              Notas (opcional)
            </Text>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Añade notas adicionales..."
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    color: Colors.textPrimary,
                    fontSize: 15,
                    textAlignVertical: 'top',
                    minHeight: 80,
                  }}
                />
              )}
            />
          </View>

          {/* Date */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
              Fecha
            </Text>
            <Pressable
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: Colors.border,
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
              <Text style={{ color: Colors.textPrimary, fontSize: 15 }}>
                {format(selectedDate, 'dd/MM/yyyy')}
              </Text>
            </Pressable>
          </View>

          {/* Submit */}
          <Button
            label="Guardar transacción"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting || createTransaction.isPending}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
