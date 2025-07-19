import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  if (Platform.OS === 'web') {
    // Web notifications require different handling
    return false;
  }
  
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncements: false,
    },
  });
  return status === 'granted';
}

export async function scheduleHabitReminder(habitId: string, title: string, time: string) {
  if (Platform.OS === 'web') return;
  
  const [hours, minutes] = time.split(':').map(Number);
  
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Habit Reminder',
      body: `Time to complete: ${title}`,
      data: { habitId, type: 'habit' },
    },
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true,
    },
  });
}

export async function scheduleWaterReminder(intervalHours: number = 2) {
  if (Platform.OS === 'web') return;
  
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Stay Hydrated! 💧',
      body: 'Time to drink some water',
      data: { type: 'water' },
    },
    trigger: {
      seconds: intervalHours * 3600,
      repeats: true,
    },
  });
}

export async function scheduleDailyQuote() {
  if (Platform.OS === 'web') return;
  
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Daily Motivation ✨',
      body: 'Your daily quote is ready!',
      data: { type: 'quote' },
    },
    trigger: {
      hour: 9,
      minute: 0,
      repeats: true,
    },
  });
}

export async function schedulePomodoroNotification(sessionType: string, duration: number) {
  if (Platform.OS === 'web') return;
  
  const title = sessionType === 'work' ? 'Work Session Complete!' : 'Break Time Over!';
  const body = sessionType === 'work' ? 'Time for a break' : 'Ready for another work session?';
  
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: 'pomodoro', sessionType },
    },
    trigger: {
      seconds: duration * 60, // Convert minutes to seconds
    },
  });
}

export async function cancelNotification(identifier: string) {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

export async function cancelAllNotifications() {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}