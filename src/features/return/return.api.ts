import { returnService } from "@services";
import type {
  ApiError,
  CreateLinkedReflectionRequest,
  ReturnPreferences,
} from "@types";

export const returnApi = {
  async getExcludedReturnContent(userId: string) {
    try {
      const result = await returnService.getExcludedReturnContent(userId);
      return { success: true, data: result, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async getDrawerCommonTags(drawerId: string) {
    try {
      const result = await returnService.getDrawerCommonTags(drawerId);
      return { success: true, data: result, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async getDrawerReturnOverview(drawerId: string) {
    try {
      const result = await returnService.getDrawerReturnOverview(drawerId);
      return { success: true, data: result, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async getDrawerReturnCandidate(
    drawerId: string,
    userId: string,
    preferences: Pick<ReturnPreferences, "returnFeaturesEnabled">,
    excludedEntryIds?: string[],
  ) {
    try {
      const result = await returnService.getDrawerReturnCandidate(
        drawerId,
        userId,
        preferences,
        excludedEntryIds,
      );
      return { success: true, data: result, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async getHomeReturnCandidate(
    userId: string,
    preferences: Pick<
      ReturnPreferences,
      "returnFeaturesEnabled" | "showReturnContentOnHome" | "showOnThisDay"
    >,
    excludedEntryIds?: string[],
  ) {
    try {
      const result = await returnService.getHomeReturnCandidate(
        userId,
        preferences,
        excludedEntryIds,
      );
      return { success: true, data: result, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async recordHomeReturnDisplay(entryId: string, userId: string) {
    try {
      const result = await returnService.recordHomeReturnDisplay(entryId, userId);
      return { success: true, data: result, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async dismissHomeReturnEntry(entryId: string, userId: string, dismissedUntil: string) {
    try {
      const result = await returnService.dismissHomeReturnEntry(entryId, userId, dismissedUntil);
      return { success: true, data: result, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

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
