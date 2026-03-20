import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@styles/theme';

interface CustomSafeAreaProps {
  children: React.ReactNode;
}

export function SafeArea({ children }: CustomSafeAreaProps) {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      {children}
    </SafeAreaView>
  );
}