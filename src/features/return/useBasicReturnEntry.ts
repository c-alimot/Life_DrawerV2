import { useAuthStore } from "@store";
import type { ApiError, HomeReturnCandidate } from "@types";
import { useCallback, useState } from "react";
import { HOME_RETURN_RESURFACE_COOLDOWN_DAYS } from "./basicReturnEntry";
import { returnApi } from "./return.api";

export function useBasicReturnEntry() {
  const { user } = useAuthStore();
  const [candidate, setCandidate] = useState<HomeReturnCandidate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchHomeReturnCandidate = useCallback(async (excludedEntryIds: string[] = []) => {
    if (!user) {
      setCandidate(null);
      return null;
    }

    const preferences = user.returnPreferences;
    if (!preferences.returnFeaturesEnabled || !preferences.showReturnContentOnHome) {
      setCandidate(null);
      setError(null);
      return null;
    }

    setIsLoading(true);
    setError(null);

    const result = await returnApi.getHomeReturnCandidate(user.id, preferences, excludedEntryIds);
    if (!result.success) {
      setCandidate(null);
      setError(result.error || { code: "UNKNOWN_ERROR", message: "Unable to load Return content" });
      setIsLoading(false);
      return null;
    }

    setCandidate(result.data);
    setIsLoading(false);
    return result.data;
  }, [user]);

  const recordHomeReturnDisplay = useCallback(async (entryId: string) => {
    if (!user) {
      return false;
    }

    const result = await returnApi.recordHomeReturnDisplay(entryId, user.id);
    return result.success;
  }, [user]);

  const dismissHomeReturnEntry = useCallback(async (entryId: string) => {
    if (!user) {
      return false;
    }

    const dismissedUntil = new Date(
      Date.now() + HOME_RETURN_RESURFACE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
    const result = await returnApi.dismissHomeReturnEntry(entryId, user.id, dismissedUntil);
    return result.success;
  }, [user]);

  const disableHomeReturnEntry = useCallback(async (entryId: string) => {
    if (!user) {
      return false;
    }

    const result = await returnApi.setEntryResurfacing(entryId, false, user.id);
    if (result.success) {
      setCandidate((current) => (current?.entry.id === entryId ? null : current));
    }

    return result.success;
  }, [user]);

  return {
    candidate,
    isLoading,
    error,
    fetchHomeReturnCandidate,
    recordHomeReturnDisplay,
    dismissHomeReturnEntry,
    disableHomeReturnEntry,
  };
}
