import { Button, Card, EntryPreviewCard, SectionHeader } from "@components/ui";
import { SkeletonText } from "@components/ui/Skeleton";
import { useTheme } from "@styles/theme";
import type { ApiError, DrawerReturnCandidate } from "@types";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DrawerReturnSectionProps {
  candidate: DrawerReturnCandidate | null;
  isLoading: boolean;
  error: ApiError | null;
  canExplore: boolean;
  onOpenEntry: (entryId: string) => void;
  onExplore: () => void;
  onRetry: () => void;
}

function formatEntryDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function DrawerReturnSection({
  candidate,
  isLoading,
  error,
  canExplore,
  onOpenEntry,
  onExplore,
  onRetry,
}: DrawerReturnSectionProps) {
  const theme = useTheme();
  const entry = candidate?.entry || null;

  if (!entry && !isLoading && !error) {
    return null;
  }

  return (
    <View style={styles.section}>
      <SectionHeader
        label="Return to something in this drawer"
        textColor="#8A8178"
        dividerColor={theme.colors.accent1}
      />
      {isLoading && !entry ? (
        <Card style={styles.loadingCard} variant="soft" accessibilityLabel="Loading a Drawer Return entry">
          <SkeletonText lines={3} lastLineWidth="58%" />
        </Card>
      ) : null}
      {error ? (
        <Card style={styles.errorCard} variant="soft">
          <Text style={[theme.typography.bodySm, styles.errorText, { color: "#6F6860" }]}>
            Something from this drawer could not be loaded right now.
          </Text>
          <TouchableOpacity
            onPress={onRetry}
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel="Try loading a Drawer Return entry again"
          >
            <Text style={[theme.typography.bodySm, styles.retryText, { color: "#556950" }]}>Try again</Text>
          </TouchableOpacity>
        </Card>
      ) : null}
      {entry ? (
        <>
          <Text style={[theme.typography.bodySm, styles.contextLabel, { color: "#556950" }]}>
            {candidate?.contextLabel}
          </Text>
          <Text style={[theme.typography.bodySm, styles.contextCopy, { color: "#6F6860" }]}>
            {candidate?.contextDescription}
          </Text>
          <EntryPreviewCard
            entry={entry}
            onPress={() => onOpenEntry(entry.id)}
            showDate
            dateText={formatEntryDate(entry.createdAt)}
            accessibilityLabel={`Open Drawer Return entry from ${formatEntryDate(entry.createdAt)}: ${entry.title || "Untitled Entry"}`}
          />
          <View style={styles.actions}>
            <Button
              label="View entry"
              onPress={() => onOpenEntry(entry.id)}
              variant="outline"
              size="sm"
              style={styles.openButton}
              accessibilityLabel={`View Drawer Return entry from ${formatEntryDate(entry.createdAt)}`}
            />
            {canExplore ? (
              <TouchableOpacity
                onPress={onExplore}
                style={styles.exploreButton}
                accessibilityRole="button"
                accessibilityLabel="Open something else from this Drawer"
              >
                <Text style={[theme.typography.bodySm, styles.exploreText, { color: "#556950" }]}>Open something from this Drawer</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  loadingCard: {
    minHeight: 124,
    justifyContent: "center",
  },
  errorCard: {
    paddingVertical: 16,
  },
  errorText: {
    lineHeight: 21,
  },
  retryButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    justifyContent: "center",
    marginTop: 4,
    paddingVertical: 8,
  },
  retryText: {
    fontWeight: "700",
  },
  contextLabel: {
    fontWeight: "700",
    marginBottom: 4,
  },
  contextCopy: {
    lineHeight: 21,
    marginBottom: 10,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    columnGap: 14,
    rowGap: 8,
    marginTop: -2,
  },
  openButton: {
    minHeight: 42,
  },
  exploreButton: {
    minHeight: 42,
    justifyContent: "center",
    paddingVertical: 8,
  },
  exploreText: {
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
