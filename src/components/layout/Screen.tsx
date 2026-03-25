import { useTheme } from "@styles/theme";
import { StyleProp, View, ViewStyle } from "react-native";

interface ScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Screen({ children, style }: ScreenProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
