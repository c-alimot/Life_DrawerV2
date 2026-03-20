import { useState, useCallback } from 'react';
import { useAuthStore } from '@store';

export function useEditDrawer(drawerId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuthStore();

  const updateDrawer = useCallback(
    async (data: { name: string; color: string }) => {
      if (!session?.user?.id) return false;
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/drawers/${drawerId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(data),
          }
        );
        return response.ok;
      } catch (error) {
        console.error('Error updating drawer:', error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [session, drawerId]
  );

  return { isLoading, updateDrawer };
}