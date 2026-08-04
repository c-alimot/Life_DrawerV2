import type {
  CreateLinkedReflectionRequest,
  Drawer,
  DrawerCommonTag,
  DrawerReturnOverview,
  ExcludedReturnContent,
  EntryWithRelations,
  EntryViewRecord,
  ReturnPreferences,
} from "@types";
import {
  HOME_RETURN_CANDIDATE_LIMIT,
  HOME_RETURN_MINIMUM_AGE_DAYS,
  HOME_RETURN_RECENT_VIEW_WINDOW_DAYS,
  HOME_RETURN_RESURFACE_COOLDOWN_DAYS,
  selectHomeReturnCandidate,
} from "@features/return/basicReturnEntry";
import { selectDrawerReturnCandidate } from "@features/return/drawerReturnCandidate";
import { supabase } from "./client";
import { drawersService } from "./drawers";
import { entriesService } from "./entries";
import type { Database } from "./types";

type EntryRow = Database["public"]["Tables"]["entries"]["Row"];

// One intentional full-entry opening counts once per entry and user within this window.
const ENTRY_VIEW_DEDUPLICATION_WINDOW_MS = 5_000;
const recentEntryViews = new Map<string, EntryViewRecord & { recordedAt: number }>();
const RETURN_DISPLAY_DEDUPLICATION_WINDOW_MS = 5_000;
const recentReturnDisplays = new Map<string, { lastResurfacedAt: string; resurfaceCount: number; recordedAt: number }>();

export const returnService = {
  async getExcludedReturnContent(userId: string): Promise<ExcludedReturnContent> {
    const [entriesResult, drawersResult] = await Promise.all([
      supabase
        .from("entries")
        .select("id, created_at", { count: "exact" })
        .eq("user_id", userId)
        .eq("resurfacing_enabled", false)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("drawers")
        .select("id, name", { count: "exact" })
        .eq("user_id", userId)
        .eq("resurfacing_enabled", false)
        .order("name", { ascending: true })
        .limit(50),
    ]);

    if (entriesResult.error) {
      throw entriesResult.error;
    }

    if (drawersResult.error) {
      throw drawersResult.error;
    }

    return {
      entryCount: entriesResult.count || 0,
      drawerCount: drawersResult.count || 0,
      entries: (entriesResult.data || []).map((entry) => ({
        id: entry.id,
        createdAt: entry.created_at,
      })),
      drawers: (drawersResult.data || []).map((drawer) => ({
        id: drawer.id,
        name: drawer.name,
      })),
    };
  },

  async getDrawerReturnOverview(drawerId: string): Promise<DrawerReturnOverview> {
    const { data, error } = await supabase
      .rpc("get_drawer_return_overview", { p_drawer_id: drawerId })
      .single();

    if (error || !data) {
      throw error || new Error("Unable to load Drawer overview");
    }

    return {
      entryCount: data.entry_count,
      firstEntryAt: data.first_entry_at ?? undefined,
      latestEntryAt: data.latest_entry_at ?? undefined,
      savedForLaterCount: data.saved_for_later_count,
      connectedReflectionCount: data.connected_reflection_count,
      revisitedCount: data.revisited_count,
    };
  },

  async getDrawerCommonTags(drawerId: string): Promise<DrawerCommonTag[]> {
    const { data, error } = await supabase.rpc("get_drawer_common_tags", {
      p_drawer_id: drawerId,
      p_limit: 50,
    });

    if (error) {
      throw error;
    }

    return (data || []).map((tag) => ({
      id: tag.tag_id,
      name: tag.tag_name,
      color: tag.tag_color ?? undefined,
      entryCount: tag.entry_count,
    }));
  },

  async getDrawerReturnCandidate(
    drawerId: string,
    userId: string,
    preferences: Pick<ReturnPreferences, "returnFeaturesEnabled">,
    excludedEntryIds: string[] = [],
  ) {
    if (!preferences.returnFeaturesEnabled) {
      return null;
    }

    const { data: drawer, error: drawerError } = await supabase
      .from("drawers")
      .select("resurfacing_enabled")
      .eq("id", drawerId)
      .eq("user_id", userId)
      .maybeSingle();

    if (drawerError) {
      throw drawerError;
    }

    if (!drawer?.resurfacing_enabled) {
      return null;
    }

    const { data: entryLinks, error: entryLinksError } = await supabase
      .from("entry_drawers")
      .select("entry_id")
      .eq("drawer_id", drawerId)
      .eq("user_id", userId)
      .limit(HOME_RETURN_CANDIDATE_LIMIT);

    if (entryLinksError) {
      throw entryLinksError;
    }

    const entryIds = (entryLinks || []).map((entryLink) => entryLink.entry_id);
    if (!entryIds.length) {
      return null;
    }

    const now = new Date();
    const minimumAgeTimestamp = new Date(
      now.getTime() - HOME_RETURN_MINIMUM_AGE_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
    const recentViewTimestamp = new Date(
      now.getTime() - HOME_RETURN_RECENT_VIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
    const resurfaceCooldownTimestamp = new Date(
      now.getTime() - HOME_RETURN_RESURFACE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: candidateRows, error: candidateError } = await supabase
      .from("entries")
      .select(
        "id, user_id, title, content, mood, current_status, created_at, updated_at, parent_entry_id, reflection_type, last_viewed_at, revisit_count, saved_for_later, resurfacing_enabled, last_resurfaced_at, resurface_count, return_dismissed_until",
      )
      .in("id", entryIds)
      .eq("user_id", userId)
      .eq("resurfacing_enabled", true)
      .lte("created_at", minimumAgeTimestamp)
      .or(`last_viewed_at.is.null,last_viewed_at.lt.${recentViewTimestamp}`)
      .or(`last_resurfaced_at.is.null,last_resurfaced_at.lt.${resurfaceCooldownTimestamp}`)
      .or(`return_dismissed_until.is.null,return_dismissed_until.lte.${now.toISOString()}`)
      .order("saved_for_later", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(HOME_RETURN_CANDIDATE_LIMIT);

    if (candidateError) {
      throw candidateError;
    }

    const rows = (candidateRows || []) as EntryRow[];
    if (!rows.length) {
      return null;
    }

    const candidateIds = rows.map((entry) => entry.id);
    const { data: childReflections, error: childReflectionsError } = await supabase
      .from("entries")
      .select("parent_entry_id")
      .eq("user_id", userId)
      .in("parent_entry_id", candidateIds);

    if (childReflectionsError) {
      throw childReflectionsError;
    }

    const entries = await entriesService.hydrateEntries(userId, rows);
    const childReflectionEntryIds = new Set(
      (childReflections || [])
        .map((reflection) => reflection.parent_entry_id)
        .filter((entryId): entryId is string => Boolean(entryId)),
    );

    return selectDrawerReturnCandidate({
      entries,
      userId,
      preferences,
      childReflectionEntryIds,
      excludedEntryIds: new Set(excludedEntryIds),
      now,
    });
  },

  async getHomeReturnCandidate(
    userId: string,
    preferences: Pick<
      ReturnPreferences,
      "returnFeaturesEnabled" | "showReturnContentOnHome" | "showOnThisDay"
    >,
    excludedEntryIds: string[] = [],
  ) {
    if (!preferences.returnFeaturesEnabled || !preferences.showReturnContentOnHome) {
      return null;
    }

    const now = new Date();
    const minimumAgeTimestamp = new Date(
      now.getTime() - HOME_RETURN_MINIMUM_AGE_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
    const recentViewTimestamp = new Date(
      now.getTime() - HOME_RETURN_RECENT_VIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
    const resurfaceCooldownTimestamp = new Date(
      now.getTime() - HOME_RETURN_RESURFACE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const [candidateResult, newestEntryResult] = await Promise.all([
      supabase
        .from("entries")
        .select(
          "id, user_id, title, content, mood, current_status, created_at, updated_at, parent_entry_id, reflection_type, last_viewed_at, revisit_count, saved_for_later, resurfacing_enabled, last_resurfaced_at, resurface_count, return_dismissed_until",
        )
        .eq("user_id", userId)
        .eq("resurfacing_enabled", true)
        .lte("created_at", minimumAgeTimestamp)
        .or(`last_viewed_at.is.null,last_viewed_at.lt.${recentViewTimestamp}`)
        .or(`last_resurfaced_at.is.null,last_resurfaced_at.lt.${resurfaceCooldownTimestamp}`)
        .or(`return_dismissed_until.is.null,return_dismissed_until.lte.${now.toISOString()}`)
        .order("saved_for_later", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(HOME_RETURN_CANDIDATE_LIMIT),
      supabase
        .from("entries")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (candidateResult.error) {
      throw candidateResult.error;
    }

    if (newestEntryResult.error) {
      throw newestEntryResult.error;
    }

    const candidateRows = (candidateResult.data || []) as EntryRow[];
    if (!candidateRows.length) {
      return null;
    }

    const candidateIds = candidateRows.map((entry) => entry.id);
    const { data: childReflections, error: childReflectionsError } = await supabase
      .from("entries")
      .select("parent_entry_id")
      .eq("user_id", userId)
      .in("parent_entry_id", candidateIds);

    if (childReflectionsError) {
      throw childReflectionsError;
    }

    const entries = await entriesService.hydrateEntries(userId, candidateRows);
    const childReflectionEntryIds = new Set(
      (childReflections || [])
        .map((reflection) => reflection.parent_entry_id)
        .filter((entryId): entryId is string => Boolean(entryId)),
    );

    return selectHomeReturnCandidate({
      entries,
      userId,
      preferences,
      newestEntryId: newestEntryResult.data?.id,
      childReflectionEntryIds,
      excludedEntryIds: new Set(excludedEntryIds),
      now,
    });
  },

  async recordHomeReturnDisplay(entryId: string, userId: string) {
    const cacheKey = `${userId}:${entryId}`;
    const now = Date.now();
    const recentDisplay = recentReturnDisplays.get(cacheKey);

    if (recentDisplay && now - recentDisplay.recordedAt < RETURN_DISPLAY_DEDUPLICATION_WINDOW_MS) {
      return {
        lastResurfacedAt: recentDisplay.lastResurfacedAt,
        resurfaceCount: recentDisplay.resurfaceCount,
        userId,
      };
    }

    const { data, error } = await supabase
      .rpc("record_home_return_display", { p_entry_id: entryId })
      .single();

    if (error || !data?.last_resurfaced_at) {
      throw error || new Error("Unable to record Home Return display");
    }

    const returnDisplay = {
      lastResurfacedAt: data.last_resurfaced_at,
      resurfaceCount: data.resurface_count,
      recordedAt: now,
    };
    recentReturnDisplays.set(cacheKey, returnDisplay);

    return {
      lastResurfacedAt: returnDisplay.lastResurfacedAt,
      resurfaceCount: returnDisplay.resurfaceCount,
      userId,
    };
  },

  async dismissHomeReturnEntry(entryId: string, userId: string, dismissedUntil: string) {
    const { data, error } = await supabase
      .from("entries")
      .update({ return_dismissed_until: dismissedUntil })
      .eq("user_id", userId)
      .eq("id", entryId)
      .select("return_dismissed_until")
      .maybeSingle();

    if (error || !data?.return_dismissed_until) {
      throw error || new Error("Unable to dismiss Home Return entry");
    }

    return data.return_dismissed_until;
  },

  async createLinkedReflection(
    userId: string,
    request: CreateLinkedReflectionRequest,
  ): Promise<EntryWithRelations> {
    const parentEntry = await this.findEntryById(request.parentEntryId, userId);

    if (!parentEntry) {
      throw new Error("The original entry is unavailable");
    }

    return entriesService.createEntry(userId, {
      ...request.entryData,
      parentEntryId: parentEntry.id,
      reflectionType: request.reflectionType,
    });
  },

  async getLinkedReflections(
    entryId: string,
    userId: string,
  ): Promise<EntryWithRelations[]> {
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .eq("parent_entry_id", entryId)
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return entriesService.hydrateEntries(userId, (data || []) as EntryRow[]);
  },

  async getReflectionChain(
    entryId: string,
    userId: string,
  ): Promise<EntryWithRelations[]> {
    const selectedEntry = await this.findEntryById(entryId, userId);
    if (!selectedEntry) {
      throw new Error("Entry not found");
    }

    let rootEntry = selectedEntry;
    const visitedAncestorIds = new Set<string>([selectedEntry.id]);
    let parentEntryId = selectedEntry.parentEntryId;

    while (parentEntryId && !visitedAncestorIds.has(parentEntryId)) {
      visitedAncestorIds.add(parentEntryId);
      const parentEntry = await this.findEntryById(parentEntryId, userId);
      if (!parentEntry) {
        break;
      }

      rootEntry = parentEntry;
      parentEntryId = parentEntry.parentEntryId;
    }

    const entriesById = new Map<string, EntryWithRelations>([[rootEntry.id, rootEntry]]);
    const pendingEntryIds = [rootEntry.id];
    const visitedDescendantIds = new Set<string>([rootEntry.id]);

    while (pendingEntryIds.length) {
      const currentEntryId = pendingEntryIds.shift();
      if (!currentEntryId) {
        continue;
      }

      const children = await this.getLinkedReflections(currentEntryId, userId);
      for (const child of children) {
        if (visitedDescendantIds.has(child.id)) {
          continue;
        }

        visitedDescendantIds.add(child.id);
        entriesById.set(child.id, child);
        pendingEntryIds.push(child.id);
      }
    }

    return Array.from(entriesById.values()).sort(
      (left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );
  },

  async setSavedForLater(
    entryId: string,
    saved: boolean,
    userId: string,
  ): Promise<boolean> {
    const entry = await this.updateEntryReturnState(entryId, userId, {
      saved_for_later: saved,
    });

    return entry.saved_for_later;
  },

  async setEntryResurfacing(
    entryId: string,
    enabled: boolean,
    userId: string,
  ): Promise<boolean> {
    const entry = await this.updateEntryReturnState(entryId, userId, {
      resurfacing_enabled: enabled,
    });

    return entry.resurfacing_enabled;
  },

  async setDrawerResurfacing(
    drawerId: string,
    enabled: boolean,
    userId: string,
  ): Promise<Drawer> {
    return drawersService.updateDrawer(drawerId, userId, {
      resurfacingEnabled: enabled,
    });
  },

  async recordEntryView(entryId: string, userId: string): Promise<EntryViewRecord> {
    const cacheKey = `${userId}:${entryId}`;
    const now = Date.now();
    const recentRecord = recentEntryViews.get(cacheKey);

    if (recentRecord && now - recentRecord.recordedAt < ENTRY_VIEW_DEDUPLICATION_WINDOW_MS) {
      return recentRecord;
    }

    const { data, error } = await supabase
      .rpc("record_entry_view", { p_entry_id: entryId })
      .single();

    if (error || !data?.last_viewed_at) {
      throw error || new Error("Unable to record entry view");
    }

    const entryViewRecord: EntryViewRecord & { recordedAt: number } = {
      lastViewedAt: data.last_viewed_at,
      revisitCount: data.revisit_count,
      recordedAt: now,
    };
    recentEntryViews.set(cacheKey, entryViewRecord);

    return entryViewRecord;
  },

  async findEntryById(
    entryId: string,
    userId: string,
  ): Promise<EntryWithRelations | null> {
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .eq("id", entryId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    const [entry] = await entriesService.hydrateEntries(userId, [data as EntryRow]);
    return entry || null;
  },

  async updateEntryReturnState(
    entryId: string,
    userId: string,
    updates: Database["public"]["Tables"]["entries"]["Update"],
  ): Promise<EntryRow> {
    const { data, error } = await supabase
      .from("entries")
      .update(updates)
      .eq("id", entryId)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();

    if (error || !data) {
      throw error || new Error("Entry not found");
    }

    return data as EntryRow;
  },
};
