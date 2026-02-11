import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { trpc, trpcReactClient } from "../lib/trpc";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState, Component } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { UserProvider, useUser } from "../contexts/UserContext";
import { SubscriptionProvider, useSubscription } from "../contexts/SubscriptionContext";
import { PersonalizationProvider, usePersonalization } from "../contexts/PersonalizationContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { LanguageProvider } from "../contexts/LanguageContext";
import { TrainingProvider } from "../contexts/TrainingContext";
import LevelUpCelebration from "../components/LevelUpCelebration";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthSubscriptionSync() {
  const { user, isAuthenticated } = useAuth();
  const { setAuthUser } = useSubscription();

  useEffect(() => {
    if (isAuthenticated && user) {
      setAuthUser({ uid: user.uid, displayName: user.displayName, email: user.email });
    } else {
      setAuthUser(null);
    }
  }, [isAuthenticated, user, setAuthUser]);

  return null;
}

function NavigationController({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { onboardingCompleted, hasSeenWelcome, isLoading: userLoading, completeOnboarding, updateProfile, profile } = useUser();
  const { isCompleted: personalizationCompleted, isLoading: personalizationLoading, loadPersonalization, data: personalizationData } = usePersonalization();
  const isMounted = useRef(true);
  const [navigationReady, setNavigationReady] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (navigationState?.key) {
      const timer = setTimeout(() => {
        if (isMounted.current) {
          setNavigationReady(true);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [navigationState?.key]);

  useEffect(() => {
    loadPersonalization();
  }, [loadPersonalization]);

  useEffect(() => {
    const syncPersonalizationToProfile = async () => {
      if (
        isAuthenticated && 
        personalizationCompleted && 
        !onboardingCompleted &&
        personalizationData.position && 
        personalizationData.skillLevel && 
        personalizationData.goals.length > 0 &&
        profile
      ) {
        console.log("Syncing personalization data to user profile");
        if (personalizationData.name) {
          await updateProfile({ name: personalizationData.name });
          console.log("Synced personalization name to profile:", personalizationData.name);
        }
        await completeOnboarding({
          position: personalizationData.position,
          skillLevel: personalizationData.skillLevel,
          goals: personalizationData.goals,
        }, personalizationData.name || undefined);
      }
    };
    
    syncPersonalizationToProfile();
  }, [isAuthenticated, personalizationCompleted, onboardingCompleted, personalizationData, completeOnboarding, updateProfile, profile]);

  useEffect(() => {
    if (!navigationReady) return;
    if (authLoading || userLoading || personalizationLoading || personalizationCompleted === null) return;

    const inPersonalizationGroup = segments[0] === "(personalization)";
    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";
    const inTabsGroup = segments[0] === "(tabs)";
    const currentScreen = segments[0];
    const tabScreen = segments.length > 1 ? segments[1] : "";

    const allowedRootScreens = [
      "paywall",
      "edit-profile",
      "notifications-settings",
      "help-center",
      "privacy-policy",
      "settings",
      "drill-session",
      "modal",
    ];
    const isOnAllowedScreen = allowedRootScreens.includes(currentScreen);

    if (isOnAllowedScreen) {
      console.log("On allowed screen, skipping navigation checks:", currentScreen);
      return;
    }

    const hasFullPersonalization = personalizationData.position && 
                                   personalizationData.skillLevel && 
                                   personalizationData.goals.length > 0;

    console.log("Navigation check:", { 
      isAuthenticated, 
      onboardingCompleted,
      hasSeenWelcome,
      personalizationCompleted,
      hasFullPersonalization,
      currentScreen,
      isOnAllowedScreen,
    });

    const safeNavigate = (path: string) => {
      try {
        if (isMounted.current) {
          console.log("Safe navigating to:", path);
          router.replace(path as any);
        }
      } catch (e) {
        console.log("[NavigationController] Navigation error (will retry):", e);
      }
    };

    if (!personalizationCompleted) {
      if (!inPersonalizationGroup) {
        console.log("Redirecting to personalization start");
        safeNavigate("/(personalization)/start");
      }
    } else if (!isAuthenticated) {
      if (!inAuthGroup) {
        console.log("Redirecting to login");
        safeNavigate("/(auth)/login");
      }
    } else if (!onboardingCompleted && !hasFullPersonalization) {
      if (!inOnboardingGroup) {
        console.log("Redirecting to onboarding");
        safeNavigate("/(onboarding)/position");
      }
    } else if (!hasSeenWelcome && tabScreen !== "welcome-coach") {
      console.log("Redirecting to welcome coach");
      safeNavigate("/(tabs)/welcome-coach");
    } else if (hasSeenWelcome && tabScreen === "welcome-coach") {
      console.log("Redirecting to home");
      safeNavigate("/(tabs)");
    } else if (!inTabsGroup && !isOnAllowedScreen) {
      console.log("Redirecting to tabs");
      safeNavigate("/(tabs)");
    }
  }, [navigationReady, isAuthenticated, onboardingCompleted, hasSeenWelcome, personalizationCompleted, personalizationData, authLoading, userLoading, personalizationLoading, segments, router]);

  return <>{children}</>;
}

function RootLayoutNav() {
  const { colors } = useTheme();
  
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "fade",
      }}
    >
      <Stack.Screen name="(personalization)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
      <Stack.Screen 
        name="paywall" 
        options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="edit-profile" 
        options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="notifications-settings" 
        options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="help-center" 
        options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="privacy-policy" 
        options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="drill-session" 
        options={{ 
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? "light" : "dark"} />;
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SubscriptionProvider>
          <NotificationProvider>
            <PersonalizationProvider>
              <AuthProvider>
                <UserProvider>
                  <TrainingProvider>
                    <AuthSubscriptionSync />
                    <NavigationController>
                      {children}
                    </NavigationController>
                    <LevelUpCelebration />
                  </TrainingProvider>
                </UserProvider>
              </AuthProvider>
            </PersonalizationProvider>
          </NotificationProvider>
        </SubscriptionProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log('[ErrorBoundary] Caught error:', error?.message);
    console.log('[ErrorBoundary] Component stack:', errorInfo?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>Something went wrong</Text>
          <Text style={errorStyles.message}>{this.state.error?.message || 'Unknown error'}</Text>
          <TouchableOpacity
            style={errorStyles.button}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={errorStyles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#0F0F1A',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#A0A0B0',
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#00D084',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppReady(true);
      SplashScreen.hideAsync().catch((e) => {
        console.log('[SplashScreen] hideAsync error (safe to ignore):', e);
      });
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (!appReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F0F1A' }} />
    );
  }

  return (
    <AppErrorBoundary>
      <trpc.Provider client={trpcReactClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppProviders>
              <ThemedStatusBar />
              <RootLayoutNav />
            </AppProviders>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </trpc.Provider>
    </AppErrorBoundary>
  );
}
