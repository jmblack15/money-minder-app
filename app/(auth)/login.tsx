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

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email inválido';
    if (!password) e.password = 'La contraseña es requerida';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await authApi.login({ email: email.trim(), password });
      await login(
        { accessToken: data.accessToken, refreshToken: data.refreshToken },
        data.user,
      );
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/' as never);
    } catch (error: unknown) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg = error instanceof Error ? error.message : 'Error al iniciar sesión';
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
        {/* Logo / Branding */}
        <View style={styles.header}>
          <Text style={styles.logo}>💸</Text>
          <Text style={styles.appName}>Money Minder</Text>
          <Text style={styles.tagline}>Controla tus finanzas con claridad</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.title}>Bienvenido de nuevo</Text>
          <Text style={styles.subtitle}>Ingresa a tu cuenta</Text>

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
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete="password"
            error={errors.password}
            rightIcon={
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            }
            onRightIconPress={() => setShowPassword((v) => !v)}
          />

          <Button
            label="Iniciar sesión"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            size="lg"
            style={styles.loginButton}
          />

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: { fontSize: 64, marginBottom: 12 },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  form: { flex: 1 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 28,
  },
  eyeIcon: { fontSize: 18 },
  loginButton: { marginTop: 8 },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: { color: Colors.textSecondary, fontSize: 14 },
  registerLink: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
});
