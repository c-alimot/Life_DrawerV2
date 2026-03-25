import { SafeArea, Screen } from "@components/layout";
import { Button } from "@components/ui";
import { MOOD_MAP, MOOD_VALUES } from "@constants/mood";
import { useCreateDrawer } from "@features/drawers/hooks/useCreateDrawer";
import { useDrawers } from "@features/drawers/hooks/useDrawers";
import { useLifePhase } from "@features/home/hooks/useLifePhase";
import { useCreateTag } from "@features/tags/hooks/useCreateTag";
import { useTags } from "@features/tags/hooks/useTags";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "@styles/theme";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";
import { useCreateEntryWithMedia } from "../hooks/useCreateEntryWithMedia";

const entrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  mood: z
    .enum([
      "happy",
      "calm",
      "inspired",
      "grateful",
      "anxious",
      "stressed",
      "angry",
      "sad",
      "tired",
      "bored",
      "meh",
    ])
    .optional(),
});

type EntryFormData = z.infer<typeof entrySchema>;

const MAX_IMAGES = 10;

interface SelectedMedia {
  imageUris: string[];
  audioUri: string | null;
  location: { latitude: number; longitude: number; address?: string } | null;
}

export function CreateEntryScreen() {
  const theme = useTheme();
  const { createEntry, isLoading } = useCreateEntryWithMedia();
  const { drawers, fetchDrawers } = useDrawers();
  const { activePhase, fetchActivePhase } = useLifePhase();
  const { tags, fetchTags } = useTags();
  const { createDrawer } = useCreateDrawer();
  const { createTag } = useCreateTag();
  const { drawerId } = useLocalSearchParams<{ drawerId?: string }>();
  const initialDrawerId = Array.isArray(drawerId) ? drawerId[0] : drawerId;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: "",
      content: "",
      mood: undefined,
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
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showDrawerModal, setShowDrawerModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [newDrawerName, setNewDrawerName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [locationText, setLocationText] = useState("");
  const soundRef = useRef<Audio.Sound | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const mood = watch("mood");

  useEffect(() => {
    fetchDrawers();
    fetchTags();
    fetchActivePhase();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [fetchActivePhase, fetchDrawers, fetchTags]);

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

  const takePhoto = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission denied",
          "Please enable camera access in settings"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

      if (!result.canceled) {
        const photoUri = result.assets[0].uri;
        setSelectedMedia((prev) => ({
          ...prev,
          imageUris: [...prev.imageUris, photoUri].slice(0, MAX_IMAGES),
        }));
      }
    } catch {
      Alert.alert("Error", "Failed to take photo");
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    setSelectedMedia((prev) => ({
      ...prev,
      imageUris: prev.imageUris.filter((_, i) => i !== index),
    }));
  }, []);

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
    } catch {
      Alert.alert("Error", "Failed to stop recording");
    }
  }, []);

  const playAudio = useCallback(async () => {
    try {
      if (!selectedMedia.audioUri) return;

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: selectedMedia.audioUri },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      await sound.playAsync();
    } catch {
      Alert.alert("Error", "Failed to play audio");
    }
  }, [selectedMedia.audioUri]);

  const removeAudio = useCallback(() => {
    setSelectedMedia((prev) => ({
      ...prev,
      audioUri: null,
    }));
  }, []);

  const startVoiceToText = useCallback(async () => {
    setIsTranscribing(true);

    Alert.alert(
      "Voice to text unavailable",
      "This feature is not enabled yet in the current app build."
    );

    setIsTranscribing(false);
  }, []);

  const stopVoiceToText = useCallback(async () => {
    setIsTranscribing(false);
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
          const { city, region } = geocode[0];
          address = [city, region].filter(Boolean).join(", ");
        }
      } catch {
        // ignore reverse geocode failure
      }

      setSelectedMedia((prev) => ({
        ...prev,
        location: { latitude, longitude, address },
      }));

      setLocationText(
        address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      );
    } catch {
      Alert.alert("Error", "Failed to get location");
    }
  }, []);

  const removeLocation = useCallback(() => {
    setSelectedMedia((prev) => ({
      ...prev,
      location: null,
    }));
    setLocationText("");
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

  const onSubmit = async (data: EntryFormData) => {
    const entry = await createEntry({
      title: data.title,
      content: data.content,
      mood: data.mood,
      drawerIds: selectedDrawers,
      tagIds: selectedTags,
      imageUris: selectedMedia.imageUris,
      audioUri: selectedMedia.audioUri || undefined,
      location: selectedMedia.location || undefined,
      lifePhaseId: activePhase?.id,
    });

    if (entry) {
      Alert.alert("Success", "Entry created successfully");
      router.back();
    }
  };

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <SafeArea>
      <Screen style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            accessible
            accessibilityLabel="Go back"
          >
            <Text style={[theme.typography.h2, { color: theme.colors.text }]}>
              ←
            </Text>
          </TouchableOpacity>

          <Button
            label={isLoading ? "Saving..." : "Save"}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            size="sm"
            accessibilityLabel="Save entry"
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  theme.typography.h2,
                  {
                    color: theme.colors.text,
                    marginBottom: theme.spacing.md,
                  },
                ]}
                placeholder="Add a title"
                placeholderTextColor={theme.colors.textSecondary}
                value={value}
                onChangeText={onChange}
                accessibilityLabel="Entry title"
              />
            )}
          />

          {errors.title && (
            <Text
              style={[theme.typography.bodySm, { color: theme.colors.error }]}
            >
              {errors.title.message}
            </Text>
          )}

          <Text
            style={[
              theme.typography.body,
              {
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.lg,
              },
            ]}
          >
            {currentDate}
          </Text>

          <TouchableOpacity
            onPress={requestLocation}
            style={{ marginBottom: theme.spacing.lg }}
            accessible
            accessibilityLabel="Add location"
            accessibilityRole="button"
          >
            <Text
              style={[
                theme.typography.body,
                {
                  color: locationText
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
                },
              ]}
            >
              {locationText || "Add location"}
            </Text>
          </TouchableOpacity>

          {selectedMedia.location && (
            <TouchableOpacity
              onPress={removeLocation}
              style={{ marginBottom: theme.spacing.lg }}
            >
              <Text
                style={[theme.typography.bodySm, { color: theme.colors.error }]}
              >
                Remove location
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.toolbar}>
            <TouchableOpacity
              style={[
                styles.toolbarButton,
                {
                  borderColor:
                    selectedTags.length > 0
                      ? theme.colors.primary
                      : theme.colors.border,
                },
              ]}
              onPress={() => setShowTagModal(true)}
              accessible
              accessibilityLabel="Add tags"
              accessibilityHint={`${selectedTags.length} tags selected`}
              accessibilityRole="button"
            >
              <Text style={styles.toolbarIcon}>🏷️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toolbarButton,
                {
                  borderColor:
                    selectedDrawers.length > 0
                      ? theme.colors.primary
                      : theme.colors.border,
                },
              ]}
              onPress={() => setShowDrawerModal(true)}
              accessible
              accessibilityLabel="Add to drawers"
              accessibilityHint={`${selectedDrawers.length} drawers selected`}
              accessibilityRole="button"
            >
              <Text style={styles.toolbarIcon}>📁</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toolbarButton,
                {
                  borderColor:
                    selectedMedia.imageUris.length > 0
                      ? theme.colors.primary
                      : theme.colors.border,
                },
              ]}
              onPress={pickImages}
              accessible
              accessibilityLabel="Add images"
              accessibilityHint={`${selectedMedia.imageUris.length}/${MAX_IMAGES} images`}
              accessibilityRole="button"
            >
              <Text style={styles.toolbarIcon}>🖼️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toolbarButton,
                { borderColor: theme.colors.border },
              ]}
              onPress={takePhoto}
              accessible
              accessibilityLabel="Take photo"
              accessibilityRole="button"
            >
              <Text style={styles.toolbarIcon}>📷</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toolbarButton,
                {
                  borderColor:
                    selectedMedia.audioUri || isRecording
                      ? theme.colors.primary
                      : theme.colors.border,
                  backgroundColor: isRecording
                    ? `${theme.colors.error}20`
                    : "transparent",
                },
              ]}
              onPress={isRecording ? stopRecording : startRecording}
              accessible
              accessibilityLabel={
                isRecording ? "Stop recording" : "Start voice memo"
              }
              accessibilityRole="button"
            >
              <Text style={styles.toolbarIcon}>
                {isRecording ? "⏹️" : "🎙️"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toolbarButton,
                {
                  borderColor: isTranscribing
                    ? theme.colors.primary
                    : theme.colors.border,
                  backgroundColor: isTranscribing
                    ? `${theme.colors.primary}20`
                    : "transparent",
                },
              ]}
              onPress={isTranscribing ? stopVoiceToText : startVoiceToText}
              accessible
              accessibilityLabel={
                isTranscribing ? "Stop voice to text" : "Start voice to text"
              }
              accessibilityRole="button"
            >
              <Text style={styles.toolbarIcon}>
                {isTranscribing ? "🎙️" : "🎤"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toolbarButton,
                {
                  borderColor: mood
                    ? theme.colors.primary
                    : theme.colors.border,
                },
              ]}
              onPress={() => setShowMoodPicker(true)}
              accessible
              accessibilityLabel="Add mood"
              accessibilityHint={
                mood ? `Mood: ${MOOD_MAP[mood]?.label}` : "Select a mood"
              }
              accessibilityRole="button"
            >
              <Text style={styles.toolbarIcon}>
                {mood ? MOOD_MAP[mood]?.emoji : "😊"}
              </Text>
            </TouchableOpacity>
          </View>

          {selectedMedia.imageUris.length > 0 && (
            <View style={{ marginBottom: theme.spacing.lg }}>
              <FlatList
                data={selectedMedia.imageUris}
                keyExtractor={(_, index) => `image-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item: imageUri, index }) => (
                  <View style={styles.imageWrapper}>
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.image}
                      accessible
                      accessibilityLabel={`Selected image ${index + 1}`}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                      accessible
                      accessibilityLabel="Remove image"
                    >
                      <Text style={styles.removeImageText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}

          {selectedMedia.audioUri && (
            <View
              style={[styles.audioBox, { borderColor: theme.colors.border }]}
            >
              <View style={styles.audioContent}>
                <Text
                  style={[theme.typography.body, { color: theme.colors.text }]}
                >
                  🎙️ Voice Memo
                </Text>
                <TouchableOpacity
                  onPress={playAudio}
                  accessible
                  accessibilityLabel="Play voice memo"
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      theme.typography.bodySm,
                      { color: theme.colors.primary },
                    ]}
                  >
                    Play
                  </Text>
                </TouchableOpacity>
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

          <Controller
            control={control}
            name="content"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.contentInput,
                  {
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                placeholder="Start writing..."
                placeholderTextColor={theme.colors.textSecondary}
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={12}
                textAlignVertical="top"
                accessibilityLabel="Entry content"
              />
            )}
          />

          {errors.content && (
            <Text
              style={[theme.typography.bodySm, { color: theme.colors.error }]}
            >
              {errors.content.message}
            </Text>
          )}
        </ScrollView>

        <Modal
          visible={showMoodPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMoodPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowMoodPicker(false)}
            activeOpacity={1}
          >
            <View
              style={[
                styles.moodPicker,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <Text
                style={[
                  theme.typography.h3,
                  { color: theme.colors.text, marginBottom: theme.spacing.md },
                ]}
              >
                How are you feeling?
              </Text>

              <View style={styles.moodGrid}>
                {MOOD_VALUES.map((moodValue) => {
                  const moodData = MOOD_MAP[moodValue];
                  return (
                    <TouchableOpacity
                      key={moodValue}
                      style={[
                        styles.moodOption,
                        {
                          backgroundColor:
                            mood === moodValue
                              ? `${theme.colors.primary}20`
                              : "transparent",
                          borderColor:
                            mood === moodValue
                              ? theme.colors.primary
                              : theme.colors.border,
                        },
                      ]}
                      onPress={() => {
                        setValue("mood", moodValue);
                        setShowMoodPicker(false);
                      }}
                      accessible
                      accessibilityLabel={`Select mood: ${moodData.label}`}
                      accessibilityRole="button"
                    >
                      <Text style={styles.moodText}>{moodData.emoji}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal
          visible={showDrawerModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDrawerModal(false)}
        >
          <SafeArea>
            <Screen
              style={[
                styles.modalContainer,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text
                  style={[theme.typography.h2, { color: theme.colors.text }]}
                >
                  Select Drawers
                </Text>

                <TouchableOpacity
                  onPress={() => setShowDrawerModal(false)}
                  accessible
                  accessibilityLabel="Close"
                >
                  <Text
                    style={[theme.typography.h3, { color: theme.colors.text }]}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalContent}
              >
                <View style={{ marginBottom: theme.spacing.lg }}>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          borderColor: theme.colors.border,
                          color: theme.colors.text,
                          flex: 1,
                        },
                      ]}
                      placeholder="New drawer name"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={newDrawerName}
                      onChangeText={setNewDrawerName}
                      accessibilityLabel="New drawer name"
                    />
                    <Button
                      label="Add"
                      onPress={handleAddDrawer}
                      size="sm"
                      disabled={!newDrawerName.trim()}
                      accessibilityLabel="Create drawer"
                    />
                  </View>
                </View>

                {drawers.map((drawer) => (
                  <TouchableOpacity
                    key={drawer.id}
                    style={[
                      styles.modalItem,
                      {
                        borderColor: selectedDrawers.includes(drawer.id)
                          ? theme.colors.primary
                          : theme.colors.border,
                        backgroundColor: selectedDrawers.includes(drawer.id)
                          ? `${theme.colors.primary}10`
                          : "transparent",
                      },
                    ]}
                    onPress={() => toggleDrawer(drawer.id)}
                    accessible
                    accessibilityLabel={`Drawer: ${drawer.name}`}
                    accessibilityHint={
                      selectedDrawers.includes(drawer.id)
                        ? "Selected"
                        : "Not selected"
                    }
                    accessibilityRole="checkbox"
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: selectedDrawers.includes(drawer.id)
                            ? theme.colors.primary
                            : "transparent",
                          borderColor: selectedDrawers.includes(drawer.id)
                            ? theme.colors.primary
                            : theme.colors.border,
                        },
                      ]}
                    >
                      {selectedDrawers.includes(drawer.id) && (
                        <Text style={{ color: theme.colors.background }}>
                          ✓
                        </Text>
                      )}
                    </View>

                    <Text
                      style={[
                        theme.typography.body,
                        { color: theme.colors.text },
                      ]}
                    >
                      {drawer.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Screen>
          </SafeArea>
        </Modal>

        <Modal
          visible={showTagModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTagModal(false)}
        >
          <SafeArea>
            <Screen
              style={[
                styles.modalContainer,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text
                  style={[theme.typography.h2, { color: theme.colors.text }]}
                >
                  Select Tags
                </Text>

                <TouchableOpacity
                  onPress={() => setShowTagModal(false)}
                  accessible
                  accessibilityLabel="Close"
                >
                  <Text
                    style={[theme.typography.h3, { color: theme.colors.text }]}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalContent}
              >
                <View style={{ marginBottom: theme.spacing.lg }}>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          borderColor: theme.colors.border,
                          color: theme.colors.text,
                          flex: 1,
                        },
                      ]}
                      placeholder="New tag name"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={newTagName}
                      onChangeText={setNewTagName}
                      accessibilityLabel="New tag name"
                    />
                    <Button
                      label="Add"
                      onPress={handleAddTag}
                      size="sm"
                      disabled={!newTagName.trim()}
                      accessibilityLabel="Create tag"
                    />
                  </View>
                </View>

                {tags.map((tag) => (
                  <TouchableOpacity
                    key={tag.id}
                    style={[
                      styles.modalItem,
                      {
                        borderColor: selectedTags.includes(tag.id)
                          ? theme.colors.primary
                          : theme.colors.border,
                        backgroundColor: selectedTags.includes(tag.id)
                          ? `${theme.colors.primary}10`
                          : "transparent",
                      },
                    ]}
                    onPress={() => toggleTag(tag.id)}
                    accessible
                    accessibilityLabel={`Tag: ${tag.name}`}
                    accessibilityHint={
                      selectedTags.includes(tag.id)
                        ? "Selected"
                        : "Not selected"
                    }
                    accessibilityRole="checkbox"
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: selectedTags.includes(tag.id)
                            ? theme.colors.primary
                            : "transparent",
                          borderColor: selectedTags.includes(tag.id)
                            ? theme.colors.primary
                            : theme.colors.border,
                        },
                      ]}
                    >
                      {selectedTags.includes(tag.id) && (
                        <Text style={{ color: theme.colors.background }}>
                          ✓
                        </Text>
                      )}
                    </View>

                    <Text
                      style={[
                        theme.typography.body,
                        { color: theme.colors.text },
                      ]}
                    >
                      {tag.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Screen>
          </SafeArea>
        </Modal>
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
    paddingVertical: 16,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
    marginTop: 12,
  },
  toolbarButton: {
    width: "22%",
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  toolbarIcon: {
    fontSize: 24,
  },
  contentInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 200,
    marginTop: 12,
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
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  audioContent: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  moodPicker: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  moodOption: {
    width: "22%",
    aspectRatio: 1,
    borderWidth: 2,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  moodText: {
    fontSize: 28,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: "System",
    fontSize: 14,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
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
