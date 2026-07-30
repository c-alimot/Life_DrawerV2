import {
    AppPageHeader,
    AppBottomNav,
    SafeArea,
    Screen,
} from "@components/layout";
import { AppModalSheet, Button, EmptyStateCard, EntryPreviewCard, FilterPill, SectionHeader } from "@components/ui";
import {
  ENTRY_PREVIEW_PILLS,
} from "@constants/entryPreviewPills";
import { MaterialCommunityIcons } from "@components/ui/icons";
import { useFocusEffect } from "@react-navigation/native";
import { DrawerOverview, DrawerReturnSection, useDrawerReturn } from "@features/return";
import type { DrawerEntryFilter, DrawerEntrySort } from "@types";
import { Fonts, useTheme } from "@styles/theme";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal as RNModal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useDrawerDetail } from "../hooks/useDrawerDetail";
import { useDrawerEntries } from "../hooks/useDrawerEntries";
import { useEditDrawer } from "../hooks/useEditDrawer";

const PAGE_BACKGROUND = "#EDEAE4";
const PAGE_SURFACE = "#FFFFFF";
const PAGE_SOFT_SURFACE = "#F8F6F2";
const PAGE_TEXT = "#2F2924";
const PAGE_MUTED = "#6F6860";
const PAGE_MUTED_LIGHT = "#8A8178";
const PAGE_PRIMARY = "#8C9A7F";
const PAGE_SECONDARY = "#556950";
const PAGE_BORDER = "#D8CCBD";
const PAGE_CARD_SHADOW = "rgba(85, 105, 80, 0.08)";
const CANCEL_BUTTON_BG = "#EDEAE4";
const CANCEL_BUTTON_BORDER = "#DAC8B1";
const CANCEL_BUTTON_TEXT = "#2F2924";
const DEFAULT_DRAWER_ICON = "archive-outline";
const DRAWER_ICON_OPTIONS = [
  { value: "archive-outline", label: "General" },
  { value: "briefcase-outline", label: "Work" },
  { value: "book-open-variant", label: "Study" },
  { value: "heart-outline", label: "Family" },
  { value: "dumbbell", label: "Fitness" },
  { value: "airplane", label: "Travel" },
  { value: "leaf-outline", label: "Wellness" },
  { value: "palette-outline", label: "Creative" },
  { value: "music-note-outline", label: "Music" },
  { value: "food-apple-outline", label: "Food" },
  { value: "target", label: "Goals" },
  { value: "notebook-outline", label: "Journal" },
  { value: "school-outline", label: "School" },
  { value: "camera-outline", label: "Photos" },
] as const;

const DRAWER_FILTER_OPTIONS: { label: string; value: DrawerEntryFilter }[] = [
  { label: "All entries", value: "all" },
  { label: "Saved for later", value: "saved_for_later" },
  { label: "Connected reflections", value: "connected_reflections" },
  { label: "Revisited", value: "revisited" },
  { label: "Not revisited", value: "not_revisited" },
];

function parseDrawerFilter(value?: string): DrawerEntryFilter {
  const routeFilterMap: Record<string, DrawerEntryFilter> = {
    all: "all",
    saved: "saved_for_later",
    connected: "connected_reflections",
    revisited: "revisited",
    "not-revisited": "not_revisited",
  };

  return value && routeFilterMap[value] ? routeFilterMap[value] : "all";
}

function parseDrawerSort(value?: string): DrawerEntrySort {
  const supportedSorts: DrawerEntrySort[] = [
    "newest",
    "oldest",
    "least_recently_viewed",
    "most_recently_revisited",
  ];

  return supportedSorts.includes(value as DrawerEntrySort)
    ? (value as DrawerEntrySort)
    : "newest";
}

function toRouteFilter(filter: DrawerEntryFilter): string {
  const routeFilterMap: Record<DrawerEntryFilter, string> = {
    all: "all",
    saved_for_later: "saved",
    connected_reflections: "connected",
    revisited: "revisited",
    not_revisited: "not-revisited",
  };

  return routeFilterMap[filter];
}

function getSortOptions(filter: DrawerEntryFilter) {
  const options: { label: string; value: DrawerEntrySort }[] = [
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
  ];

  if (filter === "all" || filter === "not_revisited") {
    options.push({ label: "Least Recently Viewed", value: "least_recently_viewed" });
  }

  if (filter === "revisited") {
    options.push({ label: "Most Recently Revisited", value: "most_recently_revisited" });
  }

  return options;
}

function getFilterEmptyState(filter: DrawerEntryFilter, hasTagFilter: boolean) {
  if (hasTagFilter) {
    return {
      title: "No entries with this tag",
      description: "Try another tag or view all entries in this drawer.",
    };
  }

  const emptyStates: Record<Exclude<DrawerEntryFilter, "all">, { title: string; description: string }> = {
    saved_for_later: {
      title: "Nothing saved for later",
      description: "You have not saved anything from this drawer for later.",
    },
    connected_reflections: {
      title: "No continuing reflections yet",
      description: "No continuing reflections in this drawer yet.",
    },
    revisited: {
      title: "Nothing revisited yet",
      description: "You can return to any entry whenever it feels useful.",
    },
    not_revisited: {
      title: "Older entries have been revisited",
      description: "You have already returned to the older entries in this drawer.",
    },
  };

  return filter === "all"
    ? { title: "No entries yet", description: "Create your first entry in this drawer when you're ready" }
    : emptyStates[filter];
}

export function DrawerDetailScreen() {
  const theme = useTheme();
  const { drawerId, filter, sort, tagId } = useLocalSearchParams<{
    drawerId: string;
    filter?: string;
    sort?: string;
    tagId?: string;
  }>();
  const drawerIdValue = Array.isArray(drawerId) ? drawerId[0] : drawerId;
  const filterValue = Array.isArray(filter) ? filter[0] : filter;
  const sortValue = Array.isArray(sort) ? sort[0] : sort;
  const tagIdValue = Array.isArray(tagId) ? tagId[0] : tagId;
  const resolvedDrawerId = drawerIdValue ?? "";

  const {
    drawer,
    isLoading: drawerLoading,
    fetchDrawer,
    deleteDrawer,
  } = useDrawerDetail(resolvedDrawerId);
  const { isLoading: updateLoading, updateDrawer } =
    useEditDrawer(resolvedDrawerId);
  const {
    entries: drawerEntries,
    isLoading: entriesLoading,
    fetchEntries,
  } = useDrawerEntries(resolvedDrawerId);
  const {
    overview: drawerOverview,
    candidate: drawerReturnCandidate,
    isOverviewLoading,
    isCandidateLoading,
    candidateError: drawerReturnError,
    commonTags,
    fetchOverview,
    fetchCandidate,
    fetchCommonTags,
    recordCandidateDisplay,
  } = useDrawerReturn(resolvedDrawerId);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditOptionsModal, setShowEditOptionsModal] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editIcon, setEditIcon] = useState<string>(DEFAULT_DRAWER_ICON);
  const [editResurfacingEnabled, setEditResurfacingEnabled] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<DrawerEntryFilter>(() =>
    parseDrawerFilter(filterValue),
  );
  const [sortOrder, setSortOrder] = useState<DrawerEntrySort>(() => parseDrawerSort(sortValue));
  const [selectedTagId, setSelectedTagId] = useState<string | null>(tagIdValue || null);
  const [draftFilter, setDraftFilter] = useState<DrawerEntryFilter>(() =>
    parseDrawerFilter(filterValue),
  );
  const [draftSortOrder, setDraftSortOrder] = useState<DrawerEntrySort>(() =>
    parseDrawerSort(sortValue),
  );
  const [draftTagId, setDraftTagId] = useState<string | null>(tagIdValue || null);
  const [canExploreDrawerReturn, setCanExploreDrawerReturn] = useState(true);
  const displayedDrawerReturnEntryIds = useRef(new Set<string>());

  useFocusEffect(
    useCallback(() => {
      fetchDrawer();
      fetchEntries({
        filter: selectedFilter,
        sort: sortOrder,
        tagId: selectedTagId,
      });
      void fetchOverview();
      void fetchCandidate();
      void fetchCommonTags();
    }, [
      fetchCandidate,
      fetchCommonTags,
      fetchDrawer,
      fetchEntries,
      fetchOverview,
      selectedFilter,
      selectedTagId,
      sortOrder,
    ]),
  );

  useEffect(() => {
    const entryId = drawerReturnCandidate?.entry.id;
    if (!entryId || displayedDrawerReturnEntryIds.current.has(entryId)) {
      return;
    }

    displayedDrawerReturnEntryIds.current.add(entryId);
    void recordCandidateDisplay(entryId);
  }, [drawerReturnCandidate, recordCandidateDisplay]);

  useEffect(() => {
    setCanExploreDrawerReturn(true);
  }, [drawerReturnCandidate?.entry.id]);

  // Initialize edit form
  useFocusEffect(
    useCallback(() => {
      if (drawer) {
        setEditName(drawer.name);
        setEditColor(drawer.color);
        const supported = DRAWER_ICON_OPTIONS.some((option) => option.value === drawer.icon);
        setEditIcon(supported ? (drawer.icon as string) : DEFAULT_DRAWER_ICON);
        setEditResurfacingEnabled(drawer.resurfacingEnabled);
      }
    }, [drawer]),
  );

  const uniqueTags = useMemo(() => {
    const tagMap = new Map<
      string,
      { id: string; name: string; color: string | null }
    >();

    drawerEntries.forEach((entry) => {
      (entry.tags || []).forEach((tag) => {
        if (!tagMap.has(tag.id)) {
          tagMap.set(tag.id, {
            id: tag.id,
            name: tag.name,
            color: tag.color ?? null,
          });
        }
      });
    });

    commonTags.forEach((tag) => {
      if (!tagMap.has(tag.id)) {
        tagMap.set(tag.id, { id: tag.id, name: tag.name, color: tag.color ?? null });
      }
    });

    return Array.from(tagMap.values()).sort((left, right) => left.name.localeCompare(right.name));
  }, [commonTags, drawerEntries]);

  const visibleEntries = drawerEntries;
  const hasActiveFilters =
    selectedFilter !== "all" || sortOrder !== "newest" || selectedTagId !== null;

  const handleEdit = useCallback(async () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Drawer name cannot be empty");
      return;
    }

    const success = await updateDrawer({
      name: editName,
      color: editColor,
      icon: editIcon,
      resurfacingEnabled: editResurfacingEnabled,
    });

    if (success) {
      Alert.alert("Success", "Drawer updated");
      setShowEditModal(false);
      fetchDrawer();
      void fetchCandidate();
    } else {
      Alert.alert("Error", "Failed to update drawer");
    }
  }, [
    editColor,
    editIcon,
    editName,
    editResurfacingEnabled,
    fetchCandidate,
    fetchDrawer,
    updateDrawer,
  ]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Delete Drawer",
      `Are you sure you want to delete "${drawer?.name}"? Entries will not be deleted.`,
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Delete",
          onPress: async () => {
            const success = await deleteDrawer();
            if (success) {
              Alert.alert("Success", "Drawer deleted");
              router.back();
            } else {
              Alert.alert("Error", "Failed to delete drawer");
            }
          },
          style: "destructive",
        },
      ],
    );
  }, [drawer?.name, deleteDrawer]);

  const handleEntryPress = useCallback((entryId: string) => {
    router.push(`/edit-entry/${entryId}`);
  }, []);

  const handleOpenDrawerReturnEntry = useCallback((entryId: string) => {
    router.push(`/entry/${entryId}`);
  }, []);

  const handleExploreDrawerReturn = useCallback(async () => {
    if (!drawerReturnCandidate) {
      return;
    }

    const nextCandidate = await fetchCandidate([drawerReturnCandidate.entry.id], false);
    if (!nextCandidate) {
      setCanExploreDrawerReturn(false);
      return;
    }

    router.push(`/entry/${nextCandidate.entry.id}`);
  }, [drawerReturnCandidate, fetchCandidate]);

  const handleCreateEntry = useCallback(() => {
    router.push(
      `/create-entry?drawerId=${encodeURIComponent(resolvedDrawerId)}`,
    );
  }, [resolvedDrawerId]);

  const handleOpenEditOptions = useCallback(() => {
    setShowEditOptionsModal(true);
  }, []);

  const handleCloseEditOptions = useCallback(() => {
    setShowEditOptionsModal(false);
  }, []);

  const handleRenameFromEditOptions = useCallback(() => {
    setShowEditOptionsModal(false);
    setShowEditModal(true);
  }, []);

  const handleDeleteFromEditOptions = useCallback(() => {
    setShowEditOptionsModal(false);
    handleDelete();
  }, [handleDelete]);

  const handleSearch = useCallback(() => {
    router.push("/search");
  }, []);

  const openFilters = useCallback(() => {
    setDraftFilter(selectedFilter);
    setDraftSortOrder(sortOrder);
    setDraftTagId(selectedTagId);
    setIsFiltersOpen(true);
  }, [selectedFilter, selectedTagId, sortOrder]);

  const closeFilters = useCallback(() => {
    setIsFiltersOpen(false);
  }, []);

  const handleSaveFilters = useCallback(() => {
    const availableSorts = getSortOptions(draftFilter);
    const nextSortOrder = availableSorts.some((option) => option.value === draftSortOrder)
      ? draftSortOrder
      : "newest";

    setSelectedFilter(draftFilter);
    setSortOrder(nextSortOrder);
    setSelectedTagId(draftTagId);
    router.setParams({
      filter: toRouteFilter(draftFilter),
      sort: nextSortOrder,
      tagId: draftTagId || "",
    });
    setIsFiltersOpen(false);
  }, [draftFilter, draftSortOrder, draftTagId]);

  const handleClearFilters = useCallback(() => {
    setSelectedFilter("all");
    setSortOrder("newest");
    setSelectedTagId(null);
    setDraftFilter("all");
    setDraftSortOrder("newest");
    setDraftTagId(null);
    router.setParams({ filter: "all", sort: "newest", tagId: "" });
  }, []);

  const handleClearDraftFilters = useCallback(() => {
    setDraftFilter("all");
    setDraftSortOrder("newest");
    setDraftTagId(null);
  }, []);

  const handleApplyReturnFilter = useCallback((filter: DrawerEntryFilter) => {
    const nextSortOrder = getSortOptions(filter).some((option) => option.value === sortOrder)
      ? sortOrder
      : "newest";

    setSelectedFilter(filter);
    setSortOrder(nextSortOrder);
    setDraftFilter(filter);
    setDraftSortOrder(nextSortOrder);
    router.setParams({
      filter: toRouteFilter(filter),
      sort: nextSortOrder,
      tagId: selectedTagId || "",
    });
  }, [selectedTagId, sortOrder]);

  const handleSelectCommonTag = useCallback((nextTagId: string) => {
    setSelectedTagId(nextTagId);
    setDraftTagId(nextTagId);
    router.setParams({
      filter: toRouteFilter(selectedFilter),
      sort: sortOrder,
      tagId: nextTagId,
    });
  }, [selectedFilter, sortOrder]);

  const colorOptions = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
  ];
  const selectedSortLabel =
    getSortOptions(selectedFilter).find((option) => option.value === sortOrder)?.label ||
    "Newest First";
  const emptyState = getFilterEmptyState(selectedFilter, selectedTagId !== null);

  if (drawerLoading) {
    return (
      <SafeArea>
        <Screen style={[styles.container, styles.pageBackground]}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={PAGE_PRIMARY} />
          </View>
        </Screen>
      </SafeArea>
    );
  }

  if (!drawer) {
    return (
      <SafeArea>
        <Screen style={[styles.container, styles.pageBackground]}>
          <View style={styles.loaderContainer}>
            <Text style={[theme.typography.body, { color: PAGE_TEXT }]}>
              Drawer not found
            </Text>
          </View>
        </Screen>
      </SafeArea>
    );
  }

  return (
    <SafeArea>
      <Screen style={[styles.container, styles.pageBackground]}>
        <AppPageHeader showBack onSearchPress={handleSearch} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.heroBlock}>
            <Text
              style={[styles.heroTitle, { fontFamily: theme.fonts.serif }]}
            >
              <Text style={{ color: PAGE_TEXT }}>{drawer.name}</Text>{" "}
              <Text style={{ color: PAGE_PRIMARY }}>Drawer</Text>
            </Text>
          </View>

          <View style={styles.heroActions}>
            <Button
              label="Add Entry"
              onPress={handleCreateEntry}
              size="sm"
              style={styles.addEntryActionButton}
              textStyle={[theme.typography.body, styles.addEntryActionButtonText]}
              accessibilityLabel="Add entry"
            />
            <Button
              label="Edit"
              onPress={handleOpenEditOptions}
              size="sm"
              style={styles.editButton}
              textStyle={[theme.typography.body, styles.editButtonText]}
              accessibilityLabel="Edit drawer"
            />
          </View>

          <DrawerOverview
            overview={drawerOverview}
            isLoading={isOverviewLoading}
            commonTags={commonTags}
            onApplyFilter={handleApplyReturnFilter}
            onSelectTag={handleSelectCommonTag}
            onViewAllTags={openFilters}
          />

          <DrawerReturnSection
            candidate={drawerReturnCandidate}
            isLoading={isCandidateLoading}
            error={drawerReturnError}
            canExplore={canExploreDrawerReturn}
            onOpenEntry={handleOpenDrawerReturnEntry}
            onExplore={() => void handleExploreDrawerReturn()}
            onRetry={() => void fetchCandidate()}
          />

          <View style={styles.archiveHeaderRow}>
            <View style={styles.archiveHeaderContent}>
              <SectionHeader
                label="Archive"
                textColor={PAGE_MUTED}
                dividerColor={PAGE_BORDER}
              />
            </View>
            <TouchableOpacity
              onPress={openFilters}
              style={styles.archiveFilterButton}
              accessible
              accessibilityLabel="Open sort and filter options"
            >
              <MaterialCommunityIcons
                name="tune-variant"
                size={24}
                color={PAGE_PRIMARY}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.sortBar}>
            <Text style={[theme.typography.bodySm, styles.sortLabel]}>
              {selectedSortLabel}
            </Text>
            <View style={styles.metaActions}>
              {hasActiveFilters ? (
                <TouchableOpacity onPress={handleClearFilters}>
                  <Text style={[theme.typography.bodySm, styles.clearAllText]}>
                    Clear all
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {entriesLoading ? (
            <View style={styles.entriesLoadingContainer}>
              <ActivityIndicator size="small" color={PAGE_PRIMARY} />
            </View>
          ) : visibleEntries.length === 0 ? (
            <EmptyStateCard
              icon="pencil-outline"
              title={hasActiveFilters ? emptyState.title : "No entries yet"}
              description={emptyState.description}
              actionLabel={hasActiveFilters ? undefined : "Create First Entry"}
              onActionPress={hasActiveFilters ? undefined : handleCreateEntry}
              accessibilityActionLabel="Create your first entry in this drawer"
            />
          ) : (
            <View style={styles.entriesList}>
              {visibleEntries.map((item, index) => {
                const currentDate = new Date(item.createdAt).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  },
                );
                const previous = visibleEntries[index - 1];
                const previousDate = previous
                  ? new Date(previous.createdAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : null;
                const showDateHeader = currentDate !== previousDate;

                return (
                  <View key={item.id} style={styles.dateGroup}>
                    {showDateHeader ? (
                      <Text
                        style={[theme.typography.bodySm, styles.dateHeading]}
                      >
                        {currentDate}
                      </Text>
                    ) : null}

                    <EntryPreviewCard
                      entry={item}
                      onPress={() => handleEntryPress(item.id)}
                      drawerName={drawer?.name || null}
                      showMeta
                    />
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        <AppBottomNav currentRoute="/drawers" />

        <AppModalSheet
          visible={showEditOptionsModal}
          onClose={handleCloseEditOptions}
          contentStyle={styles.editOptionsModal}
        >
          <Text style={[styles.menuTitle, { fontFamily: theme.fonts.serif }]}>
            Edit Drawer
          </Text>
          <Button
            label="Rename"
            onPress={handleRenameFromEditOptions}
            variant="primary"
            style={styles.menuActionButton}
            textStyle={{ color: PAGE_SECONDARY, fontWeight: "700" }}
          />
          <Button
            label="Delete"
            onPress={handleDeleteFromEditOptions}
            variant="primary"
            style={[styles.menuActionButton, styles.menuDeleteButton]}
            textStyle={{ color: PAGE_TEXT, fontWeight: "700" }}
          />
          <Button
            label="Cancel"
            onPress={handleCloseEditOptions}
            variant="primary"
            style={styles.menuActionButton}
            textStyle={{ color: CANCEL_BUTTON_TEXT, fontWeight: "700" }}
          />
        </AppModalSheet>

        <AppModalSheet
          visible={isFiltersOpen}
          onClose={closeFilters}
          contentStyle={styles.filtersModal}
        >
          <View style={styles.filtersHeader}>
            <Text style={[styles.menuTitle, { fontFamily: theme.fonts.serif }]}>
              Sort & Filter
            </Text>
            <TouchableOpacity
              onPress={handleSaveFilters}
              accessible
              accessibilityLabel="Save filters"
            >
              <Text style={[theme.typography.body, styles.saveText]}>Save</Text>
            </TouchableOpacity>
          </View>

          <Text style={[theme.typography.bodySm, styles.menuSubtitle]}>
            Choose how you want to explore this drawer.
          </Text>

          <View style={styles.metaRow}>
            <Text style={[theme.typography.bodySm, styles.sortLabel]}>
              {visibleEntries.length}{" "}
              {visibleEntries.length === 1 ? "entry" : "entries"}
            </Text>
            <View style={styles.metaActions}>
              {hasActiveFilters ? (
                <TouchableOpacity onPress={handleClearFilters}>
                  <Text style={[theme.typography.bodySm, styles.clearAllText]}>
                    Clear all
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[theme.typography.labelSm, styles.controlsLabel]}>
              Explore
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {DRAWER_FILTER_OPTIONS.map((option) => {
                const isActive = draftFilter === option.value;
                return (
                  <FilterPill
                    key={option.value}
                    label={option.label}
                    selected={isActive}
                    onPress={() => {
                      setDraftFilter(option.value);
                      if (!getSortOptions(option.value).some((sort) => sort.value === draftSortOrder)) {
                        setDraftSortOrder("newest");
                      }
                    }}
                    accessibilityLabel={`Show ${option.label}`}
                  />
                );
              })}
            </ScrollView>

            <Text style={[theme.typography.labelSm, styles.controlsLabel]}>
              Sort
            </Text>
            <View style={styles.chipRow}>
              {getSortOptions(draftFilter).map((option) => {
                const isActive = draftSortOrder === option.value;
                return (
                  <FilterPill
                    key={option.value}
                    label={option.label}
                    selected={isActive}
                    onPress={() => setDraftSortOrder(option.value)}
                    accessibilityLabel={`Sort by ${option.label}`}
                  />
                );
              })}
            </View>

            <Text style={[theme.typography.labelSm, styles.controlsLabel]}>
              Filter by Tag
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              <FilterPill
                label="All tags"
                selected={draftTagId === null}
                onPress={() => setDraftTagId(null)}
                accessibilityLabel="All tags"
              />
              {uniqueTags.map((tag) => {
                const isActive = draftTagId === tag.id;

                return (
                  <FilterPill
                    key={tag.id}
                    label={tag.name}
                    selected={isActive}
                    onPress={() => setDraftTagId(isActive ? null : tag.id)}
                    accessibilityLabel={`Tag filter ${tag.name}`}
                  />
                );
              })}
            </ScrollView>
          </ScrollView>

          <View style={styles.filtersFooter}>
            <Button
              label="Clear All"
              onPress={handleClearDraftFilters}
              variant="primary"
              style={styles.footerButton}
              textStyle={{ color: CANCEL_BUTTON_TEXT, fontWeight: "700" }}
            />
            <Button
              label="Cancel"
              onPress={closeFilters}
              variant="primary"
              style={styles.footerButton}
              textStyle={{ color: CANCEL_BUTTON_TEXT, fontWeight: "700" }}
            />
          </View>
        </AppModalSheet>

        {/* Edit Modal */}
        <RNModal
          visible={showEditModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowEditModal(false)}
        >
          <SafeArea>
            <Screen style={[styles.modalContainer, styles.pageBackground]}>
              <View style={styles.modalHeader}>
                <Text style={[theme.typography.h2, styles.modalTitle]}>
                  Edit Drawer
                </Text>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  style={styles.headerIconButton}
                  accessible
                  accessibilityLabel="Close"
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={30}
                    color={PAGE_PRIMARY}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalContent}
              >
                <View style={{ marginBottom: theme.spacing.lg }}>
                  <Text style={[theme.typography.labelSm, styles.modalLabel]}>
                    Drawer Name
                  </Text>
                  <TextInput
                    style={[styles.input]}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Enter drawer name"
                    placeholderTextColor={PAGE_MUTED_LIGHT}
                    accessibilityLabel="Drawer name"
                  />
                </View>

                <View>
                  <Text style={[theme.typography.labelSm, styles.modalLabel]}>
                    Icon
                  </Text>
                  <View style={styles.iconPickerGrid}>
                    {DRAWER_ICON_OPTIONS.map((option) => {
                      const isActive = editIcon === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          onPress={() => setEditIcon(option.value)}
                          style={[
                            styles.iconOptionButton,
                            isActive && styles.iconOptionButtonActive,
                          ]}
                          accessible
                          accessibilityLabel={`Select ${option.label} icon`}
                          accessibilityRole="button"
                        >
                          <MaterialCommunityIcons
                            name={option.value}
                            size={20}
                            color={isActive ? PAGE_SECONDARY : PAGE_MUTED}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setEditResurfacingEnabled((enabled) => !enabled)}
                  style={styles.returnSetting}
                  accessible
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: editResurfacingEnabled }}
                  accessibilityLabel="Include this Drawer in Return suggestions"
                >
                  <View style={styles.returnSettingCopy}>
                    <Text style={[theme.typography.body, styles.returnSettingTitle]}>
                      Include this Drawer in Return suggestions
                    </Text>
                    <Text style={[theme.typography.bodySm, styles.returnSettingDescription]}>
                      Entries will still remain available in this Drawer and in search.
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.returnSettingCheckbox,
                      editResurfacingEnabled && styles.returnSettingCheckboxSelected,
                    ]}
                  >
                    {editResurfacingEnabled ? (
                      <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                    ) : null}
                  </View>
                </TouchableOpacity>

                <View>
                  <Text style={[theme.typography.labelSm, styles.modalLabel]}>
                    Color
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 12,
                      marginBottom: theme.spacing.lg,
                    }}
                  >
                    {colorOptions.map((color) => (
                      <TouchableOpacity
                        key={color}
                        onPress={() => setEditColor(color)}
                        style={[
                          styles.colorOption,
                          {
                            backgroundColor: color,
                            borderColor:
                              editColor === color ? PAGE_TEXT : "transparent",
                            borderWidth: editColor === color ? 2 : 0,
                          },
                        ]}
                        accessible
                        accessibilityLabel={`Color ${color}`}
                        accessibilityRole="button"
                      >
                        {editColor === color ? (
                          <MaterialCommunityIcons
                            name="check"
                            size={22}
                            color="#FFFFFF"
                          />
                        ) : null}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <Button
                  label={updateLoading ? "Saving..." : "Save Changes"}
                  onPress={handleEdit}
                  disabled={updateLoading}
                  style={styles.saveButton}
                  textStyle={[
                    theme.typography.body,
                    styles.createEntryButtonText,
                  ]}
                  accessibilityLabel="Save drawer changes"
                />
              </ScrollView>
            </Screen>
          </SafeArea>
        </RNModal>
      </Screen>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageBackground: {
    backgroundColor: PAGE_BACKGROUND,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  returnSetting: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    padding: 14,
    borderRadius: 14,
    backgroundColor: PAGE_SOFT_SURFACE,
  },
  returnSettingCopy: {
    flex: 1,
    gap: 4,
  },
  returnSettingTitle: {
    color: PAGE_TEXT,
    fontWeight: "600",
  },
  returnSettingDescription: {
    color: PAGE_MUTED,
    lineHeight: 19,
  },
  returnSettingCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: PAGE_BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PAGE_SURFACE,
  },
  returnSettingCheckboxSelected: {
    borderColor: PAGE_PRIMARY,
    backgroundColor: PAGE_PRIMARY,
  },
  heroBlock: {
    marginBottom: 18,
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "300",
    maxWidth: "100%",
  },
  editButton: {
    minHeight: 46,
    flex: 1,
    paddingHorizontal: 22,
    borderRadius: 999,
    backgroundColor: PAGE_SECONDARY,
  },
  editButtonText: {
    color: PAGE_SURFACE,
    fontWeight: "600",
  },
  addEntryActionButton: {
    minHeight: 46,
    flex: 1,
    paddingHorizontal: 22,
    borderRadius: 999,
    backgroundColor: PAGE_PRIMARY,
  },
  addEntryActionButtonText: {
    color: PAGE_SURFACE,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 120,
  },
  heroActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    marginBottom: 22,
  },
  createEntryButton: {
    marginTop: 22,
    marginBottom: 28,
    minHeight: 54,
    borderRadius: 999,
    backgroundColor: PAGE_PRIMARY,
    shadowColor: PAGE_CARD_SHADOW,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  createEntryButtonText: {
    color: PAGE_SURFACE,
    fontWeight: "600",
  },
  archiveHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  archiveHeaderContent: {
    flex: 1,
  },
  archiveFilterButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    marginTop: -10,
  },
  sortBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sortLabel: {
    color: PAGE_MUTED,
  },
  metaActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  clearAllText: {
    color: PAGE_SECONDARY,
  },
  entriesList: {
    paddingBottom: 10,
  },
  dateGroup: {
    marginBottom: 8,
  },
  dateHeading: {
    color: PAGE_TEXT,
    marginBottom: 12,
    marginTop: 6,
    fontWeight: "500",
  },
  entriesLoadingContainer: {
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  entryCardSurface: {
    backgroundColor: PAGE_SURFACE,
    borderColor: PAGE_BORDER,
  },
  entryCard: {
    position: "relative",
    paddingVertical: 18,
    paddingLeft: 18,
    paddingRight: 18,
    borderRadius: 22,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: PAGE_TEXT,
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  entryMore: {
    position: "absolute",
    top: 10,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  entryHeaderContent: {
    flex: 1,
    paddingRight: 34,
  },
  entryTitle: {
    color: PAGE_TEXT,
    fontFamily: Fonts.serif,
    fontWeight: "400",
  },
  entryDate: {
    color: PAGE_MUTED,
    marginTop: 4,
  },
  entryBody: {
    color: PAGE_MUTED,
    marginVertical: 12,
  },
  entryMeta: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  entryMetaText: {
    color: PAGE_PRIMARY,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: ENTRY_PREVIEW_PILLS.rowGap,
    marginTop: ENTRY_PREVIEW_PILLS.rowMarginTop,
  },
  tag: {
    paddingHorizontal: ENTRY_PREVIEW_PILLS.pillPaddingHorizontal,
    paddingVertical: ENTRY_PREVIEW_PILLS.pillPaddingVertical,
    borderRadius: ENTRY_PREVIEW_PILLS.pillRadius,
  },
  emptyCard: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 36,
    minHeight: 320,
    borderRadius: 28,
    backgroundColor: PAGE_SURFACE,
    borderWidth: 1,
    borderColor: PAGE_BORDER,
    shadowColor: PAGE_SECONDARY,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  emptyIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: PAGE_SOFT_SURFACE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    color: PAGE_TEXT,
    fontFamily: Fonts.serif,
    fontWeight: "400",
    textAlign: "center",
  },
  emptyBody: {
    color: PAGE_MUTED,
    marginTop: 12,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 22,
    minHeight: 54,
    borderRadius: 20,
    paddingHorizontal: 28,
    backgroundColor: PAGE_PRIMARY,
  },
  editOptionsModal: {
    borderRadius: 24,
    backgroundColor: PAGE_SURFACE,
  },
  menuActionButton: {
    minHeight: 52,
    borderRadius: 999,
    marginBottom: 10,
    backgroundColor: CANCEL_BUTTON_BG,
    borderColor: CANCEL_BUTTON_BORDER,
  },
  menuDeleteButton: {
    backgroundColor: PAGE_SOFT_SURFACE,
    borderColor: PAGE_BORDER,
  },
  filtersModal: {
    maxHeight: "78%",
    borderRadius: 24,
    backgroundColor: PAGE_SURFACE,
  },
  filtersHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  saveText: {
    color: PAGE_SECONDARY,
    fontWeight: "700",
  },
  menuTitle: {
    color: PAGE_TEXT,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "400",
    marginBottom: 6,
  },
  menuSubtitle: {
    color: PAGE_MUTED,
    marginBottom: 14,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  controlsLabel: {
    color: PAGE_MUTED,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    marginBottom: 10,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 8,
    marginBottom: 8,
  },
  filtersFooter: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  footerButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: CANCEL_BUTTON_BG,
    borderColor: CANCEL_BUTTON_BORDER,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  modalTitle: {
    color: PAGE_TEXT,
    fontFamily: Fonts.serif,
    fontWeight: "400",
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  modalLabel: {
    color: PAGE_MUTED,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 20,
    borderColor: PAGE_BORDER,
    backgroundColor: PAGE_SURFACE,
    color: PAGE_TEXT,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
  },
  colorOption: {
    width: "23%",
    aspectRatio: 1,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  iconPickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  iconOptionButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DAC8B1",
    backgroundColor: "#ECE6DB",
    alignItems: "center",
    justifyContent: "center",
  },
  iconOptionButtonActive: {
    borderColor: PAGE_SECONDARY,
    backgroundColor: "#E6E2D8",
  },
  saveButton: {
    marginTop: 8,
    minHeight: 54,
    borderRadius: 20,
    backgroundColor: PAGE_PRIMARY,
  },
});
