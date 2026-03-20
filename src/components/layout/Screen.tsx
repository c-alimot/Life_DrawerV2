import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@styles/theme';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accessible?: boolean;
  accessibilityLabel?: string;
}

export function Screen({
  children,
  style,
  accessible,
  accessibilityLabel,
}: ScreenProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingHorizontal: theme.spacing.lg,
        },
        style,
      ]}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});