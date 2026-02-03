import { useState, useEffect, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Platform } from 'react-native';
import {
  registerForPushNotifications,
  getNotificationSettings,
  saveNotificationSettings,
  scheduleTrainingReminder,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  NotificationSettings,
} from '@/lib/notifications';

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    drillReminders: true,
    progressUpdates: true,
    coachTips: true,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeNotifications();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const receivedSubscription = addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    const responseSubscription = addNotificationResponseListener(response => {
      console.log('Notification response:', response);
      const data = response.notification.request.content.data;
      handleNotificationAction(data);
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      const [token, savedSettings] = await Promise.all([
        registerForPushNotifications(),
        getNotificationSettings(),
      ]);

      setPushToken(token);
      setSettings(savedSettings);

      if (savedSettings.enabled && savedSettings.drillReminders) {
        await scheduleTrainingReminder(18, 0);
      }

      setIsInitialized(true);
      console.log('Notifications initialized:', { token, settings: savedSettings });
    } catch (error) {
      console.log('Error initializing notifications:', error);
      setIsInitialized(true);
    }
  };

  const handleNotificationAction = (data: Record<string, unknown>) => {
    const type = data.type as string;
    console.log('Handling notification action:', type);
  };

  const updateSettings = useCallback(async (updates: Partial<NotificationSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await saveNotificationSettings(newSettings);

    if (newSettings.enabled && newSettings.drillReminders) {
      await scheduleTrainingReminder(18, 0);
    }

    console.log('Notification settings updated:', newSettings);
  }, [settings]);

  const requestPermission = useCallback(async () => {
    const token = await registerForPushNotifications();
    setPushToken(token);
    return token !== null;
  }, []);

  return {
    pushToken,
    settings,
    isInitialized,
    updateSettings,
    requestPermission,
  };
});
