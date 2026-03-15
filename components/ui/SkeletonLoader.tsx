import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.9,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: Colors.surfaceElevated,
          opacity: anim,
        },
        style,
      ]}
    />
  );
}

export function TransactionSkeleton() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
      <Skeleton width={44} height={44} borderRadius={22} />
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={12} />
      </View>
      <Skeleton width={70} height={14} />
    </View>
  );
}

export function CardSkeleton() {
  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.border,
      }}
    >
      <Skeleton width="40%" height={14} />
      <Skeleton width="70%" height={24} />
      <Skeleton width="50%" height={12} />
    </View>
  );
}
