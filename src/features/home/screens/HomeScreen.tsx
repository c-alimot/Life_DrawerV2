import { AppBottomNav, AppSideMenu, SafeArea, Screen } from "@components/layout";
import { Button } from "@components/ui";
import { useDrawers } from "@features/drawers/hooks/useDrawers";
import { useEntries } from "@features/entries/hooks/useEntries";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "@store";
import { useTheme } from "@styles/theme";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLifePhase } from "../hooks/useLifePhase";

interface GroupedEntries {
  [date: string]: any[];
}

const HOME_BACKGROUND = "#EDEAE4";
const HOME_TEXT = "#2F2924";
const HOME_MUTED = "#6F6860";
const HOME_PRIMARY = "#8C9A7F";
const HOME_SECONDARY = "#556950";
const HOME_SURFACE = "#FFFFFF";
const HOME_ACCENT = "#B39C87";

export function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const {
    entries,
    isLoading: entriesLoading,
    fetchRecentEntries,
  } = useEntries();
  const { drawers, isLoading: drawersLoading, fetchDrawers } = useDrawers();
  const {
    activePhase,
    isLoading: phaseLoading,
    fetchActivePhase,
  } = useLifePhase();

  const [groupedEntries, setGroupedEntries] = useState<GroupedEntries>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch data on screen focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchActivePhase();
        fetchRecentEntries();
        fetchDrawers();
      }
    }, [user, fetchActivePhase, fetchRecentEntries, fetchDrawers]),
  );

  // Group entries by date
  useEffect(() => {
    const grouped: GroupedEntries = {};
    entries.forEach((entry) => {
      const date = new Date(entry.createdAt).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(entry);
    });
    setGroupedEntries(grouped);
  }, [entries]);

  const handleNewEntry = useCallback(() => {
    router.push("/create-entry");
  }, []);

  const handleSearch = useCallback(() => {
    router.push("/search");
  }, []);

  const handleSetLifePhase = useCallback(() => {
    router.push("/life-phases");
  }, []);

  const handleCreateFirstEntry = useCallback(() => {
    router.push("/create-entry");
  }, []);

  const handleEntryPress = useCallback((entryId: string) => {
    router.push(`/entry/${entryId}`);
  }, []);

  const handleDrawerPress = useCallback((drawerId: string) => {
    router.push(`/drawers/${drawerId}`);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleOpenMenu = useCallback(() => {
    setIsMenuOpen(true);
  }, []);

  const isLoading = entriesLoading || drawersLoading || phaseLoading;

  return (
    <SafeArea>
      <Screen style={[styles.container, { backgroundColor: HOME_BACKGROUND }]}>
        <AppSideMenu visible={isMenuOpen} onClose={closeMenu} currentRoute="/" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleOpenMenu}
            accessible
            accessibilityLabel="Open menu"
            accessibilityRole="button"
          >
            <Text style={[styles.menuButton, { color: HOME_TEXT }]}>
              ☰
            </Text>
          </TouchableOpacity>
          <Text
            style={[
              styles.headerTitle,
              { color: HOME_TEXT, fontFamily: theme.fonts.serif },
            ]}
          >
            Home
          </Text>
          <TouchableOpacity
            onPress={handleSetLifePhase}
            accessible
            accessibilityLabel={
              activePhase
                ? `Current life phase: ${activePhase.name}`
                : "Set life phase"
            }
            accessibilityHint="Tap to set or change your current life phase"
          >
            <Text
              style={[
                theme.typography.bodySm,
                {
                  color: HOME_MUTED,
                  fontWeight: "600",
                  textAlign: "right",
                },
              ]}
            >
              {activePhase ? activePhase.name : "Set Life Phase"}
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={HOME_PRIMARY} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.newEntryButton,
                  {
                    backgroundColor: HOME_SECONDARY,
                    shadowColor: HOME_TEXT,
                  },
                ]}
                onPress={handleNewEntry}
                accessible
                accessibilityLabel="Create new entry"
                accessibilityHint="Open entry creation screen"
              >
                <Text
                  style={[
                    theme.typography.h3,
                    {
                      color: HOME_SURFACE,
                      marginRight: theme.spacing.sm,
                    },
                  ]}
                >
                  +
                </Text>
                <Text
                  style={[
                    theme.typography.body,
                    {
                      color: HOME_SURFACE,
                      fontWeight: "700",
                    },
                  ]}
                >
                  New Entry
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.searchButton,
                  {
                    backgroundColor: HOME_SURFACE,
                    borderColor: HOME_ACCENT,
                    shadowColor: HOME_TEXT,
                  },
                ]}
                onPress={handleSearch}
                accessible
                accessibilityLabel="Search entries"
                accessibilityHint="Open search and filter screen"
              >
                <Text
                  style={[
                    theme.typography.h3,
                    {
                      color: HOME_PRIMARY,
                      marginRight: theme.spacing.sm,
                    },
                  ]}
                >
                  🔍
                </Text>
                <Text
                  style={[
                    theme.typography.body,
                    {
                      color: HOME_TEXT,
                      fontWeight: "700",
                    },
                  ]}
                >
                  Search
                </Text>
              </TouchableOpacity>
            </View>

            {/* Recent Entries Section */}
            <View style={styles.section}>
              <Text
                style={[
                  theme.typography.labelSm,
                  {
                    color: HOME_MUTED,
                    marginBottom: theme.spacing.md,
                    textTransform: "uppercase",
                    letterSpacing: 2.2,
                  },
                ]}
              >
                Recent Entries
              </Text>

              {entries.length === 0 ? (
                // Empty State
                <View
                  style={[
                    styles.emptyState,
                    {
                      backgroundColor: HOME_SURFACE,
                      shadowColor: HOME_TEXT,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.emptyIcon,
                      {
                        backgroundColor: theme.colors.accent1 + "55",
                      },
                    ]}
                  >
                    <Text style={styles.emptyIconText}>✏️</Text>
                  </View>
                  <Text
                    style={[
                      styles.emptyTitle,
                      {
                        color: HOME_TEXT,
                        fontFamily: theme.fonts.serif,
                        marginBottom: theme.spacing.md,
                      },
                    ]}
                  >
                    No entries yet
                  </Text>
                  <Text
                    style={[
                      theme.typography.body,
                      {
                        color: HOME_MUTED,
                        textAlign: "center",
                        marginBottom: theme.spacing.lg,
                        lineHeight: 28,
                      },
                    ]}
                  >
                    Your journey starts here. Capture your first moment whenever
                    you&apos;re ready.
                  </Text>
                  <Button
                    label="+ Create First Entry"
                    onPress={handleCreateFirstEntry}
                    textStyle={{ color: "#FFFFFF" }}
                    style={[
                      styles.inlineCta,
                      { backgroundColor: HOME_PRIMARY },
                    ]}
                    accessibilityLabel="Create first entry button"
                  />
                </View>
              ) : (
                // Entries List
                <View>
                  {Object.entries(groupedEntries).map(([date, dateEntries]) => (
                    <View key={date} style={styles.dateGroup}>
                      <Text
                        style={[
                          theme.typography.bodySm,
                          {
                            color: theme.colors.textSecondary,
                            marginBottom: theme.spacing.md,
                            fontWeight: "500",
                          },
                        ]}
                      >
                        {date}
                      </Text>
                      {(dateEntries as any[]).map((entry) => (
                        <TouchableOpacity
                          key={entry.id}
                          style={[
                            styles.entryCard,
                            {
                              backgroundColor: HOME_SURFACE,
                              shadowColor: HOME_TEXT,
                            },
                          ]}
                          onPress={() => handleEntryPress(entry.id)}
                          accessible
                          accessibilityLabel={`Entry: ${entry.title || "Untitled"}`}
                          accessibilityHint={`Created on ${new Date(entry.createdAt).toLocaleDateString()}`}
                        >
                          <View style={styles.entryHeader}>
                            <Text
                              style={[
                                theme.typography.h3,
                                {
                                  color: HOME_TEXT,
                                  flex: 1,
                                  fontFamily: theme.fonts.serif,
                                },
                              ]}
                              numberOfLines={1}
                            >
                              {entry.title || "Untitled Entry"}
                            </Text>
                            {entry.mood && (
                              <Text
                                style={[theme.typography.body]}
                                accessible
                                accessibilityLabel={`Mood: ${entry.mood}`}
                              >
                                {entry.mood}
                              </Text>
                            )}
                          </View>
                          <Text
                            style={[
                              theme.typography.bodySm,
                              {
                                color: HOME_MUTED,
                              },
                            ]}
                            numberOfLines={2}
                          >
                            {entry.content}
                          </Text>
                          {entry.drawers && entry.drawers.length > 0 && (
                            <View style={styles.entryTags}>
                              {entry.drawers.map((drawer: any) => (
                                <View
                                  key={drawer.id}
                                  style={[
                                    styles.tag,
                                    {
                                      backgroundColor: drawer.color + "20",
                                    },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      theme.typography.labelXs,
                                      { color: drawer.color },
                                    ]}
                                  >
                                    {drawer.name}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Recently Opened Drawers Section */}
            <View style={styles.section}>
              <Text
                  style={[
                    theme.typography.labelSm,
                  {
                    color: HOME_MUTED,
                    marginBottom: theme.spacing.md,
                    textTransform: "uppercase",
                    letterSpacing: 2.2,
                  },
                ]}
              >
                Recently Opened Drawers
              </Text>

              {drawers.length === 0 ? (
                <View
                  style={[
                    styles.infoBox,
                    {
                      backgroundColor: HOME_SURFACE,
                      shadowColor: HOME_TEXT,
                    },
                  ]}
                >
                  <Text
                    style={[
                      theme.typography.bodySm,
                      { color: HOME_MUTED },
                    ]}
                  >
                    You can create custom drawers anytime to organize your
                    entries by theme or topic
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={drawers.slice(0, 5)}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  renderItem={({ item: drawer }) => (
                    <TouchableOpacity
                      style={[
                        styles.drawerCard,
                        {
                          backgroundColor: HOME_SURFACE,
                          shadowColor: HOME_TEXT,
                        },
                      ]}
                      onPress={() => handleDrawerPress(drawer.id)}
                      accessible
                      accessibilityLabel={`Drawer: ${drawer.name}`}
                      accessibilityHint={`${drawer.entryCount} entries`}
                    >
                      <View
                        style={[
                          styles.drawerIcon,
                          {
                            backgroundColor: drawer.color || HOME_PRIMARY,
                          },
                        ]}
                      >
                        <Text style={styles.drawerIconText}>
                          {drawer.icon || "📦"}
                        </Text>
                      </View>
                      <View style={styles.drawerInfo}>
                        <Text
                          style={[
                            styles.drawerTitle,
                            {
                              color: HOME_TEXT,
                              fontFamily: theme.fonts.serif,
                            },
                          ]}
                        >
                          {drawer.name}
                        </Text>
                        <Text
                          style={[
                            theme.typography.bodySm,
                            { color: HOME_MUTED },
                          ]}
                        >
                          {drawer.entryCount} entries
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              )}

              {drawers.length === 0 && (
                <View
                  style={[
                    styles.infoBox,
                    {
                      backgroundColor: HOME_SURFACE,
                      shadowColor: HOME_TEXT,
                    },
                  ]}
                >
                  <Text
                    style={[
                      theme.typography.bodySm,
                      { color: HOME_MUTED },
                    ]}
                  >
                    You can create custom drawers anytime to organize your
                    entries by theme or topic
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}

        <AppBottomNav currentRoute="/" />
      </Screen>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  menuButton: {
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "500",
    minWidth: 36,
  },
  headerTitle: {
    fontSize: 42,
    lineHeight: 48,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 230,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 999,
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  newEntryButton: {},
  searchButton: {
    borderWidth: 1.5,
  },
  section: {
    marginBottom: 32,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyIconText: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  inlineCta: {
    minHeight: 64,
    borderRadius: 999,
    paddingHorizontal: 24,
  },
  dateGroup: {
    marginBottom: 20,
  },
  entryCard: {
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 22,
    marginBottom: 14,
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  entryTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  drawerCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 22,
    marginBottom: 14,
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  drawerIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  drawerIconText: {
    fontSize: 24,
  },
  drawerInfo: {
    flex: 1,
  },
  drawerTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  infoBox: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 20,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
});
