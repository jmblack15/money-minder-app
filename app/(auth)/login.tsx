import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/colors';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await authService.login(data);
      await login(
        { access_token: result.access_token, refresh_token: result.refresh_token },
        result.user,
      );
      router.replace('/(app)');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      Alert.alert('Error', msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 24,
          gap: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Brand */}
        <View style={{ alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 24,
              backgroundColor: `${Colors.primary}22`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 36 }}>💰</Text>
          </View>
          <Text
            style={{
              color: Colors.textPrimary,
              fontSize: 28,
              fontWeight: '800',
              letterSpacing: -0.5,
            }}
          >
            Money Minder
          </Text>
          <Text style={{ color: Colors.textSecondary, fontSize: 15, textAlign: 'center' }}>
            Controla tus finanzas con inteligencia
          </Text>
        </View>

        {/* Form */}
        <View style={{ gap: 16 }}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Correo electrónico"
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.email?.message}
                leftIcon={
                  <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} />
                }
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Contraseña"
                placeholder="••••••••"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.password?.message}
                secureTextEntry
                secureToggle
                leftIcon={
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} />
                }
              />
            )}
          />
        </View>

        {/* Submit */}
        <View style={{ gap: 16 }}>
          <Button
            label="Iniciar sesión"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          />

          <View
            style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 }}
          >
            <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>
              ¿No tienes cuenta?
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text
                style={{
                  color: Colors.primary,
                  fontSize: 14,
                  fontWeight: '600',
                }}
              >
                Regístrate
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
