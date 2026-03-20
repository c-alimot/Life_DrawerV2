import {
  Modal as RNModal,
  View,
  StyleSheet,
  ModalProps as RNModalProps,
  TouchableOpacity,
  AccessibilityInfo,
} from 'react-native';
import { useTheme } from '@styles/theme';
import React from 'react';

interface ModalProps extends Omit<RNModalProps, 'children'> {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  accessibilityLabel?: string;
}

export function Modal({
  visible,
  onClose,
  children,
  title,
  accessibilityLabel,
}: ModalProps) {
  const theme = useTheme();

  React.useEffect(() => {
    if (visible) {
      // Announce modal to screen readers
      AccessibilityInfo.announceForAccessibility(
        accessibilityLabel || title || 'Modal dialog opened'
      );
    }
  }, [visible, accessibilityLabel, title]);

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      accessible
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="dialog"
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
        accessible={false}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.background,
              borderRadius: theme.radius.lg,
            },
          ]}
          accessible={false}
        >
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    padding: 20,
    maxHeight: '80%',
  },
});