import { Tabs } from 'expo-router';
import { Home, Bot, Dumbbell, Video, User } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { BlurView } from 'expo-blur';
import { StyleSheet, View, Platform } from 'react-native';

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          paddingTop: 8,
          height: 85,
        },
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <BlurView
              intensity={Platform.OS === 'ios' ? 80 : 100}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
            <View 
              style={[
                styles.tabBarOverlay, 
                { 
                  backgroundColor: isDark 
                    ? 'rgba(15, 15, 26, 0.75)' 
                    : 'rgba(255, 255, 255, 0.75)',
                  borderTopColor: isDark 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.05)',
                }
              ]} 
            />
          </View>
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700' as const,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.home,
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: t.coach,
          tabBarIcon: ({ color, size }) => <Bot size={size} color={color} />,
          headerTitle: t.coach,
        }}
      />
      <Tabs.Screen
        name="drills"
        options={{
          title: t.drills,
          tabBarIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
          headerTitle: t.drills,
        }}
      />
      <Tabs.Screen
        name="video"
        options={{
          title: t.video,
          tabBarIcon: ({ color, size }) => <Video size={size} color={color} />,
          headerTitle: t.video,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.profile,
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="welcome-coach"
        options={{
          href: null,
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  tabBarOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 0.5,
  },
});
