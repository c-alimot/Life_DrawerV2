import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@styles/theme';
import { useAuthStore } from '@store';
import { Screen, SafeArea } from '@components/layout';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const QUOTES = [
  'Every moment is a fresh beginning.',
  'Write your story, one entry at a time.',
  'Your thoughts matter. Capture them here.',
  'Reflection is the gateway to growth.',
  'In writing, we find ourselves.',
  'Today\'s thoughts, tomorrow\'s wisdom.',
  'Document your journey, cherish your memories.',
  'The best time to write was yesterday. The second best is now.',
];

export function SplashScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { session, fetchSession } = useAuthStore();
  const route = useRoute();

  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const [quote, setQuote] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Select random quote
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(randomQuote);
  }, []);

  useEffect(() => {
    // Animate logo
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate quote
    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 300);
  }, [scaleAnim, opacityAnim, slideAnim]);

  useEffect(() => {
    // Check authentication status
    const initializeApp = async () => {
      try {
        // Verify session is still valid
        const currentSession = await fetchSession();

        // Simulate loading time for smooth transition
        setTimeout(() => {
          setIsLoading(false);

          // Navigate based on auth status
          if (currentSession) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' as any }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' as any }],
            });
          }
        }, 2000); // 2 second splash screen
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLoading(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' as any }],
        });
      }
    };

    initializeApp();
  }, [navigation, fetchSession]);

  return (
    <SafeArea>
      <Screen style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Animated Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.logoBox}>
            <Text style={styles.logo}>📔</Text>
          </View>
        </Animated.View>

        {/* App Title */}
        <Text style={[theme.typography.h1, { color: theme.colors.text, marginTop: 24 }]}>
          Life Drawer
        </Text>

        {/* Subtitle */}
        <Text
          style={[
            theme.typography.bodySm,
            {
              color: theme.colors.textSecondary,
              marginTop: 8,
            },
          ]}
        >
          Journal. Reflect. Grow.
        </Text>

        {/* Animated Quote */}
        <Animated.View
          style={[
            styles.quoteContainer,
            {
              opacity: opacityAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text
            style={[
              theme.typography.body,
              {
                color: theme.colors.textSecondary,
                textAlign: 'center',
                fontStyle: 'italic',
              },
            ]}
          >
            "{quote}"
          </Text>
        </Animated.View>

        {/* Loading Indicator */}
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[
              theme.typography.bodySm,
              {
                color: theme.colors.textSecondary,
                marginTop: 16,
              },
            ]}
          >
            Preparing your journal...
          </Text>
        </View>

        {/* Background Decoration */}
        <View
          style={[
            styles.decoration,
            {
              backgroundColor: theme.colors.primary + '05',
            },
          ]}
        />
      </Screen>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    marginTop: '15%',
  },
  logoBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
  },
  quoteContainer: {
    paddingHorizontal: 32,
    marginVertical: 24,
  },
  loaderContainer: {
    alignItems: 'center',
    marginBottom: '15%',
  },
  decoration: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.3,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
});