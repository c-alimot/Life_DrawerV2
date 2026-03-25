import { AppBottomNav, AppSideMenu, SafeArea, Screen } from "@components/layout";
import { Button, Input } from "@components/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "@styles/theme";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";
import { useLifePhase } from "../hooks/useLifePhase";

const PAGE_BACKGROUND = "#EDEAE4";
const PAGE_SURFACE = "#FFFFFF";
const PAGE_TEXT = "#2F2924";
const PAGE_MUTED = "#6F6860";
const PAGE_PRIMARY = "#8C9A7F";
const PAGE_SECONDARY = "#556950";
const PAGE_BORDER = "#B39C87";

const lifePhaseSchema = z.object({
  name: z.string().min(2, "Life phase name must be at least 2 characters"),
  description: z.string().optional(),
});

type LifePhaseFormData = z.infer<typeof lifePhaseSchema>;

const EXAMPLE_PHASES = [
  {
    name: "College Years",
    description: "Learning and growing",
  },
  {
    name: "First Job",
    description: "Starting my career journey",
  },
  {
    name: "Living Abroad",
    description: "New adventures in a new place",
  },
];

export function LifePhasesScreen() {
  const theme = useTheme();
  const {
    activePhase,
    phases,
    isLoading,
    createPhase,
    setActivePhaseById,
    fetchAllPhases,
  } = useLifePhase();
  const [showModal, setShowModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LifePhaseFormData>({
    resolver: zodResolver(lifePhaseSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Fetch phases on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchAllPhases();
    }, [fetchAllPhases]),
  );

  const onSubmit = async (data: LifePhaseFormData) => {
    const newPhase = await createPhase({
      name: data.name,
      description: data.description,
    });

    if (newPhase) {
      reset();
      setShowModal(false);
      fetchAllPhases();
    }
  };

  const handleSelectPhase = useCallback(
    async (phaseId: string) => {
      await setActivePhaseById(phaseId);
      fetchAllPhases();
    },
    [setActivePhaseById, fetchAllPhases],
  );

  const handleExamplePhase = useCallback(
    (name: string, description: string) => {
      reset({ name, description });
    },
    [reset],
  );

  return (
    <SafeArea>
      <Screen style={[styles.container, { backgroundColor: PAGE_BACKGROUND }]}>
        <AppSideMenu
          visible={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          currentRoute="/life-phases"
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setIsMenuOpen(true)}
            accessible
            accessibilityLabel="Open menu"
          >
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
            Life Phases
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Illustration & Description */}
          <View style={styles.intro}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: PAGE_SURFACE,
                  borderColor: PAGE_BORDER,
                  shadowColor: PAGE_TEXT,
                },
              ]}
            >
              <Text style={styles.iconText}>📅</Text>
            </View>

            <Text
              style={[
                theme.typography.h2,
                {
                  color: PAGE_TEXT,
                  textAlign: "center",
                  marginVertical: theme.spacing.lg,
                  fontFamily: theme.fonts.serif,
                },
              ]}
            >
              Define Your Life Phases
            </Text>

            <Text
              style={[
                theme.typography.body,
                {
                  color: PAGE_MUTED,
                  textAlign: "center",
                  marginBottom: theme.spacing.xl,
                  lineHeight: 24,
                },
              ]}
            >
              Group your entries under one current life phase at a time, helping
              you capture and reflect on the chapter you&apos;re in right now.
            </Text>
          </View>

          {/* Create Button */}
          <Button
            label="+ Create Your First Phase"
            onPress={() => setShowModal(true)}
            variant="secondary"
            accessibilityLabel="Create new life phase button"
            accessibilityHint="Opens form to create a new life phase"
          />

          {/* Active Phase */}
          {activePhase && (
            <View
              style={[
                styles.card,
                styles.activeCard,
                {
                  borderColor: PAGE_BORDER,
                  backgroundColor: PAGE_SURFACE,
                  shadowColor: PAGE_TEXT,
                },
              ]}
            >
              <Text
                style={[
                  theme.typography.labelSm,
                  {
                    color: PAGE_SECONDARY,
                    marginBottom: theme.spacing.sm,
                    letterSpacing: 2,
                  },
                ]}
              >
                CURRENT LIFE PHASE
              </Text>
              <Text
                style={[
                  styles.phaseName,
                  {
                    color: PAGE_TEXT,
                    marginBottom: theme.spacing.xs,
                    fontFamily: theme.fonts.serif,
                  },
                ]}
              >
                {activePhase.name}
              </Text>
              {activePhase.description && (
                <Text
                  style={[
                    theme.typography.bodySm,
                    { color: PAGE_MUTED },
                  ]}
                >
                  {activePhase.description}
                </Text>
              )}
            </View>
          )}

          {/* All Phases */}
          {phases.length > 0 && (
            <View>
              <Text
                style={[
                  theme.typography.labelSm,
                  {
                    color: PAGE_MUTED,
                    marginTop: theme.spacing.xl,
                    marginBottom: theme.spacing.md,
                    letterSpacing: 2.2,
                    textTransform: "uppercase",
                  },
                ]}
              >
                YOUR LIFE PHASES
              </Text>

              <FlatList
                data={phases}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item: phase }) => (
                  <TouchableOpacity
                    style={[
                      styles.phaseCard,
                      {
                        borderColor: PAGE_BORDER,
                        backgroundColor: PAGE_SURFACE,
                        shadowColor: PAGE_TEXT,
                      },
                    ]}
                    onPress={() => handleSelectPhase(phase.id)}
                    accessible
                    accessibilityLabel={`Life phase: ${phase.name}`}
                    accessibilityHint={
                      phase.isActive
                        ? "Currently active"
                        : "Tap to set as active"
                    }
                    accessibilityRole="button"
                  >
                    <View
                      style={[
                        styles.phaseIcon,
                        {
                          backgroundColor: phase.isActive
                            ? PAGE_PRIMARY
                            : PAGE_PRIMARY + "22",
                        },
                      ]}
                    >
                      <Text style={styles.phaseIconText}>📅</Text>
                    </View>
                    <View style={styles.phaseInfo}>
                      <Text
                        style={[
                          styles.phaseName,
                          { color: PAGE_TEXT, fontFamily: theme.fonts.serif },
                        ]}
                      >
                        {phase.name}
                      </Text>
                      {phase.description && (
                        <Text
                          style={[
                            theme.typography.bodySm,
                            {
                              color: PAGE_MUTED,
                              marginTop: theme.spacing.xs,
                            },
                          ]}
                        >
                          {phase.description}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* Example Phases */}
          {phases.length === 0 && (
            <View>
              <Text
                style={[
                  theme.typography.labelSm,
                  {
                    color: PAGE_MUTED,
                    marginTop: theme.spacing.xl,
                    marginBottom: theme.spacing.md,
                    letterSpacing: 2.2,
                    textTransform: "uppercase",
                  },
                ]}
              >
                EXAMPLE LIFE PHASES
              </Text>

              <FlatList
                data={EXAMPLE_PHASES}
                keyExtractor={(item) => item.name}
                scrollEnabled={false}
                renderItem={({ item: example }) => (
                  <TouchableOpacity
                    style={[
                      styles.exampleCard,
                      {
                        borderColor: PAGE_BORDER,
                        backgroundColor: PAGE_SURFACE,
                        shadowColor: PAGE_TEXT,
                      },
                    ]}
                    onPress={() =>
                      handleExamplePhase(example.name, example.description)
                    }
                    accessible
                    accessibilityLabel={`Example: ${example.name}`}
                    accessibilityHint={`${example.description}. Tap to use this as template`}
                    accessibilityRole="button"
                  >
                    <View
                      style={[
                        styles.exampleIcon,
                        {
                          backgroundColor: PAGE_PRIMARY + "22",
                        },
                      ]}
                    >
                      <Text style={styles.exampleIconText}>📅</Text>
                    </View>
                    <View style={styles.exampleInfo}>
                      <Text
                        style={[
                          styles.phaseName,
                          { color: PAGE_TEXT, fontFamily: theme.fonts.serif },
                        ]}
                      >
                        {example.name}
                      </Text>
                      <Text
                        style={[
                          theme.typography.bodySm,
                          {
                            color: PAGE_MUTED,
                            marginTop: theme.spacing.xs,
                          },
                        ]}
                      >
                        {example.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </ScrollView>

        {/* Create Modal */}
        <Modal
          visible={showModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <SafeArea>
            <Screen
              style={[
                styles.modalContainer,
                { backgroundColor: PAGE_BACKGROUND },
              ]}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  accessible
                  accessibilityLabel="Close"
                >
                  <Text
                    style={[theme.typography.h3, { color: PAGE_TEXT }]}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: PAGE_TEXT, fontFamily: theme.fonts.serif },
                  ]}
                >
                  New Life Phase
                </Text>
                <View style={{ width: 40 }} />
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalContent}
              >
                {/* Form */}
                <View style={styles.form}>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Life Phase Name"
                        placeholder="e.g., College Years, New Job"
                        value={value}
                        onChangeText={onChange}
                        error={errors.name?.message}
                        accessibilityLabel="Life phase name input"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Description (Optional)"
                        placeholder="Add details about this life phase..."
                        value={value}
                        onChangeText={onChange}
                        multiline
                        numberOfLines={4}
                        accessibilityLabel="Life phase description input"
                      />
                    )}
                  />
                </View>

                <Button
                  label={isLoading ? "Creating..." : "Create Life Phase"}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading}
                  accessibilityLabel="Create life phase button"
                />
              </ScrollView>
            </Screen>
          </SafeArea>
        </Modal>

        <AppBottomNav currentRoute="/life-phases" />
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
  menuButton: {
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "500",
  },
  pageTitle: {
    fontSize: 40,
    lineHeight: 46,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 230,
  },
  intro: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  iconText: {
    fontSize: 50,
  },
  card: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 22,
    marginTop: 24,
    marginBottom: 32,
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  activeCard: {
    borderWidth: 1,
  },
  phaseCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 22,
    marginBottom: 12,
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  phaseIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  phaseIconText: {
    fontSize: 24,
  },
  phaseInfo: {
    flex: 1,
  },
  exampleCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 22,
    marginBottom: 12,
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  exampleIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  exampleIconText: {
    fontSize: 24,
  },
  exampleInfo: {
    flex: 1,
  },
  form: {
    marginBottom: 20,
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
  modalTitle: {
    fontSize: 34,
    lineHeight: 40,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  phaseName: {
    fontSize: 28,
    lineHeight: 32,
  },
});
