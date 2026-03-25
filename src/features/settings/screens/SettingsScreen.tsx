import { AppSideMenu, SafeArea, Screen } from "@components/layout";
import { Button } from "@components/ui";
import { useLogout } from "@features/auth/hooks/useLogout";
import { useAuthStore } from "@store";
import { useTheme } from "@styles/theme";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PAGE_BACKGROUND = "#EDEAE4";
const PAGE_SURFACE = "#FFFFFF";
const PAGE_TEXT = "#2F2924";
const PAGE_MUTED = "#6F6860";
const PAGE_PRIMARY = "#8C9A7F";
const PAGE_SECONDARY = "#556950";
const PAGE_BORDER = "#B39C87";

export function SettingsScreen() {
  const theme = useTheme();
  const { logout, isLoading } = useLogout();
  const { user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const displayName =
    user?.displayName?.trim() ||
    user?.email.split("@")[0]?.replace(/[._-]+/g, " ") ||
    "Life Drawer User";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <SafeArea>
      <Screen style={[styles.container, { backgroundColor: PAGE_BACKGROUND }]}>
        <AppSideMenu
          visible={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          currentRoute="/settings"
        />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
            <Text style={[styles.menuIcon, { color: PAGE_TEXT }]}>
              ☰
            </Text>
          </TouchableOpacity>
          <Text
            style={[
              styles.pageTitle,
              { color: PAGE_TEXT, fontFamily: theme.fonts.serif },
            ]}
          >
            Settings
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <Text
            style={[
              theme.typography.bodySm,
              styles.sectionLabel,
              { color: PAGE_MUTED },
            ]}
          >
            Account
          </Text>

          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: PAGE_SURFACE,
                borderColor: PAGE_BORDER,
                shadowColor: PAGE_TEXT,
              },
            ]}
          >
            <View style={styles.profileTopRow}>
              <View
                style={[
                  styles.avatarCircle,
                  {
                    backgroundColor: theme.colors.accent1,
                    borderColor: theme.colors.accent2,
                  },
                ]}
              >
                <Text
                  style={[styles.avatarText, { color: PAGE_SECONDARY }]}
                >
                  {avatarLetter}
                </Text>
              </View>
              <View style={styles.profileText}>
                <Text
                  style={[
                    styles.profileName,
                    { color: PAGE_TEXT, fontFamily: theme.fonts.serif },
                  ]}
                >
                  {displayName}
                </Text>
                <Text
                  style={[
                    theme.typography.body,
                    { color: PAGE_MUTED },
                  ]}
                >
                  {user?.email || "No email available"}
                </Text>
              </View>
            </View>

            <Button
              label="Edit Profile"
              onPress={() => router.replace("/")}
              variant="secondary"
              textStyle={{ color: "#FFFFFF" }}
              style={{ backgroundColor: PAGE_PRIMARY, borderRadius: 999 }}
            />
          </View>

          <Text
            style={[
              theme.typography.bodySm,
              styles.sectionLabel,
              { color: PAGE_MUTED },
            ]}
          >
            App Settings
          </Text>

          <View style={styles.optionList}>
            {[
              ["Personal Information", ""],
              ["Password & Security", ""],
              ["Notifications", "Reminders and alerts"],
              ["Privacy", "Data and permissions"],
              ["Storage", "Manage your data"],
              ["Help Center", ""],
              ["About", "Version 1.0.0"],
            ].map(([title, subtitle]) => (
              <TouchableOpacity
                key={title}
                style={[
                  styles.optionCard,
                  {
                    borderColor: PAGE_BORDER,
                    backgroundColor: PAGE_SURFACE,
                    shadowColor: PAGE_TEXT,
                  },
                ]}
                onPress={() => router.replace("/")}
              >
                <View style={styles.optionTextBlock}>
                  <Text style={[styles.optionTitle, { color: PAGE_TEXT }]}>
                    {title}
                  </Text>
                  {subtitle ? (
                    <Text
                      style={[
                        theme.typography.body,
                        { color: PAGE_MUTED },
                      ]}
                    >
                      {subtitle}
                    </Text>
                  ) : null}
                </View>
                <Text
                  style={[
                    theme.typography.h3,
                    { color: PAGE_MUTED },
                  ]}
                >
                  ›
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            label={isLoading ? "Signing out..." : "Sign Out"}
            onPress={logout}
            variant="secondary"
            textStyle={{ color: "#FFFFFF" }}
            style={[
              styles.signOutButton,
              { backgroundColor: PAGE_SECONDARY, borderRadius: 999 },
            ]}
          />
        </View>
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
  headerSpacer: {
    width: 32,
  },
  menuIcon: {
    fontSize: 30,
    lineHeight: 30,
  },
  pageTitle: {
    fontSize: 40,
    lineHeight: 46,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 24,
  },
  sectionLabel: {
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  profileCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  profileTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
    marginBottom: 6,
  },
  optionList: {
    gap: 14,
  },
  optionCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  optionTextBlock: {
    flex: 1,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  signOutButton: {
    marginTop: 8,
  },
});
