import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { requestNotificationPermission } from '@/lib/notifications';
import { analytics } from '@/lib/analytics';

interface NotificationSetting {
  key: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const { completeOnboarding } = useAuth();
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      key: 'habits',
      title: 'Habit Reminders',
      description: 'Get notified when it\'s time to complete your habits',
      icon: 'target',
      enabled: false,
    },
    {
      key: 'tasks',
      title: 'Task Deadlines',
      description: 'Never miss important task due dates',
      icon: 'check-square',
      enabled: false,
    },
    {
      key: 'water',
      title: 'Water Reminders',
      description: 'Stay hydrated with regular water intake reminders',
      icon: 'droplets',
      enabled: false,
    },
    {
      key: 'quotes',
      title: 'Daily Quotes',
      description: 'Start your day with inspiring quotes',
      icon: 'quote',
      enabled: false,
    },
  ]);

  const handleToggle = async (key: string) => {
    const currentNotif = notifications.find(n => n.key === key);
    if (!currentNotif?.enabled) {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        // If permission denied, don't enable the notification
        return;
      }
    }
    
    setNotifications(prev => 
      prev.map(notif => 
        notif.key === key ? { ...notif, enabled: !notif.enabled } : notif
      )
    );
  };

  const handleFinish = async () => {
    await completeOnboarding();
    analytics.onboardingCompleted(0);
    // Navigation will be handled by auth state change
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Stay Informed
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Choose which notifications you'd like to receive
        </Text>
      </View>

      <View style={styles.notifications}>
        {notifications.map((notif, index) => (
          <Card key={index} style={styles.notificationCard}>
            <View style={styles.notificationContent}>
              <View style={[styles.notificationIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <DynamicIcon name={notif.icon} size={24} color={theme.colors.primary} />
              </View>
              
              <View style={styles.notificationInfo}>
                <Text style={[styles.notificationTitle, { color: theme.colors.text }]}>
                  {notif.title}
                </Text>
                <Text style={[styles.notificationDescription, { color: theme.colors.textSecondary }]}>
                  {notif.description}
                </Text>
              </View>

              <Switch
                value={notif.enabled}
                onValueChange={() => handleToggle(notif.key)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={notif.enabled ? theme.colors.primary : theme.colors.textSecondary}
              />
            </View>
          </Card>
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          title="Get Started"
          onPress={handleFinish}
          style={styles.finishButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  notifications: {
    flex: 1,
  },
  notificationCard: {
    marginBottom: 16,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingTop: 20,
  },
  finishButton: {
    marginBottom: 20,
  },
});