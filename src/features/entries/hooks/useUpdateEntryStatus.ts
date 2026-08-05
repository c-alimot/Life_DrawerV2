import { useAuthStore } from "@store";
import { useCallback, useRef, useState } from "react";
import { entryStatusApi } from "../api/entryStatus.api";
import { normalizeStatusNote } from "../statusUpdate";
import type { ApiError, EntryStatus, EntryStatusUpdateResult } from "@types";

interface StatusUpdateInput {
  currentStatus: EntryStatus | null;
  status: EntryStatus;
  note: string;
}

export function useUpdateEntryStatus(entryId: string) {
  const { user } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const submittingRef = useRef(false);

  const updateStatus = useCallback(async (
    { currentStatus, status, note }: StatusUpdateInput,
  ): Promise<EntryStatusUpdateResult | null> => {
    if (!user || !entryId || submittingRef.current) {
      return null;
    }

    submittingRef.current = true;
    setIsSaving(true);
    setError(null);
    const normalizedNote = normalizeStatusNote(note);

    try {
      const result = currentStatus === null
        ? await entryStatusApi.setInitialEntryStatus(entryId, status)
        : await entryStatusApi.updateEntryStatus({
            entryId,
            status,
            note: normalizedNote,
          });

      if (!result.success || !result.data) {
        setError(result.error);
        return null;
      }

      return result.data;
    } finally {
      submittingRef.current = false;
      setIsSaving(false);
    }
  }, [entryId, user]);

  return { updateStatus, isSaving, error };
}
