import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { X, Bell, Zap, Trophy, MessageSquare, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'training_reminders',
      title: 'Training Reminders',
      description: 'Daily reminders to complete your drills',
      icon: <Calendar size={22} color={Colors.primary} />,
      enabled: true,
    },
    {
      id: 'ai_tips',
      title: 'AI Coach Tips',
      description: 'Personalized tips from your AI coach',
      icon: <Zap size={22} color={Colors.accent} />,
      enabled: true,
    },
    {
      id: 'progress_updates',
      title: 'Progress Updates',
      description: 'Weekly progress and achievements',
      icon: <Trophy size={22} color="#FF6B35" />,
      enabled: true,
    },
    {
      id: 'new_drills',
      title: 'New Drills',
      description: 'When new drills are added',
      icon: <Bell size={22} color={Colors.textSecondary} />,
      enabled: false,
    },
    {
      id: 'community',
      title: 'Community Updates',
      description: 'News and updates from Ronaldify',
      icon: <MessageSquare size={22} color={Colors.textSecondary} />,
      enabled: false,
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.id === id 
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0F1A', '#1A1A2E', '#0F0F1A']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionDescription}>
            Choose which notifications you&apos;d like to receive
          </Text>

          <View style={styles.settingsContainer}>
            {settings.map(setting => (
              <View key={setting.id} style={styles.settingItem}>
                <View style={styles.settingIcon}>{setting.icon}</View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingDescription}>{setting.description}</Text>
                </View>
                <Switch
                  value={setting.enabled}
                  onValueChange={() => toggleSetting(setting.id)}
                  trackColor={{ false: Colors.surface, true: Colors.primary }}
                  thumbColor={Colors.text}
                />
              </View>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Bell size={20} color={Colors.textMuted} />
            <Text style={styles.infoText}>
              You can change these settings anytime. We&apos;ll never spam you with unnecessary notifications.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  settingsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 20,
  },
});
