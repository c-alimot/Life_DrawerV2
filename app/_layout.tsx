import { authApi } from "@features/auth/api/auth.api";
import {
  clearOnboardingCompleted,
  getOnboardingCompleted,
} from "@features/auth/utils/onboarding";
import { supabase } from "@services/supabase";
import type { Profile } from "@types";
import { useAuthStore } from "@store";
import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, setLoading } = useAuthStore();
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] =
    useState(false);
  const forceOnboardingOnLocalWeb =
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    window.location.hostname === "localhost";

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") {
      return;
    }

    const { documentElement, body } = document;
    const expoRoot =
      document.getElementById("root") ||
      document.getElementById("__next") ||
      document.querySelector("#root > div");

    const previousHtmlOverflow = documentElement.style.overflow;
    const previousHtmlHeight = documentElement.style.height;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyHeight = body.style.height;
    const previousBodyMinHeight = body.style.minHeight;
    const previousRootHeight =
      expoRoot instanceof HTMLElement ? expoRoot.style.height : "";
    const previousRootMinHeight =
      expoRoot instanceof HTMLElement ? expoRoot.style.minHeight : "";

    documentElement.style.height = "100%";
    documentElement.style.overflow = "auto";
    body.style.height = "auto";
    body.style.minHeight = "100%";
    body.style.overflow = "auto";

    if (expoRoot instanceof HTMLElement) {
      expoRoot.style.height = "auto";
      expoRoot.style.minHeight = "100%";
    }

    return () => {
      documentElement.style.overflow = previousHtmlOverflow;
      documentElement.style.height = previousHtmlHeight;
      body.style.overflow = previousBodyOverflow;
      body.style.height = previousBodyHeight;
      body.style.minHeight = previousBodyMinHeight;

      if (expoRoot instanceof HTMLElement) {
        expoRoot.style.height = previousRootHeight;
        expoRoot.style.minHeight = previousRootMinHeight;
      }
    };
  }, []);

  const mapSessionUserToProfile = (
    sessionUser: {
      id: string;
      email?: string | null;
      user_metadata?: Record<string, unknown>;
      created_at?: string;
      updated_at?: string;
    },
  ): Profile => {
    const displayName =
      typeof sessionUser.user_metadata?.display_name === "string"
        ? sessionUser.user_metadata.display_name
        : undefined;
    const avatarUrl =
      typeof sessionUser.user_metadata?.avatar_url === "string"
        ? sessionUser.user_metadata.avatar_url
        : undefined;

    return {
      id: sessionUser.id,
      email: sessionUser.email || "",
      displayName,
      avatarUrl,
      createdAt: sessionUser.created_at || new Date().toISOString(),
      updatedAt:
        sessionUser.updated_at ||
        sessionUser.created_at ||
        new Date().toISOString(),
    };
  };

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      setLoading(true);

      if (forceOnboardingOnLocalWeb) {
        await Promise.all([
          clearOnboardingCompleted(),
          supabase.auth.signOut(),
        ]);

        if (!isMounted) return;

        setHasCompletedOnboardingState(false);
        setUser(null);
        setLoading(false);
        setIsBootstrapping(false);
        return;
      }

      const [sessionResult, onboardingCompleted] = await Promise.all([
        authApi.getSession(),
        getOnboardingCompleted(),
      ]);

      if (!isMounted) return;

      setHasCompletedOnboardingState(onboardingCompleted);
      setUser(sessionResult.data?.user || null);
      setLoading(false);
      setIsBootstrapping(false);
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      if (!session) {
        setUser(null);
        return;
      }

      setUser(mapSessionUserToProfile(session.user));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [forceOnboardingOnLocalWeb, setLoading, setUser]);

  useEffect(() => {
    if (isBootstrapping) return;

    let isMounted = true;

    const syncRoute = async () => {
      const isAuthRoute =
        pathname === "/intro" ||
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/onboarding";
      const isProtectedRoute = !isAuthRoute;

      if (!user) {
        const onboardingCompleted = await getOnboardingCompleted();

        if (!isMounted) return;

        if (onboardingCompleted !== hasCompletedOnboarding) {
          setHasCompletedOnboardingState(onboardingCompleted);
        }

        if (!onboardingCompleted) {
          if (pathname !== "/onboarding") {
            router.replace("/onboarding");
          }
          return;
        }

        if (pathname === "/onboarding") {
          router.replace("/intro");
          return;
        }

        if (isProtectedRoute) {
          router.replace("/intro");
        }

        return;
      }

      if (isAuthRoute) {
        router.replace("/");
      }
    };

    syncRoute();

    return () => {
      isMounted = false;
    };
  }, [hasCompletedOnboarding, isBootstrapping, pathname, router, user]);

  if (isBootstrapping) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size="large" />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="intro" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
