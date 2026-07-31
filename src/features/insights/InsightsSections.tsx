import { Card, EntryPreviewCard } from "@components/ui";
import { MaterialCommunityIcons } from "@components/ui/icons";
import { useTheme } from "@styles/theme";
import type {
  ApiError,
  ContinuingReflectionSummary,
  DrawerInsightSummary,
  HomeReturnCandidate,
  InsightsCollectionOverview,
} from "@types";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PAGE_MUTED = "#6F6860";
const PAGE_PRIMARY = "#8C9A7F";
const PAGE_SECONDARY = "#556950";
const PAGE_TEXT = "#2F2924";

function formatDate(value?: string): string | null {
  if (!value) return null;

  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatFullDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function SectionTitle({ children }: { children: string }) {
  const theme = useTheme();

  return (
    <Text
      accessibilityRole="header"
      style={[theme.typography.h2, styles.sectionTitle, { color: PAGE_TEXT, fontFamily: theme.fonts.serif }]}
    >
      {children}
    </Text>
  );
}

function RetryCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  const theme = useTheme();

  return (
    <Card variant="soft" style={styles.noticeCard} accessibilityLiveRegion="polite">
      <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>{message}</Text>
      <TouchableOpacity
        onPress={onRetry}
        style={styles.textAction}
        accessibilityRole="button"
        accessibilityLabel="Try loading this Insights section again"
      >
        <Text style={[theme.typography.bodySm, { color: PAGE_SECONDARY, fontWeight: "700" }]}>Try again</Text>
      </TouchableOpacity>
    </Card>
  );
}

interface InsightsReturnSectionProps {
  candidate: HomeReturnCandidate | null;
  error: ApiError | null;
  onOpenEntry: (entryId: string) => void;
  onRetry: () => void;
}

export function InsightsReturnSection({
  candidate,
  error,
  onOpenEntry,
  onRetry,
}: InsightsReturnSectionProps) {
  const theme = useTheme();

  if (!candidate && !error) return null;

  return (
    <View style={styles.section}>
      <SectionTitle>Return to something</SectionTitle>
      {error ? <RetryCard message="Something to return to could not be loaded right now." onRetry={onRetry} /> : null}
      {candidate ? (
        <>
          <Text style={[theme.typography.bodySm, styles.context, { color: PAGE_MUTED }]}>
            {candidate.contextLabel} · {candidate.contextDescription}
          </Text>
          <EntryPreviewCard
            entry={candidate.entry}
            onPress={() => onOpenEntry(candidate.entry.id)}
            showDate
            dateText={formatFullDate(candidate.entry.createdAt)}
            drawerName={candidate.entry.drawers[0]?.name}
            accessibilityLabel={`Open Return entry from ${formatFullDate(candidate.entry.createdAt)}: ${candidate.entry.title || "Untitled Entry"}`}
          />
          <TouchableOpacity
            style={styles.outlineAction}
            onPress={() => onOpenEntry(candidate.entry.id)}
            accessibilityRole="button"
            accessibilityLabel="Open Return entry"
          >
            <Text style={[theme.typography.bodySm, { color: PAGE_SECONDARY, fontWeight: "700" }]}>Open entry</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color={PAGE_SECONDARY} />
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
}

interface ContinuingReflectionsOverviewProps {
  summary: ContinuingReflectionSummary | null;
  error: ApiError | null;
  onOpenChain: (entryId: string) => void;
  onRetry: () => void;
}

export function ContinuingReflectionsOverview({
  summary,
  error,
  onOpenChain,
  onRetry,
}: ContinuingReflectionsOverviewProps) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <SectionTitle>Continuing reflections</SectionTitle>
      {error ? <RetryCard message="Connected reflections are unavailable right now." onRetry={onRetry} /> : null}
      {!error && summary?.chainCount === 0 ? (
        <Card variant="soft" style={styles.noticeCard}>
          <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>
            When you reflect on an earlier Entry, its history will appear here.
          </Text>
        </Card>
      ) : null}
      {!error && summary && summary.chainCount > 0 ? (
        <>
          <Text style={[theme.typography.body, styles.summaryCopy, { color: PAGE_MUTED }]}>
            {summary.connectedEntryCount} {summary.connectedEntryCount === 1 ? "Entry is" : "Entries are"} part of continuing reflections.
          </Text>
          <View accessibilityRole="list" style={styles.list}>
            {summary.chains.map((chain) => (
              <TouchableOpacity
                key={chain.rootEntryId}
                onPress={() => onOpenChain(chain.rootEntryId)}
                style={styles.reflectionCard}
                accessibilityRole="button"
                accessibilityLabel={`Open reflection history beginning ${formatFullDate(chain.originalEntryAt)}`}
              >
                <View style={styles.reflectionHeader}>
                  <View style={styles.reflectionIcon}>
                    <MaterialCommunityIcons name="source-branch" size={18} color={PAGE_SECONDARY} />
                  </View>
                  <View style={styles.flexCopy}>
                    <Text numberOfLines={1} style={[theme.typography.body, { color: PAGE_TEXT, fontWeight: "700" }]}>
                      {chain.title}
                    </Text>
                    <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>
                      {formatFullDate(chain.originalEntryAt)} · {chain.entryCount} connected Entries
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={22} color={PAGE_MUTED} />
                </View>
                <Text numberOfLines={2} style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>{chain.preview}</Text>
                <Text style={[theme.typography.labelSm, { color: PAGE_SECONDARY }]}>Latest reflection {formatFullDate(chain.latestReflectionAt)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

interface CollectionOverviewProps {
  overview: InsightsCollectionOverview | null;
  error: ApiError | null;
  onRetry: () => void;
}

export function CollectionOverview({ overview, error, onRetry }: CollectionOverviewProps) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <SectionTitle>Your collection</SectionTitle>
      {error ? <RetryCard message="Your collection summary could not be loaded right now." onRetry={onRetry} /> : null}
      {!error && overview ? (
        <Card variant="elevated" style={styles.collectionCard} accessibilityLabel={`${overview.entryCount} Entries across ${overview.drawerCount} Drawers`}>
          {overview.entryCount === 0 ? (
            <Text style={[theme.typography.body, { color: PAGE_MUTED }]}>
              Your collection is still beginning. As you add Entries, Life Drawer will help you return to thoughts and moments over time.
            </Text>
          ) : (
            <>
              <Text style={[theme.typography.body, { color: PAGE_MUTED }]}>
                Your collection includes {overview.entryCount} {overview.entryCount === 1 ? "Entry" : "Entries"} across {overview.drawerCount} {overview.drawerCount === 1 ? "Drawer" : "Drawers"}{overview.firstEntryAt && overview.latestEntryAt ? `, written between ${formatDate(overview.firstEntryAt)} and ${formatDate(overview.latestEntryAt)}.` : "."}
              </Text>
              <View style={styles.factRow}>
                <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>{overview.savedForLaterCount} saved for later</Text>
                <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>{overview.connectedReflectionCount} in continuing reflections</Text>
                <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>{overview.tagCount} user-created {overview.tagCount === 1 ? "Tag" : "Tags"}</Text>
              </View>
            </>
          )}
        </Card>
      ) : null}
    </View>
  );
}

interface DrawerInsightsSectionProps {
  drawers: DrawerInsightSummary[];
  totalDrawers: number;
  error: ApiError | null;
  onOpenDrawer: (drawerId: string) => void;
  onViewAll: () => void;
  onRetry: () => void;
}

export function DrawerInsightsSection({
  drawers,
  totalDrawers,
  error,
  onOpenDrawer,
  onViewAll,
  onRetry,
}: DrawerInsightsSectionProps) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <SectionTitle>Drawers over time</SectionTitle>
      {error ? <RetryCard message="Drawer summaries are unavailable right now." onRetry={onRetry} /> : null}
      {!error && totalDrawers === 0 ? (
        <Card variant="soft" style={styles.noticeCard}>
          <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>Create a Drawer when you want a place to gather related Entries.</Text>
        </Card>
      ) : null}
      {!error ? (
        <View style={styles.list}>
          {drawers.map((drawer) => (
            <TouchableOpacity
              key={drawer.drawerId}
              onPress={() => onOpenDrawer(drawer.drawerId)}
              style={styles.drawerCard}
              accessibilityRole="button"
              accessibilityLabel={`Open Drawer ${drawer.drawerName}, ${drawer.entryCount} Entries`}
            >
              <View style={[styles.drawerColor, { backgroundColor: drawer.drawerColor || PAGE_PRIMARY }]} />
              <View style={styles.flexCopy}>
                <Text style={[theme.typography.h3, { color: PAGE_TEXT, fontFamily: theme.fonts.serif }]}>{drawer.drawerName}</Text>
                <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>
                  {drawer.entryCount} {drawer.entryCount === 1 ? "Entry" : "Entries"}
                  {drawer.firstEntryAt && drawer.latestEntryAt ? ` · ${formatDate(drawer.firstEntryAt)} – ${formatDate(drawer.latestEntryAt)}` : ""}
                </Text>
                {drawer.connectedReflectionCount > 0 ? <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>{drawer.connectedReflectionCount} continuing {drawer.connectedReflectionCount === 1 ? "reflection" : "reflections"}</Text> : null}
                {drawer.savedForLaterCount > 0 ? <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>{drawer.savedForLaterCount} saved for later</Text> : null}
                {drawer.commonTags.length > 0 ? <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>Common Tags: {drawer.commonTags.join(", ")}</Text> : null}
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={PAGE_MUTED} />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
      {!error && totalDrawers > drawers.length ? (
        <TouchableOpacity onPress={onViewAll} style={styles.textAction} accessibilityRole="button" accessibilityLabel="View all Drawers">
          <Text style={[theme.typography.bodySm, { color: PAGE_SECONDARY, fontWeight: "700" }]}>View all Drawers</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

interface ExploreCollectionSectionProps {
  drawers: DrawerInsightSummary[];
  onOpenDrawer: (drawerId: string, filter?: "saved" | "connected") => void;
  onBrowseDrawers: () => void;
  onBrowseTags: () => void;
  onSearch: () => void;
}

export function ExploreCollectionSection({
  drawers,
  onOpenDrawer,
  onBrowseDrawers,
  onBrowseTags,
  onSearch,
}: ExploreCollectionSectionProps) {
  const theme = useTheme();
  const savedDrawer = drawers.find((drawer) => drawer.savedForLaterCount > 0);
  const connectedDrawer = drawers.find((drawer) => drawer.connectedReflectionCount > 0);
  const actions = [
    ...(savedDrawer ? [{ label: "View saved for later", icon: "bookmark-outline", onPress: () => onOpenDrawer(savedDrawer.drawerId, "saved") }] : []),
    ...(connectedDrawer ? [{ label: "View connected reflections", icon: "source-branch", onPress: () => onOpenDrawer(connectedDrawer.drawerId, "connected") }] : []),
    { label: "Browse by Drawer", icon: "archive-outline", onPress: onBrowseDrawers },
    { label: "Browse by Tag", icon: "tag-outline", onPress: onBrowseTags },
    { label: "Search your Entries", icon: "magnify", onPress: onSearch },
  ];

  return (
    <View style={styles.section}>
      <SectionTitle>Explore your collection</SectionTitle>
      <View style={styles.exploreList}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.label}
            onPress={action.onPress}
            style={styles.exploreAction}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <View style={styles.exploreIcon}><MaterialCommunityIcons name={action.icon} size={20} color={PAGE_SECONDARY} /></View>
            <Text style={[theme.typography.body, styles.flexCopy, { color: PAGE_TEXT, fontWeight: "600" }]}>{action.label}</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={PAGE_MUTED} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 38 },
  sectionTitle: { marginBottom: 14 },
  context: { marginBottom: 10 },
  summaryCopy: { marginBottom: 14, lineHeight: 25 },
  noticeCard: { gap: 10 },
  collectionCard: { gap: 16 },
  factRow: { gap: 6 },
  textAction: { alignSelf: "flex-start", minHeight: 40, justifyContent: "center", paddingVertical: 7 },
  outlineAction: { alignSelf: "flex-start", minHeight: 44, borderWidth: 1, borderColor: "#B39C87", borderRadius: 22, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 8, marginTop: -4 },
  list: { gap: 12 },
  reflectionCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E7DED2", borderRadius: 18, padding: 15, gap: 10 },
  reflectionHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  reflectionIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#EEF1EA", alignItems: "center", justifyContent: "center" },
  flexCopy: { flex: 1 },
  drawerCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E7DED2", borderRadius: 18, padding: 15 },
  drawerColor: { width: 5, minHeight: 76, borderRadius: 4 },
  exploreList: { gap: 10 },
  exploreAction: { minHeight: 58, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F8F6F2", borderRadius: 16 },
  exploreIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#E6E9E2" },
});
