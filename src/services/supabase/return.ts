import type {
  CreateLinkedReflectionRequest,
  Drawer,
  EntryWithRelations,
  EntryViewRecord,
} from "@types";
import { supabase } from "./client";
import { drawersService } from "./drawers";
import { entriesService } from "./entries";
import type { Database } from "./types";

type EntryRow = Database["public"]["Tables"]["entries"]["Row"];

// One intentional full-entry opening counts once per entry and user within this window.
const ENTRY_VIEW_DEDUPLICATION_WINDOW_MS = 5_000;
const recentEntryViews = new Map<string, EntryViewRecord & { recordedAt: number }>();

export const returnService = {
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
