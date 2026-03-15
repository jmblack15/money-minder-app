import React from 'react';
import { Pressable, PressableProps, View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: PressableProps['onPress'];
  elevated?: boolean;
  noPadding?: boolean;
}

export function Card({ children, style, onPress, elevated, noPadding }: CardProps) {
  const base: ViewStyle = {
    backgroundColor: elevated ? Colors.surfaceElevated : Colors.surface,
    borderRadius: 20,
    padding: noPadding ? 0 : 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [base, style, { opacity: pressed ? 0.85 : 1 }]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[base, style]}>{children}</View>;
}
