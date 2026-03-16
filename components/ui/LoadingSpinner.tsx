import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'large',
  color = Colors.primary,
  style,
  fullScreen = false,
}: LoadingSpinnerProps) {
  return (
    <View style={[fullScreen ? styles.fullScreen : styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
