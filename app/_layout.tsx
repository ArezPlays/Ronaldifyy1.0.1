import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { trpc, trpcReactClient } from "@/lib/trpc";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState, useCallback, Component } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform } from "react-native";
import { Image } from 'react-native';

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { SubscriptionProvider, useSubscription } from "@/contexts/SubscriptionContext";
import { PersonalizationProvider, usePersonalization } from "@/contexts/PersonalizationContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TrainingProvider } from "@/contexts/TrainingContext";
import LevelUpCelebration from "@/components/LevelUpCelebration";

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
    const tabScreen = (segments as string[])[1] ?? "";

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

function LoadingScreen({ onFinished }: { onFinished: () => void }) {
  const progress = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [displayPercent, setDisplayPercent] = useState(0);
  const { width: screenWidth } = Dimensions.get('window');
  const barWidth = screenWidth - 80;

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(titleTranslateY, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(bottomOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();

    const progressAnim = Animated.timing(progress, {
      toValue: 1,
      duration: 2400,
      useNativeDriver: false,
    });
    progressAnim.start();

    const listenerId = progress.addListener(({ value }) => {
      setDisplayPercent(Math.round(value * 100));
    });

    const finishTimer = setTimeout(() => {
      pulse.stop();
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onFinished();
      });
    }, 2800);

    return () => {
      clearTimeout(finishTimer);
      progress.removeListener(listenerId);
      pulse.stop();
    };
  }, []);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, barWidth],
  });

  return (
    <Animated.View style={[loadStyles.container, { opacity: screenOpacity }]}>
      <StatusBar style="light" />
      <View style={loadStyles.topGlow} />

      <View style={loadStyles.centerContent}>
        <Animated.View style={[
          loadStyles.titleContainer,
          { opacity: titleOpacity, transform: [{ translateY: titleTranslateY }, { scale: pulseAnim }] },
        ]}>
          <View style={loadStyles.ballOuter}>
            <View style={loadStyles.ballGlow} />
            <Text style={loadStyles.ballEmoji}>⚽</Text>
          </View>
          <Text style={loadStyles.title}>Ronaldify</Text>
        </Animated.View>

        <Animated.View style={{ opacity: subtitleOpacity }}>
          <Text style={loadStyles.subtitle}>Train like a pro</Text>
        </Animated.View>
      </View>

      <Animated.View style={[loadStyles.bottomSection, { opacity: bottomOpacity }]}>
        <View style={loadStyles.progressInfo}>
          <Text style={loadStyles.loadingText}>Loading your experience</Text>
          <Text style={loadStyles.percentText}>{displayPercent}%</Text>
        </View>
        <View style={[loadStyles.progressTrack, { width: barWidth }]}> 
          <Animated.View style={[loadStyles.progressFill, { width: progressWidth }]}>
            <View style={loadStyles.progressShine} />
          </Animated.View>
        </View>
        <View style={loadStyles.dotsRow}>
          {['Drills', 'AI Coach', 'Videos'].map((label, i) => (
            <View key={label} style={loadStyles.dotItem}>
              <View style={[
                loadStyles.dot,
                displayPercent > (i + 1) * 30 && loadStyles.dotActive,
              ]} />
              <Text style={[
                loadStyles.dotLabel,
                displayPercent > (i + 1) * 30 && loadStyles.dotLabelActive,
              ]}>{label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const loadStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topGlow: {
    position: 'absolute',
    top: -120,
    left: '50%',
    marginLeft: -200,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(0, 200, 83, 0.06)',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ballOuter: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  ballGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 200, 83, 0.12)',
  },
  ballEmoji: {
    fontSize: 58,
  },

  title: {
    fontSize: 42,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B6B80',
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
    fontWeight: '500' as const,
  },
  bottomSection: {
    paddingBottom: Platform.OS === 'web' ? 48 : 64,
    width: '100%',
    alignItems: 'center',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 40,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#6B6B80',
    fontWeight: '500' as const,
  },
  percentText: {
    fontSize: 13,
    color: '#00C853',
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#1A1A2E',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00C853',
    borderRadius: 2,
    position: 'relative',
  },
  progressShine: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 20,
  },
  dotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2A2A40',
  },
  dotActive: {
    backgroundColor: '#00C853',
  },
  dotLabel: {
    fontSize: 12,
    color: '#3A3A50',
    fontWeight: '500' as const,
  },
  dotLabelActive: {
    color: '#A0A0B0',
  },
});

export default function RootLayout() {
  const [showLoading, setShowLoading] = useState(true);
  const appFadeIn = useRef(new Animated.Value(0)).current;

  const handleLoadingFinished = useCallback(() => {
    setShowLoading(false);
    Animated.timing(appFadeIn, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0F1A' }}>
      {showLoading && <LoadingScreen onFinished={handleLoadingFinished} />}
      {!showLoading && (
        <Animated.View style={{ flex: 1, opacity: appFadeIn }}>
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
        </Animated.View>
      )}
    </View>
  );
}
