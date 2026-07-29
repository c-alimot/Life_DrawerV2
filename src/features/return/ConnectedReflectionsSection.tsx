import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@components/ui/icons";
import { useTheme } from "@styles/theme";
import type { ApiError, EntryWithRelations } from "@types";

const INITIAL_VISIBLE_ENTRIES = 4;

interface ConnectedReflectionsSectionProps {
  entries: EntryWithRelations[];
  currentEntryId: string;
  isLoading: boolean;
  error: ApiError | null;
  onRetry: () => void;
  onOpenEntry: (entryId: string) => void;
}

function formatReflectionType(entry: EntryWithRelations): string {
  if (!entry.parentEntryId) {
    return "Original Entry";
  }

  if (!entry.reflectionType) {
    return "Connected reflection";
  }

  return `${entry.reflectionType.charAt(0).toUpperCase()}${entry.reflectionType.slice(1)}`;
}

function getEntryPreview(entry: EntryWithRelations): string {
  const normalizedContent = entry.content.trim().replace(/\s+/g, " ");
  if (normalizedContent.length <= 150) {
    return normalizedContent;
  }

  return `${normalizedContent.slice(0, 150)}...`;
}

export function ConnectedReflectionsSection({
  entries,
  currentEntryId,
  isLoading,
  error,
  onRetry,
  onOpenEntry,
}: ConnectedReflectionsSectionProps) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasConnectedEntries = entries.length > 1;
  const visibleEntries = useMemo(() => {
    if (isExpanded || entries.length <= INITIAL_VISIBLE_ENTRIES) {
      return entries;
    }

    const initialEntries = entries.slice(0, INITIAL_VISIBLE_ENTRIES);
    const currentEntry = entries.find((entry) => entry.id === currentEntryId);

    return currentEntry && !initialEntries.some((entry) => entry.id === currentEntry.id)
      ? [...initialEntries, currentEntry]
      : initialEntries;
  }, [currentEntryId, entries, isExpanded]);

  if (!hasConnectedEntries && !error && !isLoading) {
    return null;
  }

  return (
    <View style={[styles.section, { borderColor: theme.colors.border }]}>
      <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Continuing reflections</Text>

      {isLoading ? (
        <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
          Loading connected reflections...
        </Text>
      ) : null}

      {error ? (
        <View style={styles.errorState}>
          <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
            Connected reflections are unavailable right now.
          </Text>
          <TouchableOpacity
            onPress={onRetry}
            accessible
            accessibilityLabel="Retry loading connected reflections"
          >
            <Text style={[theme.typography.bodySm, { color: theme.colors.primary, fontWeight: "700" }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {hasConnectedEntries ? (
        <View accessibilityRole="list" style={styles.historyList}>
          {visibleEntries.map((entry) => {
            const isCurrentEntry = entry.id === currentEntryId;
            const formattedDate = new Date(entry.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            });
            const title = entry.title || "Untitled Entry";
            const preview = getEntryPreview(entry);

            return (
              <TouchableOpacity
                key={entry.id}
                onPress={() => {
                  if (!isCurrentEntry) {
                    onOpenEntry(entry.id);
                  }
                }}
                disabled={isCurrentEntry}
                accessible
                accessibilityRole="button"
                accessibilityState={{ selected: isCurrentEntry, disabled: isCurrentEntry }}
                accessibilityLabel={
                  isCurrentEntry
                    ? `Currently viewing ${formatReflectionType(entry)} from ${formattedDate}: ${title}`
                    : `Open ${formatReflectionType(entry)} from ${formattedDate}: ${title}`
                }
                style={[
                  styles.historyItem,
                  { borderColor: theme.colors.border },
                  isCurrentEntry && { borderColor: theme.colors.primary, backgroundColor: "#F1F3ED" },
                ]}
              >
                <View style={styles.historyItemHeader}>
                  <View style={styles.historyItemCopy}>
                    <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                      {formattedDate}
                    </Text>
                    <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: "700" }]}>
                      {formatReflectionType(entry)}
                    </Text>
                  </View>
                  {isCurrentEntry ? (
                    <View style={styles.currentEntryLabel}>
                      <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.primary} />
                      <Text style={[theme.typography.labelSm, { color: theme.colors.primary }]}>This Entry</Text>
                    </View>
                  ) : (
                    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                  )}
                </View>
                <Text numberOfLines={1} style={[theme.typography.bodySm, { color: theme.colors.text, fontWeight: "600" }]}>
                  {title}
                </Text>
                <Text numberOfLines={2} style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                  {preview}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}

      {entries.length > INITIAL_VISIBLE_ENTRIES && !isExpanded ? (
        <TouchableOpacity
          onPress={() => setIsExpanded(true)}
          accessible
          accessibilityLabel="View all connected reflections"
          accessibilityState={{ expanded: false }}
        >
          <Text style={[theme.typography.bodySm, { color: theme.colors.primary, fontWeight: "700" }]}>View all connected reflections</Text>
        </TouchableOpacity>
      ) : null}

      {entries.length > INITIAL_VISIBLE_ENTRIES && isExpanded ? (
        <TouchableOpacity
          onPress={() => setIsExpanded(false)}
          accessible
          accessibilityLabel="Show fewer connected reflections"
          accessibilityState={{ expanded: true }}
        >
          <Text style={[theme.typography.bodySm, { color: theme.colors.primary, fontWeight: "700" }]}>Show fewer reflections</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 1,
    gap: 12,
  },
  errorState: {
    gap: 6,
  },
  historyList: {
    gap: 10,
  },
  historyItem: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 5,
  },
  historyItemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  historyItemCopy: {
    flex: 1,
    gap: 2,
  },
  currentEntryLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
