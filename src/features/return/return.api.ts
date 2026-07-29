import { returnService } from "@services";
import type {
  ApiError,
  CreateLinkedReflectionRequest,
} from "@types";

export const returnApi = {
  async createLinkedReflection(userId: string, request: CreateLinkedReflectionRequest) {
    try {
      const result = await returnService.createLinkedReflection(userId, request);
      return { success: true, data: result, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async getLinkedReflections(entryId: string, userId: string) {
    try {
      const result = await returnService.getLinkedReflections(entryId, userId);
      return { success: true, data: result, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async getReflectionChain(entryId: string, userId: string) {
    try {
      const result = await returnService.getReflectionChain(entryId, userId);
      return { success: true, data: result, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async setSavedForLater(entryId: string, saved: boolean, userId: string) {
    try {
      const result = await returnService.setSavedForLater(entryId, saved, userId);
      return { success: true, data: result, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async setEntryResurfacing(entryId: string, enabled: boolean, userId: string) {
    try {
      const result = await returnService.setEntryResurfacing(entryId, enabled, userId);
      return { success: true, data: result, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async setDrawerResurfacing(drawerId: string, enabled: boolean, userId: string) {
    try {
      const result = await returnService.setDrawerResurfacing(drawerId, enabled, userId);
      return { success: true, data: result, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async recordEntryView(entryId: string, userId: string) {
    try {
      const result = await returnService.recordEntryView(entryId, userId);
      return { success: true, data: result, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },
};
