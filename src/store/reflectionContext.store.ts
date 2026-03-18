import { create } from 'zustand';
import type { MoodValue } from '@types';

interface ReflectionContextStoreState {
  selectedDrawerIds: string[];
  selectedTagIds: string[];
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  moodFilter: MoodValue[];
  searchQuery: string;

  setSelectedDrawers: (drawerIds: string[]) => void;
  toggleDrawer: (drawerId: string) => void;
  setSelectedTags: (tagIds: string[]) => void;
  toggleTag: (tagId: string) => void;
  setDateRange: (startDate: string | null, endDate: string | null) => void;
  setMoodFilter: (moods: MoodValue[]) => void;
  toggleMood: (mood: MoodValue) => void;
  setSearchQuery: (query: string) => void;
  clearAllFilters: () => void;
}

export const useReflectionContextStore = create<ReflectionContextStoreState>(
  (set) => ({
    selectedDrawerIds: [],
    selectedTagIds: [],
    dateRange: {
      startDate: null,
      endDate: null,
    },
    moodFilter: [],
    searchQuery: '',

    setSelectedDrawers: (drawerIds) => set({ selectedDrawerIds: drawerIds }),

    toggleDrawer: (drawerId) =>
      set((state) => ({
        selectedDrawerIds: state.selectedDrawerIds.includes(drawerId)
          ? state.selectedDrawerIds.filter((id) => id !== drawerId)
          : [...state.selectedDrawerIds, drawerId],
      })),

    setSelectedTags: (tagIds) => set({ selectedTagIds: tagIds }),

    toggleTag: (tagId) =>
      set((state) => ({
        selectedTagIds: state.selectedTagIds.includes(tagId)
          ? state.selectedTagIds.filter((id) => id !== tagId)
          : [...state.selectedTagIds, tagId],
      })),

    setDateRange: (startDate, endDate) =>
      set({ dateRange: { startDate, endDate } }),

    setMoodFilter: (moods) => set({ moodFilter: moods }),

    toggleMood: (mood) =>
      set((state) => ({
        moodFilter: state.moodFilter.includes(mood)
          ? state.moodFilter.filter((m) => m !== mood)
          : [...state.moodFilter, mood],
      })),

    setSearchQuery: (query) => set({ searchQuery: query }),

    clearAllFilters: () =>
      set({
        selectedDrawerIds: [],
        selectedTagIds: [],
        dateRange: { startDate: null, endDate: null },
        moodFilter: [],
        searchQuery: '',
      }),
  })
);