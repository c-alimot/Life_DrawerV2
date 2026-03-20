import {
  TouchableOpacity,
  Text,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native';
import { useTheme } from '@styles/theme';
import { a11y } from '@styles/accessibility';

interface ChipProps {
  label: string;
  onPress?: () => void;
  selected?: boolean;
  variant?: 'default' | 'filled';
  accessibilityLabel?: string;
}

export function Chip({
  label,
  onPress,
  selected = false,
  variant = 'default',
  accessibilityLabel,
}: ChipProps) {
  const theme = useTheme();

  const isVariantFilled = variant === 'filled';

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          borderRadius: theme.radius.full,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          minHeight: a11y.minTouchTarget,
          minWidth: a11y.minTouchTarget,
          backgroundColor: isVariantFilled
            ? theme.colors.primary
            : selected
              ? theme.colors.primaryLight
              : theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={onPress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ selected }}
      accessibilityHint={selected ? 'Currently selected' : 'Double tap to select'}
    >
      <Text
        style={[
          theme.typography.labelSm,
          {
            color: isVariantFilled
              ? theme.colors.white
              : theme.colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
});