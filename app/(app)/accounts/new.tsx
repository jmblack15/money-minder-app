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

import { useCreateAccount } from '@/hooks/useAccounts';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { ACCOUNT_TYPES, ACCOUNT_COLORS } from '@/constants/categories';

export default function NewAccountScreen() {
  const createAccount = useCreateAccount();
  const [name, setName] = useState('');
  const [type, setType] = useState(ACCOUNT_TYPES[0].id);
  const [balance, setBalance] = useState('0');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Ingresa el nombre de la cuenta');
      return;
    }
    const parsedBalance = parseFloat(balance) || 0;

    try {
      await createAccount.mutateAsync({
        name: name.trim(),
        type,
        balance: parsedBalance,
        color,
      });
      router.back();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear cuenta';
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
            Nueva cuenta
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
              Nombre de la cuenta
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ej: Cuenta nómina, Efectivo..."
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

          {/* Account type */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
              Tipo de cuenta
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ACCOUNT_TYPES.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => setType(t.id)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: type === t.id ? Colors.primary : Colors.surface,
                    borderWidth: 1,
                    borderColor: type === t.id ? Colors.primary : Colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{t.icon}</Text>
                  <Text
                    style={{
                      color: type === t.id ? Colors.textPrimary : Colors.textSecondary,
                      fontSize: 13,
                      fontWeight: '500',
                    }}
                  >
                    {t.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Initial balance */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
              Balance inicial
            </Text>
            <TextInput
              value={balance}
              onChangeText={setBalance}
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
                fontSize: 20,
                fontWeight: '700',
              }}
            />
          </View>

          {/* Color picker */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
              Color
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {ACCOUNT_COLORS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: c,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: color === c ? 3 : 0,
                    borderColor: Colors.textPrimary,
                  }}
                >
                  {color === c && (
                    <Ionicons name="checkmark" size={18} color={Colors.textPrimary} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          <Button
            label="Crear cuenta"
            onPress={handleSubmit}
            loading={createAccount.isPending}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
