import {
  TextInput,
  View,
  StyleSheet,
  ViewStyle,
  Text,
} from 'react-native';
import { useTheme } from '@styles/theme';
import { a11y } from '@styles/accessibility';

interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  multiline?: boolean;
  style?: ViewStyle;
  error?: string;
  label?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Input({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  multiline,
  style,
  error,
  label,
  accessibilityLabel,
  accessibilityHint,
}: InputProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text
          style={[
            theme.typography.label,
            {
              color: theme.colors.text,
              marginBottom: theme.spacing.sm,
            },
          ]}
        >
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          theme.typography.body,
          {
            borderColor: error ? theme.colors.error : theme.colors.border,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            minHeight: a11y.minTouchTarget,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        accessible
        accessibilityRole="text"
        accessibilityLabel={accessibilityLabel || label || placeholder}
        accessibilityHint={accessibilityHint}
        accessibilityLiveRegion="polite"
      />
      {error && (
        <Text
          style={[
            theme.typography.caption,
            {
              color: theme.colors.error,
              marginTop: theme.spacing.sm,
            },
          ]}
          accessible
          accessibilityLiveRegion="assertive"
          accessibilityRole="alert"
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
  },
});