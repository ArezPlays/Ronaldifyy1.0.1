import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const NOTIFICATION_SETTINGS_KEY = '@ronaldify_notification_settings';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  drillReminders: boolean;
  progressUpdates: boolean;
  coachTips: boolean;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  drillReminders: true,
  progressUpdates: true,
  coachTips: true,
};

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') {
    console.log('Push notifications not supported on web');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission not granted');
      return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    if (!projectId) {
      console.log('No EAS project ID found, skipping push token registration');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    console.log('Push notification token:', token.data);
    return token.data;
  } catch (error) {
    console.log('Error registering for push notifications:', error);
    return null;
  }
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.log('Error saving notification settings:', error);
  }
}

export async function scheduleTrainingReminder(hour: number = 18, minute: number = 0): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);
    
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const secondsUntilTrigger = Math.max(1, Math.floor((scheduledTime.getTime() - now.getTime()) / 1000));

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚽ Time to Train!',
        body: "Your daily training session is waiting. Let's improve your skills!",
        data: { type: 'training_reminder' },
        sound: true,
      },
      trigger: { seconds: secondsUntilTrigger } as Notifications.NotificationTriggerInput,
    });

    console.log('Scheduled training reminder:', identifier);
    return identifier;
  } catch (error) {
    console.log('Error scheduling training reminder:', error);
    return null;
  }
}

export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<string | null> {
  if (Platform.OS === 'web') {
    console.log('Local notification (web):', { title, body });
    return null;
  }

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null,
    });

    console.log('Sent local notification:', identifier);
    return identifier;
  } catch (error) {
    console.log('Error sending local notification:', error);
    return null;
  }
}

export async function notifyDrillCompleted(drillName: string): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.progressUpdates) return;

  await sendLocalNotification(
    '✅ Drill Completed!',
    `Great job completing "${drillName}"! Keep up the momentum.`,
    { type: 'drill_completed', drillName }
  );
}

export async function notifyTrainingPlanCompleted(): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.progressUpdates) return;

  await sendLocalNotification(
    '🏆 Training Plan Complete!',
    "You've finished today's training! Your dedication is paying off.",
    { type: 'plan_completed' }
  );
}

export async function notifyNewAIFeedback(): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.coachTips) return;

  await sendLocalNotification(
    '🤖 New AI Feedback',
    'Your AI coach has new insights for you. Check them out!',
    { type: 'ai_feedback' }
  );
}

export async function notifyVideoAnalysisReady(): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.progressUpdates) return;

  await sendLocalNotification(
    '📹 Video Analysis Ready',
    'Your video has been analyzed. See your personalized feedback now!',
    { type: 'video_analysis' }
  );
}

export async function notifyStreakMilestone(days: number): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.progressUpdates) return;

  await sendLocalNotification(
    `🔥 ${days} Day Streak!`,
    `You've trained ${days} days in a row! Keep the fire burning.`,
    { type: 'streak_milestone', days }
  );
}

export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
