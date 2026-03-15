import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
  View,
} from 'react-native';
import { Colors } from '@/constants/colors';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  label: string;
}

const variantStyles: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary: { bg: Colors.primary, text: Colors.textPrimary },
  secondary: { bg: Colors.surface, text: Colors.textPrimary, border: Colors.border },
  ghost: { bg: Colors.transparent, text: Colors.primary },
  danger: { bg: Colors.danger, text: Colors.textPrimary },
};

const sizeStyles: Record<Size, { py: number; px: number; fontSize: number; radius: number }> = {
  sm: { py: 8, px: 16, fontSize: 14, radius: 12 },
  md: { py: 14, px: 20, fontSize: 16, radius: 16 },
  lg: { py: 18, px: 24, fontSize: 18, radius: 20 },
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  label,
  disabled,
  ...rest
}: ButtonProps) {
  const vs = variantStyles[variant];
  const ss = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      style={({ pressed }) => ({
        backgroundColor: vs.bg,
        borderWidth: vs.border ? 1 : 0,
        borderColor: vs.border,
        borderRadius: ss.radius,
        paddingVertical: ss.py,
        paddingHorizontal: ss.px,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        width: fullWidth ? '100%' : undefined,
        gap: 8,
      })}
    >
      {loading ? (
        <ActivityIndicator color={vs.text} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text
            style={{
              color: vs.text,
              fontSize: ss.fontSize,
              fontWeight: '600',
              letterSpacing: 0.3,
            }}
          >
            {label}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </Pressable>
  );
}
