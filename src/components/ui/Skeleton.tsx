import { useTheme } from "@styles/theme";
import React, { useEffect, useRef } from "react";
import { Animated, DimensionValue, StyleProp, View, ViewStyle } from "react-native";

export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
  variant?: "text" | "rectangular" | "circular";
}

export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius,
  style,
  animated = true,
  variant = "rectangular",
}: SkeletonProps) {
  const theme = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue, animated]);

  const getSkeletonStyle = () => {
    let defaultBorderRadius = 4;

    if (variant === "circular") {
      defaultBorderRadius = 999; // Large value for circular
    } else if (variant === "text") {
      defaultBorderRadius = 2;
    }

    const backgroundColor = animated
      ? animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [
            theme.colors.gray?.[200] || theme.colors.border,
            theme.colors.gray?.[300] || theme.colors.textSecondary,
          ],
        })
      : theme.colors.gray?.[200] || theme.colors.border;

    return {
      width,
      height,
      backgroundColor: backgroundColor as any,
      borderRadius:
        borderRadius !== undefined ? borderRadius : defaultBorderRadius,
    };
  };

  return (
    <Animated.View style={[getSkeletonStyle(), style]} accessible={false} />
  );
}

// Pre-configured skeleton variants for common use cases
export interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: DimensionValue;
  spacing?: number;
  style?: ViewStyle;
}

export function SkeletonText({
  lines = 1,
  lastLineWidth = "75%",
  spacing,
  style,
}: SkeletonTextProps) {
  const theme = useTheme();
  const lineSpacing = spacing || theme.spacing.xs;

  return (
    <View style={style}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height={16}
          width={index === lines - 1 && lines > 1 ? lastLineWidth : "100%"}
          style={index < lines - 1 ? { marginBottom: lineSpacing } : undefined}
        />
      ))}
    </View>
  );
}

export interface SkeletonCardProps {
  showAvatar?: boolean;
  showTitle?: boolean;
  titleLines?: number;
  showContent?: boolean;
  contentLines?: number;
  style?: ViewStyle;
}

export function SkeletonCard({
  showAvatar = true,
  showTitle = true,
  titleLines = 1,
  showContent = true,
  contentLines = 3,
  style,
}: SkeletonCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          padding: theme.spacing.lg,
          backgroundColor: theme.colors.surface || theme.colors.background,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        {showAvatar && (
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            style={{ marginRight: theme.spacing.md }}
          />
        )}

        <View style={{ flex: 1 }}>
          {showTitle && (
            <SkeletonText
              lines={titleLines}
              style={{ marginBottom: theme.spacing.sm }}
            />
          )}

          {showContent && <SkeletonText lines={contentLines} />}
        </View>
      </View>
    </View>
  );
}
