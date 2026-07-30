import { Card, SectionHeader } from "@components/ui";
import { SkeletonText } from "@components/ui/Skeleton";
import { useTheme } from "@styles/theme";
import type { DrawerCommonTag, DrawerEntryFilter, DrawerReturnOverview } from "@types";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DrawerOverviewProps {
  overview: DrawerReturnOverview | null;
  isLoading: boolean;
  commonTags: DrawerCommonTag[];
  onApplyFilter: (filter: DrawerEntryFilter) => void;
  onSelectTag: (tagId: string) => void;
  onViewAllTags: () => void;
}

function formatMonthYear(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getDateRangeCopy(overview: DrawerReturnOverview): string {
  if (!overview.firstEntryAt || !overview.latestEntryAt) {
    return `${overview.entryCount} ${overview.entryCount === 1 ? "entry" : "entries"} collected.`;
  }

  const first = formatMonthYear(overview.firstEntryAt);
  const latest = formatMonthYear(overview.latestEntryAt);

  return first === latest
    ? `${overview.entryCount} ${overview.entryCount === 1 ? "entry" : "entries"} collected in ${first}.`
    : `${overview.entryCount} ${overview.entryCount === 1 ? "entry" : "entries"} collected between ${first} and ${latest}.`;
}

export function DrawerOverview({
  overview,
  isLoading,
  commonTags,
  onApplyFilter,
  onSelectTag,
  onViewAllTags,
}: DrawerOverviewProps) {
  const theme = useTheme();
  const visibleCommonTags = commonTags.slice(0, 5);

  if (!overview && !isLoading) {
    return null;
  }

  return (
    <View style={styles.section} accessibilityRole="summary">
      <SectionHeader
        label="Inside this drawer"
        textColor="#8A8178"
        dividerColor={theme.colors.accent1}
      />
      {isLoading && !overview ? (
        <Card style={styles.card} variant="soft" accessibilityLabel="Loading Drawer overview">
          <SkeletonText lines={2} lastLineWidth="62%" />
        </Card>
      ) : null}
      {overview ? (
        <Card style={styles.card} variant="soft" accessibilityLabel={getDateRangeCopy(overview)}>
          <Text style={[theme.typography.body, styles.primaryCopy, { color: "#2F2924" }]}>
            {getDateRangeCopy(overview)}
          </Text>
          {overview.savedForLaterCount > 0 || overview.connectedReflectionCount > 0 ? (
            <Text style={[theme.typography.bodySm, styles.secondaryCopy, { color: "#6F6860" }]}>
              {[
                overview.savedForLaterCount > 0
                  ? `${overview.savedForLaterCount} saved for later`
                  : null,
                overview.connectedReflectionCount > 0
                  ? `${overview.connectedReflectionCount} continuing ${overview.connectedReflectionCount === 1 ? "reflection" : "reflections"}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          ) : null}
          {overview.savedForLaterCount > 0 ? (
            <TouchableOpacity
              onPress={() => onApplyFilter("saved_for_later")}
              style={styles.summaryAction}
              accessibilityRole="button"
              accessibilityLabel={`View ${overview.savedForLaterCount} entries saved for later`}
            >
              <Text style={[theme.typography.bodySm, styles.actionText, { color: "#556950" }]}>
                View entries saved for later
              </Text>
            </TouchableOpacity>
          ) : null}
          {overview.connectedReflectionCount > 0 ? (
            <TouchableOpacity
              onPress={() => onApplyFilter("connected_reflections")}
              style={styles.summaryAction}
              accessibilityRole="button"
              accessibilityLabel={`View ${overview.connectedReflectionCount} entries with connected reflections`}
            >
              <Text style={[theme.typography.bodySm, styles.actionText, { color: "#556950" }]}>
                View continuing reflections
              </Text>
            </TouchableOpacity>
          ) : null}
          {overview.revisitedCount > 0 ? (
            <TouchableOpacity
              onPress={() => onApplyFilter("revisited")}
              style={styles.summaryAction}
              accessibilityRole="button"
              accessibilityLabel={`View ${overview.revisitedCount} revisited entries`}
            >
              <Text style={[theme.typography.bodySm, styles.actionText, { color: "#556950" }]}>
                View revisited entries
              </Text>
            </TouchableOpacity>
          ) : null}
          {overview.entryCount > 0 ? (
            <TouchableOpacity
              onPress={() => onApplyFilter("not_revisited")}
              style={styles.summaryAction}
              accessibilityRole="button"
              accessibilityLabel="View older entries that have not been revisited"
            >
              <Text style={[theme.typography.bodySm, styles.actionText, { color: "#556950" }]}>
                View older entries not revisited
              </Text>
            </TouchableOpacity>
          ) : null}
        </Card>
      ) : null}
      {visibleCommonTags.length > 0 ? (
        <View style={styles.tagsSection}>
          <Text style={[theme.typography.labelSm, styles.tagsLabel, { color: "#6F6860" }]}>COMMON TAGS</Text>
          <View style={styles.tagsWrap}>
            {visibleCommonTags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                onPress={() => onSelectTag(tag.id)}
                style={styles.tagChip}
                accessibilityRole="button"
                accessibilityLabel={`Filter this Drawer by tag ${tag.name}`}
              >
                <Text style={[theme.typography.bodySm, styles.tagText, { color: "#556950" }]}>{tag.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {commonTags.length > visibleCommonTags.length ? (
            <TouchableOpacity
              onPress={onViewAllTags}
              style={styles.viewAllTagsButton}
              accessibilityRole="button"
              accessibilityLabel="View all Drawer tags in filters"
            >
              <Text style={[theme.typography.bodySm, styles.actionText, { color: "#556950" }]}>View all tags</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  card: {
    paddingVertical: 16,
  },
  primaryCopy: {
    lineHeight: 23,
  },
  secondaryCopy: {
    lineHeight: 21,
    marginTop: 8,
  },
  summaryAction: {
    alignSelf: "flex-start",
    minHeight: 36,
    justifyContent: "center",
    marginTop: 4,
    paddingVertical: 6,
  },
  actionText: {
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  tagsSection: {
    marginTop: 16,
  },
  tagsLabel: {
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    minHeight: 36,
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#F1ECE4",
    borderWidth: 1,
    borderColor: "#DAC8B1",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tagText: {
    fontWeight: "600",
  },
  viewAllTagsButton: {
    alignSelf: "flex-start",
    minHeight: 36,
    justifyContent: "center",
    marginTop: 8,
    paddingVertical: 6,
  },
});
