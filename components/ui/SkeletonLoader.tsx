import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] });

  return (
    <Animated.View
      style={[
        { width: width as number, height, borderRadius, backgroundColor: Colors.shimmer, opacity },
        style,
      ]}
    />
  );
}

export function TransactionSkeleton() {
  return (
    <View style={skeletonStyles.row}>
      <SkeletonBox width={44} height={44} borderRadius={14} />
      <View style={skeletonStyles.content}>
        <SkeletonBox width="60%" height={14} borderRadius={7} />
        <SkeletonBox width="40%" height={11} borderRadius={6} style={skeletonStyles.mt6} />
      </View>
      <SkeletonBox width={70} height={16} borderRadius={8} />
    </View>
  );
}

export function CardSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <SkeletonBox width="50%" height={13} borderRadius={6} />
      <SkeletonBox width="70%" height={28} borderRadius={8} style={skeletonStyles.mt10} />
      <SkeletonBox width="40%" height={11} borderRadius={6} style={skeletonStyles.mt8} />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  mt6: { marginTop: 6 },
  mt8: { marginTop: 8 },
  mt10: { marginTop: 10 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
