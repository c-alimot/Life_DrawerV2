import { create } from 'zustand';
import type { EntryDraft } from '@types';

interface EntryDraftStoreState {
  draft: EntryDraft | null;
  isEditing: boolean;

  setDraft: (draft: EntryDraft) => void;
  updateDraft: (partial: Partial<EntryDraft>) => void;
  addDrawerToDraft: (drawerId: string) => void;
  removeDrawerFromDraft: (drawerId: string) => void;
  addTagToDraft: (tagId: string) => void;
  removeTagFromDraft: (tagId: string) => void;
  clearDraft: () => void;
  startEditing: (entryId: string) => void;
  stopEditing: () => void;
}

export const useEntryDraftStore = create<EntryDraftStoreState>((set) => ({
  draft: null,
  isEditing: false,

  setDraft: (draft) => set({ draft }),

  updateDraft: (partial) =>
    set((state) => ({
      draft: state.draft ? { ...state.draft, ...partial } : null,
    })),

  addDrawerToDraft: (drawerId) =>
    set((state) => {
      if (!state.draft) return state;
      if (state.draft.selectedDrawerIds.includes(drawerId)) return state;
      return {
        draft: {
          ...state.draft,
          selectedDrawerIds: [...state.draft.selectedDrawerIds, drawerId],
        },
      };
    }),

  removeDrawerFromDraft: (drawerId) =>
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          selectedDrawerIds: state.draft.selectedDrawerIds.filter(
            (id) => id !== drawerId
          ),
        },
      };
    }),

  addTagToDraft: (tagId) =>
    set((state) => {
      if (!state.draft) return state;
      if (state.draft.selectedTagIds.includes(tagId)) return state;
      return {
        draft: {
          ...state.draft,
          selectedTagIds: [...state.draft.selectedTagIds, tagId],
        },
      };
    }),

  removeTagFromDraft: (tagId) =>
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          selectedTagIds: state.draft.selectedTagIds.filter(
            (id) => id !== tagId
          ),
        },
      };
    }),

  clearDraft: () =>
    set({
      draft: null,
      isEditing: false,
    }),

  startEditing: (entryId) =>
    set({
      isEditing: true,
    }),

  stopEditing: () =>
    set({
      isEditing: false,
    }),
}));