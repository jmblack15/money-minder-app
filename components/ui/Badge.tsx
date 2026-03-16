import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export function Badge({ label, color = Colors.primary, textColor = Colors.text, style, size = 'md' }: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        size === 'sm' && styles.badgeSm,
        { backgroundColor: `${color}25` },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'sm' && styles.textSm,
          { color },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 11,
  },
});
