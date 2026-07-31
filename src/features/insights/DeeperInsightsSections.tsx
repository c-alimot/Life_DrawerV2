import { Card } from "@components/ui";
import { MaterialCommunityIcons } from "@components/ui/icons";
import { useTheme } from "@styles/theme";
import type {
  ApiError,
  InsightReflectionComparison,
  InsightTheme,
  InsightsTimeRange,
  RecentlyReturnedEntry,
  SavedForLaterInsightsSummary,
} from "@types";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PAGE_MUTED = "#6F6860";
const PAGE_PRIMARY = "#8C9A7F";
const PAGE_SECONDARY = "#556950";
const PAGE_TEXT = "#2F2924";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function SectionTitle({ children }: { children: string }) {
  const theme = useTheme();

  return (
    <Text accessibilityRole="header" style={[theme.typography.h2, styles.sectionTitle, { color: PAGE_TEXT, fontFamily: theme.fonts.serif }]}>
      {children}
    </Text>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  const theme = useTheme();

  return (
    <Card variant="soft" style={styles.noticeCard} accessibilityLiveRegion="polite">
      <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>{message}</Text>
      <TouchableOpacity onPress={onRetry} style={styles.textAction} accessibilityRole="button" accessibilityLabel="Try loading this Insights section again">
        <Text style={[theme.typography.bodySm, { color: PAGE_SECONDARY, fontWeight: "700" }]}>Try again</Text>
      </TouchableOpacity>
    </Card>
  );
}

export function InsightsTimeRangeControl({
  value,
  onChange,
}: {
  value: InsightsTimeRange;
  onChange: (value: InsightsTimeRange) => void;
}) {
  const theme = useTheme();
  const options: { label: string; value: InsightsTimeRange }[] = [
    { label: "All time", value: "all" },
    { label: "Past 6 months", value: "six_months" },
    { label: "Past year", value: "year" },
  ];

  return (
    <View style={styles.rangeSection} accessibilityLabel={`Insights time range: ${options.find((option) => option.value === value)?.label}`}>
      <Text style={[theme.typography.bodySm, styles.rangeLabel, { color: PAGE_MUTED }]}>Use this range for the sections below</Text>
      <View style={styles.rangeOptions} accessibilityRole="radiogroup">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[styles.rangeOption, isSelected && styles.rangeOptionSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={option.label}
            >
              <Text style={[theme.typography.bodySm, { color: isSelected ? "#FFFFFF" : PAGE_SECONDARY, fontWeight: "700" }]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

interface ThemesSectionProps {
  themes: InsightTheme[];
  hasTags: boolean;
  error: ApiError | null;
  onOpenTag: (tagId: string) => void;
  onOpenDrawer: (drawerId: string, tagId: string) => void;
  onRetry: () => void;
}

export function ThemesSection({ themes, hasTags, error, onOpenTag, onOpenDrawer, onRetry }: ThemesSectionProps) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <SectionTitle>Themes you return to</SectionTitle>
      <Text style={[theme.typography.bodySm, styles.helperCopy, { color: PAGE_MUTED }]}>Themes are based on the Tags you added to your Entries.</Text>
      {error ? <ErrorCard message="Themes could not be loaded right now." onRetry={onRetry} /> : null}
      {!error && !hasTags ? <Card variant="soft" style={styles.noticeCard}><Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>Add Tags to Entries to notice themes across your collection.</Text></Card> : null}
      {!error && hasTags && themes.length === 0 ? <Card variant="soft" style={styles.noticeCard}><Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>Your Tags have not repeated enough to show a pattern yet.</Text></Card> : null}
      {!error ? (
        <View style={styles.list} accessibilityRole="list">
          {themes.map((item) => (
            <Card key={item.tagId} variant="elevated" style={styles.themeCard} accessibilityLabel={`${item.name}, used in ${item.entryCount} Entries across ${item.drawerCount} Drawers`}>
              <View style={styles.themeHeading}>
                <View style={[styles.themeColor, { backgroundColor: item.color || PAGE_PRIMARY }]} />
                <Text style={[theme.typography.h3, styles.flexCopy, { color: PAGE_TEXT, fontFamily: theme.fonts.serif }]}>{item.name}</Text>
              </View>
              <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>Appears in {item.entryCount} {item.entryCount === 1 ? "Entry" : "Entries"} across {item.drawerCount} {item.drawerCount === 1 ? "Drawer" : "Drawers"}.</Text>
              <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>First used {formatDate(item.firstEntryAt)} · Most recently used {formatDate(item.latestEntryAt)}</Text>
              {item.connectedReflectionCount > 0 ? <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>{item.connectedReflectionCount} {item.connectedReflectionCount === 1 ? "Entry is" : "Entries are"} part of continuing reflections.</Text> : null}
              {item.periods.length > 0 ? <View style={styles.timeline} accessibilityLabel={`${item.name} by year: ${item.periods.map((period) => `${period.label}, ${period.entryCount} Entries`).join("; ")}`}>
                {item.periods.map((period) => <Text key={period.label} style={[theme.typography.bodySm, { color: PAGE_SECONDARY }]}>{period.label}: {period.entryCount} {period.entryCount === 1 ? "Entry" : "Entries"}</Text>)}
              </View> : null}
              {item.drawers.length > 0 ? (
                <View style={styles.drawerLinks}>
                  <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>This Tag appears across these Drawers:</Text>
                  <View style={styles.drawerPills}>
                    {item.drawers.map((drawer) => <TouchableOpacity key={drawer.id} onPress={() => onOpenDrawer(drawer.id, item.tagId)} style={styles.drawerPill} accessibilityRole="button" accessibilityLabel={`Open ${drawer.name} filtered by ${item.name}`}><Text style={[theme.typography.labelSm, { color: PAGE_SECONDARY }]}>{drawer.name}</Text></TouchableOpacity>)}
                  </View>
                </View>
              ) : null}
              <TouchableOpacity onPress={() => onOpenTag(item.tagId)} style={styles.textAction} accessibilityRole="button" accessibilityLabel={`View Entries with Tag ${item.name}`}>
                <Text style={[theme.typography.bodySm, { color: PAGE_SECONDARY, fontWeight: "700" }]}>View tagged Entries</Text>
              </TouchableOpacity>
            </Card>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function ChangesOverTimeSection({
  comparisons,
  error,
  onOpenHistory,
  onRetry,
}: {
  comparisons: InsightReflectionComparison[];
  error: ApiError | null;
  onOpenHistory: (entryId: string) => void;
  onRetry: () => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <SectionTitle>Changes over time</SectionTitle>
      <Text style={[theme.typography.bodySm, styles.helperCopy, { color: PAGE_MUTED }]}>These Entries are connected through reflections. Life Drawer does not interpret what changed.</Text>
      {error ? <ErrorCard message="Connected reflection comparisons are unavailable right now." onRetry={onRetry} /> : null}
      {!error && comparisons.length === 0 ? <Card variant="soft" style={styles.noticeCard}><Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>When an earlier Entry has a connected reflection, changes over time can appear here.</Text></Card> : null}
      {!error ? <View style={styles.list}>{comparisons.map((comparison) => (
        <Card key={comparison.rootEntryId} variant="elevated" style={styles.comparisonCard}>
          <Text accessibilityRole="header" style={[theme.typography.labelSm, { color: PAGE_SECONDARY }]}>THEN — {formatDate(comparison.originalEntryAt)}</Text>
          <Text numberOfLines={3} style={[theme.typography.body, { color: PAGE_TEXT }]}>{comparison.originalPreview}</Text>
          <View style={styles.comparisonDivider} />
          <Text accessibilityRole="header" style={[theme.typography.labelSm, { color: PAGE_SECONDARY }]}>NOW — {formatDate(comparison.latestReflectionAt)}</Text>
          <Text numberOfLines={3} style={[theme.typography.body, { color: PAGE_TEXT }]}>{comparison.latestPreview}</Text>
          <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>{comparison.latestReflectionType ? `${comparison.latestReflectionType.charAt(0).toUpperCase()}${comparison.latestReflectionType.slice(1)} reflection` : "Connected reflection"} · {comparison.entryCount} connected Entries</Text>
          <TouchableOpacity onPress={() => onOpenHistory(comparison.rootEntryId)} style={styles.textAction} accessibilityRole="button" accessibilityLabel={`View full reflection history beginning ${formatDate(comparison.originalEntryAt)}`}>
            <Text style={[theme.typography.bodySm, { color: PAGE_SECONDARY, fontWeight: "700" }]}>View full reflection history</Text>
          </TouchableOpacity>
        </Card>
      ))}</View> : null}
    </View>
  );
}

export function RecentlyReturnedSection({
  entries,
  error,
  onOpenEntry,
  onRetry,
}: {
  entries: RecentlyReturnedEntry[];
  error: ApiError | null;
  onOpenEntry: (entryId: string) => void;
  onRetry: () => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <SectionTitle>Recently returned to</SectionTitle>
      <Text style={[theme.typography.bodySm, styles.helperCopy, { color: PAGE_MUTED }]}>Includes Entries you intentionally reopened.</Text>
      {error ? <ErrorCard message="Recently returned Entries are unavailable right now." onRetry={onRetry} /> : null}
      {!error && entries.length === 0 ? <Card variant="soft" style={styles.noticeCard}><Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>Entries you return to will appear here.</Text></Card> : null}
      {!error ? <View style={styles.list}>{entries.map((entry) => (
        <TouchableOpacity key={entry.entryId} onPress={() => onOpenEntry(entry.entryId)} style={styles.returnedCard} accessibilityRole="button" accessibilityLabel={`Open Entry from ${formatDate(entry.createdAt)}, returned to ${formatDate(entry.lastViewedAt)}`}>
          <View style={styles.returnedHeader}>
            <View style={styles.returnedIcon}><MaterialCommunityIcons name="history" size={18} color={PAGE_SECONDARY} /></View>
            <View style={styles.flexCopy}>
              <Text numberOfLines={1} style={[theme.typography.body, { color: PAGE_TEXT, fontWeight: "700" }]}>{entry.title}</Text>
              <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>Written {formatDate(entry.createdAt)} · Returned to {formatDate(entry.lastViewedAt)}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={PAGE_MUTED} />
          </View>
          <Text numberOfLines={2} style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>{entry.preview}</Text>
          {entry.drawerName || entry.hasConnectedReflection ? <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>{[entry.drawerName, entry.hasConnectedReflection ? "Connected reflection" : null].filter(Boolean).join(" · ")}</Text> : null}
        </TouchableOpacity>
      ))}</View> : null}
    </View>
  );
}

export function SavedForLaterInsightsSection({
  summary,
  error,
  onOpenSaved,
  onRetry,
}: {
  summary: SavedForLaterInsightsSummary | null;
  error: ApiError | null;
  onOpenSaved: () => void;
  onRetry: () => void;
}) {
  const theme = useTheme();

  if (!error && (!summary || summary.entryCount === 0)) return null;

  return (
    <View style={styles.section}>
      <SectionTitle>Saved for later</SectionTitle>
      {error ? <ErrorCard message="Your saved Entries summary is unavailable right now." onRetry={onRetry} /> : null}
      {summary && summary.entryCount > 0 ? <Card variant="soft" style={styles.savedCard}>
        <MaterialCommunityIcons name="bookmark-outline" size={22} color={PAGE_SECONDARY} />
        <View style={styles.flexCopy}>
          <Text style={[theme.typography.body, { color: PAGE_TEXT }]}>{summary.entryCount} {summary.entryCount === 1 ? "Entry is" : "Entries are"} saved for later.</Text>
          <TouchableOpacity onPress={onOpenSaved} style={styles.textAction} accessibilityRole="button" accessibilityLabel="View saved for later Entries">
            <Text style={[theme.typography.bodySm, { color: PAGE_SECONDARY, fontWeight: "700" }]}>View saved Entries</Text>
          </TouchableOpacity>
        </View>
      </Card> : null}
    </View>
  );
}

export function InsightsExplainabilitySection() {
  const theme = useTheme();

  return (
    <Card variant="soft" style={styles.explainabilityCard}>
      <Text accessibilityRole="header" style={[theme.typography.h3, { color: PAGE_TEXT, fontFamily: theme.fonts.serif }]}>About these insights</Text>
      <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>Themes come from Tags you created, and comparisons come from Entries you connected through reflections. Life Drawer does not infer meaning, mood, or mental health from your writing.</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 38 },
  sectionTitle: { marginBottom: 12 },
  helperCopy: { marginBottom: 14, lineHeight: 21 },
  rangeSection: { marginBottom: 34 },
  rangeLabel: { marginBottom: 10 },
  rangeOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  rangeOption: { minHeight: 38, justifyContent: "center", borderWidth: 1, borderColor: "#B39C87", borderRadius: 19, paddingHorizontal: 13, backgroundColor: "#F8F6F2" },
  rangeOptionSelected: { borderColor: PAGE_SECONDARY, backgroundColor: PAGE_SECONDARY },
  noticeCard: { gap: 10 },
  list: { gap: 12 },
  themeCard: { gap: 10 },
  themeHeading: { flexDirection: "row", alignItems: "center", gap: 10 },
  themeColor: { width: 12, height: 12, borderRadius: 6 },
  flexCopy: { flex: 1 },
  timeline: { gap: 4, paddingLeft: 11, borderLeftWidth: 2, borderColor: "#DAC8B1" },
  drawerLinks: { gap: 7 },
  drawerPills: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  drawerPill: { minHeight: 32, justifyContent: "center", borderRadius: 16, paddingHorizontal: 10, backgroundColor: "#EEF1EA" },
  textAction: { alignSelf: "flex-start", minHeight: 38, justifyContent: "center", paddingVertical: 6 },
  comparisonCard: { gap: 10 },
  comparisonDivider: { height: 1, backgroundColor: "#E7DED2", marginVertical: 2 },
  returnedCard: { gap: 9, padding: 15, borderRadius: 18, borderWidth: 1, borderColor: "#E7DED2", backgroundColor: "#FFFFFF" },
  returnedHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  returnedIcon: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center", backgroundColor: "#EEF1EA" },
  savedCard: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  explainabilityCard: { gap: 10, marginBottom: 38 },
});
