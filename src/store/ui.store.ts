import { create } from 'zustand';

interface UIStoreState {
  modals: {
    createEntry: boolean;
    createDrawer: boolean;
    createTag: boolean;
    filters: boolean;
    entryOptions: boolean;
  };

  isLoadingEntries: boolean;
  isLoadingDrawers: boolean;
  isLoadingTags: boolean;
  isSyncing: boolean;

  isOnline: boolean;
  syncError: string | null;

  selectedEntryId: string | null;
  selectedDrawerId: string | null;

  openModal: (modalName: keyof UIStoreState['modals']) => void;
  closeModal: (modalName: keyof UIStoreState['modals']) => void;
  toggleModal: (modalName: keyof UIStoreState['modals']) => void;
  setLoadingEntries: (loading: boolean) => void;
  setLoadingDrawers: (loading: boolean) => void;
  setLoadingTags: (loading: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setOnlineStatus: (online: boolean) => void;
  setSyncError: (error: string | null) => void;
  setSelectedEntry: (entryId: string | null) => void;
  setSelectedDrawer: (drawerId: string | null) => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  modals: {
    createEntry: false,
    createDrawer: false,
    createTag: false,
    filters: false,
    entryOptions: false,
  },

  isLoadingEntries: false,
  isLoadingDrawers: false,
  isLoadingTags: false,
  isSyncing: false,

  isOnline: true,
  syncError: null,

  selectedEntryId: null,
  selectedDrawerId: null,

  openModal: (modalName) =>
    set((state) => ({
      modals: { ...state.modals, [modalName]: true },
    })),

  closeModal: (modalName) =>
    set((state) => ({
      modals: { ...state.modals, [modalName]: false },
    })),

  toggleModal: (modalName) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: !state.modals[modalName],
      },
    })),

  setLoadingEntries: (loading) => set({ isLoadingEntries: loading }),
  setLoadingDrawers: (loading) => set({ isLoadingDrawers: loading }),
  setLoadingTags: (loading) => set({ isLoadingTags: loading }),
  setSyncing: (syncing) => set({ isSyncing: syncing }),
  setOnlineStatus: (online) => set({ isOnline: online }),
  setSyncError: (error) => set({ syncError: error }),
  setSelectedEntry: (entryId) => set({ selectedEntryId: entryId }),
  setSelectedDrawer: (drawerId) => set({ selectedDrawerId: drawerId }),
}));