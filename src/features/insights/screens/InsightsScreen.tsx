import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { useTheme } from '@styles/theme';
import { useEntries } from '@features/entries/hooks/useEntries';
import { MOOD_MAP, MOOD_VALUES, type MoodValue } from '@constants/moods';
import { Screen, SafeArea } from '@components/layout';

type TimeRange = 'week' | 'month' | 'all';

export function InsightsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { entries, isLoading, fetchEntries } = useEntries();

  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [fetchEntries])
  );

  // Calculate date range
  const getDateRange = useCallback(
    (range: TimeRange) => {
      const now = new Date();
      let startDate = new Date();

      if (range === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (range === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else {
        startDate = new Date(0); // All time
      }

      return startDate;
    },
    []
  );

  // Filter entries by time range
  const filteredEntries = useMemo(() => {
    if (!entries) return [];
    const startDate = getDateRange(timeRange);
    return entries.filter((entry) => new Date(entry.createdAt) >= startDate);
  }, [entries, timeRange, getDateRange]);

  // Mood distribution
  const moodDistribution = useMemo(() => {
    const distribution: Record<MoodValue, number> = {} as Record<MoodValue, number>;

    MOOD_VALUES.forEach((mood) => {
      distribution[mood] = 0;
    });

    filteredEntries.forEach((entry) => {
      if (entry.mood) {
        distribution[entry.mood as MoodValue]++;
      }
    });

    return distribution;
  }, [filteredEntries]);

  // Entry frequency (by day of week)
  const entryFrequency = useMemo(() => {
    const frequency = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };

    filteredEntries.forEach((entry) => {
      const date = new Date(entry.createdAt);
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
        date.getDay()
      ];
      frequency[day as keyof typeof frequency]++;
    });

    return frequency;
  }, [filteredEntries]);

  // Tag frequency
  const tagFrequency = useMemo(() => {
    const tagMap: Record<string, { name: string; count: number; color: string }> =
      {};

    filteredEntries.forEach((entry) => {
      entry.tags?.forEach((tag) => {
        if (!tagMap[tag.id]) {
          tagMap[tag.id] = { name: tag.name, count: 0, color: tag.color };
        }
        tagMap[tag.id].count++;
      });
    });

    return Object.values(tagMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredEntries]);

  // Drawer frequency
  const drawerFrequency = useMemo(() => {
    const drawerMap: Record<
      string,
      { name: string; count: number; color: string }
    > = {};

    filteredEntries.forEach((entry) => {
      entry.drawers?.forEach((drawer) => {
        if (!drawerMap[drawer.id]) {
          drawerMap[drawer.id] = {
            name: drawer.name,
            count: 0,
            color: drawer.color,
          };
        }
        drawerMap[drawer.id].count++;
      });
    });

    return Object.values(drawerMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredEntries]);

  // Statistics
  const stats = useMemo(() => {
    const totalEntries = filteredEntries.length;
    const entriesWithAudio = filteredEntries.filter((e) => e.audioUrl).length;
    const entriesWithImages = filteredEntries.filter(
      (e) => e.images && e.images.length > 0
    ).length;
    const totalImages = filteredEntries.reduce(
      (sum, e) => sum + (e.images?.length || 0),
      0
    );
    const avgWordsPerEntry = Math.round(
      filteredEntries.reduce((sum, e) => sum + e.content.split(' ').length, 0) /
        (totalEntries || 1)
    );

    return {
      totalEntries,
      entriesWithAudio,
      entriesWithImages,
      totalImages,
      avgWordsPerEntry,
    };
  }, [filteredEntries]);

  // Most common mood
  const mostCommonMood = useMemo(() => {
    let maxMood: MoodValue | null = null;
    let maxCount = 0;

    Object.entries(moodDistribution).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxMood = mood as MoodValue;
      }
    });

    return maxMood;
  }, [moodDistribution]);

  // Writing streak
  const writingStreak = useMemo(() => {
    const dates = new Set(
      filteredEntries.map((e) =>
        new Date(e.createdAt).toLocaleDateString()
      )
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    while (dates.has(currentDate.toLocaleDateString())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }, [filteredEntries]);

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

  const maxMoodCount = Math.max(...Object.values(moodDistribution), 1);
  const maxFrequency = Math.max(...Object.values(entryFrequency), 1);
  const maxTagCount = Math.max(...tagFrequency.map((t) => t.count), 1);
  const maxDrawerCount = Math.max(...drawerFrequency.map((d) => d.count), 1);

  return (
    <SafeArea>
      <Screen style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[theme.typography.h2, { color: theme.colors.text }]}>
            Insights
          </Text>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeSelector}>
          {(['week', 'month', 'all'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              onPress={() => setTimeRange(range)}
              style={[
                styles.timeRangeButton,
                {
                  backgroundColor:
                    timeRange === range ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              accessible
              accessibilityLabel={`Last ${range}`}
              accessibilityRole="button"
            >
              <Text
                style={[
                  theme.typography.bodySm,
                  {
                    color:
                      timeRange === range
                        ? theme.colors.background
                        : theme.colors.text,
                  },
                ]}
              >
                Last {range === 'all' ? 'All Time' : range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Quick Stats */}
          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <Text
                style={[
                  theme.typography.h3,
                  { color: theme.colors.primary, marginBottom: 4 },
                ]}
              >
                {stats.totalEntries}
              </Text>
              <Text style={[theme.typography.labelSm, { color: theme.colors.textSecondary }]}>
                Entries
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <Text
                style={[
                  theme.typography.h3,
                  { color: theme.colors.primary, marginBottom: 4 },
                ]}
              >
                {stats.avgWordsPerEntry}
              </Text>
              <Text style={[theme.typography.labelSm, { color: theme.colors.textSecondary }]}>
                Avg Words
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <Text
                style={[
                  theme.typography.h3,
                  { color: theme.colors.primary, marginBottom: 4 },
                ]}
              >
                {writingStreak}
              </Text>
              <Text style={[theme.typography.labelSm, { color: theme.colors.textSecondary }]}>
                Day Streak
              </Text>
            </View>
          </View>

          {/* Mood Distribution */}
          <View style={styles.section}>
            <Text
              style={[
                theme.typography.h3,
                {
                  color: theme.colors.text,
                  marginBottom: theme.spacing.md,
                },
              ]}
            >
              📊 Mood Distribution
            </Text>

            {mostCommonMood && (
              <View
                style={[
                  styles.highlightCard,
                  {
                    backgroundColor: theme.colors.primary + '10',
                    borderColor: theme.colors.primary,
                  },
                ]}
              >
                <Text style={[theme.typography.labelSm, { color: theme.colors.primary }]}>
                  Most Common Mood
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <Text style={{ fontSize: 32, marginRight: 12 }}>
                    {MOOD_MAP[mostCommonMood].emoji}
                  </Text>
                  <View>
                    <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                      {MOOD_MAP[mostCommonMood].label}
                    </Text>
                    <Text
                      style={[
                        theme.typography.bodySm,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {moodDistribution[mostCommonMood]} entries
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: theme.spacing.md,
              }}
            >
              {MOOD_VALUES.map((mood) => {
                const count = moodDistribution[mood];
                const barHeight = (count / maxMoodCount) * 80;

                return (
                  <View
                    key={mood}
                    style={{
                      alignItems: 'center',
                      flex: 0,
                      width: '18%',
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 80,
                        backgroundColor: theme.colors.surface,
                        borderRadius: 8,
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      }}
                    >
                      <View
                        style={[
                          {
                            width: '100%',
                            height: barHeight,
                            backgroundColor: theme.colors.primary,
                            borderRadius: 6,
                          },
                        ]}
                      />
                    </View>
                    <Text style={{ fontSize: 16, marginTop: 8 }}>
                      {MOOD_MAP[mood].emoji}
                    </Text>
                    <Text
                      style={[
                        theme.typography.labelXs,
                        { color: theme.colors.textSecondary, marginTop: 4 },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Entry Frequency */}
          <View style={styles.section}>
            <Text
              style={[
                theme.typography.h3,
                {
                  color: theme.colors.text,
                  marginBottom: theme.spacing.md,
                },
              ]}
            >
              📅 Entry Frequency
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 4,
              }}
            >
              {Object.entries(entryFrequency).map(([day, count]) => {
                const barHeight = (count / maxFrequency) * 100;

                return (
                  <View
                    key={day}
                    style={{
                      alignItems: 'center',
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: '100%',
                        height: 100,
                        backgroundColor: theme.colors.surface,
                        borderRadius: 8,
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      }}
                    >
                      <View
                        style={{
                          width: '100%',
                          height: barHeight,
                          backgroundColor: theme.colors.primary,
                          borderRadius: 6,
                        }}
                      />
                    </View>
                    <Text
                      style={[
                        theme.typography.labelSm,
                        {
                          color: theme.colors.textSecondary,
                          marginTop: 8,
                        },
                      ]}
                    >
                      {day}
                    </Text>
                    <Text
                      style={[
                        theme.typography.labelXs,
                        { color: theme.colors.primary, marginTop: 2 },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Media Stats */}
          <View style={styles.section}>
            <Text
              style={[
                theme.typography.h3,
                {
                  color: theme.colors.text,
                  marginBottom: theme.spacing.md,
                },
              ]}
            >
              📸 Media Statistics
            </Text>

            <View style={{ gap: 12 }}>
              <View
                style={[
                  styles.statRow,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <View>
                  <Text style={[theme.typography.body, { color: theme.colors.text }]}>
                    🖼️ Entries with Images
                  </Text>
                  <Text
                    style={[
                      theme.typography.bodySm,
                      { color: theme.colors.textSecondary, marginTop: 4 },
                    ]}
                  >
                    {stats.totalImages} total images
                  </Text>
                </View>
                <Text
                  style={[
                    theme.typography.h3,
                    { color: theme.colors.primary },
                  ]}
                >
                  {stats.entriesWithImages}
                </Text>
              </View>

              <View
                style={[
                  styles.statRow,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <View>
                  <Text style={[theme.typography.body, { color: theme.colors.text }]}>
                    🎙️ Entries with Audio
                  </Text>
                  <Text
                    style={[
                      theme.typography.bodySm,
                      { color: theme.colors.textSecondary, marginTop: 4 },
                    ]}
                  >
                    Voice recorded entries
                  </Text>
                </View>
                <Text
                  style={[
                    theme.typography.h3,
                    { color: theme.colors.primary },
                  ]}
                >
                  {stats.entriesWithAudio}
                </Text>
              </View>
            </View>
          </View>

          {/* Top Tags */}
          {tagFrequency.length > 0 && (
            <View style={styles.section}>
              <Text
                style={[
                  theme.typography.h3,
                  {
                    color: theme.colors.text,
                    marginBottom: theme.spacing.md,
                  },
                ]}
              >
                🏷️ Top Tags
              </Text>

              {tagFrequency.map((tag, index) => {
                const barWidth = (tag.count / maxTagCount) * 100;

                return (
                  <View
                    key={tag.name}
                    style={{
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 6,
                      }}
                    >
                      <Text
                        style={[
                          theme.typography.bodySm,
                          { color: theme.colors.text },
                        ]}
                      >
                        {tag.name}
                      </Text>
                      <Text
                        style={[
                          theme.typography.bodySm,
                          { color: theme.colors.primary },
                        ]}
                      >
                        {tag.count}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: '100%',
                        height: 8,
                        backgroundColor: theme.colors.surface,
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          width: `${barWidth}%`,
                          height: '100%',
                          backgroundColor: tag.color,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Top Drawers */}
          {drawerFrequency.length > 0 && (
            <View style={styles.section}>
              <Text
                style={[
                  theme.typography.h3,
                  {
                    color: theme.colors.text,
                    marginBottom: theme.spacing.md,
                  },
                ]}
              >
                📁 Most Used Drawers
              </Text>

              {drawerFrequency.map((drawer) => {
                const barWidth = (drawer.count / maxDrawerCount) * 100;

                return (
                  <View
                    key={drawer.name}
                    style={{
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 6,
                      }}
                    >
                      <Text
                        style={[
                          theme.typography.bodySm,
                          { color: theme.colors.text },
                        ]}
                      >
                        {drawer.name}
                      </Text>
                      <Text
                        style={[
                          theme.typography.bodySm,
                          { color: theme.colors.primary },
                        ]}
                      >
                        {drawer.count}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: '100%',
                        height: 8,
                        backgroundColor: theme.colors.surface,
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          width: `${barWidth}%`,
                          height: '100%',
                          backgroundColor: drawer.color,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Empty State */}
          {stats.totalEntries === 0 && (
            <View style={styles.emptyContainer}>
              <Text
                style={[
                  theme.typography.h3,
                  { color: theme.colors.textSecondary },
                ]}
              >
                No data yet
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
                Create some entries to see your insights
              </Text>
            </View>
          )}
        </ScrollView>
      </Screen>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  highlightCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
});