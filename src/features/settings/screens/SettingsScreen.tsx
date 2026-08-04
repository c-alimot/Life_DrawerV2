import { AppBottomNav, AppPageHeader, SafeArea, Screen } from "@components/layout";
import { AppModalSheet, Button, SectionHeader } from "@components/ui";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@components/ui/icons";
import Constants from "expo-constants";
import { authApi } from "@features/auth/api/auth.api";
import { useLogout } from "@features/auth/hooks/useLogout";
import { useExcludedReturnContent } from "@features/return";
import { useAuthStore } from "@store";
import { useTheme } from "@styles/theme";
import type { ReturnNotificationFrequency, UpdateReturnPreferencesRequest } from "@types";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PAGE_BACKGROUND = "#EDEAE4";
const PAGE_SURFACE = "#FFFFFF";
const PAGE_TEXT = "#2F2924";
const PAGE_MUTED = "#6F6860";
const PAGE_PRIMARY = "#8C9A7F";
const PAGE_SECONDARY = "#556950";
const PAGE_BORDER = "#B39C87";
const PAGE_CARD_CREAM = "#FBFAF7";
const PAGE_CARD_BORDER = "#E7DED2";
const SETTINGS_PREFERENCES_KEY = "lifeDrawer.settings.preferences";

type SettingsPanel =
  | "password"
  | "notifications"
  | "return"
  | "excludedReturn"
  | "privacy"
  | "storage"
  | "help"
  | "about";

type LocalSettingsPreferences = {
  dailyReminders: boolean;
  weeklyReflection: boolean;
};

const DEFAULT_LOCAL_SETTINGS: LocalSettingsPreferences = {
  dailyReminders: true,
  weeklyReflection: true,
};

const settingsStorage =
  Platform.OS === "web"
    ? {
        getItem: async (key: string) =>
          typeof window === "undefined" ? null : window.localStorage.getItem(key),
        setItem: async (key: string, value: string) => {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, value);
          }
        },
      }
    : AsyncStorage;

export function SettingsScreen() {
  const theme = useTheme();
  const { logout, isLoading } = useLogout();
  const { user, setUser } = useAuthStore();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [activePanel, setActivePanel] = useState<SettingsPanel | null>(null);
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);
  const [isSavingReturnPreferences, setIsSavingReturnPreferences] = useState(false);
  const [returnFeedback, setReturnFeedback] = useState<string | null>(null);
  const [localSettings, setLocalSettings] =
    useState<LocalSettingsPreferences>(DEFAULT_LOCAL_SETTINGS);
  const [hasLoadedLocalSettings, setHasLoadedLocalSettings] = useState(false);
  const {
    content: excludedReturnContent,
    isLoading: isExcludedReturnContentLoading,
    error: excludedReturnContentError,
    load: loadExcludedReturnContent,
    restoreEntry: restoreExcludedEntry,
    restoreDrawer: restoreExcludedDrawer,
  } = useExcludedReturnContent();

  const displayName =
    user?.displayName?.trim() ||
    user?.email.split("@")[0]?.replace(/[._-]+/g, " ") ||
    "Life Drawer User";
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const profileImageUri = user?.avatarUrl;
  const editorImageUri = selectedPhotoUri ?? user?.avatarUrl;
  const editorAvatarLetter = (editedName.trim() || displayName).charAt(0).toUpperCase();
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const panelTitle =
    activePanel === "password"
      ? "Password & Security"
      : activePanel === "notifications"
        ? "Notifications"
        : activePanel === "return"
          ? "Returning to past Entries"
          : activePanel === "excludedReturn"
            ? "Excluded from Return"
        : activePanel === "privacy"
          ? "Privacy"
          : activePanel === "storage"
            ? "Storage"
            : activePanel === "help"
              ? "Help Center"
              : activePanel === "about"
                ? "About"
                : "";
  const modalSheetContentStyle = {
    ...styles.editModalContent,
    backgroundColor: PAGE_SURFACE,
  };

  const openEditProfile = useCallback(() => {
    setEditedName(displayName);
    setSelectedPhotoUri(null);
    setIsEditProfileOpen(true);
  }, [displayName]);

  const closeEditProfile = useCallback(() => {
    setIsEditProfileOpen(false);
    setEditedName(displayName);
    setSelectedPhotoUri(null);
  }, [displayName]);

  const handlePickProfilePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Photo access needed",
        "Please enable photo library access to choose a profile image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setSelectedPhotoUri(result.assets[0].uri);
    }
  }, []);

  const handleSaveProfile = useCallback(async () => {
    if (!user?.id) {
      Alert.alert("Unable to update profile", "Please sign in again and try once more.");
      return;
    }

    const trimmedName = editedName.trim();

    if (!trimmedName) {
      Alert.alert("Name required", "Please enter a name for your profile.");
      return;
    }

    setIsSavingProfile(true);

    try {
      const profileUpdates: { displayName: string; avatarUrl?: string } = {
        displayName: trimmedName,
      };

      if (selectedPhotoUri) {
        const uploadResult = await authApi.uploadProfilePhoto(user.id, selectedPhotoUri);

        if (!uploadResult.success || !uploadResult.data) {
          throw uploadResult.error || new Error("Failed to upload profile photo");
        }

        profileUpdates.avatarUrl = uploadResult.data;
      }

      const updateResult = await authApi.updateProfile(user.id, profileUpdates);

      if (!updateResult.success || !updateResult.data) {
        throw updateResult.error || new Error("Failed to update profile");
      }

      setUser(updateResult.data);
      setSelectedPhotoUri(null);
      setIsEditProfileOpen(false);
    } catch (error: any) {
      Alert.alert(
        "Unable to save profile",
        error?.message || "Please try again in a moment.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  }, [editedName, selectedPhotoUri, setUser, user]);

  const openPanel = useCallback((panel: SettingsPanel) => {
    setActivePanel(panel);
  }, []);

  const closePanel = useCallback(() => {
    setActivePanel(null);
  }, []);

  const handlePasswordReset = useCallback(async () => {
    if (!user?.email) {
      Alert.alert("Email unavailable", "We couldn't find a sign-in email for this account.");
      return;
    }

    setIsSendingPasswordReset(true);

    try {
      const result = await authApi.resetPassword(user.email);

      if (!result.success) {
        throw result.error || new Error("Unable to send reset email");
      }

      Alert.alert(
        "Reset email sent",
        `We sent password reset instructions to ${user.email}.`,
      );
    } catch (error: any) {
      Alert.alert(
        "Unable to send reset email",
        error?.message || "Please try again in a moment.",
      );
    } finally {
      setIsSendingPasswordReset(false);
    }
  }, [user?.email]);

  const handleUpdateReturnPreferences = useCallback(async (
    updates: UpdateReturnPreferencesRequest,
  ) => {
    if (!user) {
      return;
    }

    setIsSavingReturnPreferences(true);

    try {
      const result = await authApi.updateReturnPreferences(user.id, updates);
      if (!result.success || !result.data) {
        throw result.error || new Error("Unable to update Return preferences");
      }

      setUser(result.data);
      setReturnFeedback("Return preferences updated.");
    } catch (error) {
      Alert.alert(
        "Unable to update Return",
        error instanceof Error ? error.message : "Please try again in a moment.",
      );
    } finally {
      setIsSavingReturnPreferences(false);
    }
  }, [setUser, user]);

  const handleRestoreExcludedEntry = useCallback(async (entryId: string) => {
    const restored = await restoreExcludedEntry(entryId);
    if (!restored) {
      Alert.alert("Unable to restore Entry", "Please try again in a moment.");
      return;
    }

    setReturnFeedback("Entry restored to Return suggestions.");
  }, [restoreExcludedEntry]);

  const handleRestoreExcludedDrawer = useCallback(async (drawerId: string) => {
    const restored = await restoreExcludedDrawer(drawerId);
    if (!restored) {
      Alert.alert("Unable to restore Drawer", "Please try again in a moment.");
      return;
    }

    setReturnFeedback("Drawer restored to Return suggestions.");
  }, [restoreExcludedDrawer]);

  useEffect(() => {
    let isMounted = true;

    const loadLocalSettings = async () => {
      try {
        const storedValue = await settingsStorage.getItem(SETTINGS_PREFERENCES_KEY);

        if (!isMounted) {
          return;
        }

        if (!storedValue) {
          setLocalSettings(DEFAULT_LOCAL_SETTINGS);
          setHasLoadedLocalSettings(true);
          return;
        }

        const parsed = JSON.parse(storedValue) as Partial<LocalSettingsPreferences>;

        setLocalSettings({
          dailyReminders:
            typeof parsed.dailyReminders === "boolean"
              ? parsed.dailyReminders
              : DEFAULT_LOCAL_SETTINGS.dailyReminders,
          weeklyReflection:
            typeof parsed.weeklyReflection === "boolean"
              ? parsed.weeklyReflection
              : DEFAULT_LOCAL_SETTINGS.weeklyReflection,
        });
      } catch (error) {
        console.warn("Failed to load local settings preferences", error);
        if (isMounted) {
          setLocalSettings(DEFAULT_LOCAL_SETTINGS);
        }
      } finally {
        if (isMounted) {
          setHasLoadedLocalSettings(true);
        }
      }
    };

    loadLocalSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedLocalSettings) {
      return;
    }

    settingsStorage
      .setItem(SETTINGS_PREFERENCES_KEY, JSON.stringify(localSettings))
      .catch((error) => {
        console.warn("Failed to persist local settings preferences", error);
      });
  }, [hasLoadedLocalSettings, localSettings]);

  useEffect(() => {
    if (activePanel === "return" || activePanel === "excludedReturn") {
      void loadExcludedReturnContent();
    }
  }, [activePanel, loadExcludedReturnContent]);

  const settingsOptions = useMemo(
    () => [
      {
        title: "Personal Information",
        subtitle: "",
        onPress: openEditProfile,
      },
      {
        title: "Password & Security",
        subtitle: "",
        onPress: () => openPanel("password"),
      },
      {
        title: "Notifications",
        subtitle: "Reminders and alerts",
        onPress: () => openPanel("notifications"),
      },
      {
        title: "Return",
        subtitle: "Choose what may return across Life Drawer",
        onPress: () => openPanel("return"),
      },
      {
        title: "Privacy",
        subtitle: "Data and permissions",
        onPress: () => openPanel("privacy"),
      },
      {
        title: "Storage",
        subtitle: "Manage your data",
        onPress: () => openPanel("storage"),
      },
      {
        title: "Help Center",
        subtitle: "",
        onPress: () => openPanel("help"),
      },
      {
        title: "About",
        subtitle: `Version ${appVersion}`,
        onPress: () => openPanel("about"),
      },
    ],
    [appVersion, openEditProfile, openPanel],
  );

  const panelContent = useMemo(() => {
    const softPanelSurfaceStyle = {
      backgroundColor: "#F8F6F2",
      borderColor: PAGE_BORDER,
    } as const;

    if (!activePanel) {
      return null;
    }

    if (activePanel === "password") {
      return (
        <View style={styles.panelBody}>
          <Text style={[theme.typography.body, styles.panelCopy, { color: PAGE_MUTED }]}>
            Use your sign-in email to receive a secure password reset link.
          </Text>
          <View style={[styles.infoCard, softPanelSurfaceStyle]}>
            <Text style={[theme.typography.labelSm, styles.infoLabel, { color: PAGE_MUTED }]}>
              SIGN-IN EMAIL
            </Text>
            <Text style={[styles.infoValue, { color: PAGE_TEXT }]}>
              {user?.email || "No email available"}
            </Text>
          </View>
          <Button
            label={isSendingPasswordReset ? "Sending..." : "Send reset email"}
            onPress={handlePasswordReset}
            disabled={isSendingPasswordReset || !user?.email}
            variant="primary"
            style={[styles.panelPrimaryButton, { backgroundColor: PAGE_SECONDARY }]}
            textStyle={styles.panelPrimaryButtonText}
          />
        </View>
      );
    }

    if (activePanel === "notifications") {
      return (
        <View style={styles.panelBody}>
          <Text style={[theme.typography.body, styles.panelCopy, { color: PAGE_MUTED }]}>
            These reminders are stored on this device for now, so you can keep the experience gentle without setting up extra backend preferences.
          </Text>
          <View style={styles.preferenceList}>
            <View style={[styles.preferenceRow, softPanelSurfaceStyle]}>
              <View style={styles.preferenceTextBlock}>
                <Text style={[styles.preferenceTitle, { color: PAGE_TEXT }]}>Daily reminders</Text>
                <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>
                  Gentle prompts to capture a moment from your day.
                </Text>
              </View>
              <Switch
                value={localSettings.dailyReminders}
                onValueChange={(value) =>
                  setLocalSettings((current) => ({ ...current, dailyReminders: value }))
                }
                trackColor={{ false: "#D8D2CA", true: PAGE_PRIMARY }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={[styles.preferenceRow, softPanelSurfaceStyle]}>
              <View style={styles.preferenceTextBlock}>
                <Text style={[styles.preferenceTitle, { color: PAGE_TEXT }]}>Weekly reflection prompts</Text>
                <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>
                  A softer weekly nudge to revisit your recent entries.
                </Text>
              </View>
              <Switch
                value={localSettings.weeklyReflection}
                onValueChange={(value) =>
                  setLocalSettings((current) => ({ ...current, weeklyReflection: value }))
                }
                trackColor={{ false: "#D8D2CA", true: PAGE_PRIMARY }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
      );
    }

    if (activePanel === "return") {
      const returnPreferences = user?.returnPreferences;
      const isReturnEnabled = returnPreferences?.returnFeaturesEnabled ?? false;
      const subSettingsDisabled = isSavingReturnPreferences || !returnPreferences || !isReturnEnabled;
      const notificationOptions: {
        value: ReturnNotificationFrequency;
        label: string;
        description: string;
      }[] = [
        {
          value: "only_in_app",
          label: "Only inside the app",
          description: "Show Return content when I open Life Drawer, without sending notifications.",
        },
        {
          value: "occasionally",
          label: "Occasionally",
          description: "Send an occasional notification when an Entry may be worth returning to.",
        },
        {
          value: "weekly",
          label: "Weekly",
          description: "Send no more than one Return notification per week.",
        },
        {
          value: "never",
          label: "Never",
          description: "Do not send Return notifications.",
        },
      ];

      return (
        <View style={styles.panelBody}>
          <Text style={[theme.typography.body, styles.panelCopy, { color: PAGE_MUTED }]}>
            Choose when and where Life Drawer may bring older Entries back into your experience.
          </Text>
          {returnFeedback ? <Text accessibilityLiveRegion="polite" style={[theme.typography.bodySm, styles.returnFeedback, { color: PAGE_SECONDARY }]}>{returnFeedback}</Text> : null}
          <View style={styles.preferenceList}>
            <View style={[styles.preferenceRow, softPanelSurfaceStyle]}>
              <View style={styles.preferenceTextBlock}>
                <Text style={[styles.preferenceTitle, { color: PAGE_TEXT }]}>Enable Return features</Text>
                <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>
                  Allow Life Drawer to bring older Entries back on Home, Insights, and other Return experiences.
                </Text>
              </View>
              <Switch
                value={isReturnEnabled}
                onValueChange={(value) =>
                  void handleUpdateReturnPreferences({ returnFeaturesEnabled: value })
                }
                disabled={isSavingReturnPreferences || !returnPreferences}
                trackColor={{ false: "#D8D2CA", true: PAGE_PRIMARY }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Enable Return features"
              />
            </View>
            <View style={[styles.preferenceRow, softPanelSurfaceStyle]}>
              <View style={styles.preferenceTextBlock}>
                <Text style={[styles.preferenceTitle, { color: PAGE_TEXT }]}>Show older Entries on Home</Text>
                <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>
                  Occasionally show one older Entry below the main writing action.
                </Text>
              </View>
              <Switch
                value={returnPreferences?.showReturnContentOnHome ?? false}
                onValueChange={(value) =>
                  void handleUpdateReturnPreferences({ showReturnContentOnHome: value })
                }
                disabled={subSettingsDisabled}
                trackColor={{ false: "#D8D2CA", true: PAGE_PRIMARY }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Show older Entries on Home"
                accessibilityHint={!isReturnEnabled ? "Enable Return features to change this setting" : undefined}
              />
            </View>
            <View style={[styles.preferenceRow, softPanelSurfaceStyle]}>
              <View style={styles.preferenceTextBlock}>
                <Text style={[styles.preferenceTitle, { color: PAGE_TEXT }]}>Show Return content in Insights</Text>
                <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>
                  Include older Entries, continuing reflections, and Return pathways in Insights.
                </Text>
              </View>
              <Switch
                value={returnPreferences?.insightsReturnContentEnabled ?? false}
                onValueChange={(value) =>
                  void handleUpdateReturnPreferences({ insightsReturnContentEnabled: value })
                }
                disabled={subSettingsDisabled}
                trackColor={{ false: "#D8D2CA", true: PAGE_PRIMARY }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Show Return content in Insights"
                accessibilityHint={!isReturnEnabled ? "Enable Return features to change this setting" : undefined}
              />
            </View>
            <View style={[styles.preferenceRow, softPanelSurfaceStyle]}>
              <View style={styles.preferenceTextBlock}>
                <Text style={[styles.preferenceTitle, { color: PAGE_TEXT }]}>Show Entries from around this time</Text>
                <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>
                  Include Entries written around the same date in previous months or years.
                </Text>
              </View>
              <Switch
                value={returnPreferences?.showOnThisDay ?? false}
                onValueChange={(value) =>
                  void handleUpdateReturnPreferences({ showOnThisDay: value })
                }
                disabled={subSettingsDisabled}
                trackColor={{ false: "#D8D2CA", true: PAGE_PRIMARY }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Show Entries from around this time"
                accessibilityHint={!isReturnEnabled ? "Enable Return features to change this setting" : undefined}
              />
            </View>
          </View>
          <View style={[styles.returnSubsection, softPanelSurfaceStyle]}>
            <Text style={[styles.preferenceTitle, { color: PAGE_TEXT }]}>Return notifications</Text>
            <Text style={[theme.typography.bodySm, styles.returnSubsectionCopy, { color: PAGE_MUTED }]}>Notification delivery is not active in this version. Your preference is saved for when it becomes available, and any future notification will use generic copy without Entry details.</Text>
            <View accessibilityRole="radiogroup" style={styles.notificationOptions}>
              {notificationOptions.map((option) => {
                const isSelected = returnPreferences?.notificationFrequency === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => void handleUpdateReturnPreferences({ notificationFrequency: option.value })}
                    disabled={subSettingsDisabled}
                    style={[styles.notificationOption, isSelected && styles.notificationOptionSelected, subSettingsDisabled && styles.preferenceDisabled]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected, disabled: subSettingsDisabled }}
                    accessibilityLabel={option.label}
                    accessibilityHint={option.description}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>{isSelected ? <View style={styles.radioDot} /> : null}</View>
                    <View style={styles.preferenceTextBlock}>
                      <Text style={[theme.typography.bodySm, { color: PAGE_TEXT, fontWeight: "700" }]}>{option.label}</Text>
                      <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>{option.description}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View style={[styles.returnSubsection, softPanelSurfaceStyle]}>
            <Text style={[styles.preferenceTitle, { color: PAGE_TEXT }]}>Excluded from Return</Text>
            <Text style={[theme.typography.bodySm, styles.returnSubsectionCopy, { color: PAGE_MUTED }]}>{excludedReturnContent.entryCount} excluded {excludedReturnContent.entryCount === 1 ? "Entry" : "Entries"} · {excludedReturnContent.drawerCount} excluded {excludedReturnContent.drawerCount === 1 ? "Drawer" : "Drawers"}</Text>
            <Button label="Manage excluded content" onPress={() => openPanel("excludedReturn")} variant="outline" size="sm" disabled={isExcludedReturnContentLoading} style={styles.manageExcludedButton} />
          </View>
        </View>
      );
    }

    if (activePanel === "excludedReturn") {
      const formatDate = (value: string) => new Date(value).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      const hasExcludedContent = excludedReturnContent.entryCount > 0 || excludedReturnContent.drawerCount > 0;

      return (
        <View style={styles.panelBody}>
          <Text style={[theme.typography.body, styles.panelCopy, { color: PAGE_MUTED }]}>Entries and Drawers here are excluded only from automatic Return suggestions. They remain available through normal browsing.</Text>
          {returnFeedback ? <Text accessibilityLiveRegion="polite" style={[theme.typography.bodySm, styles.returnFeedback, { color: PAGE_SECONDARY }]}>{returnFeedback}</Text> : null}
          {isExcludedReturnContentLoading ? <View style={styles.excludedLoading}><ActivityIndicator size="small" color={PAGE_PRIMARY} /></View> : null}
          {excludedReturnContentError ? <View style={styles.excludedError}><Text accessibilityLiveRegion="polite" style={[theme.typography.bodySm, { color: "#A6544E" }]}>Excluded content could not be loaded right now.</Text><Button label="Try again" onPress={() => void loadExcludedReturnContent()} variant="outline" size="sm" /></View> : null}
          {!isExcludedReturnContentLoading && !excludedReturnContentError && !hasExcludedContent ? <View style={[styles.infoCard, softPanelSurfaceStyle]}><Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>Nothing is currently excluded from Return suggestions.</Text></View> : null}
          {excludedReturnContent.entries.length > 0 ? <View style={styles.preferenceList}>
            <Text style={[theme.typography.labelSm, { color: PAGE_MUTED }]}>ENTRIES</Text>
            {excludedReturnContent.entries.map((entry) => <View key={entry.id} style={[styles.excludedRow, softPanelSurfaceStyle]}><Text style={[theme.typography.bodySm, styles.preferenceTextBlock, { color: PAGE_TEXT }]}>Entry from {formatDate(entry.createdAt)}</Text><Button label="Restore" onPress={() => void handleRestoreExcludedEntry(entry.id)} variant="outline" size="sm" /></View>)}
          </View> : null}
          {excludedReturnContent.entryCount > excludedReturnContent.entries.length || excludedReturnContent.drawerCount > excludedReturnContent.drawers.length ? <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>Showing the most recent 50 excluded items in each group.</Text> : null}
          {excludedReturnContent.drawers.length > 0 ? <View style={styles.preferenceList}>
            <Text style={[theme.typography.labelSm, { color: PAGE_MUTED }]}>DRAWERS</Text>
            {excludedReturnContent.drawers.map((drawer) => <View key={drawer.id} style={[styles.excludedRow, softPanelSurfaceStyle]}><Text style={[theme.typography.bodySm, styles.preferenceTextBlock, { color: PAGE_TEXT }]}>{drawer.name}</Text><Button label="Restore" onPress={() => void handleRestoreExcludedDrawer(drawer.id)} variant="outline" size="sm" /></View>)}
          </View> : null}
          <Button label="Back to Return settings" onPress={() => openPanel("return")} variant="outline" size="md" style={styles.manageExcludedButton} />
        </View>
      );
    }

    if (activePanel === "privacy") {
      return (
        <View style={styles.panelBody}>
          <Text style={[theme.typography.body, styles.panelCopy, { color: PAGE_MUTED }]}>
            Your profile and journal content stay tied to your signed-in account, and private entry media is protected behind signed access.
          </Text>
          <View style={[styles.infoCard, softPanelSurfaceStyle]}>
            <Text style={[theme.typography.labelSm, styles.infoLabel, { color: PAGE_MUTED }]}>
              ACCOUNT
            </Text>
            <Text style={[styles.infoValue, { color: PAGE_TEXT }]}>
              {user?.email || "No email available"}
            </Text>
          </View>
          <Text style={[theme.typography.bodySm, styles.bulletText, { color: PAGE_MUTED }]}>
            • Profile edits sync to your account.
          </Text>
          <Text style={[theme.typography.bodySm, styles.bulletText, { color: PAGE_MUTED }]}>
            • Entry photos and audio are stored privately and shared through signed URLs.
          </Text>
          <Text style={[theme.typography.bodySm, styles.bulletText, { color: PAGE_MUTED }]}>
            • Notification choices in this version stay on this device.
          </Text>
          <Button
            label={isLoading ? "Signing out..." : "Sign out"}
            onPress={logout}
            variant="outline"
            style={[styles.panelSecondaryButton, { borderColor: PAGE_BORDER }]}
            textStyle={{ color: PAGE_SECONDARY, fontWeight: "700" }}
          />
        </View>
      );
    }

    if (activePanel === "storage") {
      return (
        <View style={styles.panelBody}>
          <Text style={[theme.typography.body, styles.panelCopy, { color: PAGE_MUTED }]}>
            Life Drawer keeps your core journal data in your account and a small set of preferences on this device to keep the app feeling personal.
          </Text>
          <View style={styles.preferenceList}>
            <View style={[styles.storageCard, softPanelSurfaceStyle]}>
              <Text style={[styles.preferenceTitle, { color: PAGE_TEXT }]}>Account data</Text>
              <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>
                Profile details, entries, tags, and drawers stay with your account.
              </Text>
            </View>
            <View style={[styles.storageCard, softPanelSurfaceStyle]}>
              <Text style={[styles.preferenceTitle, { color: PAGE_TEXT }]}>This device</Text>
              <Text style={[theme.typography.bodySm, { color: PAGE_MUTED }]}>
                Reminder choices are saved locally so they stay lightweight and fast.
              </Text>
            </View>
          </View>
        </View>
      );
    }

    if (activePanel === "help") {
      return (
        <View style={styles.panelBody}>
          <Text style={[theme.typography.body, styles.panelCopy, { color: PAGE_MUTED }]}>
            A few quick ways to get unstuck inside Life Drawer.
          </Text>
          <Text style={[theme.typography.bodySm, styles.bulletText, { color: PAGE_MUTED }]}>
            • Use Personal Information to update your name or profile photo.
          </Text>
          <Text style={[theme.typography.bodySm, styles.bulletText, { color: PAGE_MUTED }]}>
            • Use Password &amp; Security to send yourself a reset email.
          </Text>
          <Text style={[theme.typography.bodySm, styles.bulletText, { color: PAGE_MUTED }]}>
            • Use Storage and Privacy to review how your data is handled in this version.
          </Text>
          <View style={[styles.infoCard, softPanelSurfaceStyle]}>
            <Text style={[theme.typography.labelSm, styles.infoLabel, { color: PAGE_MUTED }]}>
              SUPPORT TIP
            </Text>
            <Text style={[theme.typography.bodySm, { color: PAGE_TEXT }]}>
              If something looks off after an update, signing out and back in usually refreshes your account state cleanly.
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.panelBody}>
        <Text style={[theme.typography.body, styles.panelCopy, { color: PAGE_MUTED }]}>
          Life Drawer is currently running version {appVersion}.
        </Text>
        <View style={[styles.infoCard, softPanelSurfaceStyle]}>
          <Text style={[theme.typography.labelSm, styles.infoLabel, { color: PAGE_MUTED }]}>
            VERSION
          </Text>
          <Text style={[styles.infoValue, { color: PAGE_TEXT }]}>v{appVersion}</Text>
        </View>
        <Text style={[theme.typography.bodySm, styles.bulletText, { color: PAGE_MUTED }]}>
          Built to help you capture memories, moods, and meaning across the moments that matter.
        </Text>
      </View>
    );
  }, [
    activePanel,
    appVersion,
    handlePasswordReset,
    handleRestoreExcludedDrawer,
    handleRestoreExcludedEntry,
    handleUpdateReturnPreferences,
    isLoading,
    isExcludedReturnContentLoading,
    isSendingPasswordReset,
    isSavingReturnPreferences,
    loadExcludedReturnContent,
    localSettings.dailyReminders,
    localSettings.weeklyReflection,
    excludedReturnContent.drawers,
    excludedReturnContent.drawerCount,
    excludedReturnContent.entries,
    excludedReturnContent.entryCount,
    excludedReturnContentError,
    logout,
    openPanel,
    theme.typography.body,
    theme.typography.bodySm,
    theme.typography.labelSm,
    user?.email,
    user?.returnPreferences,
    returnFeedback,
  ]);

  return (
    <SafeArea>
      <Screen style={[styles.container, { backgroundColor: PAGE_BACKGROUND }]}>
        <AppPageHeader onSearchPress={() => router.push("/search")} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.heroBlock}>
            <Text
              style={[
                styles.heroTitlePrimary,
                { color: PAGE_TEXT, fontFamily: theme.fonts.serif },
              ]}
            >
              Account &{" "}
              <Text style={[styles.heroTitleSecondary, { color: PAGE_PRIMARY }]}>
                Settings
              </Text>
            </Text>
          </View>

          <SectionHeader
            label="Account"
            textColor={PAGE_MUTED}
            dividerColor={theme.colors.accent1}
          />

          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: PAGE_CARD_CREAM,
                borderColor: PAGE_CARD_BORDER,
                shadowColor: PAGE_TEXT,
              },
            ]}
          >
            <View style={styles.profileTopRow}>
              {profileImageUri ? (
                <Image
                  source={{ uri: profileImageUri }}
                  style={[
                    styles.avatarCircle,
                    { borderColor: theme.colors.accent2 },
                  ]}
                />
              ) : (
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
              )}
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

            <TouchableOpacity
              style={[
                styles.primaryAction,
                {
                  backgroundColor: PAGE_PRIMARY,
                  shadowColor: PAGE_TEXT,
                },
              ]}
              onPress={openEditProfile}
              accessible
              accessibilityLabel="Edit profile"
            >
              <View style={styles.primaryActionIconBox}>
                <MaterialCommunityIcons
                  name="account-edit-outline"
                  size={22}
                  color="#F8F6F2"
                />
              </View>
              <View style={styles.primaryActionCopy}>
                <Text
                  style={[
                    styles.primaryActionText,
                    { fontFamily: theme.fonts.serif },
                  ]}
                >
                  Edit Profile
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <SectionHeader
            label="App Settings"
            textColor={PAGE_MUTED}
            dividerColor={theme.colors.accent1}
          />

          <View style={styles.optionList}>
            {settingsOptions.map(({ title, subtitle, onPress }) => (
              <TouchableOpacity
                key={title}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: PAGE_CARD_CREAM,
                    borderColor: PAGE_CARD_BORDER,
                    shadowColor: PAGE_TEXT,
                  },
                ]}
                onPress={onPress}
              >
                <View style={styles.optionTextBlock}>
                  <Text style={[styles.optionTitle, { color: PAGE_TEXT }]}>{title}</Text>
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
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={PAGE_MUTED}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.signOutButton,
              {
                backgroundColor: PAGE_SECONDARY,
                shadowColor: PAGE_TEXT,
              },
            ]}
            onPress={logout}
            accessible
            accessibilityLabel="Sign out"
          >
            <Text style={styles.signOutButtonText}>
              {isLoading ? "Signing out..." : "Sign Out"}
            </Text>
          </TouchableOpacity>

          <View style={styles.helperPanel}>
            <Text
              style={[
                styles.helperText,
                {
                  color: PAGE_MUTED,
                  fontFamily: theme.fonts.serif,
                },
              ]}
            >
              Keep your account details, privacy choices, and app preferences aligned with the season of life you&apos;re in.
            </Text>
          </View>
        </ScrollView>

        <AppModalSheet
          visible={isEditProfileOpen}
          onClose={closeEditProfile}
          contentStyle={modalSheetContentStyle}
        >
          <View style={styles.editModalHeader}>
            <Text
              style={[
                styles.editModalTitle,
                { color: PAGE_TEXT, fontFamily: theme.fonts.serif },
              ]}
            >
              Edit profile
            </Text>
            <TouchableOpacity
              onPress={closeEditProfile}
              style={styles.editModalCloseButton}
              accessibilityRole="button"
              accessibilityLabel="Close edit profile"
            >
              <MaterialCommunityIcons name="close" size={28} color={PAGE_BORDER} />
            </TouchableOpacity>
          </View>

          <View style={styles.editAvatarBlock}>
            {editorImageUri ? (
              <Image
                source={{ uri: editorImageUri }}
                style={[
                  styles.editAvatarCircle,
                  { borderColor: theme.colors.accent2 },
                ]}
              />
            ) : (
              <View
                style={[
                  styles.editAvatarCircle,
                  {
                    backgroundColor: theme.colors.accent1,
                    borderColor: theme.colors.accent2,
                  },
                ]}
              >
                <Text style={[styles.avatarText, { color: PAGE_SECONDARY }]}>
                  {editorAvatarLetter}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.changePhotoButton,
                {
                  backgroundColor: PAGE_PRIMARY,
                  borderColor: theme.colors.accent2,
                },
              ]}
              onPress={handlePickProfilePhoto}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
            >
              <Text style={[styles.changePhotoText, { color: PAGE_SURFACE }]}>
                Change photo
              </Text>
            </TouchableOpacity>
            <Text style={[styles.changePhotoHint, { color: PAGE_MUTED }]}>
              Choose a square photo or illustration for your profile.
            </Text>
          </View>

          <View style={styles.editFieldBlock}>
            <Text style={[theme.typography.labelSm, styles.editFieldLabel, { color: PAGE_TEXT }]}>
              DISPLAY NAME
            </Text>
            <TextInput
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Your name"
              placeholderTextColor={PAGE_MUTED}
              style={[
                styles.editFieldInput,
                {
                  backgroundColor: "#F8F6F2",
                  color: PAGE_TEXT,
                  shadowColor: PAGE_TEXT,
                },
              ]}
              accessibilityLabel="Display name input"
            />
          </View>

          <View style={styles.editActions}>
            <Button
              label="Cancel"
              onPress={closeEditProfile}
              variant="outline"
              style={[
                styles.editSecondaryButton,
                { borderRadius: 999, borderColor: PAGE_BORDER },
              ]}
              textStyle={{ color: PAGE_SECONDARY, fontWeight: "700" }}
            />
            <Button
              label={isSavingProfile ? "Saving..." : "Save"}
              onPress={handleSaveProfile}
              disabled={isSavingProfile}
              variant="primary"
              style={[
                styles.editPrimaryButton,
                { borderRadius: 999, backgroundColor: PAGE_SECONDARY },
              ]}
              textStyle={{ color: "#FFFFFF", fontWeight: "700" }}
            />
          </View>
        </AppModalSheet>

        <AppModalSheet
          visible={!!activePanel}
          onClose={closePanel}
          contentStyle={modalSheetContentStyle}
        >
          <View style={styles.editModalHeader}>
            <Text
              style={[
                styles.editModalTitle,
                { color: PAGE_TEXT, fontFamily: theme.fonts.serif },
              ]}
            >
              {panelTitle}
            </Text>
            <TouchableOpacity
              onPress={closePanel}
              style={styles.editModalCloseButton}
              accessibilityRole="button"
              accessibilityLabel={`Close ${panelTitle}`}
            >
              <MaterialCommunityIcons name="close" size={28} color={PAGE_BORDER} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.panelScrollContent}
          >
            {panelContent}
          </ScrollView>
        </AppModalSheet>

        <AppBottomNav currentRoute="/settings" />
      </Screen>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 230,
  },
  heroBlock: {
    marginTop: 6,
    marginBottom: 30,
  },
  heroTitlePrimary: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "300",
  },
  heroTitleSecondary: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "300",
    marginTop: 2,
  },
  profileCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 28,
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
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "600",
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "300",
    marginBottom: 6,
  },
  primaryAction: {
    minHeight: 70,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  primaryActionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  primaryActionCopy: {
    flex: 1,
  },
  primaryActionText: {
    color: "#F8F6F2",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "300",
  },
  editModalContent: {
    width: "100%",
    borderRadius: 28,
    padding: 24,
  },
  editModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  editModalTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "400",
  },
  editModalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  editAvatarBlock: {
    alignItems: "center",
    marginBottom: 22,
  },
  editAvatarCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
  },
  changePhotoButton: {
    minHeight: 40,
    borderRadius: 999,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: "600",
  },
  changePhotoHint: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  editFieldBlock: {
    marginBottom: 22,
  },
  editFieldLabel: {
    letterSpacing: 2.2,
    marginBottom: 8,
  },
  editFieldInput: {
    minHeight: 64,
    borderRadius: 18,
    paddingHorizontal: 18,
    fontSize: 16,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  editSecondaryButton: {
    flex: 1,
    minHeight: 54,
    backgroundColor: PAGE_SURFACE,
  },
  editPrimaryButton: {
    flex: 1,
    minHeight: 54,
  },
  optionList: {
    gap: 18,
  },
  optionCard: {
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
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
    marginBottom: 4,
  },
  signOutButton: {
    minHeight: 76,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    marginTop: 28,
  },
  signOutButtonText: {
    color: "#F8F6F2",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
  },
  helperPanel: {
    marginTop: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  helperText: {
    lineHeight: 28,
    textAlign: "center",
    fontSize: 18,
    fontStyle: "italic",
  },
  panelScrollContent: {
    paddingBottom: 4,
  },
  panelBody: {
    gap: 16,
  },
  panelCopy: {
    lineHeight: 24,
  },
  infoCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  infoLabel: {
    letterSpacing: 2,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  panelPrimaryButton: {
    minHeight: 54,
    borderRadius: 999,
  },
  panelPrimaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  panelSecondaryButton: {
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: PAGE_SURFACE,
  },
  preferenceList: {
    gap: 12,
  },
  preferenceRow: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  preferenceTextBlock: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
    marginBottom: 4,
  },
  returnFeedback: {
    lineHeight: 20,
    fontWeight: "600",
  },
  returnSubsection: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  returnSubsectionCopy: {
    lineHeight: 20,
    marginTop: 2,
  },
  notificationOptions: {
    gap: 8,
    marginTop: 14,
  },
  notificationOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E7DED2",
    borderRadius: 14,
    padding: 12,
  },
  notificationOptionSelected: {
    borderColor: PAGE_PRIMARY,
    backgroundColor: "#F1F3ED",
  },
  preferenceDisabled: {
    opacity: 0.55,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: PAGE_SECONDARY,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  radioCircleSelected: {
    borderColor: PAGE_PRIMARY,
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: PAGE_PRIMARY,
  },
  manageExcludedButton: {
    alignSelf: "flex-start",
    marginTop: 14,
  },
  excludedLoading: {
    minHeight: 48,
    justifyContent: "center",
  },
  excludedError: {
    gap: 10,
  },
  excludedRow: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  storageCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  bulletText: {
    lineHeight: 22,
  },
});
