import { AppPageHeader, SafeArea, Screen } from "@components/layout";
import { AppModalSheet, Button } from "@components/ui";
import { ConnectedReflectionsSection } from "@features/return/ConnectedReflectionsSection";
import { ENTRY_PREVIEW_PILLS, sanitizeEntryPreviewLabel } from "@constants/entryPreviewPills";
import { getEntryStatusLabel } from "@constants/entryStatus";
import { MOOD_MAP } from "@constants/moods";
import { MaterialCommunityIcons } from "@components/ui/icons";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "@styles/theme";
import type { EntryWithRelations, MoodValue } from "@types";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useEntryDetail } from "../hooks/useEntryDetail";

type TabType = "content" | "media" | "details";

export function EntryDetailScreen() {
  const theme = useTheme();
  const { entryId, skipReturnView } = useLocalSearchParams<{
    entryId: string;
    skipReturnView?: string;
  }>();
  const entryIdValue = Array.isArray(entryId) ? entryId[0] : entryId;
  const skipReturnViewValue = Array.isArray(skipReturnView) ? skipReturnView[0] : skipReturnView;
  const resolvedEntryId = entryIdValue ?? "";
  const {
    entry,
    reflectionChain,
    isReflectionChainLoading,
    reflectionChainError,
    isDeleting,
    isLoading,
    fetchEntry,
    fetchReflectionChain,
    recordEntryView,
    setSavedForLater,
    setEntryResurfacing,
    deleteEntry,
    getDirectChildReflections,
    unlinkDrawer,
    unlinkTag,
  } = useEntryDetail(resolvedEntryId);
  const { isPlaying, duration, position, play } = useAudioPlayer(
    entry?.audioUrl || null,
  );

  const [activeTab, setActiveTab] = useState<TabType>("content");
  const [isReturnActionsOpen, setIsReturnActionsOpen] = useState(false);
  const hasSkippedInitialReturnViewRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const entryLoaded = await fetchEntry();
        if (entryLoaded && skipReturnViewValue === "1" && !hasSkippedInitialReturnViewRef.current) {
          hasSkippedInitialReturnViewRef.current = true;
          return;
        }

        if (entryLoaded) {
          await recordEntryView();
        }
      })();
    }, [fetchEntry, recordEntryView, skipReturnViewValue]),
  );

  const handleEdit = useCallback(() => {
    router.push(`/edit-entry/${resolvedEntryId}`);
  }, [resolvedEntryId]);

  const handleDelete = useCallback(async () => {
    if (!entry) return;

    let hasConnectedReflections = Boolean(entry.parentEntryId) || reflectionChain.some(
      (connectedEntry) => connectedEntry.id !== resolvedEntryId,
    );

    if (!hasConnectedReflections) {
      const directChildren = await getDirectChildReflections();
      if (directChildren === null) {
        Alert.alert("Unable to check connected reflections", "Please try again before deleting this Entry.");
        return;
      }

      hasConnectedReflections = directChildren.length > 0;
    }

    const deletionMessage = hasConnectedReflections
      ? "This Entry has connected reflections. Deleting it will not delete them, but may remove part of their history."
      : "Are you sure you want to delete this entry?";

    Alert.alert("Delete Entry", deletionMessage, [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Delete",
        onPress: async () => {
          const success = await deleteEntry();
          if (success) {
            Alert.alert("Success", "Entry deleted");
            router.back();
          } else {
            Alert.alert("Error", "Failed to delete entry");
          }
        },
        style: "destructive",
      },
    ]);
  }, [deleteEntry, entry, getDirectChildReflections, reflectionChain, resolvedEntryId]);

  const handleReflectOnThis = useCallback(() => {
    if (!entry) return;

    setIsReturnActionsOpen(false);
    router.push(
      `/create-entry?parentEntryId=${encodeURIComponent(entry.id)}&parentEntryDate=${encodeURIComponent(entry.createdAt)}&reflectionType=update&isConnectedReflection=1`,
    );
  }, [entry]);

  const handleOpenConnectedEntry = useCallback((connectedEntryId: string) => {
    router.push(`/entry/${connectedEntryId}`);
  }, []);

  const handleSavedForLater = useCallback(async () => {
    if (!entry) return;

    const success = await setSavedForLater(!entry.savedForLater);
    if (!success) {
      Alert.alert("Unable to save", "Please try again in a moment.");
      return;
    }

    setIsReturnActionsOpen(false);
  }, [entry, setSavedForLater]);

  const updateEntryResurfacing = useCallback(async (enabled: boolean) => {
    const success = await setEntryResurfacing(enabled);
    if (!success) {
      Alert.alert("Unable to update this entry", "Please try again in a moment.");
      return;
    }

    setIsReturnActionsOpen(false);
  }, [setEntryResurfacing]);

  const handleEntryResurfacing = useCallback(() => {
    if (!entry) return;

    if (!entry.resurfacingEnabled) {
      void updateEntryResurfacing(true);
      return;
    }

    Alert.alert(
      "Exclude from Return suggestions?",
      "This Entry will remain available in its Drawer and in search. You can allow it in Return again at any time.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Exclude",
          style: "destructive",
          onPress: () => void updateEntryResurfacing(false),
        },
      ],
    );
  }, [entry, updateEntryResurfacing]);

  const handleRemoveDrawer = useCallback(
    (drawerId: string) => {
      Alert.alert("Remove Drawer", "Remove this entry from this drawer?", [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Remove",
          onPress: async () => {
            await unlinkDrawer(drawerId);
          },
          style: "destructive",
        },
      ]);
    },
    [unlinkDrawer],
  );

  const handleRemoveTag = useCallback(
    (tagId: string) => {
      Alert.alert("Remove Tag", "Remove this tag from the entry?", [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Remove",
          onPress: async () => {
            await unlinkTag(tagId);
          },
          style: "destructive",
        },
      ]);
    },
    [unlinkTag],
  );
  const resolveDrawerIcon = useCallback((icon: string | undefined | null) => {
    if (!icon) return "archive-outline";
    return /^[a-z0-9-]+$/i.test(icon) ? icon : "archive-outline";
  }, []);

  if (isLoading) {
    return (
      <SafeArea>
        <Screen style={styles.container}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        </Screen>
      </SafeArea>
    );
  }

  if (!entry) {
    return (
      <SafeArea>
        <Screen style={styles.container}>
          <View style={styles.loaderContainer}>
            <Text style={[theme.typography.body, { color: theme.colors.text }]}>
              Entry not found
            </Text>
          </View>
        </Screen>
      </SafeArea>
    );
  }

  const formattedDate = new Date(entry.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;
  const parentEntry: EntryWithRelations | undefined = entry.parentEntryId
    ? reflectionChain.find((connectedEntry) => connectedEntry.id === entry.parentEntryId)
    : undefined;
  const reflectionTypeLabel = entry.reflectionType
    ? `${entry.reflectionType.charAt(0).toUpperCase()}${entry.reflectionType.slice(1)}`
    : "Reflection";
  const parentEntryDateLabel = parentEntry
    ? new Date(parentEntry.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const parentEntryPreview = parentEntry?.content.trim().replace(/\s+/g, " ").slice(0, 130);

  return (
    <SafeArea>
      <Screen style={styles.container}>
        <AppPageHeader
          showBack
          showSearch={false}
          rightSlot={
            <View style={styles.headerActions}>
              <Button
                label="Edit"
                onPress={handleEdit}
                size="sm"
                accessibilityLabel="Edit entry"
              />
              <TouchableOpacity
                onPress={() => setIsReturnActionsOpen(true)}
                accessible
                accessibilityLabel="Entry options"
                style={styles.returnActionsButton}
              >
                <MaterialCommunityIcons
                  name="dots-horizontal"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => void handleDelete()}
                disabled={isDeleting}
                accessible
                accessibilityLabel="Delete entry"
                style={styles.deleteButton}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={theme.colors.error} />
                ) : (
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={22}
                    color={theme.colors.error}
                  />
                )}
              </TouchableOpacity>
            </View>
          }
        />

        {/* Tab Navigation */}
        <View
          style={[styles.tabBar, { borderBottomColor: theme.colors.border }]}
        >
          <TouchableOpacity
            onPress={() => setActiveTab("content")}
            style={[
              styles.tabButton,
              {
                borderBottomColor:
                  activeTab === "content"
                    ? theme.colors.primary
                    : "transparent",
              },
            ]}
            accessible
            accessibilityLabel="Content tab"
            accessibilityRole="tab"
          >
            <Text
              style={[
                theme.typography.body,
                {
                  color:
                    activeTab === "content"
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                  fontWeight: activeTab === "content" ? "600" : "400",
                },
              ]}
            >
              Content
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("media")}
            style={[
              styles.tabButton,
              {
                borderBottomColor:
                  activeTab === "media" ? theme.colors.primary : "transparent",
              },
            ]}
            accessible
            accessibilityLabel="Media tab"
            accessibilityRole="tab"
          >
            <Text
              style={[
                theme.typography.body,
                {
                  color:
                    activeTab === "media"
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                  fontWeight: activeTab === "media" ? "600" : "400",
                },
              ]}
            >
              Media
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("details")}
            style={[
              styles.tabButton,
              {
                borderBottomColor:
                  activeTab === "details"
                    ? theme.colors.primary
                    : "transparent",
              },
            ]}
            accessible
            accessibilityLabel="Details tab"
            accessibilityRole="tab"
          >
            <Text
              style={[
                theme.typography.body,
                {
                  color:
                    activeTab === "details"
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                  fontWeight: activeTab === "details" ? "600" : "400",
                },
              ]}
            >
              Details
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Content Tab */}
          {activeTab === "content" && (
            <View>
              {entry.parentEntryId && (
                <View style={[styles.reflectionOriginCard, { borderColor: theme.colors.border }]}>
                  <Text style={[theme.typography.labelSm, styles.sectionLabel, { color: theme.colors.textSecondary }]}>
                    Reflection from an earlier Entry
                  </Text>
                  <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: "700" }]}>
                    {reflectionTypeLabel}
                  </Text>
                  {parentEntry && parentEntryDateLabel ? (
                    <>
                      <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                        Original Entry: {parentEntryDateLabel}
                      </Text>
                      {parentEntryPreview ? (
                        <Text style={[theme.typography.bodySm, styles.parentEntryPreview, { color: theme.colors.textSecondary }]}>
                          “{parentEntryPreview}{parentEntry.content.length > parentEntryPreview.length ? "..." : ""}”
                        </Text>
                      ) : null}
                      <TouchableOpacity
                        onPress={() => router.push(`/entry/${parentEntry.id}`)}
                        accessible
                        accessibilityLabel="View original Entry"
                      >
                        <Text style={[theme.typography.bodySm, { color: theme.colors.primary, fontWeight: "700" }]}>View original Entry</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                      Earlier Entry unavailable.
                    </Text>
                  )}
                </View>
              )}

              <Text
                style={[
                  theme.typography.h2,
                  { color: theme.colors.text, marginBottom: theme.spacing.sm },
                ]}
              >
                {entry.title}
              </Text>

              <Text
                style={[
                  theme.typography.bodySm,
                  {
                    color: theme.colors.textSecondary,
                    marginBottom: theme.spacing.lg,
                  },
                ]}
              >
                {formattedDate}
              </Text>

              {entry.currentStatus ? (
                <View style={[styles.statusRow, { marginBottom: theme.spacing.lg }]}>
                  <Text style={[theme.typography.labelSm, styles.statusLabel, { color: theme.colors.textSecondary }]}>Current Status</Text>
                  <Text style={[theme.typography.body, { color: theme.colors.text }]}>
                    {getEntryStatusLabel(entry.currentStatus)}
                  </Text>
                </View>
              ) : entry.mood ? (
                <View style={[styles.moodRow, { marginBottom: theme.spacing.lg }]}>
                  <Text style={[styles.moodEmoji, { marginRight: theme.spacing.sm }]}>
                    {MOOD_MAP[entry.mood as MoodValue]?.emoji}
                  </Text>
                  <Text
                    style={[
                      theme.typography.body,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {MOOD_MAP[entry.mood as MoodValue]?.label}
                  </Text>
                </View>
              ) : null}

              <Text
                style={[
                  theme.typography.body,
                  {
                    color: theme.colors.text,
                    lineHeight: 24,
                  },
                ]}
              >
                {entry.content}
              </Text>

              <ConnectedReflectionsSection
                entries={reflectionChain}
                currentEntryId={entry.id}
                isLoading={isReflectionChainLoading}
                error={reflectionChainError}
                onRetry={() => void fetchReflectionChain()}
                onOpenEntry={handleOpenConnectedEntry}
              />
            </View>
          )}

          {/* Media Tab */}
          {activeTab === "media" && (
            <View>
              {/* Images */}
              {entry.images && entry.images.length > 0 && (
                <View style={[styles.sectionBlock, { marginBottom: theme.spacing.xl }]}>
                  <Text
                    style={[
                      theme.typography.h3,
                      {
                        color: theme.colors.text,
                        marginBottom: theme.spacing.md,
                      },
                    ]}
                  >
                    Images
                  </Text>
                  <FlatList
                    data={entry.images}
                    keyExtractor={(_, index) => `image-${index}`}
                    horizontal
                    scrollEnabled
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item: imageUri }) => (
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.detailImage}
                        accessible
                        accessibilityLabel="Entry image"
                      />
                    )}
                  />
                </View>
              )}

              {/* Audio */}
              {entry.audioUrl && (
                <View style={[styles.sectionBlock, { marginBottom: theme.spacing.xl }]}>
                  <Text
                    style={[
                      theme.typography.h3,
                      {
                        color: theme.colors.text,
                        marginBottom: theme.spacing.md,
                      },
                    ]}
                  >
                    Voice Memo
                  </Text>
                  <View
                    style={[
                      styles.audioPlayer,
                      { borderColor: theme.colors.border },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={play}
                      style={[
                        styles.playButton,
                        { backgroundColor: theme.colors.primary },
                      ]}
                      accessible
                      accessibilityLabel={
                        isPlaying ? "Pause audio" : "Play audio"
                      }
                      accessibilityRole="button"
                    >
                      <Text style={styles.playButtonText}>
                        {isPlaying ? "⏸️" : "▶️"}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.audioInfo}>
                      <View
                        style={[
                          styles.progressBar,
                          { backgroundColor: theme.colors.gray[200] },
                        ]}
                      >
                        <View
                          style={[
                            styles.progressFill,
                            {
                              backgroundColor: theme.colors.primary,
                              width: `${progressPercent}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          theme.typography.bodySm,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        {Math.floor(position / 1000)}s /{" "}
                        {Math.floor(duration / 1000)}s
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Details Tab */}
          {activeTab === "details" && (
            <View>
              {/* Location */}
              {entry.location && (
                <View style={[styles.sectionBlock, { marginBottom: theme.spacing.lg }]}>
                  <Text
                    style={[
                      theme.typography.labelSm,
                      styles.sectionLabel,
                      { color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
                    ]}
                  >
                    Location
                  </Text>
                  <Text
                    style={[
                      theme.typography.body,
                      { color: theme.colors.text },
                    ]}
                  >
                    📍 {entry.location.address || "Location unavailable"}
                  </Text>
                </View>
              )}

              {/* Drawers */}
              {entry.drawers && entry.drawers.length > 0 && (
                <View style={[styles.sectionBlock, { marginBottom: theme.spacing.lg }]}>
                  <Text
                    style={[
                      theme.typography.labelSm,
                      styles.sectionLabel,
                      { color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
                    ]}
                  >
                    Drawers
                  </Text>
                  <View style={styles.badgeRow}>
                    {entry.drawers.map((drawer) => (
                      <TouchableOpacity
                        key={drawer.id}
                        style={[
                          styles.tagBadge,
                          styles.drawerBadge,
                          {
                            backgroundColor: "#E6E2D8",
                            borderColor: "#556950",
                          },
                        ]}
                        onLongPress={() => handleRemoveDrawer(drawer.id)}
                        accessible
                        accessibilityLabel={`Drawer: ${drawer.name}`}
                        accessibilityHint="Long press to remove"
                      >
                        <MaterialCommunityIcons
                          name={resolveDrawerIcon(drawer.icon)}
                          size={14}
                          color="#556950"
                        />
                        <Text
                          style={[
                            theme.typography.bodySm,
                            { color: "#556950", fontWeight: "500" },
                          ]}
                        >
                          {sanitizeEntryPreviewLabel(drawer.name)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <View style={[styles.sectionBlock, { marginBottom: theme.spacing.lg }]}>
                  <Text
                    style={[
                      theme.typography.labelSm,
                      styles.sectionLabel,
                      { color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
                    ]}
                  >
                    Tags
                  </Text>
                  <View style={styles.badgeRow}>
                    {entry.tags.map((tag) => (
                      <TouchableOpacity
                        key={tag.id}
                        style={[
                          styles.tagBadge,
                          {
                            backgroundColor: ENTRY_PREVIEW_PILLS.tagBackground,
                            borderColor: ENTRY_PREVIEW_PILLS.tagBorder,
                          },
                        ]}
                        onLongPress={() => handleRemoveTag(tag.id)}
                        accessible
                        accessibilityLabel={`Tag: ${tag.name}`}
                        accessibilityHint="Long press to remove"
                      >
                        <Text
                          style={[
                            theme.typography.bodySm,
                            {
                              color: ENTRY_PREVIEW_PILLS.tagText,
                              fontWeight: "400",
                            },
                          ]}
                        >
                          {sanitizeEntryPreviewLabel(tag.name)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Author */}
              {entry.author && (
                <View style={[styles.sectionBlock, { marginBottom: theme.spacing.lg }]}>
                  <Text
                    style={[
                      theme.typography.labelSm,
                      styles.sectionLabel,
                      { color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
                    ]}
                  >
                    Author
                  </Text>
                  <Text
                    style={[
                      theme.typography.body,
                      { color: theme.colors.text },
                    ]}
                  >
                    {entry.author.displayName || entry.author.email}
                  </Text>
                </View>
              )}

              {/* Created/Updated */}
              <View>
                <Text
                  style={[
                    theme.typography.labelSm,
                    styles.sectionLabel,
                    { color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
                  ]}
                >
                  Dates
                </Text>
                <Text
                  style={[
                    theme.typography.bodySm,
                    {
                      color: theme.colors.textSecondary,
                      marginBottom: theme.spacing.xs,
                    },
                  ]}
                >
                  Created: {new Date(entry.createdAt).toLocaleString()}
                </Text>
                <Text
                  style={[
                    theme.typography.bodySm,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Updated: {new Date(entry.updatedAt).toLocaleString()}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        <AppModalSheet
          visible={isReturnActionsOpen}
          onClose={() => setIsReturnActionsOpen(false)}
          contentStyle={styles.returnActionsSheet}
        >
          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Entry options</Text>
          <Text style={[theme.typography.bodySm, styles.returnActionsSubtitle, { color: theme.colors.textSecondary }]}>
            Choose how you would like to return to this entry.
          </Text>
          <Button
            label="Reflect on this"
            onPress={handleReflectOnThis}
            variant="primary"
            style={styles.returnActionButton}
            accessibilityLabel="Reflect on this Entry"
          />
          <Text style={[theme.typography.bodySm, styles.returnActionsSubtitle, { color: theme.colors.textSecondary }]}>
            Write about what has changed, stayed the same, or feels different now.
          </Text>
          <Button
            label={entry.savedForLater ? "Remove from saved" : "Save for later"}
            onPress={handleSavedForLater}
            variant="primary"
            style={styles.returnActionButton}
            accessibilityLabel={entry.savedForLater ? "Remove entry from saved" : "Save entry for later"}
          />
          <Button
            label={entry.resurfacingEnabled ? "Do not bring this back automatically" : "Allow this in Return suggestions"}
            onPress={handleEntryResurfacing}
            variant="primary"
            style={styles.returnActionButton}
            accessibilityLabel={entry.resurfacingEnabled ? "Disable Return suggestions for this entry" : "Allow Return suggestions for this entry"}
          />
          <Text style={[theme.typography.bodySm, styles.returnActionsSubtitle, { color: theme.colors.textSecondary }]}>Your Entry will remain available in its Drawer and in search.</Text>
          <Button
            label="Cancel"
            onPress={() => setIsReturnActionsOpen(false)}
            variant="primary"
            style={styles.returnActionButton}
            accessibilityLabel="Close entry options"
          />
        </AppModalSheet>
      </Screen>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  returnActionsButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 3,
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  detailImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginRight: 12,
  },
  audioPlayer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  playButtonText: {
    fontSize: 24,
  },
  audioInfo: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  moodRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  moodEmoji: {
    fontSize: 24,
  },
  statusRow: {
    gap: 4,
  },
  statusLabel: {
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  sectionBlock: {
    width: "100%",
  },
  reflectionOriginCard: {
    marginBottom: 20,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  parentEntryPreview: {
    fontStyle: "italic",
    lineHeight: 20,
  },
  returnActionsSheet: {
    gap: 12,
  },
  returnActionsSubtitle: {
    marginBottom: 4,
  },
  returnActionButton: {
    width: "100%",
  },
  sectionLabel: {
    textTransform: "uppercase",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  drawerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
