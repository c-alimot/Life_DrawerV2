import {
  ENTRY_STATUS_DETAILS,
  ENTRY_STATUS_VALUES,
} from "@constants/entryStatus";
import type { EntryStatus } from "@types";
import { useTheme } from "@styles/theme";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface EntryStatusPickerModalProps {
  visible: boolean;
  selectedStatus: EntryStatus | null;
  onSelectStatus: (status: EntryStatus) => void;
  onClose: () => void;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  surfaceColor: string;
  primaryColor: string;
}

export function EntryStatusPickerModal({
  visible,
  selectedStatus,
  onSelectStatus,
  onClose,
  backgroundColor,
  textColor,
  borderColor,
  surfaceColor,
  primaryColor,
}: EntryStatusPickerModalProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.statusPicker, { backgroundColor }]}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[theme.typography.h3, { color: textColor }]}>Where does this stand?</Text>
              <Text style={[theme.typography.bodySm, { color: textColor }]}>Choose the Status that feels true right now.</Text>
            </View>
            <TouchableOpacity onPress={onClose} accessible accessibilityRole="button" accessibilityLabel="Close Status selector">
              <Text style={[theme.typography.body, { color: primaryColor }]}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.options} showsVerticalScrollIndicator={false}>
            {ENTRY_STATUS_VALUES.map((status) => {
              const details = ENTRY_STATUS_DETAILS[status];
              const isSelected = selectedStatus === status;

              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.option,
                    {
                      backgroundColor: isSelected ? "#E6E2D8" : surfaceColor,
                      borderColor: isSelected ? primaryColor : borderColor,
                    },
                  ]}
                  onPress={() => onSelectStatus(status)}
                  accessible
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={details.label}
                  accessibilityHint={details.description}
                >
                  <View style={styles.optionCopy}>
                    <Text style={[theme.typography.body, styles.optionLabel, { color: textColor }]}>{details.label}</Text>
                    <Text style={[theme.typography.bodySm, { color: textColor }]}>{details.description}</Text>
                  </View>
                  <Text style={[theme.typography.bodySm, { color: primaryColor }]}>{isSelected ? "Selected" : "Select"}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  statusPicker: {
    maxHeight: "82%",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 18,
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  options: {
    gap: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionLabel: {
    fontWeight: "700",
  },
});
