import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Discover your entries & insights</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Entries</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Search & Filter</Text>
            <Text style={styles.cardText}>Find entries by mood, date, tags, or drawers</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organization</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📁 Drawers</Text>
            <Text style={styles.cardText}>Organize related entries into categories</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🏷️ Tags</Text>
            <Text style={styles.cardText}>Label and search entries by topics</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Insights</Text>
            <Text style={styles.cardText}>View your mood trends and patterns</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
