import type {
  ContinuingReflectionSummary,
  DrawerInsightSummary,
  InsightReflectionComparison,
  InsightTheme,
  InsightsCollectionOverview,
  RecentlyReturnedEntry,
  SavedForLaterInsightsSummary,
} from "@types";
import { supabase } from "./client";

export const insightsService = {
  async getCollectionOverview(_userId: string): Promise<InsightsCollectionOverview> {
    const { data, error } = await supabase
      .rpc("get_insights_collection_overview")
      .single();

    if (error || !data) {
      throw error || new Error("Unable to load collection overview");
    }

    return {
      entryCount: data.entry_count,
      drawerCount: data.drawer_count,
      firstEntryAt: data.first_entry_at ?? undefined,
      latestEntryAt: data.latest_entry_at ?? undefined,
      savedForLaterCount: data.saved_for_later_count,
      connectedReflectionCount: data.connected_reflection_count,
      tagCount: data.tag_count,
    };
  },

  async getContinuingReflectionSummary(
    _userId: string,
  ): Promise<ContinuingReflectionSummary> {
    const { data, error } = await supabase.rpc("get_insights_reflection_chains", {
      p_limit: 3,
    });

    if (error) {
      throw error;
    }

    const rows = data || [];
    const firstRow = rows[0];

    return {
      chainCount: firstRow?.chain_count ?? 0,
      connectedEntryCount: firstRow?.connected_entry_count ?? 0,
      chains: rows.map((row) => ({
        rootEntryId: row.root_entry_id,
        originalEntryAt: row.original_entry_at,
        latestReflectionAt: row.latest_reflection_at,
        entryCount: row.entry_count,
        title: row.title || "Untitled Entry",
        preview: row.preview,
      })),
    };
  },

  async getDrawerInsightSummaries(_userId: string): Promise<DrawerInsightSummary[]> {
    const { data, error } = await supabase.rpc("get_insights_drawer_summaries", {
      p_limit: 4,
    });

    if (error) {
      throw error;
    }

    return (data || []).map((row) => ({
      drawerId: row.drawer_id,
      drawerName: row.drawer_name,
      drawerColor: row.drawer_color ?? undefined,
      drawerIcon: row.drawer_icon ?? undefined,
      entryCount: row.entry_count,
      firstEntryAt: row.first_entry_at ?? undefined,
      latestEntryAt: row.latest_entry_at ?? undefined,
      savedForLaterCount: row.saved_for_later_count,
      connectedReflectionCount: row.connected_reflection_count,
      commonTags: row.common_tags || [],
    }));
  },

  async getRecurringThemes(_userId: string, startAt?: string): Promise<InsightTheme[]> {
    const { data, error } = await supabase.rpc("get_insights_recurring_themes", {
      p_start_at: startAt || null,
      p_limit: 4,
    });

    if (error) {
      throw error;
    }

    return (data || []).map((row) => ({
      tagId: row.tag_id,
      name: row.tag_name,
      color: row.tag_color ?? undefined,
      entryCount: row.entry_count,
      drawerCount: row.drawer_count,
      firstEntryAt: row.first_entry_at,
      latestEntryAt: row.latest_entry_at,
      connectedReflectionCount: row.connected_reflection_count,
      drawers: row.drawer_ids.map((id, index) => ({ id, name: row.drawer_names[index] || "Untitled Drawer" })),
      periods: row.year_counts.map((value) => {
        const [label, count] = value.split(":");
        return { label, entryCount: Number(count) || 0 };
      }),
    }));
  },

  async getReflectionComparisons(
    _userId: string,
    startAt?: string,
  ): Promise<InsightReflectionComparison[]> {
    const { data, error } = await supabase.rpc("get_insights_reflection_comparisons", {
      p_start_at: startAt || null,
      p_limit: 3,
    });

    if (error) {
      throw error;
    }

    return (data || []).map((row) => ({
      rootEntryId: row.root_entry_id,
      originalEntryAt: row.original_entry_at,
      originalPreview: row.original_preview,
      latestEntryId: row.latest_entry_id,
      latestReflectionAt: row.latest_reflection_at,
      latestPreview: row.latest_preview,
      latestReflectionType:
        row.latest_reflection_type === "update" ||
        row.latest_reflection_type === "response" ||
        row.latest_reflection_type === "continuation"
          ? row.latest_reflection_type
          : undefined,
      entryCount: row.entry_count,
    }));
  },

  async getRecentlyReturnedEntries(
    _userId: string,
    startAt?: string,
  ): Promise<RecentlyReturnedEntry[]> {
    const { data, error } = await supabase.rpc("get_insights_recently_returned", {
      p_start_at: startAt || null,
      p_limit: 3,
    });

    if (error) {
      throw error;
    }

    return (data || []).map((row) => ({
      entryId: row.entry_id,
      title: row.title || "Untitled Entry",
      preview: row.preview,
      createdAt: row.created_at,
      lastViewedAt: row.last_viewed_at,
      drawerName: row.drawer_name ?? undefined,
      hasConnectedReflection: row.has_connected_reflection,
    }));
  },

  async getSavedForLaterSummary(
    _userId: string,
    startAt?: string,
  ): Promise<SavedForLaterInsightsSummary> {
    const { data, error } = await supabase
      .rpc("get_insights_saved_for_later_summary", { p_start_at: startAt || null })
      .single();

    if (error || !data) {
      throw error || new Error("Unable to load saved Entries summary");
    }

    return { entryCount: data.entry_count };
  },
};
