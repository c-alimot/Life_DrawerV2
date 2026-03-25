import { AppSideMenu, SafeArea, Screen } from "@components/layout";
import { useTags } from "@features/tags/hooks/useTags";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "@styles/theme";
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

const EXAMPLE_TAGS = [
  "gratitude",
  "milestone",
  "reflection",
  "goals",
  "learning",
  "mindfulness",
];

const PAGE_BACKGROUND = "#EDEAE4";
const PAGE_SURFACE = "#FFFFFF";
const PAGE_TEXT = "#2F2924";
const PAGE_MUTED = "#6F6860";
const PAGE_PRIMARY = "#8C9A7F";
const PAGE_SECONDARY = "#556950";
const PAGE_BORDER = "#B39C87";

export function TagsScreen() {
  const theme = useTheme();
  const { tags, isLoading, fetchTags } = useTags();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCreateTag = useCallback(() => {
    Alert.alert(
      "Create Tag",
      "Tag creation will live here next. Right now, you can create tags while writing or editing an entry.",
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTags();
    }, [fetchTags]),
  );

  return (
    <SafeArea>
      <Screen style={[styles.container, { backgroundColor: PAGE_BACKGROUND }]}>
        <AppSideMenu
          visible={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          currentRoute="/tags"
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
            Tags
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={PAGE_PRIMARY} />
          </View>
        ) : (
          <View style={styles.content}>
            {tags.length === 0 ? (
              <>
                <View style={styles.emptyHero}>
                  <View
                    style={[
                      styles.iconFrame,
                      { backgroundColor: theme.colors.accent1 },
                    ]}
                  >
                    <Text style={styles.iconText}>🏷️</Text>
                  </View>

                  <Text
                    style={[
                      theme.typography.h2,
                      styles.heroTitle,
                      { color: PAGE_TEXT, fontFamily: theme.fonts.serif },
                    ]}
                  >
                    Organize with Tags
                  </Text>

                  <Text
                    style={[
                      theme.typography.body,
                      styles.heroDescription,
                      { color: PAGE_MUTED },
                    ]}
                  >
                    Tags help you connect entries across different drawers and
                    life phases. Add quick labels like “gratitude,” “milestone,”
                    or “reflection” to find related moments easily.
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.createButton,
                      {
                        backgroundColor: PAGE_SECONDARY,
                        shadowColor: PAGE_TEXT,
                      },
                    ]}
                    onPress={handleCreateTag}
                    accessible
                    accessibilityLabel="Create your first tag"
                  >
                    <Text style={styles.createButtonText}>
                      + Create Your First Tag
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.examplesSection}>
                  <Text
                    style={[
                      theme.typography.bodySm,
                      styles.examplesHeading,
                      { color: PAGE_MUTED },
                    ]}
                  >
                    Example Tags
                  </Text>
                  <View style={styles.examplesGrid}>
                    {EXAMPLE_TAGS.map((tag, index) => (
                      <View
                        key={tag}
                        style={[
                          styles.exampleChip,
                          {
                            borderColor: PAGE_BORDER,
                            backgroundColor: PAGE_SURFACE,
                            shadowColor: PAGE_TEXT,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.exampleDot,
                            {
                              backgroundColor:
                                index % 3 === 1
                                  ? theme.colors.accent1
                                  : theme.colors.primary,
                            },
                          ]}
                        />
                        <Text
                          style={[
                            theme.typography.body,
                            { color: PAGE_MUTED },
                          ]}
                        >
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <FlatList
                data={tags}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.tagsList}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.tagCard,
                      {
                        backgroundColor: PAGE_SURFACE,
                        borderColor: PAGE_BORDER,
                        shadowColor: PAGE_TEXT,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.tagDot,
                        { backgroundColor: item.color || theme.colors.primary },
                      ]}
                    />
                    <Text
                      style={[
                        styles.tagCardTitle,
                        { color: PAGE_TEXT, fontFamily: theme.fonts.serif },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        theme.typography.bodySm,
                        { color: PAGE_MUTED },
                      ]}
                    >
                      {item.entryCount} entries
                    </Text>
                  </View>
                )}
              />
            )}
          </View>
        )}
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
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyHero: {
    alignItems: "center",
    paddingTop: 56,
  },
  iconFrame: {
    width: 112,
    height: 112,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  iconText: {
    fontSize: 44,
  },
  heroTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  heroDescription: {
    textAlign: "center",
    lineHeight: 28,
    maxWidth: 360,
    marginBottom: 34,
  },
  createButton: {
    borderRadius: 999,
    minHeight: 64,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  createButtonText: {
    color: "#F8F6F2",
    fontSize: 18,
    fontWeight: "700",
  },
  examplesSection: {
    marginTop: 120,
  },
  examplesHeading: {
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 22,
  },
  examplesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
  },
  exampleChip: {
    minWidth: 144,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  exampleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  tagsList: {
    paddingTop: 12,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  tagCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    minHeight: 120,
    justifyContent: "center",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  tagCardTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  tagDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: 12,
  },
});
