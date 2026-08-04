import { AppBottomNav, AppPageHeader, SafeArea, Screen } from "@components/layout";
import { Button } from "@components/ui";
import {
  CollectionOverview,
  ContinuingReflectionsOverview,
  DrawerInsightsSection,
  ExploreCollectionSection,
  InsightsReturnSection,
} from "@features/insights/InsightsSections";
import {
  ChangesOverTimeSection,
  InsightsExplainabilitySection,
  InsightsTimeRangeControl,
  RecentlyReturnedSection,
  SavedForLaterInsightsSection,
  ThemesSection,
} from "@features/insights/DeeperInsightsSections";
import { useInsights } from "@features/insights/useInsights";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "@styles/theme";
import { router } from "expo-router";
import type { InsightsTimeRange } from "@types";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

const PAGE_BACKGROUND = "#EDEAE4";
const PAGE_MUTED = "#6F6860";
const PAGE_PRIMARY = "#8C9A7F";
const PAGE_TEXT = "#2F2924";

export function InsightsScreen() {
  const theme = useTheme();
  const {
    overview,
    reflections,
    drawers,
    returnCandidate,
    themes,
    comparisons,
    recentlyReturned,
    savedForLater,
    isLoading,
    overviewError,
    reflectionsError,
    drawersError,
    returnError,
    themesError,
    comparisonsError,
    recentlyReturnedError,
    savedForLaterError,
    returnContentEnabled,
    recordReturnCandidateDisplay,
    load,
  } = useInsights();
  const [timeRange, setTimeRange] = useState<InsightsTimeRange>("all");
  const displayedReturnEntryIds = useRef(new Set<string>());

  useFocusEffect(
    useCallback(() => {
      void load(timeRange);
    }, [load, timeRange]),
  );

  const handleTimeRangeChange = useCallback((nextTimeRange: InsightsTimeRange) => {
    setTimeRange(nextTimeRange);
  }, []);

  useEffect(() => {
    const entryId = returnCandidate?.entry.id;
    if (!returnContentEnabled || !entryId || displayedReturnEntryIds.current.has(entryId)) {
      return;
    }

    displayedReturnEntryIds.current.add(entryId);
    void recordReturnCandidateDisplay(entryId);
  }, [recordReturnCandidateDisplay, returnCandidate?.entry.id, returnContentEnabled]);

  const openDrawer = useCallback((drawerId: string, filter?: "saved" | "connected") => {
    const params = filter ? `?filter=${filter}` : "";
    router.push(`/drawers/${drawerId}${params}`);
  }, []);

  if (isLoading && !overview) {
    return (
      <SafeArea>
        <Screen style={styles.container}>
          <View style={styles.loader}><ActivityIndicator size="large" color={PAGE_PRIMARY} /></View>
        </Screen>
      </SafeArea>
    );
  }

  const isNewCollection = overview?.entryCount === 0;

  return (
    <SafeArea>
      <Screen style={styles.container}>
        <AppPageHeader onSearchPress={() => router.push("/search")} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <Text accessibilityRole="header" style={[styles.title, { color: PAGE_TEXT, fontFamily: theme.fonts.serif }]}>Insights</Text>
            <Text style={[theme.typography.body, styles.introduction, { color: PAGE_MUTED }]}>Insights help you notice what has stayed, changed, or returned across your collection.</Text>
          </View>

          {returnContentEnabled ? (
            <>
              <InsightsReturnSection candidate={returnCandidate} error={returnError} onOpenEntry={(entryId) => router.push(`/entry/${entryId}`)} onRetry={() => load(timeRange)} />
              <ContinuingReflectionsOverview summary={reflections} error={reflectionsError} onOpenChain={(entryId) => router.push(`/entry/${entryId}`)} onRetry={() => load(timeRange)} />
            </>
          ) : null}
          <CollectionOverview overview={overview} error={overviewError} onRetry={() => load(timeRange)} />
          {isNewCollection ? (
            <View style={styles.newCollectionActions}>
              <Button label="Write an Entry" onPress={() => router.push("/create-entry")} size="md" />
              <Button label="Create a Drawer" onPress={() => router.push("/drawers")} variant="outline" size="md" />
            </View>
          ) : null}
          <DrawerInsightsSection drawers={drawers} totalDrawers={overview?.drawerCount || 0} error={drawersError} onOpenDrawer={openDrawer} onViewAll={() => router.push("/drawers")} onRetry={() => load(timeRange)} />
          <InsightsTimeRangeControl value={timeRange} onChange={handleTimeRangeChange} />
          <ThemesSection themes={themes} hasTags={(overview?.tagCount || 0) > 0} error={themesError} onOpenTag={(tagId) => router.push(`/all-entries?tagId=${encodeURIComponent(tagId)}`)} onOpenDrawer={(drawerId, tagId) => router.push(`/drawers/${drawerId}?tagId=${encodeURIComponent(tagId)}`)} onRetry={() => load(timeRange)} />
          <ChangesOverTimeSection comparisons={comparisons} error={comparisonsError} onOpenHistory={(entryId) => router.push(`/entry/${entryId}`)} onRetry={() => load(timeRange)} />
          <RecentlyReturnedSection entries={recentlyReturned} error={recentlyReturnedError} onOpenEntry={(entryId) => router.push(`/entry/${entryId}`)} onRetry={() => load(timeRange)} />
          <SavedForLaterInsightsSection summary={savedForLater} error={savedForLaterError} onOpenSaved={() => router.push("/all-entries?filter=saved")} onRetry={() => load(timeRange)} />
          <ExploreCollectionSection drawers={drawers} onOpenDrawer={openDrawer} onBrowseDrawers={() => router.push("/drawers")} onBrowseTags={() => router.push("/tags")} onSearch={() => router.push("/search")} />
          <InsightsExplainabilitySection />
        </ScrollView>
        <AppBottomNav currentRoute="/insights" />
      </Screen>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAGE_BACKGROUND },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 160 },
  hero: { marginBottom: 34 },
  title: { fontSize: 36, lineHeight: 43 },
  introduction: { marginTop: 13, lineHeight: 27, maxWidth: 600 },
  newCollectionActions: { gap: 10, marginTop: -16, marginBottom: 38 },
});
