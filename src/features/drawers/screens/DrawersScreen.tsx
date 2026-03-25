import { AppBottomNav, AppSideMenu, SafeArea, Screen } from "@components/layout";
import { useDrawers } from "@features/drawers/hooks/useDrawers";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "@styles/theme";
import type { Drawer } from "@types";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type DrawerListItem = Drawer & { entryCount: number };

const PAGE_BACKGROUND = "#EDEAE4";
const PAGE_SURFACE = "#FFFFFF";
const PAGE_TEXT = "#2F2924";
const PAGE_MUTED = "#6F6860";
const PAGE_PRIMARY = "#8C9A7F";
const PAGE_SECONDARY = "#556950";
const PAGE_BORDER = "#B39C87";

const STARTER_DRAWER: DrawerListItem = {
  id: "starter-drawer",
  userId: "starter-user",
  name: "My Life Drawer",
  entryCount: 0,
  color: "#8C9A7F",
  icon: "🗃️",
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};

export function DrawersScreen() {
  const theme = useTheme();
  const { drawers, isLoading, fetchDrawers } = useDrawers();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hasRealDrawers = drawers.length > 0;
  const displayDrawers: DrawerListItem[] = hasRealDrawers ? drawers : [STARTER_DRAWER];

  const handleCreateDrawer = useCallback(() => {
    Alert.alert(
      "Create Drawer",
      "Drawer creation will live here next. For now, you can create drawers while writing a new entry.",
    );
  }, []);

  const handleEditDrawers = useCallback(() => {
    Alert.alert(
      "Edit Drawers",
      "Drawer editing options will live here next. You can already open existing drawers from this page.",
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDrawers();
    }, [fetchDrawers]),
  );

  return (
    <SafeArea>
      <Screen style={[styles.container, { backgroundColor: PAGE_BACKGROUND }]}>
        <AppSideMenu
          visible={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          currentRoute="/drawers"
        />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
            <Text style={[styles.menuButton, { color: PAGE_TEXT }]}>
              ☰
            </Text>
          </TouchableOpacity>
          <Text
            style={[
              styles.pageTitle,
              { color: PAGE_TEXT, fontFamily: theme.fonts.serif },
            ]}
          >
            Drawers
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={PAGE_PRIMARY} />
          </View>
        ) : (
          <FlatList
            data={displayDrawers}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.content}
            ListHeaderComponent={
              <>
                <View style={styles.topRow}>
                  <TouchableOpacity
                    style={[
                      styles.primaryAction,
                      {
                        backgroundColor: PAGE_SECONDARY,
                        shadowColor: PAGE_TEXT,
                      },
                    ]}
                    onPress={handleCreateDrawer}
                  >
                    <Text style={styles.primaryActionIcon}>+</Text>
                    <Text style={styles.primaryActionText}>Create Drawer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.secondaryAction,
                      {
                        borderColor: PAGE_BORDER,
                        backgroundColor: PAGE_SURFACE,
                        shadowColor: PAGE_TEXT,
                      },
                    ]}
                    onPress={handleEditDrawers}
                  >
                    <Text
                      style={[
                        theme.typography.body,
                        { color: PAGE_TEXT, fontWeight: "700" },
                      ]}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.sectionHeader}>
                  <Text
                    style={[
                      theme.typography.bodySm,
                      {
                        color: PAGE_MUTED,
                        textTransform: "uppercase",
                        letterSpacing: 2.2,
                      },
                    ]}
                  >
                    Your Drawers
                  </Text>
                </View>
              </>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.card,
                  {
                    backgroundColor: PAGE_SURFACE,
                    borderColor: PAGE_BORDER,
                    shadowColor: PAGE_TEXT,
                  },
                ]}
                onPress={() => {
                  if (item.id === STARTER_DRAWER.id) {
                    Alert.alert(
                      "Starter Drawer",
                      "This is your built-in drawer. Once you start creating entries and custom drawers, they will appear here.",
                    );
                    return;
                  }

                  router.push(`/drawers/${item.id}`);
                }}
              >
                <View
                  style={[
                    styles.icon,
                    {
                      backgroundColor: (item.color || PAGE_PRIMARY) + "22",
                    },
                  ]}
                >
                  <Text style={styles.iconText}>{item.icon || "📁"}</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: PAGE_TEXT, fontFamily: theme.fonts.serif },
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      theme.typography.bodySm,
                      { color: PAGE_MUTED, fontWeight: "600" },
                    ]}
                  >
                    {item.entryCount} entries
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListFooterComponent={
              <Text
                style={[
                  theme.typography.body,
                  styles.emptyText,
                  { color: PAGE_MUTED },
                ]}
              >
                Create new drawers to organize your entries by theme, topic, or
                anything that matters to you.
              </Text>
            }
          />
        )}

        <AppBottomNav currentRoute="/drawers" />
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuButton: {
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "500",
  },
  pageTitle: {
    fontSize: 40,
    lineHeight: 46,
  },
  headerSpacer: {
    width: 32,
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 230,
  },
  topRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 28,
  },
  primaryAction: {
    flex: 1,
    minHeight: 96,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  primaryActionIcon: {
    color: "#F8F6F2",
    fontSize: 32,
    marginRight: 10,
    marginTop: -2,
  },
  primaryActionText: {
    color: "#F8F6F2",
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryAction: {
    flex: 1,
    minHeight: 96,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  sectionHeader: {
    marginBottom: 18,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  iconText: {
    fontSize: 22,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  emptyText: {
    marginTop: 28,
    lineHeight: 28,
    textAlign: "center",
    paddingHorizontal: 28,
  },
});
