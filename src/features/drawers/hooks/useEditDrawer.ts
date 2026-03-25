import { useState, useCallback } from "react";
import { useAuthStore } from "@store";
import { drawersApi } from "../api/drawers.api";
import type { ApiError, UpdateDrawerRequest } from "@types";

export function useEditDrawer(drawerId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { user } = useAuthStore();

  const updateDrawer = useCallback(
    async (data: UpdateDrawerRequest) => {
      if (!user || !drawerId) return false;

      setIsLoading(true);
      setError(null);

      try {
        const result = await drawersApi.updateDrawer(drawerId, user.id, data);
        if (!result.success) {
          setError(
            result.error || {
              code: "UNKNOWN_ERROR",
              message: "Failed to update drawer",
            },
          );
          return false;
        }

        return true;
      } catch (error) {
        const apiError = error as ApiError;
        setError(apiError);
        console.error("Error updating drawer:", apiError);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user, drawerId],
  );

  return { isLoading, error, updateDrawer };
}
