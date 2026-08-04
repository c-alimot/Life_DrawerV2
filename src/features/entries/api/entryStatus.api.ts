import { entryStatusService } from "@services";
import type { ApiError, EntryStatus, UpdateEntryStatusRequest } from "@types";

export const entryStatusApi = {
  async getCurrentEntryStatus(entryId: string, userId: string) {
    try {
      const data = await entryStatusService.getCurrentEntryStatus(entryId, userId);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async getEntryStatusHistory(entryId: string, userId: string) {
    try {
      const data = await entryStatusService.getEntryStatusHistory(entryId, userId);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async setInitialEntryStatus(entryId: string, status: EntryStatus) {
    try {
      const data = await entryStatusService.setInitialEntryStatus(entryId, status);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async updateEntryStatus(request: UpdateEntryStatusRequest) {
    try {
      const data = await entryStatusService.updateEntryStatus(request);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },
};
