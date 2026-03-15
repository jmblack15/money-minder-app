import React from 'react';
import { Text, View } from 'react-native';

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  size?: 'sm' | 'md';
}

export function Badge({
  label,
  color = '#FFFFFF',
  backgroundColor = '#7C5CFC',
  size = 'md',
}: BadgeProps) {
  return (
    <View
      style={{
        backgroundColor,
        borderRadius: 100,
        paddingHorizontal: size === 'sm' ? 8 : 12,
        paddingVertical: size === 'sm' ? 2 : 4,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color,
          fontSize: size === 'sm' ? 11 : 13,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
