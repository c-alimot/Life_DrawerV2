import { useState, useCallback } from 'react';
import { useAuthStore } from '@store';
import { deleteDrawer as deleteDrawerAPI } from '@services/supabase/drawers';
import type { Drawer } from '@types';

export function useDrawerDetail(drawerId: string) {
  const [drawer, setDrawer] = useState<Drawer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuthStore();

  const fetchDrawer = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      // Fetch from your API
      const response = await fetch(
        `/api/drawers/${drawerId}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );
      const data = await response.json();
      setDrawer(data);
    } catch (error) {
      console.error('Error fetching drawer:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session, drawerId]);

  const deleteDrawer = useCallback(async () => {
    if (!session?.user?.id) return false;
    try {
      await deleteDrawerAPI(drawerId, session.access_token);
      return true;
    } catch (error) {
      console.error('Error deleting drawer:', error);
      return false;
    }
  }, [session, drawerId]);

  return { drawer, isLoading, fetchDrawer, deleteDrawer };
}