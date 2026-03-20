import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { useTheme } from '@styles/theme';
import { a11y } from '@styles/accessibility';
import { motion, useReducedMotion } from '@styles/motion';
import React from 'react';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const theme = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (prefersReducedMotion) return;

    Animated.spring(scaleAnim, {
      toValue: motion.scale.subtle,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (prefersReducedMotion) return;

    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary,
      borderColor: 'transparent',
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      borderColor: 'transparent',
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.primary,
    },
  };

  const sizeStyles = {
    sm: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      minHeight: a11y.minTouchTarget,
    },
    md: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      minHeight: a11y.minTouchTarget,
    },
    lg: {
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      minHeight: a11y.minTouchTarget,
    },
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          variantStyles[variant],
          sizeStyles[size],
          { borderRadius: theme.radius.md },
          disabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
      >
        <Text
          style={[
            theme.typography.label,
            {
              color:
                variant === 'outline'
                  ? theme.colors.primary
                  : theme.colors.white,
            },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});