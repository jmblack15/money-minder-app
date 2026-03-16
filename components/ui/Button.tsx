import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '@/constants/colors';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: Colors.primary },
    text: { color: Colors.text },
  },
  secondary: {
    container: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
    text: { color: Colors.text },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: Colors.primary },
  },
  danger: {
    container: { backgroundColor: Colors.expense },
    text: { color: Colors.text },
  },
};

const sizeStyles: Record<Size, { container: ViewStyle; text: TextStyle }> = {
  sm: { container: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 }, text: { fontSize: 13 } },
  md: { container: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14 }, text: { fontSize: 15 } },
  lg: { container: { paddingVertical: 18, paddingHorizontal: 32, borderRadius: 16 }, text: { fontSize: 17 } },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        v.container,
        s.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text.color as string} />
      ) : (
        <Text style={[styles.text, v.text, s.text, textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
});
