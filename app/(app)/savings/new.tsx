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
import { addMonths, format } from 'date-fns';

import { useCreateSavingsGoal } from '@/hooks/useSavings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/colors';

export default function NewSavingsGoalScreen() {
  const createGoal = useCreateSavingsGoal();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState(format(addMonths(new Date(), 6), 'yyyy-MM-dd'));

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Ingresa el nombre de la meta');
      return;
    }
    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    try {
      await createGoal.mutateAsync({
        name: name.trim(),
        target_amount: amount,
        deadline,
      });
      router.back();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear meta';
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
            Nueva meta de ahorro
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
              Nombre de la meta
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ej: Vacaciones, Auto nuevo..."
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

          {/* Target amount */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
              Monto objetivo
            </Text>
            <TextInput
              value={targetAmount}
              onChangeText={setTargetAmount}
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
                color: Colors.income,
                fontSize: 24,
                fontWeight: '800',
              }}
            />
          </View>

          {/* Deadline */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
              Fecha límite (YYYY-MM-DD)
            </Text>
            <TextInput
              value={deadline}
              onChangeText={setDeadline}
              placeholder="2025-12-31"
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
            label="Crear meta"
            onPress={handleSubmit}
            loading={createGoal.isPending}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
