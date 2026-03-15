import React from 'react';
import { Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = '📭',
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 56 }}>{icon}</Text>
      <Text
        style={{
          color: Colors.textPrimary,
          fontSize: 18,
          fontWeight: '700',
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{
            color: Colors.textSecondary,
            fontSize: 14,
            textAlign: 'center',
            lineHeight: 20,
          }}
        >
          {subtitle}
        </Text>
      )}
      {actionLabel && onAction && (
        <View style={{ marginTop: 8, width: '100%' }}>
          <Button label={actionLabel} onPress={onAction} size="md" />
        </View>
      )}
    </View>
  );
}
