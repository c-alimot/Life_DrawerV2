import { SafeArea, Screen } from "@components/layout";
import {
  Button,
  EntryImageStrip,
  EntryOptionsCarousel,
  type EntryOptionsCarouselButton,
  type EntryOptionsCarouselHandle,
  EntryStatusPickerModal,
  AppModalSheet,
  EntrySelectionModal,
} from "@components/ui";
import { ENTRY_PREVIEW_PILLS, sanitizeEntryPreviewLabel } from "@constants/entryPreviewPills";
import { getEntryStatusLabel } from "@constants/entryStatus";
import { useCreateDrawer } from "@features/drawers/hooks/useCreateDrawer";
import { useDeleteDrawer } from "@features/drawers/hooks/useDeleteDrawer";
import { useDrawers } from "@features/drawers/hooks/useDrawers";
import { useUpdateDrawer } from "@features/drawers/hooks/useUpdateDrawer";
import { useCreateTag } from "@features/tags/hooks/useCreateTag";
import { useDeleteTag } from "@features/tags/hooks/useDeleteTag";
import { useTags } from "@features/tags/hooks/useTags";
import { useUpdateTag } from "@features/tags/hooks/useUpdateTag";
import { zodResolver } from "@hookform/resolvers/zod";
import { MaterialCommunityIcons } from "@components/ui/icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@styles/theme";
import { entriesApi } from "../api/entries.api";
import { useAuthStore } from "@store";
import type { EntryStatus, EntryWithRelations, ReflectionType } from "@types";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";
import { useCreateEntryWithMedia } from "../hooks/useCreateEntryWithMedia";
import { validateEntryRequirements } from "../entryRequirements";

const entrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

type EntryFormData = z.infer<typeof entrySchema>;

const MAX_IMAGES = 10;
const ENTRY_BACKGROUND = "#EDEAE4";
const ENTRY_SURFACE = "#FFFFFF";
const ENTRY_TEXT = "#2F2924";
const ENTRY_MUTED = "#6F6860";
const ENTRY_PRIMARY = "#8C9A7F";
const ENTRY_SECONDARY = "#556950";
const ENTRY_ACCENT = "#DAC8B1";
const ENTRY_DANGER_DARK = "#8B2D2A";
const ENTRY_DANGER = "#A6544E";
const ENTRY_CANCEL_BG = "#E3E1DC";
const ENTRY_CANCEL_BORDER = "#C9C4BB";
const ENTRY_CANCEL_TEXT = "#5F6368";
const ENTRY_PLACEHOLDER = "#8A8178";
const ENTRY_TEXTBOX_BG = "#F8F6F2";

const REFLECTION_TYPE_OPTIONS: {
  value: ReflectionType;
  label: string;
  description: string;
}[] = [
  { value: "update", label: "Update", description: "Share what happened or changed afterward." },
  { value: "response", label: "Response", description: "Respond to what you previously thought or felt." },
  { value: "continuation", label: "Continuation", description: "Continue the same thought or story." },
];

const REFLECTION_PROMPTS = [
  "What has changed since then?",
  "Does this still feel true?",
  "What do you notice now?",
  "What happened after this?",
  "What would you tell your past self?",
  "Is there anything you understand differently now?",
] as const;

interface SelectedMedia {
  imageUris: string[];
  audioUri: string | null;
  location: { latitude: number; longitude: number; address?: string } | null;
}

function formatLocationLabelFromPlacemark(
  placemark: Location.LocationGeocodedAddress
): string {
  const locality =
    placemark.city ||
    placemark.district ||
    placemark.subregion ||
    placemark.name ||
    placemark.street;
  const area = placemark.region || placemark.country;
  return [locality, area].filter(Boolean).join(", ");
}

function formatLocationLabelFromNominatim(address?: Record<string, unknown>): string {
  if (!address) {
    return "";
  }

  const rawLocality = [
    address.city,
    address.town,
    address.village,
    address.municipality,
    address.county,
    address.suburb,
    address.hamlet,
  ].find((value) => typeof value === "string" && value.length > 0) as
    | string
    | undefined;

  const rawArea = [
    address.state,
    address.province,
    address.region,
    address.country,
  ].find((value) => typeof value === "string" && value.length > 0) as
    | string
    | undefined;

  return [rawLocality, rawArea].filter(Boolean).join(", ");
}

async function reverseGeocodeWithNominatim(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;
    const response = await fetch(url);
    if (!response.ok) {
      return "";
    }

    const json = (await response.json()) as { address?: Record<string, unknown> };
    return formatLocationLabelFromNominatim(json.address);
  } catch {
    return "";
  }
}

export function CreateEntryScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { createEntry, isLoading, error } = useCreateEntryWithMedia();
  const { drawers, fetchDrawers } = useDrawers();
  const { tags, fetchTags } = useTags();
  const { createDrawer } = useCreateDrawer();
  const { updateDrawer } = useUpdateDrawer();
  const { deleteDrawer } = useDeleteDrawer();
  const { createTag } = useCreateTag();
  const { updateTag } = useUpdateTag();
  const { deleteTag } = useDeleteTag();
  const {
    drawerId,
    parentEntryId,
    parentEntryDate,
    reflectionType,
    isConnectedReflection: isConnectedReflectionParam,
  } = useLocalSearchParams<{
    drawerId?: string;
    parentEntryId?: string;
    parentEntryDate?: string;
    reflectionType?: ReflectionType;
    isConnectedReflection?: string;
  }>();
  const initialDrawerId = Array.isArray(drawerId) ? drawerId[0] : drawerId;
  const resolvedParentEntryId = Array.isArray(parentEntryId) ? parentEntryId[0] : parentEntryId;
  const resolvedParentEntryDate = Array.isArray(parentEntryDate) ? parentEntryDate[0] : parentEntryDate;
  const resolvedReflectionType = Array.isArray(reflectionType) ? reflectionType[0] : reflectionType;
  const isConnectedReflection =
    (Array.isArray(isConnectedReflectionParam)
      ? isConnectedReflectionParam[0]
      : isConnectedReflectionParam) === "1" &&
    Boolean(resolvedParentEntryId);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia>({
    imageUris: [],
    audioUri: null,
    location: null,
  });

  const [selectedDrawers, setSelectedDrawers] = useState<string[]>(
    initialDrawerId ? [initialDrawerId] : []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showDrawerModal, setShowDrawerModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<EntryStatus | null>(null);
  const [drawerRequirementError, setDrawerRequirementError] = useState<string | null>(null);
  const [statusRequirementError, setStatusRequirementError] = useState<string | null>(null);
  const [newDrawerName, setNewDrawerName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [pendingImageRemoveIndex, setPendingImageRemoveIndex] = useState<number | null>(null);
  const [parentEntry, setParentEntry] = useState<EntryWithRelations | null>(null);
  const [isParentLoading, setIsParentLoading] = useState(isConnectedReflection);
  const [parentLoadFailed, setParentLoadFailed] = useState(false);
  const [selectedReflectionType, setSelectedReflectionType] = useState<ReflectionType>(
    resolvedReflectionType === "response" || resolvedReflectionType === "continuation"
      ? resolvedReflectionType
      : "update",
  );
  const [promptIndex, setPromptIndex] = useState(0);
  const [isPromptVisible, setIsPromptVisible] = useState(true);
  const soundRef = useRef<Audio.Sound | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const bypassExitPromptRef = useRef(false);
  const optionsCarouselRef = useRef<EntryOptionsCarouselHandle>(null);

  const titleValue = watch("title");
  const contentValue = watch("content");
  const neutralActionTextStyle = { color: ENTRY_CANCEL_TEXT, fontWeight: "700" } as const;
  const primaryActionTextStyle = { color: "#FFFFFF", fontWeight: "700" } as const;
  const discardActionTextStyle = { color: ENTRY_TEXT, fontWeight: "700" } as const;

  const loadParentEntry = useCallback(async () => {
    if (!isConnectedReflection || !resolvedParentEntryId || !user) {
      setIsParentLoading(false);
      return;
    }

    setIsParentLoading(true);
    setParentLoadFailed(false);

    const result = await entriesApi.getEntry(resolvedParentEntryId, user.id);
    if (!result.success || !result.data) {
      setParentEntry(null);
      setParentLoadFailed(true);
      setIsParentLoading(false);
      return;
    }

    setParentEntry(result.data);
    setIsParentLoading(false);
  }, [isConnectedReflection, resolvedParentEntryId, user]);

  useEffect(() => {
    void loadParentEntry();
  }, [loadParentEntry]);

  useEffect(() => {
    fetchDrawers();
    fetchTags();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [fetchDrawers, fetchTags]);

  const pickImages = useCallback(async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission denied",
          "Please enable photo library access in settings"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: MAX_IMAGES,
      });

      if (!result.canceled) {
        const newUris = result.assets.map((asset: ImagePicker.ImagePickerAsset) => asset.uri);
        setSelectedMedia((prev) => ({
          ...prev,
          imageUris: [...prev.imageUris, ...newUris].slice(0, MAX_IMAGES),
        }));
      }
    } catch {
      Alert.alert("Error", "Failed to pick images");
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    setSelectedMedia((prev) => ({
      ...prev,
      imageUris: prev.imageUris.filter((_, i) => i !== index),
    }));
  }, []);

  const requestRemoveImage = useCallback((index: number) => {
    setPendingImageRemoveIndex(index);
  }, []);

  const confirmRemoveImage = useCallback(() => {
    if (pendingImageRemoveIndex === null) {
      return;
    }
    removeImage(pendingImageRemoveIndex);
    setPendingImageRemoveIndex(null);
  }, [pendingImageRemoveIndex, removeImage]);

  const startRecording = useCallback(async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission denied",
          "Please enable microphone access in settings"
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();

      recordingRef.current = recording;
      setIsRecording(true);
    } catch {
      Alert.alert("Error", "Failed to start recording");
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      if (!recordingRef.current) return;

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      if (uri) {
        setSelectedMedia((prev) => ({
          ...prev,
          audioUri: uri,
        }));
      }

      recordingRef.current = null;
      setIsRecording(false);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    } catch {
      Alert.alert("Error", "Failed to stop recording");
    }
  }, []);

  const playAudio = useCallback(async () => {
    try {
      if (!selectedMedia.audioUri) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.didJustFinish) {
          await soundRef.current.replayAsync();
        } else {
          await soundRef.current.playAsync();
        }
        setIsAudioPlaying(true);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: selectedMedia.audioUri },
        { shouldPlay: true },
      );

      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          setIsAudioPlaying(false);
          return;
        }
        setIsAudioPlaying(status.isPlaying);
        if (status.didJustFinish) {
          setIsAudioPlaying(false);
        }
      });
      setIsAudioPlaying(true);
    } catch {
      Alert.alert("Error", "Failed to play audio");
    }
  }, [selectedMedia.audioUri]);

  const pauseAudio = useCallback(async () => {
    try {
      if (!soundRef.current) return;
      await soundRef.current.pauseAsync();
      setIsAudioPlaying(false);
    } catch {
      Alert.alert("Error", "Failed to pause audio");
    }
  }, []);

  const removeAudio = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    setIsAudioPlaying(false);
    setSelectedMedia((prev) => ({
      ...prev,
      audioUri: null,
    }));
  }, []);

  const requestLocation = useCallback(async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission denied",
          "Please enable location access in settings"
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      let address = "";
      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (geocode.length > 0) {
          address = formatLocationLabelFromPlacemark(geocode[0]);
        }
      } catch {
        // ignore reverse geocode failure
      }

      if (!address) {
        address = await reverseGeocodeWithNominatim(latitude, longitude);
      }

      if (!address) {
        Alert.alert(
          "Location unavailable",
          "Couldn't find your city/state name. Please try again where GPS is stronger."
        );
        return;
      }

      setSelectedMedia((prev) => ({
        ...prev,
        location: { latitude, longitude, address },
      }));

    } catch {
      Alert.alert("Error", "Failed to get location");
    }
  }, []);

  const removeLocation = useCallback(() => {
    setSelectedMedia((prev) => ({
      ...prev,
      location: null,
    }));
  }, []);

  const handleAddDrawer = useCallback(async () => {
    if (!newDrawerName.trim()) {
      Alert.alert("Error", "Please enter a drawer name");
      return;
    }

    const result = await createDrawer({ name: newDrawerName.trim() });

    if (result) {
      setSelectedDrawers((prev) =>
        prev.includes(result.id) ? prev : [...prev, result.id]
      );
      setDrawerRequirementError(null);
      setNewDrawerName("");
      fetchDrawers();
    }
  }, [newDrawerName, createDrawer, fetchDrawers]);

  const toggleDrawer = useCallback((drawerIdValue: string) => {
    setSelectedDrawers((prev) =>
      prev.includes(drawerIdValue)
        ? prev.filter((id) => id !== drawerIdValue)
        : [...prev, drawerIdValue]
    );
    setDrawerRequirementError(null);
  }, []);

  const handleAddTag = useCallback(async () => {
    if (!newTagName.trim()) {
      Alert.alert("Error", "Please enter a tag name");
      return;
    }

    const result = await createTag({ name: newTagName.trim() });

    if (result) {
      setSelectedTags((prev) =>
        prev.includes(result.id) ? prev : [...prev, result.id]
      );
      setNewTagName("");
      fetchTags();
    }
  }, [newTagName, createTag, fetchTags]);

  const toggleTag = useCallback((tagIdValue: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagIdValue)
        ? prev.filter((id) => id !== tagIdValue)
        : [...prev, tagIdValue]
    );
  }, []);

  const handleEditDrawer = useCallback(
    async (drawerIdValue: string, name: string) => {
      const result = await updateDrawer(drawerIdValue, { name });
      if (!result) {
        return false;
      }

      await fetchDrawers();
      return true;
    },
    [fetchDrawers, updateDrawer],
  );

  const handleDeleteDrawer = useCallback(
    async (drawerIdValue: string) => {
      const success = await deleteDrawer(drawerIdValue);
      if (!success) {
        return false;
      }

      setSelectedDrawers((prev) => prev.filter((id) => id !== drawerIdValue));
      await fetchDrawers();
      return true;
    },
    [deleteDrawer, fetchDrawers],
  );

  const handleEditTag = useCallback(
    async (tagIdValue: string, name: string) => {
      const result = await updateTag(tagIdValue, { name });
      if (!result) {
        return false;
      }

      await fetchTags();
      return true;
    },
    [fetchTags, updateTag],
  );

  const handleDeleteTag = useCallback(
    async (tagIdValue: string) => {
      const success = await deleteTag(tagIdValue);
      if (!success) {
        return false;
      }

      setSelectedTags((prev) => prev.filter((id) => id !== tagIdValue));
      await fetchTags();
      return true;
    },
    [deleteTag, fetchTags],
  );

  const onSubmit = async (data: EntryFormData) => {
    if (isLoading) {
      return;
    }

    if (isConnectedReflection && (!resolvedParentEntryId || !parentEntry)) {
      Alert.alert("Earlier Entry unavailable", "Please retry loading the original Entry before saving.");
      return;
    }

    const requirements = validateEntryRequirements(selectedDrawers, selectedStatus);
    if (requirements.summary) {
      setDrawerRequirementError(requirements.drawerError);
      setStatusRequirementError(requirements.statusError);
      requestAnimationFrame(() => {
        optionsCarouselRef.current?.revealOption(
          requirements.drawerError ? "drawer" : "status",
          true,
        );
      });
      Alert.alert("Before saving", requirements.summary);
      return;
    }

    const entry = await createEntry({
      title: data.title,
      content: data.content,
      currentStatus: selectedStatus,
      drawerIds: selectedDrawers,
      tagIds: selectedTags,
      imageUris: selectedMedia.imageUris,
      audioUri: selectedMedia.audioUri || undefined,
      location: selectedMedia.location || undefined,
    }, isConnectedReflection && resolvedParentEntryId
      ? {
          parentEntryId: resolvedParentEntryId,
          reflectionType: selectedReflectionType,
        }
      : undefined);

    if (entry) {
      bypassExitPromptRef.current = true;
      if (isConnectedReflection) {
        Alert.alert("Reflection saved.", undefined, [
          {
            text: "View reflection",
            onPress: () => router.replace(`/entry/${entry.id}?skipReturnView=1`),
          },
        ]);
      } else {
        Alert.alert("Entry saved.");
        router.back();
      }
    } else {
      Alert.alert("Error", error?.message || "Failed to save entry");
    }
  };

  const handleBack = useCallback(() => {
    bypassExitPromptRef.current = true;
    router.back();
  }, []);

  const arraysEqual = useCallback((left: string[], right: string[]) => {
    if (left.length !== right.length) return false;
    const leftSorted = [...left].sort();
    const rightSorted = [...right].sort();
    return leftSorted.every((value, index) => value === rightSorted[index]);
  }, []);

  const initialSelectedDrawers = useMemo(
    () => (initialDrawerId ? [initialDrawerId] : []),
    [initialDrawerId],
  );

  const hasUnsavedChanges = useMemo(() => {
    return (
      Boolean(titleValue?.trim()) ||
      Boolean(contentValue?.trim()) ||
      Boolean(selectedStatus) ||
      !arraysEqual(selectedDrawers, initialSelectedDrawers) ||
      selectedTags.length > 0 ||
      selectedMedia.imageUris.length > 0 ||
      Boolean(selectedMedia.audioUri) ||
      Boolean(selectedMedia.location)
    );
  }, [
    arraysEqual,
    contentValue,
    initialSelectedDrawers,
    selectedStatus,
    selectedDrawers,
    selectedMedia.audioUri,
    selectedMedia.imageUris.length,
    selectedMedia.location,
    selectedTags.length,
    titleValue,
  ]);

  const handleBackPress = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowExitPrompt(true);
      return;
    }

    handleBack();
  }, [handleBack, hasUnsavedChanges]);

  const handleDiscardEntry = useCallback(() => {
    reset({
      title: "",
      content: "",
    });
    setSelectedMedia({
      imageUris: [],
      audioUri: null,
      location: null,
    });
    setSelectedDrawers(initialDrawerId ? [initialDrawerId] : []);
    setSelectedTags([]);
    setSelectedStatus(null);
    setDrawerRequirementError(null);
    setStatusRequirementError(null);
    setNewDrawerName("");
    setNewTagName("");
    setPendingImageRemoveIndex(null);
    setShowDrawerModal(false);
    setShowTagModal(false);
    setShowStatusPicker(false);
    setShowExitPrompt(false);
    handleBack();
  }, [handleBack, initialDrawerId, reset]);

  const handleSaveFromExitPrompt = () => {
    setShowExitPrompt(false);
    handleSubmit(onSubmit)();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (bypassExitPromptRef.current) {
        bypassExitPromptRef.current = false;
        return;
      }

      if (!hasUnsavedChanges) {
        return;
      }

      event.preventDefault();
      setShowExitPrompt(true);
    });

    return unsubscribe;
  }, [hasUnsavedChanges, navigation]);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const selectedDrawerPreview = drawers
    .filter((drawer) => selectedDrawers.includes(drawer.id))
    .map((drawer) => ({ id: drawer.id, name: drawer.name, icon: drawer.icon }));
  const displayDrawerPreview = selectedDrawerPreview;
  const selectableDrawers = drawers;
  const selectedTagPreview = tags
    .filter((tag) => selectedTags.includes(tag.id))
    .map((tag) => ({ id: tag.id, name: tag.name }));
  const entryPalette = {
    background: ENTRY_BACKGROUND,
    surface: ENTRY_SURFACE,
    text: ENTRY_TEXT,
    muted: ENTRY_MUTED,
    primary: ENTRY_PRIMARY,
    border: ENTRY_ACCENT,
    inverseText: "#F8F6F2",
  };

  const renderToolbarItem = (
    icon: ReactNode,
    label: string,
  ) => (
    <View style={styles.toolbarItemContent}>
      {icon}
      <Text numberOfLines={2} style={styles.toolbarItemLabel}>{label}</Text>
    </View>
  );
  const parentEntryDateLabel = useMemo(() => {
    const value = parentEntry?.createdAt || resolvedParentEntryDate;
    if (!value) return "an earlier Entry";

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "an earlier Entry"
      : date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }, [parentEntry?.createdAt, resolvedParentEntryDate]);
  const parentEntryPreview = parentEntry?.content.trim().replace(/\s+/g, " ").slice(0, 150);
  const resolveDrawerIcon = useCallback((icon: string | undefined | null) => {
    if (!icon) return "archive-outline";
    return /^[a-z0-9-]+$/i.test(icon) ? icon : "archive-outline";
  }, []);

  const toolbarButtons: EntryOptionsCarouselButton[] = [
    {
      key: "drawer",
      borderColor:
        drawerRequirementError
          ? ENTRY_DANGER
          : selectedDrawers.length > 0
            ? ENTRY_SECONDARY
            : ENTRY_ACCENT,
      backgroundColor: ENTRY_TEXTBOX_BG,
      onPress: () => setShowDrawerModal(true),
      required: true,
      selected: selectedDrawers.length > 0,
      accessibilityLabel: "Choose a Drawer, required",
      accessibilityHint: drawerRequirementError || `${selectedDrawers.length} drawers selected`,
      content: renderToolbarItem(
        <MaterialCommunityIcons
          name="archive-outline"
          size={28}
          color={ENTRY_SECONDARY}
        />,
        selectedDrawers.length === 1
          ? sanitizeEntryPreviewLabel(selectedDrawerPreview[0]?.name || "Drawer")
          : selectedDrawers.length > 1
            ? `${selectedDrawers.length} Drawers`
            : "Choose Drawer",
      ),
    },
    {
      key: "tags",
      borderColor: selectedTags.length > 0 ? ENTRY_SECONDARY : ENTRY_ACCENT,
      backgroundColor: ENTRY_TEXTBOX_BG,
      onPress: () => setShowTagModal(true),
      selected: selectedTags.length > 0,
      accessibilityLabel: "Add tags",
      accessibilityHint: `${selectedTags.length} tags selected`,
      content: renderToolbarItem(
        <MaterialCommunityIcons
          name="tag-outline"
          size={28}
          color={ENTRY_SECONDARY}
        />,
        selectedTags.length ? `${selectedTags.length} Tags` : "Add Tags",
      ),
    },
    {
      key: "status",
      borderColor: statusRequirementError
        ? ENTRY_DANGER
        : selectedStatus
          ? ENTRY_SECONDARY
          : ENTRY_ACCENT,
      backgroundColor: ENTRY_TEXTBOX_BG,
      onPress: () => setShowStatusPicker(true),
      required: true,
      selected: Boolean(selectedStatus),
      accessibilityLabel: "Set Status, required",
      accessibilityHint: statusRequirementError || (selectedStatus ? `Status selected: ${selectedStatus.replaceAll("_", " ")}` : "Choose where this stands"),
      content: renderToolbarItem(
        <MaterialCommunityIcons name="progress-check" size={28} color={ENTRY_SECONDARY} />,
        selectedStatus ? getEntryStatusLabel(selectedStatus) : "Set Status",
      ),
    },
    {
      key: "image",
      borderColor:
        selectedMedia.imageUris.length > 0 ? ENTRY_SECONDARY : ENTRY_ACCENT,
      backgroundColor: ENTRY_TEXTBOX_BG,
      onPress: pickImages,
      selected: selectedMedia.imageUris.length > 0,
      accessibilityLabel: "Add images",
      accessibilityHint: `${selectedMedia.imageUris.length}/${MAX_IMAGES} images`,
      content: renderToolbarItem(
        <MaterialCommunityIcons
          name="image-outline"
          size={28}
          color={ENTRY_SECONDARY}
        />,
        selectedMedia.imageUris.length === 1 ? "1 Image" : selectedMedia.imageUris.length ? `${selectedMedia.imageUris.length} Images` : "Add Image",
      ),
    },
    {
      key: "voice-memo",
      borderColor:
        selectedMedia.audioUri || isRecording ? ENTRY_SECONDARY : ENTRY_ACCENT,
      backgroundColor: ENTRY_TEXTBOX_BG,
      onPress: isRecording ? stopRecording : selectedMedia.audioUri ? playAudio : startRecording,
      selected: Boolean(selectedMedia.audioUri || isRecording),
      accessibilityLabel: isRecording ? "Stop recording" : "Start voice memo",
      accessibilityHint: isRecording ? "Recording in progress" : selectedMedia.audioUri ? "Voice memo added" : undefined,
      content: renderToolbarItem(
        <MaterialCommunityIcons name="mic" size={28} color={ENTRY_SECONDARY} />,
        isRecording ? "Recording…" : selectedMedia.audioUri ? "Voice Added" : "Voice Memo",
      ),
    },
    {
      key: "location",
      borderColor: selectedMedia.location ? ENTRY_SECONDARY : ENTRY_ACCENT,
      backgroundColor: ENTRY_TEXTBOX_BG,
      onPress: requestLocation,
      selected: Boolean(selectedMedia.location),
      accessibilityLabel: "Add location",
      accessibilityHint: selectedMedia.location?.address || "Add an optional location",
      content: renderToolbarItem(
        <MaterialCommunityIcons name="map-marker-outline" size={28} color={ENTRY_SECONDARY} />,
        selectedMedia.location?.address || "Add Location",
      ),
    },
  ];

  return (
    <SafeArea>
      <Screen style={[styles.container, { backgroundColor: ENTRY_BACKGROUND }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.headerBack}
            accessible
            accessibilityLabel="Go back"
          >
            <Text style={[theme.typography.body, styles.headerBackText]}>
              Back
            </Text>
          </TouchableOpacity>

          <Button
            label={isLoading ? "Saving..." : "Save"}
            onPress={handleSubmit(onSubmit)}
            disabled={
              isLoading ||
              (isConnectedReflection && (isParentLoading || parentLoadFailed))
            }
            size="sm"
            textStyle={{ color: "#FFFFFF", letterSpacing: 1.5 }}
            style={styles.saveButton}
            accessibilityLabel="Save entry"
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {isConnectedReflection && (
            <View style={styles.reflectionContextCard}>
              <Text style={[theme.typography.h3, styles.reflectionContextTitle]}>
                Reflecting on an Entry from {parentEntryDateLabel}
              </Text>
              {isParentLoading ? (
                <Text style={[theme.typography.bodySm, styles.reflectionContextCopy]}>
                  Loading earlier Entry...
                </Text>
              ) : parentLoadFailed ? (
                <View style={styles.reflectionContextUnavailable}>
                  <Text style={[theme.typography.bodySm, styles.reflectionContextCopy]}>
                    Earlier Entry unavailable.
                  </Text>
                  <TouchableOpacity
                    onPress={() => void loadParentEntry()}
                    accessible
                    accessibilityLabel="Retry loading earlier Entry"
                  >
                    <Text style={[theme.typography.bodySm, styles.reflectionContextLink]}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {parentEntryPreview ? (
                    <Text style={[theme.typography.bodySm, styles.reflectionContextPreview]}>
                      “{parentEntryPreview}{(parentEntry?.content.length || 0) > parentEntryPreview.length ? "..." : ""}”
                    </Text>
                  ) : null}
                  <TouchableOpacity
                    onPress={() => router.push(`/entry/${resolvedParentEntryId}`)}
                    accessible
                    accessibilityLabel="View original Entry"
                  >
                    <Text style={[theme.typography.bodySm, styles.reflectionContextLink]}>View original Entry</Text>
                  </TouchableOpacity>
                </>
              )}
              <Text style={[theme.typography.bodySm, styles.reflectionContextCopy]}>
                Your original Entry will remain unchanged.
              </Text>

              <Text style={[theme.typography.labelSm, styles.reflectionTypeLabel]}>Reflection type</Text>
              <View style={styles.reflectionTypeList}>
                {REFLECTION_TYPE_OPTIONS.map((option) => {
                  const selected = selectedReflectionType === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setSelectedReflectionType(option.value)}
                      style={[styles.reflectionTypeOption, selected && styles.reflectionTypeOptionSelected]}
                      accessible
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      accessibilityLabel={`${option.label}. ${option.description}`}
                    >
                      <View style={styles.reflectionTypeOptionHeader}>
                        <Text style={[theme.typography.body, styles.reflectionTypeOptionTitle]}>{option.label}</Text>
                        {selected ? <MaterialCommunityIcons name="check-circle" size={18} color={ENTRY_SECONDARY} /> : null}
                      </View>
                      <Text style={[theme.typography.bodySm, styles.reflectionTypeOptionDescription]}>{option.description}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {isPromptVisible ? (
                <View style={styles.reflectionPrompt}>
                  <Text style={[theme.typography.bodySm, styles.reflectionPromptText]}>
                    {REFLECTION_PROMPTS[promptIndex]}
                  </Text>
                  <View style={styles.reflectionPromptActions}>
                    <TouchableOpacity
                      onPress={() => setPromptIndex((index) => (index + 1) % REFLECTION_PROMPTS.length)}
                      accessible
                      accessibilityLabel="Show another reflection prompt"
                    >
                      <Text style={[theme.typography.bodySm, styles.reflectionContextLink]}>Another prompt</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setIsPromptVisible(false)}
                      accessible
                      accessibilityLabel="Dismiss reflection prompt"
                    >
                      <Text style={[theme.typography.bodySm, styles.reflectionContextLink]}>Dismiss</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsPromptVisible(true)}
                  accessible
                  accessibilityLabel="Show a reflection prompt"
                >
                  <Text style={[theme.typography.bodySm, styles.reflectionContextLink]}>Show a reflection prompt</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.titleInput,
                  {
                    color: ENTRY_TEXT,
                    fontFamily: theme.fonts.serif,
                    fontWeight: value?.trim() ? "600" : "300",
                  },
                ]}
                placeholder="Add a title"
                placeholderTextColor={ENTRY_PLACEHOLDER}
                value={value}
                onChangeText={onChange}
                editable
                cursorColor={ENTRY_PRIMARY}
                selectionColor={ENTRY_PRIMARY}
                underlineColorAndroid="transparent"
                autoCorrect={false}
                autoCapitalize="sentences"
                returnKeyType="done"
                spellCheck={false}
                focusable
                accessibilityLabel="Entry title"
                autoFocus={isConnectedReflection}
              />
            )}
          />

          {errors.title && (
            <Text
              style={[theme.typography.bodySm, { color: theme.colors.errorText }]}
            >
              {errors.title.message}
            </Text>
          )}

          <View style={styles.metaRow}>
            <View style={styles.inlineMetaItem}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={24}
                color={ENTRY_PRIMARY}
              />
              <Text style={styles.inlineMetaText}>{currentDate}</Text>
            </View>

          </View>

          {selectedMedia.location && (
            <TouchableOpacity
              onPress={removeLocation}
              style={{ marginBottom: theme.spacing.lg }}
            >
              <Text
                style={[theme.typography.bodySm, { color: ENTRY_DANGER_DARK }]}
              >
                Remove location
              </Text>
            </TouchableOpacity>
          )}

          <EntryOptionsCarousel
            ref={optionsCarouselRef}
            buttons={toolbarButtons}
            containerStyle={styles.toolbar}
            buttonStyle={styles.toolbarButton}
            surfaceColor={ENTRY_BACKGROUND}
          />

          {drawerRequirementError || statusRequirementError ? (
            <View accessibilityLiveRegion="polite">
              {drawerRequirementError ? (
                <Text style={[theme.typography.bodySm, styles.requirementError]}>
                  {drawerRequirementError}
                </Text>
              ) : null}
              {statusRequirementError ? (
                <Text style={[theme.typography.bodySm, styles.requirementError]}>
                  {statusRequirementError}
                </Text>
              ) : null}
            </View>
          ) : null}

          {isRecording ? (
            <View accessibilityLiveRegion="polite" style={styles.recordingStatusRow}>
              <View style={styles.recordingStatusDot} />
              <Text style={styles.recordingStatusText}>Recording voice memo...</Text>
            </View>
          ) : null}

          <EntryImageStrip
            items={selectedMedia.imageUris}
            titleColor={theme.colors.textSecondary}
            onRemove={(_, index) => requestRemoveImage(index)}
            getItemAccessibilityLabel={(index) => `Selected image ${index + 1}`}
          />

          {selectedMedia.audioUri && (
            <View
              style={[styles.audioBox, { borderColor: ENTRY_ACCENT }]}
            >
              <View style={styles.audioContent}>
                <Text
                  style={[theme.typography.body, { color: ENTRY_TEXT }]}
                >
                  Voice Memo
                </Text>
                <View style={styles.audioActions}>
                  <TouchableOpacity
                    onPress={playAudio}
                    accessible
                    accessibilityLabel="Play voice memo"
                    accessibilityRole="button"
                  >
                    <Text style={[theme.typography.bodySm, { color: ENTRY_TEXT }]}>
                      Play
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={pauseAudio}
                    disabled={!isAudioPlaying}
                    accessible
                    accessibilityLabel="Pause voice memo"
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        theme.typography.bodySm,
                        { color: isAudioPlaying ? ENTRY_TEXT : "#8A8178" },
                      ]}
                    >
                      Pause
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={removeAudio}
                accessible
                accessibilityLabel="Remove voice memo"
              >
                <Text
                  style={[theme.typography.body, { color: theme.colors.error }]}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {(displayDrawerPreview.length > 0 || selectedTagPreview.length > 0) && (
            <View style={styles.linkedPreviewSection}>
              {displayDrawerPreview.length > 0 && (
                <>
                  <Text style={styles.linkedPreviewLabel}>Linked Drawers</Text>
                  <View style={styles.linkedChipRow}>
                    {displayDrawerPreview.map((drawer) => (
                      <View key={`drawer-${drawer.id}`} style={styles.linkedDrawerChip}>
                        <MaterialCommunityIcons
                          name={resolveDrawerIcon(drawer.icon)}
                          size={14}
                          color="#556950"
                        />
                        <Text style={styles.linkedDrawerChipText}>
                          {sanitizeEntryPreviewLabel(drawer.name)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
              {selectedTagPreview.length > 0 && (
                <>
                  <Text style={styles.linkedPreviewLabel}>Linked Tags</Text>
                  <View style={styles.linkedChipRow}>
                    {selectedTagPreview.map((tag) => (
                      <View key={`tag-${tag.id}`} style={styles.linkedTagChip}>
                        <Text style={styles.linkedTagChipText}>
                          {sanitizeEntryPreviewLabel(tag.name)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          )}

          {errors.content && (
            <Text
              style={[theme.typography.bodySm, { color: ENTRY_DANGER_DARK }]}
            >
              {errors.content.message}
            </Text>
          )}

          <Controller
            control={control}
            name="content"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.contentInput,
                  {
                    borderColor: ENTRY_ACCENT,
                    color: ENTRY_TEXT,
                    backgroundColor: ENTRY_TEXTBOX_BG,
                  },
                ]}
                placeholder="Start writing..."
                placeholderTextColor={ENTRY_MUTED}
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={12}
                textAlignVertical="top"
                accessibilityLabel="Entry content"
              />
            )}
          />
        </ScrollView>

        <EntryStatusPickerModal
          visible={showStatusPicker}
          selectedStatus={selectedStatus}
          onSelectStatus={(status) => {
            setSelectedStatus(status);
            setStatusRequirementError(null);
            setShowStatusPicker(false);
          }}
          onClose={() => setShowStatusPicker(false)}
          backgroundColor={entryPalette.background}
          textColor={entryPalette.text}
          borderColor={entryPalette.border}
          surfaceColor={entryPalette.surface}
          primaryColor={entryPalette.primary}
        />

        <EntrySelectionModal
          visible={showDrawerModal}
          title="Select Drawers"
          items={selectableDrawers.map((drawer) => ({
            id: drawer.id,
            name: drawer.name,
            isManageable: true,
          }))}
          selectedIds={selectedDrawers}
          onToggle={toggleDrawer}
          onClose={() => setShowDrawerModal(false)}
          createValue={newDrawerName}
          onCreateValueChange={setNewDrawerName}
          onCreate={handleAddDrawer}
          createPlaceholder="New drawer name"
          createAccessibilityLabel="New drawer name"
          createButtonAccessibilityLabel="Create drawer"
          placeholderTextColor={entryPalette.muted}
          textColor={entryPalette.text}
          backgroundColor={entryPalette.background}
          surfaceColor={entryPalette.surface}
          borderColor={entryPalette.border}
          primaryColor={entryPalette.primary}
          inverseTextColor={entryPalette.inverseText}
          itemTypeLabel="drawer"
          onEditItem={handleEditDrawer}
          onDeleteItem={handleDeleteDrawer}
        />

        <EntrySelectionModal
          visible={showTagModal}
          title="Select Tags"
          items={tags.map((tag) => ({ id: tag.id, name: tag.name, isManageable: true }))}
          selectedIds={selectedTags}
          onToggle={toggleTag}
          onClose={() => setShowTagModal(false)}
          createValue={newTagName}
          onCreateValueChange={setNewTagName}
          onCreate={handleAddTag}
          createPlaceholder="New tag name"
          createAccessibilityLabel="New tag name"
          createButtonAccessibilityLabel="Create tag"
          placeholderTextColor={entryPalette.muted}
          textColor={entryPalette.text}
          backgroundColor={entryPalette.background}
          surfaceColor={entryPalette.surface}
          borderColor={entryPalette.border}
          primaryColor={entryPalette.primary}
          inverseTextColor={entryPalette.inverseText}
          itemTypeLabel="tag"
          onEditItem={handleEditTag}
          onDeleteItem={handleDeleteTag}
        />

        <AppModalSheet
          visible={pendingImageRemoveIndex !== null}
          onClose={() => setPendingImageRemoveIndex(null)}
          contentStyle={styles.actionModal}
        >
          <Text style={[styles.actionTitle, { color: ENTRY_TEXT, fontFamily: theme.fonts.serif }]}>
            Delete Image
          </Text>
          <Text style={[theme.typography.body, styles.actionSubtitle, { color: ENTRY_MUTED }]}>
            Are you sure you want to delete this image?
          </Text>
          <View style={styles.actionRow}>
            <Button
              label="Cancel"
              onPress={() => setPendingImageRemoveIndex(null)}
              variant="primary"
              style={[styles.actionButton, { backgroundColor: ENTRY_CANCEL_BG, borderColor: ENTRY_CANCEL_BORDER }]}
              textStyle={neutralActionTextStyle}
            />
            <Button
              label="Delete"
              onPress={confirmRemoveImage}
              variant="primary"
              style={[styles.actionButton, { backgroundColor: ENTRY_DANGER, borderColor: ENTRY_DANGER }]}
              textStyle={primaryActionTextStyle}
            />
          </View>
        </AppModalSheet>

        <AppModalSheet
          visible={showExitPrompt}
          onClose={() => setShowExitPrompt(false)}
          contentStyle={styles.actionModal}
        >
          <Text style={[styles.actionTitle, { color: ENTRY_TEXT, fontFamily: theme.fonts.serif }]}>
            Leave Entry?
          </Text>
          <Text style={[theme.typography.body, styles.actionSubtitle, { color: ENTRY_MUTED }]}>
            Do you want to save your changes before leaving?
          </Text>
          <View style={styles.actionRow}>
            <Button
              label="Save Changes"
              onPress={handleSaveFromExitPrompt}
              variant="primary"
              style={[styles.actionButton, { backgroundColor: ENTRY_SECONDARY, borderColor: ENTRY_SECONDARY }]}
              textStyle={primaryActionTextStyle}
            />
            <Button
              label="Discard Entry"
              onPress={handleDiscardEntry}
              variant="primary"
              style={[styles.actionButton, { backgroundColor: ENTRY_CANCEL_BG, borderColor: ENTRY_CANCEL_BORDER }]}
              textStyle={discardActionTextStyle}
            />
          </View>
        </AppModalSheet>
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
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 12,
  },
  headerBack: {
    paddingVertical: 8,
  },
  headerBackText: {
    color: ENTRY_TEXT,
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: ENTRY_SECONDARY,
    borderRadius: 999,
    minHeight: 42,
    paddingHorizontal: 18,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    paddingTop: 4,
  },
  reflectionContextCard: {
    marginBottom: 22,
    padding: 16,
    borderRadius: 18,
    backgroundColor: ENTRY_SURFACE,
    borderWidth: 1,
    borderColor: ENTRY_ACCENT,
    gap: 10,
  },
  reflectionContextTitle: {
    color: ENTRY_TEXT,
  },
  reflectionContextCopy: {
    color: ENTRY_MUTED,
  },
  reflectionContextPreview: {
    color: ENTRY_TEXT,
    fontStyle: "italic",
    lineHeight: 20,
  },
  reflectionContextLink: {
    color: ENTRY_SECONDARY,
    fontWeight: "700",
  },
  reflectionContextUnavailable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reflectionTypeLabel: {
    color: ENTRY_MUTED,
    marginTop: 4,
    textTransform: "uppercase",
  },
  reflectionTypeList: {
    gap: 8,
  },
  reflectionTypeOption: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: ENTRY_TEXTBOX_BG,
    borderWidth: 1,
    borderColor: ENTRY_ACCENT,
  },
  reflectionTypeOptionSelected: {
    borderColor: ENTRY_SECONDARY,
    backgroundColor: "#EDF0E8",
  },
  reflectionTypeOptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  reflectionTypeOptionTitle: {
    color: ENTRY_TEXT,
    fontWeight: "700",
  },
  reflectionTypeOptionDescription: {
    color: ENTRY_MUTED,
    marginTop: 3,
  },
  reflectionPrompt: {
    gap: 8,
    marginTop: 2,
  },
  reflectionPromptText: {
    color: ENTRY_TEXT,
  },
  reflectionPromptActions: {
    flexDirection: "row",
    gap: 16,
  },
  metaRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 24,
  },
  inlineMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  inlineMetaText: {
    color: ENTRY_MUTED,
    fontSize: 16,
    lineHeight: 22,
    flexShrink: 1,
  },
  inlineMetaTextActive: {
    color: ENTRY_PRIMARY,
  },
  titleInput: {
    backgroundColor: "transparent",
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 14,
    width: "100%",
    minHeight: 92,
    fontSize: 44,
    lineHeight: 52,
    fontWeight: "300",
    marginBottom: 18,
  },
  toolbar: {
    marginTop: 4,
  },
  toolbarButton: {
    shadowColor: "#2F2924",
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 1,
  },
  toolbarItemContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  toolbarItemLabel: {
    color: "#2F2924",
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  requirementError: {
    color: ENTRY_DANGER_DARK,
    marginBottom: 8,
  },
  recordingStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -2,
    marginBottom: 10,
    gap: 8,
  },
  recordingStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: ENTRY_DANGER,
  },
  recordingStatusText: {
    color: ENTRY_MUTED,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  contentInput: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    minHeight: 430,
    marginTop: 12,
    fontSize: 19,
    lineHeight: 32,
    shadowColor: "#2F2924",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  imageWrapper: {
    position: "relative",
    marginRight: 12,
    marginBottom: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  audioBox: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: ENTRY_SURFACE,
    shadowColor: "#2F2924",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 3,
  },
  audioContent: {
    flex: 1,
    gap: 4,
  },
  audioActions: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  linkedPreviewSection: {
    marginBottom: 14,
    gap: 6,
  },
  linkedPreviewLabel: {
    color: "#8A8178",
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  linkedChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },
  linkedDrawerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#556950",
    backgroundColor: "#E6E2D8",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  linkedDrawerChipText: {
    color: "#556950",
    fontSize: 14,
    fontWeight: "500",
  },
  linkedTagChip: {
    borderWidth: 1,
    borderColor: ENTRY_PREVIEW_PILLS.tagBorder,
    backgroundColor: ENTRY_PREVIEW_PILLS.tagBackground,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  linkedTagChipText: {
    color: ENTRY_PREVIEW_PILLS.tagText,
    fontSize: 14,
    fontWeight: "400",
  },
  actionModal: {
    borderRadius: 24,
    backgroundColor: ENTRY_SURFACE,
  },
  actionTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "400",
    marginBottom: 6,
  },
  actionSubtitle: {
    marginBottom: 14,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 999,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 40,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "System",
    fontSize: 14,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 18,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
