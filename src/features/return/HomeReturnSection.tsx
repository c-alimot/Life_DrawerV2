import { Button, Card, EntryPreviewCard, SectionHeader } from "@components/ui";
import { SkeletonText } from "@components/ui/Skeleton";
import { useTheme } from "@styles/theme";
import type { ApiError, HomeReturnCandidate } from "@types";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HomeReturnSectionProps {
  candidate: HomeReturnCandidate | null;
  isLoading: boolean;
  error: ApiError | null;
  onOpenEntry: (entryId: string) => void;
  onDismiss: () => void;
  onShowSomethingElse: () => void;
  onDisableResurfacing: () => void;
  onRetry: () => void;
}

function formatEntryDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function HomeReturnSection({
  candidate,
  isLoading,
  error,
  onOpenEntry,
  onDismiss,
  onShowSomethingElse,
  onDisableResurfacing,
  onRetry,
}: HomeReturnSectionProps) {
  const theme = useTheme();
  const entry = candidate?.entry || null;

  if (!entry && !isLoading && !error) {
    return null;
  }

  return (
    <View style={styles.section}>
      <SectionHeader
        label={candidate?.contextLabel || "From your collection"}
        textColor="#8A8178"
        dividerColor={theme.colors.accent1}
      />

      {isLoading && !entry ? (
        <Card style={styles.loadingCard} variant="soft" accessibilityLabel="Loading a Return entry">
          <SkeletonText lines={3} lastLineWidth="58%" />
        </Card>
      ) : null}

      {error ? (
        <Card style={styles.errorCard} variant="soft">
          <Text style={[theme.typography.bodySm, styles.errorText, { color: "#6F6860" }]}>
            Something to revisit could not be loaded right now.
          </Text>
          <TouchableOpacity
            onPress={onRetry}
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel="Try loading a Return entry again"
          >
            <Text style={[theme.typography.bodySm, styles.retryText, { color: "#556950" }]}>Try again</Text>
          </TouchableOpacity>
        </Card>
      ) : null}

      {entry ? (
        <>
          <Text style={[theme.typography.bodySm, styles.contextLabel, { color: "#6F6860" }]}>
            {candidate?.contextDescription}
          </Text>
          <EntryPreviewCard
            entry={entry}
            onPress={() => onOpenEntry(entry.id)}
            showDate
            dateText={formatEntryDate(entry.createdAt)}
            drawerName={entry.drawers[0]?.name}
            accessibilityLabel={`Open Return entry from ${formatEntryDate(entry.createdAt)}: ${entry.title || "Untitled Entry"}`}
          />
          <View style={styles.actions}>
            <Button
              label="View entry"
              onPress={() => onOpenEntry(entry.id)}
              variant="outline"
              size="sm"
              style={styles.openButton}
              accessibilityLabel={`View Return entry from ${formatEntryDate(entry.createdAt)}`}
            />
            <TouchableOpacity
              onPress={onShowSomethingElse}
              style={styles.dismissButton}
              accessibilityRole="button"
              accessibilityLabel="Show a different Return entry"
            >
              <Text style={[theme.typography.bodySm, styles.dismissText, { color: "#6F6860" }]}>Show something else</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onDismiss}
              style={styles.dismissButton}
              accessibilityRole="button"
              accessibilityLabel="Not right now. Dismiss this Return entry for 21 days"
            >
              <Text style={[theme.typography.bodySm, styles.dismissText, { color: "#6F6860" }]}>Not right now</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={onDisableResurfacing}
            style={styles.disableButton}
            accessibilityRole="button"
            accessibilityLabel="Do not bring this entry back automatically"
          >
            <Text style={[theme.typography.bodySm, styles.disableText, { color: "#6F6860" }]}>Do not bring this back automatically</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 34,
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
  dismissButton: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  dismissText: {
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  disableButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    justifyContent: "center",
    marginTop: 6,
    paddingVertical: 8,
  },
  disableText: {
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
