import { returnApi } from "@features/return/return.api";
import type { ApiError } from "@types";
import { entryStatusApi } from "./entryStatus.api";
import {
  buildEntryDevelopmentTimeline,
  type EntryDevelopmentTimeline,
} from "../entryDevelopmentTimeline";

export const entryDevelopmentTimelineApi = {
  async getEntryDevelopmentTimeline(
    entryId: string,
    userId: string,
  ): Promise<{ success: true; data: EntryDevelopmentTimeline; error: null } | { success: false; data: null; error: ApiError }> {
    const chainResult = await returnApi.getReflectionChain(entryId, userId);
    if (!chainResult.success || !chainResult.data) {
      return {
        success: false,
        data: null,
        error: chainResult.error || { code: "UNKNOWN_ERROR", message: "Entry development history is unavailable" },
      };
    }

    const rootEntry = chainResult.data.find((entry) => !entry.parentEntryId) || chainResult.data[0];
    if (!rootEntry) {
      return {
        success: false,
        data: null,
        error: { code: "NOT_FOUND", message: "Entry development history is unavailable" },
      };
    }

    const historyResult = await entryStatusApi.getEntryStatusHistory(rootEntry.id, userId);
    if (!historyResult.success || !historyResult.data) {
      return {
        success: false,
        data: null,
        error: historyResult.error || { code: "UNKNOWN_ERROR", message: "Entry Status history is unavailable" },
      };
    }

    const timeline = buildEntryDevelopmentTimeline(chainResult.data, historyResult.data);
    if (!timeline) {
      return {
        success: false,
        data: null,
        error: { code: "NOT_FOUND", message: "Entry development history is unavailable" },
      };
    }

    return { success: true, data: timeline, error: null };
  },
};
