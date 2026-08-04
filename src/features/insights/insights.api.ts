import { insightsService, returnService } from "@services";
import type { ApiError, ReturnPreferences } from "@types";

export const insightsApi = {
  async getCollectionOverview(userId: string) {
    try {
      const data = await insightsService.getCollectionOverview(userId);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async getContinuingReflectionSummary(userId: string) {
    try {
      const data = await insightsService.getContinuingReflectionSummary(userId);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async getDrawerInsightSummaries(userId: string) {
    try {
      const data = await insightsService.getDrawerInsightSummaries(userId);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async getRecurringThemes(userId: string, startAt?: string) {
    try {
      const data = await insightsService.getRecurringThemes(userId, startAt);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async getReflectionComparisons(userId: string, startAt?: string) {
    try {
      const data = await insightsService.getReflectionComparisons(userId, startAt);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async getRecentlyReturnedEntries(userId: string, startAt?: string) {
    try {
      const data = await insightsService.getRecentlyReturnedEntries(userId, startAt);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async getSavedForLaterSummary(userId: string, startAt?: string) {
    try {
      const data = await insightsService.getSavedForLaterSummary(userId, startAt);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async getReturnCandidate(
    userId: string,
    preferences: ReturnPreferences,
  ) {
    try {
      // Automated Return respects Return preferences; factual Insights summaries do not exclude opted-out entries.
      const data = await returnService.getHomeReturnCandidate(userId, {
        ...preferences,
        showReturnContentOnHome: true,
      });
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },

  async recordReturnCandidateDisplay(entryId: string, userId: string) {
    try {
      const data = await returnService.recordHomeReturnDisplay(entryId, userId);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error as ApiError };
    }
  },
};
