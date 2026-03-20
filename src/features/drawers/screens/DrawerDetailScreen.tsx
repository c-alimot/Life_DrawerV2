import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useTheme } from '@styles/theme';
import { useDrawerDetail } from '../hooks/useDrawerDetail';
import { useEditDrawer } from '../hooks/useEditDrawer';
import { useEntries } from '@features/entries/hooks/useEntries';
import { MOOD_MAP, type MoodValue } from '@constants/moods';
import { Screen, SafeArea } from '@components/layout';
import { Button } from '@components/ui';

export function DrawerDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { drawerId } = route.params as { drawerId: string };

  const { drawer, isLoading: drawerLoading, fetchDrawer, deleteDrawer } =
    useDrawerDetail(drawerId);
  const { isLoading: updateLoading, updateDrawer } = useEditDrawer(drawerId);
  const { entries, isLoading: entriesLoading } = useEntries();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  useFocusEffect(
    useCallback(() => {
      fetchDrawer();
    }, [fetchDrawer])
  );

  // Initialize edit form
  useFocusEffect(
    useCallback(() => {
      if (drawer) {
        setEditName(drawer.name);
        setEditColor(drawer.color);
      }
    }, [drawer])
  );

  // Get entries in this drawer
  const drawerEntries = entries?.filter((entry) =>
    entry.drawers?.some((d) => d.id === drawerId)
  ) || [];

  // Sort entries
  const sortedEntries = [...drawerEntries].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  const handleEdit = useCallback(async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Drawer name cannot be empty');
      return;
    }

    const success = await updateDrawer({
      name: editName,
      color: editColor,
    });

    if (success) {
      Alert.alert('Success', 'Drawer updated');
      setShowEditModal(false);
      fetchDrawer();
    } else {
      Alert.alert('Error', 'Failed to update drawer');
    }
  }, [editName, editColor, updateDrawer, fetchDrawer]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Drawer',
      `Are you sure you want to delete "${drawer?.name}"? Entries will not be deleted.`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            const success = await deleteDrawer();
            if (success) {
              Alert.alert('Success', 'Drawer deleted');
              navigation.goBack();
            } else {
              Alert.alert('Error', 'Failed to delete drawer');
            }
          },
          style: 'destructive',
        },
      ]
    );
  }, [drawer?.name, deleteDrawer, navigation]);

  const handleEntryPress = useCallback(
    (entryId: string) => {
      navigation.navigate('EntryDetail', { entryId } as any);
    },
    [navigation]
  );

  const handleCreateEntry = useCallback(() => {
    navigation.navigate('CreateEntry', { drawerId } as any);
  }, [navigation, drawerId]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const colorOptions = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
  ];

  if (drawerLoading) {
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

  if (!drawer) {
    return (
      <SafeArea>
        <Screen style={styles.container}>
          <View style={styles.loaderContainer}>
            <Text style={[theme.typography.body, { color: theme.colors.text }]}>
              Drawer not found
            </Text>
          </View>
        </Screen>
      </SafeArea>
    );
  }

  return (
    <SafeArea>
      <Screen style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} accessible accessibilityLabel="Go back">
            <Text style={[theme.typography.h2, { color: theme.colors.text }]}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <Button
              label="Edit"
              onPress={() => setShowEditModal(true)}
              size="sm"
              accessibilityLabel="Edit drawer"
            />
            <TouchableOpacity
              onPress={handleDelete}
              accessible
              accessibilityLabel="Delete drawer"
              style={{ marginLeft: theme.spacing.sm }}
            >
              <Text style={[theme.typography.body, { color: theme.colors.error }]}>
                🗑️
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Drawer Info Card */}
          <View
            style={[
              styles.drawerInfoCard,
              {
                backgroundColor: drawer.color + '20',
                borderColor: drawer.color,
              },
            ]}
          >
            <View style={styles.drawerIcon}>
              <Text style={{ fontSize: 40 }}>📁</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                {drawer.name}
              </Text>
              <Text
                style={[
                  theme.typography.bodySm,
                  { color: theme.colors.textSecondary, marginTop: 4 },
                ]}
              >
                {drawerEntries.length} {drawerEntries.length === 1 ? 'entry' : 'entries'}
              </Text>
            </View>
            <View
              style={[
                styles.colorDot,
                { backgroundColor: drawer.color },
              ]}
            />
          </View>

          {/* Create Entry Button */}
          <Button
            label="+ Add Entry to Drawer"
            onPress={handleCreateEntry}
            style={{ marginVertical: theme.spacing.lg }}
            accessibilityLabel="Create entry in this drawer"
          />

          {/* Sort Options */}
          <View style={styles.sortBar}>
            <Text
              style={[
                theme.typography.labelSm,
                { color: theme.colors.textSecondary },
              ]}
            >
              Sort by:
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => setSortBy('date')}
                style={[
                  styles.sortButton,
                  {
                    backgroundColor:
                      sortBy === 'date' ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                accessible
                accessibilityLabel="Sort by date"
                accessibilityRole="button"
              >
                <Text
                  style={[
                    theme.typography.bodySm,
                    {
                      color:
                        sortBy === 'date'
                          ? theme.colors.background
                          : theme.colors.text,
                    },
                  ]}
                >
                  Date
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSortBy('title')}
                style={[
                  styles.sortButton,
                  {
                    backgroundColor:
                      sortBy === 'title'
                        ? theme.colors.primary
                        : theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                accessible
                accessibilityLabel="Sort by title"
                accessibilityRole="button"
              >
                <Text
                  style={[
                    theme.typography.bodySm,
                    {
                      color:
                        sortBy === 'title'
                          ? theme.colors.background
                          : theme.colors.text,
                    },
                  ]}
                >
                  Title
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Entries List */}
          {sortedEntries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text
                style={[
                  theme.typography.h3,
                  { color: theme.colors.textSecondary },
                ]}
              >
                No entries yet
              </Text>
              <Text
                style={[
                  theme.typography.body,
                  {
                    color: theme.colors.textSecondary,
                    marginTop: theme.spacing.md,
                    textAlign: 'center',
                  },
                ]}
              >
                Create your first entry in this drawer
              </Text>
            </View>
          ) : (
            <FlatList
              data={sortedEntries}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.entryCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => handleEntryPress(item.id)}
                  accessible
                  accessibilityLabel={`Entry: ${item.title}`}
                  accessibilityRole="button"
                >
                  <View style={styles.entryHeader}>
                    <View style={{ flex: 1 }}>
                      <Text
                        numberOfLines={1}
                        style={[
                          theme.typography.h4,
                          { color: theme.colors.text },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          theme.typography.labelXs,
                          {
                            color: theme.colors.textSecondary,
                            marginTop: 4,
                          },
                        ]}
                      >
                        {new Date(item.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                      </Text>
                    </View>
                    {item.mood && (
                      <Text style={{ fontSize: 24, marginLeft: 8 }}>
                        {MOOD_MAP[item.mood as MoodValue]?.emoji}
                      </Text>
                    )}
                  </View>

                  <Text
                    numberOfLines={2}
                    style={[
                      theme.typography.bodySm,
                      {
                        color: theme.colors.textSecondary,
                        marginVertical: theme.spacing.sm,
                      },
                    ]}
                  >
                    {item.content}
                  </Text>

                  {/* Entry Metadata */}
                  <View style={styles.entryMeta}>
                    {item.images && item.images.length > 0 && (
                      <Text style={[theme.typography.labelXs, { color: theme.colors.primary }]}>
                        🖼️ {item.images.length}
                      </Text>
                    )}
                    {item.audioUrl && (
                      <Text style={[theme.typography.labelXs, { color: theme.colors.primary }]}>
                        🎙️
                      </Text>
                    )}
                    {item.location && (
                      <Text style={[theme.typography.labelXs, { color: theme.colors.primary }]}>
                        📍
                      </Text>
                    )}
                  </View>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: theme.spacing.sm }}>
                      {item.tags.slice(0, 3).map((tag) => (
                        <View
                          key={tag.id}
                          style={[
                            styles.tagBadge,
                            {
                              backgroundColor: tag.color + '30',
                              borderColor: tag.color,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              theme.typography.labelXs,
                              { color: tag.color },
                            ]}
                          >
                            {tag.name}
                          </Text>
                        </View>
                      ))}
                      {item.tags.length > 3 && (
                        <Text
                          style={[
                            theme.typography.labelXs,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          +{item.tags.length - 3}
                        </Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.entriesList}
            />
          )}
        </ScrollView>

        {/* Edit Modal */}
        <Modal
          visible={showEditModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowEditModal(false)}
        >
          <SafeArea>
            <Screen
              style={[
                styles.modalContainer,
                { backgroundColor: theme.colors.background } as any,
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[theme.typography.h2, { color: theme.colors.text }]}>
                  Edit Drawer
                </Text>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  accessible
                  accessibilityLabel="Close"
                >
                  <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalContent}
              >
                {/* Name Input */}
                <View style={{ marginBottom: theme.spacing.lg }}>
                  <Text
                    style={[
                      theme.typography.labelSm,
                      {
                        color: theme.colors.textSecondary,
                        marginBottom: theme.spacing.sm,
                      },
                    ]}
                  >
                    Drawer Name
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderColor: theme.colors.border,
                        color: theme.colors.text,
                      },
                    ]}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Enter drawer name"
                    placeholderTextColor={theme.colors.textSecondary}
                    accessibilityLabel="Drawer name"
                  />
                </View>

                {/* Color Picker */}
                <View>
                  <Text
                    style={[
                      theme.typography.labelSm,
                      {
                        color: theme.colors.textSecondary,
                        marginBottom: theme.spacing.md,
                      },
                    ]}
                  >
                    Color
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
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
                              editColor === color
                                ? theme.colors.primary
                                : 'transparent',
                            borderWidth: editColor === color ? 3 : 0,
                          },
                        ]}
                        accessible
                        accessibilityLabel={`Color ${color}`}
                        accessibilityRole="button"
                      >
                        {editColor === color && (
                          <Text style={{ fontSize: 20 }}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Save Button */}
                <Button
                  label={updateLoading ? 'Saving...' : 'Save Changes'}
                  onPress={handleEdit}
                  disabled={updateLoading}
                  accessibilityLabel="Save drawer changes"
                />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 40,
  },
  drawerInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  drawerIcon: {
    marginRight: 12,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 12,
  },
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  entriesList: {
    paddingBottom: 20,
  },
  entryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  entryMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: 300,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  colorOption: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});