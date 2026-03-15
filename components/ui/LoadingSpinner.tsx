import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '@/constants/colors';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'small' | 'large';
  color?: string;
}

export function LoadingSpinner({
  fullScreen,
  size = 'large',
  color = Colors.primary,
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }

  return <ActivityIndicator size={size} color={color} />;
}
