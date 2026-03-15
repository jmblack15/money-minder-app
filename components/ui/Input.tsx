import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureToggle?: boolean;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  secureToggle,
  secureTextEntry,
  style,
  ...rest
}: InputProps) {
  const [isSecure, setIsSecure] = useState(secureTextEntry ?? false);
  const hasError = !!error;

  return (
    <View style={{ gap: 6 }}>
      {label && (
        <Text
          style={{
            color: Colors.textSecondary,
            fontSize: 14,
            fontWeight: '500',
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: hasError ? Colors.danger : Colors.border,
          paddingHorizontal: 16,
          gap: 10,
        }}
      >
        {leftIcon && (
          <View style={{ opacity: 0.6 }}>{leftIcon}</View>
        )}
        <TextInput
          {...rest}
          secureTextEntry={secureToggle ? isSecure : secureTextEntry}
          placeholderTextColor={Colors.textSecondary}
          style={[
            {
              flex: 1,
              color: Colors.textPrimary,
              fontSize: 16,
              paddingVertical: 14,
            },
            style,
          ]}
        />
        {secureToggle && (
          <TouchableOpacity onPress={() => setIsSecure((v) => !v)}>
            <Ionicons
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
        {rightIcon && !secureToggle && (
          <View style={{ opacity: 0.6 }}>{rightIcon}</View>
        )}
      </View>
      {hasError && (
        <Text style={{ color: Colors.danger, fontSize: 12 }}>{error}</Text>
      )}
    </View>
  );
}
