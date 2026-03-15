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

const schema = z
  .object({
    name: z.string().min(2, 'Mínimo 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const login = useAuthStore((s) => s.login);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      await login(
        { access_token: result.access_token, refresh_token: result.refresh_token },
        result.user,
      );
      router.replace('/(app)');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrarse';
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
        {/* Header */}
        <View style={{ gap: 8 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
            <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>Volver</Text>
          </TouchableOpacity>
          <Text
            style={{
              color: Colors.textPrimary,
              fontSize: 28,
              fontWeight: '800',
              letterSpacing: -0.5,
            }}
          >
            Crear cuenta
          </Text>
          <Text style={{ color: Colors.textSecondary, fontSize: 15 }}>
            Empieza a controlar tus finanzas hoy
          </Text>
        </View>

        {/* Form */}
        <View style={{ gap: 16 }}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nombre completo"
                placeholder="Juan García"
                autoCapitalize="words"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.name?.message}
                leftIcon={
                  <Ionicons name="person-outline" size={18} color={Colors.textSecondary} />
                }
              />
            )}
          />

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
                placeholder="Mínimo 6 caracteres"
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

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirmar contraseña"
                placeholder="Repite tu contraseña"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.confirmPassword?.message}
                secureTextEntry
                secureToggle
                leftIcon={
                  <Ionicons name="shield-checkmark-outline" size={18} color={Colors.textSecondary} />
                }
              />
            )}
          />
        </View>

        {/* Submit */}
        <View style={{ gap: 16 }}>
          <Button
            label="Crear cuenta"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>¿Ya tienes cuenta?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: '600' }}>
                Inicia sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
