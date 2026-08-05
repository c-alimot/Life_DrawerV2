import {
  ENTRY_STATUS_DETAILS,
  ENTRY_STATUS_NOTE_MAX_LENGTH,
  ENTRY_STATUS_VALUES,
} from "@constants/entryStatus";
import type { EntryStatus } from "@types";
import { useTheme } from "@styles/theme";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { canSaveStatusUpdate, getStatusUpdateHelperText } from "@features/entries/statusUpdate";
import { AppModalSheet } from "./AppModalSheet";
import { Button } from "./Button";

interface EntryStatusUpdateSheetProps {
  visible: boolean;
  currentStatus: EntryStatus | null;
  isSaving: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSave: (status: EntryStatus, note: string) => Promise<boolean>;
}

export function EntryStatusUpdateSheet({
  visible,
  currentStatus,
  isSaving,
  errorMessage,
  onClose,
  onSave,
}: EntryStatusUpdateSheetProps) {
  const theme = useTheme();
  const wasVisible = useRef(false);
  const [selectedStatus, setSelectedStatus] = useState<EntryStatus | null>(currentStatus);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (visible && !wasVisible.current) {
      setSelectedStatus(currentStatus);
      setNote("");
    }
    wasVisible.current = visible;
  }, [currentStatus, visible]);

  const canSave = canSaveStatusUpdate(currentStatus, selectedStatus, note);
  const helperText = getStatusUpdateHelperText(currentStatus, selectedStatus, note);

  const handleSave = async () => {
    if (!selectedStatus || !canSave || isSaving) {
      return;
    }

    await onSave(selectedStatus, note);
  };

  return (
    <AppModalSheet visible={visible} onClose={onClose} contentStyle={styles.sheet}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text accessibilityRole="header" style={[theme.typography.h3, { color: theme.colors.text }]}>
            Where does this stand now?
          </Text>
          <Text style={[theme.typography.bodySm, styles.intro, { color: theme.colors.textSecondary }]}>
            Update this Entry without writing a full reflection.
          </Text>

          <View accessibilityRole="radiogroup" style={styles.options}>
            {ENTRY_STATUS_VALUES.map((status) => {
              const details = ENTRY_STATUS_DETAILS[status];
              const isCurrent = currentStatus === status;
              const isSelected = selectedStatus === status;
              const stateLabel = isCurrent && isSelected
                ? "Current status"
                : isSelected
                  ? "Selected"
                  : isCurrent
                    ? "Current"
                    : "Select";

              return (
                <TouchableOpacity
                  key={status}
                  onPress={() => setSelectedStatus(status)}
                  style={[
                    styles.option,
                    {
                      backgroundColor: isSelected ? "#E6E2D8" : theme.colors.surface,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  accessible
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${details.label}${isCurrent ? ", current status" : ""}${isSelected ? ", selected" : ""}`}
                  accessibilityHint={details.description}
                >
                  <View style={styles.optionCopy}>
                    <Text style={[theme.typography.body, styles.optionLabel, { color: theme.colors.text }]}>
                      {details.label}
                    </Text>
                    <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                      {details.description}
                    </Text>
                  </View>
                  <Text style={[theme.typography.bodySm, styles.optionState, { color: theme.colors.secondary }]}>
                    {stateLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[theme.typography.bodySm, styles.noteLabel, { color: theme.colors.text }]}>Add a note</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="What feels different now?"
            placeholderTextColor={theme.colors.textSecondary}
            maxLength={ENTRY_STATUS_NOTE_MAX_LENGTH}
            multiline
            textAlignVertical="top"
            style={[styles.noteInput, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
            accessibilityLabel="Add a note"
            accessibilityHint="Optional context for this Status update"
          />

          {helperText ? (
            <Text accessibilityLiveRegion="polite" style={[theme.typography.bodySm, styles.helperText, { color: theme.colors.textSecondary }]}>
              {helperText}
            </Text>
          ) : null}
          {errorMessage ? (
            <Text accessibilityLiveRegion="assertive" style={[theme.typography.bodySm, styles.errorText]}>
              {errorMessage}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Button label="Cancel" onPress={onClose} variant="outline" style={styles.actionButton} />
            <Button
              label={isSaving ? "Saving..." : "Save Status"}
              onPress={() => void handleSave()}
              disabled={!canSave}
              loading={isSaving}
              style={styles.actionButton}
              accessibilityLabel={isSaving ? "Saving Status" : "Save Status"}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppModalSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    maxHeight: "88%",
  },
  intro: {
    marginTop: 6,
    marginBottom: 18,
  },
  options: {
    gap: 10,
  },
  option: {
    minHeight: 72,
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
  optionState: {
    fontWeight: "700",
  },
  noteLabel: {
    marginTop: 20,
    marginBottom: 8,
    fontWeight: "700",
  },
  noteInput: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    fontSize: 16,
    lineHeight: 22,
  },
  helperText: {
    marginTop: 8,
  },
  errorText: {
    marginTop: 8,
    color: "#8B2D2A",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
  },
});
