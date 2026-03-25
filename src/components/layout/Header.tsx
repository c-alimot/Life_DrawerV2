import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@styles/theme';
import { useNavigation } from '@react-navigation/native';
import { a11y } from '../../styles/accessibility';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  accessibilityLabel?: string;
}

export function Header({
  title,
  showBackButton = false,
  rightComponent,
  accessibilityLabel,
}: HeaderProps) {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.border,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          minHeight: a11y.minTouchTarget,
        },
      ]}
      accessible
      accessibilityRole="header"
      accessibilityLabel={accessibilityLabel || title}
    >
      <View style={styles.content}>
        {showBackButton && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to previous screen"
            style={{ minHeight: a11y.minTouchTarget, minWidth: a11y.minTouchTarget }}
          >
            <Text style={{ color: theme.colors.primary, fontSize: 18 }}>←</Text>
          </TouchableOpacity>
        )}
        <Text
          style={[
            theme.typography.h3,
            { color: theme.colors.text, flex: 1 },
          ]}
        >
          {title}
        </Text>
        {rightComponent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
