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

import { useCreateBudget } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { BUDGET_PERIODS } from '@/constants/categories';
import { Category } from '@/types';

export default function NewBudgetScreen() {
  const { data: categories = [] } = useCategories();
  const createBudget = useCreateBudget();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const [alertAt, setAlertAt] = useState('80');

  const expenseCategories = categories.filter(
    (c) => c.type === 'expense' || c.type === 'both',
  );

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Selecciona una categoría');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    try {
      await createBudget.mutateAsync({
        category_id: selectedCategory.id,
        amount: parsedAmount,
        period,
        alert_at: parseInt(alertAt, 10) || 80,
      });
      router.back();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear presupuesto';
      Alert.alert('Error', msg);
    }
  };

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
          <Text style={{ color: Colors.textPrimary, fontSize: 20, fontWeight: '700' }}>
            Nuevo presupuesto
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Category selector */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
              Categoría
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {expenseCategories.map((cat) => (
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

          {/* Amount */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
              Límite de presupuesto
            </Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={Colors.textSecondary}
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: Colors.border,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: Colors.textPrimary,
                fontSize: 18,
                fontWeight: '700',
              }}
            />
          </View>

          {/* Period */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
              Período
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {BUDGET_PERIODS.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => setPeriod(p.id)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 14,
                    alignItems: 'center',
                    backgroundColor: period === p.id ? Colors.primary : Colors.surface,
                    borderWidth: 1,
                    borderColor: period === p.id ? Colors.primary : Colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: period === p.id ? Colors.textPrimary : Colors.textSecondary,
                      fontWeight: '600',
                      fontSize: 14,
                    }}
                  >
                    {p.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Alert threshold */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
              Alertar al alcanzar (%)
            </Text>
            <TextInput
              value={alertAt}
              onChangeText={setAlertAt}
              keyboardType="number-pad"
              placeholder="80"
              placeholderTextColor={Colors.textSecondary}
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: Colors.border,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: Colors.textPrimary,
                fontSize: 16,
              }}
            />
          </View>

          <Button
            label="Crear presupuesto"
            onPress={handleSubmit}
            loading={createBudget.isPending}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
