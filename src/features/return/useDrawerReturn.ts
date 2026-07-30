import { useAuthStore } from "@store";
import type { ApiError, DrawerCommonTag, DrawerReturnCandidate, DrawerReturnOverview } from "@types";
import { useCallback, useState } from "react";
import { returnApi } from "./return.api";

export function useDrawerReturn(drawerId: string) {
  const { user } = useAuthStore();
  const [overview, setOverview] = useState<DrawerReturnOverview | null>(null);
  const [candidate, setCandidate] = useState<DrawerReturnCandidate | null>(null);
  const [commonTags, setCommonTags] = useState<DrawerCommonTag[]>([]);
  const [isOverviewLoading, setIsOverviewLoading] = useState(false);
  const [isCandidateLoading, setIsCandidateLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<ApiError | null>(null);
  const [candidateError, setCandidateError] = useState<ApiError | null>(null);

  const fetchCommonTags = useCallback(async () => {
    if (!user || !drawerId) {
      setCommonTags([]);
      return [];
    }

    const result = await returnApi.getDrawerCommonTags(drawerId);
    if (!result.success || !result.data) {
      setCommonTags([]);
      return [];
    }

    setCommonTags(result.data);
    return result.data;
  }, [drawerId, user]);

  const fetchOverview = useCallback(async () => {
    if (!user || !drawerId) {
      setOverview(null);
      return null;
    }

    setIsOverviewLoading(true);
    setOverviewError(null);
    const result = await returnApi.getDrawerReturnOverview(drawerId);

    if (!result.success || !result.data) {
      setOverview(null);
      setOverviewError(result.error || { code: "UNKNOWN_ERROR", message: "Unable to load Drawer overview" });
      setIsOverviewLoading(false);
      return null;
    }

    setOverview(result.data);
    setIsOverviewLoading(false);
    return result.data;
  }, [drawerId, user]);

  const fetchCandidate = useCallback(async (
    excludedEntryIds: string[] = [],
    shouldUpdateCandidate = true,
  ) => {
    if (!user || !drawerId) {
      if (shouldUpdateCandidate) {
        setCandidate(null);
      }
      return null;
    }

    if (shouldUpdateCandidate) {
      setIsCandidateLoading(true);
      setCandidateError(null);
    }
    const result = await returnApi.getDrawerReturnCandidate(
      drawerId,
      user.id,
      user.returnPreferences,
      excludedEntryIds,
    );

    if (!result.success) {
      if (shouldUpdateCandidate) {
        setCandidate(null);
        setCandidateError(result.error || { code: "UNKNOWN_ERROR", message: "Unable to load Drawer Return" });
        setIsCandidateLoading(false);
      }
      return null;
    }

    if (shouldUpdateCandidate) {
      setCandidate(result.data);
      setIsCandidateLoading(false);
    }
    return result.data;
  }, [drawerId, user]);

  const recordCandidateDisplay = useCallback(async (entryId: string) => {
    if (!user) {
      return false;
    }

    const result = await returnApi.recordHomeReturnDisplay(entryId, user.id);
    return result.success;
  }, [user]);

  return {
    overview,
    candidate,
    isOverviewLoading,
    isCandidateLoading,
    overviewError,
    candidateError,
    commonTags,
    fetchOverview,
    fetchCandidate,
    fetchCommonTags,
    recordCandidateDisplay,
  };
}
