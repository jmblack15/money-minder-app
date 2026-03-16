import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface ProgressBarProps {
  progress: number; // 0–100
  color?: string;
  height?: number;
  style?: ViewStyle;
  animated?: boolean;
}

function getProgressColor(progress: number, customColor?: string): string {
  if (customColor) return customColor;
  if (progress >= 90) return Colors.progressDanger;
  if (progress >= 70) return Colors.progressWarning;
  return Colors.progressSafe;
}

export function ProgressBar({
  progress,
  color,
  height = 8,
  style,
  animated = true,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.spring(animatedWidth, {
        toValue: clampedProgress,
        useNativeDriver: false,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      animatedWidth.setValue(clampedProgress);
    }
  }, [clampedProgress, animated]);

  const barColor = getProgressColor(clampedProgress, color);

  return (
    <View style={[styles.track, { height }, style]}>
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: barColor,
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: Colors.border,
    borderRadius: 100,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 100,
  },
});
