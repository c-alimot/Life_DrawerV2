import { useAuthStore } from "@store";
import type {
  ApiError,
  ContinuingReflectionSummary,
  DrawerInsightSummary,
  HomeReturnCandidate,
  InsightReflectionComparison,
  InsightTheme,
  InsightsCollectionOverview,
  InsightsTimeRange,
  RecentlyReturnedEntry,
  SavedForLaterInsightsSummary,
} from "@types";
import { useCallback, useState } from "react";
import { insightsApi } from "./insights.api";

function getTimeRangeStart(timeRange: InsightsTimeRange): string | undefined {
  if (timeRange === "all") return undefined;

  const start = new Date();
  start.setMonth(start.getMonth() - (timeRange === "six_months" ? 6 : 12));
  return start.toISOString();
}

export function useInsights() {
  const { user } = useAuthStore();
  const [overview, setOverview] = useState<InsightsCollectionOverview | null>(null);
  const [reflections, setReflections] = useState<ContinuingReflectionSummary | null>(null);
  const [drawers, setDrawers] = useState<DrawerInsightSummary[]>([]);
  const [returnCandidate, setReturnCandidate] = useState<HomeReturnCandidate | null>(null);
  const [themes, setThemes] = useState<InsightTheme[]>([]);
  const [comparisons, setComparisons] = useState<InsightReflectionComparison[]>([]);
  const [recentlyReturned, setRecentlyReturned] = useState<RecentlyReturnedEntry[]>([]);
  const [savedForLater, setSavedForLater] = useState<SavedForLaterInsightsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<ApiError | null>(null);
  const [reflectionsError, setReflectionsError] = useState<ApiError | null>(null);
  const [drawersError, setDrawersError] = useState<ApiError | null>(null);
  const [returnError, setReturnError] = useState<ApiError | null>(null);
  const [themesError, setThemesError] = useState<ApiError | null>(null);
  const [comparisonsError, setComparisonsError] = useState<ApiError | null>(null);
  const [recentlyReturnedError, setRecentlyReturnedError] = useState<ApiError | null>(null);
  const [savedForLaterError, setSavedForLaterError] = useState<ApiError | null>(null);

  const load = useCallback(async (timeRange: InsightsTimeRange = "all") => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const showReturn =
      user.returnPreferences.returnFeaturesEnabled &&
      user.returnPreferences.insightsReturnContentEnabled;
    const startAt = getTimeRangeStart(timeRange);

    const requests = await Promise.all([
      insightsApi.getCollectionOverview(user.id),
      insightsApi.getContinuingReflectionSummary(user.id),
      insightsApi.getDrawerInsightSummaries(user.id),
      showReturn ? insightsApi.getReturnCandidate(user.id, user.returnPreferences) : null,
      insightsApi.getRecurringThemes(user.id, startAt),
      insightsApi.getReflectionComparisons(user.id, startAt),
      insightsApi.getRecentlyReturnedEntries(user.id, startAt),
      insightsApi.getSavedForLaterSummary(user.id, startAt),
    ]);

    const [overviewResult, reflectionsResult, drawersResult, returnResult, themesResult, comparisonsResult, recentlyReturnedResult, savedForLaterResult] = requests;
    setOverview(overviewResult.data);
    setReflections(reflectionsResult.data);
    setDrawers(drawersResult.data || []);
    setReturnCandidate(returnResult?.data || null);
    setThemes(themesResult.data || []);
    setComparisons(comparisonsResult.data || []);
    setRecentlyReturned(recentlyReturnedResult.data || []);
    setSavedForLater(savedForLaterResult.data);
    setOverviewError(overviewResult.error);
    setReflectionsError(reflectionsResult.error);
    setDrawersError(drawersResult.error);
    setReturnError(returnResult?.error || null);
    setThemesError(themesResult.error);
    setComparisonsError(comparisonsResult.error);
    setRecentlyReturnedError(recentlyReturnedResult.error);
    setSavedForLaterError(savedForLaterResult.error);
    setIsLoading(false);
  }, [user]);

  return {
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
    returnContentEnabled: Boolean(
      user?.returnPreferences.returnFeaturesEnabled &&
        user.returnPreferences.insightsReturnContentEnabled,
    ),
    load,
  };
}
