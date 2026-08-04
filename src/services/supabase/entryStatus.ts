import {
  entryStatusSchema,
  updateEntryStatusSchema,
} from "@constants/entryStatus";
import type {
  EntryStatus,
  EntryStatusHistory,
  EntryStatusUpdateResult,
  UpdateEntryStatusRequest,
} from "@types";
import { supabase } from "./client";
import type { Database } from "./types";

type EntryStatusHistoryRow = Database["public"]["Tables"]["entry_status_history"]["Row"];
type EntryStatusMutationRow = Database["public"]["Functions"]["update_entry_status"]["Returns"][number];

function mapEntryStatusHistory(
  row: EntryStatusHistoryRow | EntryStatusMutationRow,
): EntryStatusHistory {
  const source = row.source === "initial" ? "initial" : "update";

  return {
    id: "event_id" in row ? row.event_id : row.id,
    entryId: row.entry_id,
    userId: row.user_id,
    status: entryStatusSchema.parse(row.status),
    note: row.note,
    connectedReflectionEntryId: row.connected_reflection_entry_id,
    source,
    createdAt: row.created_at,
  };
}

export const entryStatusService = {
  async getCurrentEntryStatus(entryId: string, userId: string): Promise<EntryStatus | null> {
    const { data, error } = await supabase
      .from("entries")
      .select("current_status")
      .eq("id", entryId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    return data?.current_status ? entryStatusSchema.parse(data.current_status) : null;
  },

  async getEntryStatusHistory(entryId: string, userId: string): Promise<EntryStatusHistory[]> {
    const { data, error } = await supabase
      .from("entry_status_history")
      .select("*")
      .eq("entry_id", entryId)
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (error) throw error;

    return (data || []).map(mapEntryStatusHistory);
  },

  async setInitialEntryStatus(
    entryId: string,
    status: EntryStatus,
  ): Promise<EntryStatusUpdateResult> {
    const validatedStatus = entryStatusSchema.parse(status);
    const { data, error } = await supabase
      .rpc("set_initial_entry_status", {
        p_entry_id: entryId,
        p_status: validatedStatus,
      })
      .single();

    if (error || !data) {
      throw error || new Error("Unable to set the initial Entry Status");
    }

    const historyEvent = mapEntryStatusHistory(data);
    return { currentStatus: historyEvent.status, historyEvent };
  },

  async updateEntryStatus(
    request: UpdateEntryStatusRequest,
  ): Promise<EntryStatusUpdateResult> {
    const validatedRequest = updateEntryStatusSchema.parse(request);
    const { data, error } = await supabase
      .rpc("update_entry_status", {
        p_entry_id: validatedRequest.entryId,
        p_status: validatedRequest.status,
        p_note: validatedRequest.note ?? null,
        p_connected_reflection_entry_id: validatedRequest.connectedReflectionEntryId ?? null,
      })
      .single();

    if (error || !data) {
      throw error || new Error("Unable to update the Entry Status");
    }

    const historyEvent = mapEntryStatusHistory(data);
    return { currentStatus: historyEvent.status, historyEvent };
  },
};
