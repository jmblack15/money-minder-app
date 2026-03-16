import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export default function RegisterScreen() {
  const login = useAuthStore((s) => s.login);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'El nombre es requerido';
    if (!email.trim()) e.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email inválido';
    if (!password) e.password = 'La contraseña es requerida';
    else if (password.length < 8) e.password = 'Mínimo 8 caracteres';
    if (password !== confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      await login(
        { accessToken: data.accessToken, refreshToken: data.refreshToken },
        data.user,
      );
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/' as never);
    } catch (error: unknown) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.log('Register error:', error instanceof Error ? error.message : error);
      console.log('Register error data:', (error as any)?.data);
      const msg = error instanceof Error ? error.message : 'Error al registrarse';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Empieza a controlar tus finanzas hoy</Text>
        </View>

        <Input
          label="Nombre completo"
          placeholder="Juan García"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
          error={errors.name}
        />

        <Input
          label="Email"
          placeholder="tu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
        />

        <Input
          label="Contraseña"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          error={errors.password}
          rightIcon={
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
          }
          onRightIconPress={() => setShowPassword((v) => !v)}
        />

        <Input
          label="Confirmar contraseña"
          placeholder="Repite tu contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          error={errors.confirmPassword}
        />

        <Button
          label="Crear cuenta"
          onPress={handleRegister}
          loading={loading}
          fullWidth
          size="lg"
          style={styles.registerButton}
        />

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 24,
  },
  backIcon: { fontSize: 24, color: Colors.text },
  header: { marginBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textSecondary },
  eyeIcon: { fontSize: 18 },
  registerButton: { marginTop: 8 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { color: Colors.textSecondary, fontSize: 14 },
  loginLink: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
});
