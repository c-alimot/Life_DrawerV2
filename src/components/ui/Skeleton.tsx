import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@styles/theme';
import { motion, useReducedMotion } from '@styles/motion';
import React from 'react';

interface SkeletonProps {
  width?: number | string;
  height: number;
  borderRadius?: number;
}

export function Skeleton({
  width = '100%',
  height,
  borderRadius = 8,
}: SkeletonProps) {
  const theme = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (prefersReducedMotion) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: motion.duration.slow,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: motion.duration.slow,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [prefersReducedMotion, shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.gray[200],
          opacity: prefersReducedMotion ? 0.6 : opacity,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    marginBottom: 16,
  },
});