import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { Colors } from '@/constants/colors';

interface ProgressBarProps {
  percentage: number; // 0–100
  height?: number;
  backgroundColor?: string;
  animated?: boolean;
}

function getBarColor(pct: number): string {
  if (pct >= 100) return Colors.expense;
  if (pct >= 90) return Colors.danger;
  if (pct >= 70) return Colors.warning;
  return Colors.income;
}

export function ProgressBar({
  percentage,
  height = 8,
  backgroundColor = Colors.border,
  animated = true,
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(percentage, 0), 100);
  const anim = useRef(new Animated.Value(0)).current;
  const color = getBarColor(clamped);

  useEffect(() => {
    if (animated) {
      Animated.spring(anim, {
        toValue: clamped,
        useNativeDriver: false,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      anim.setValue(clamped);
    }
  }, [clamped]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={{
        backgroundColor,
        borderRadius: height / 2,
        height,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={{
          backgroundColor: color,
          borderRadius: height / 2,
          height: '100%',
          width,
        }}
      />
    </View>
  );
}
