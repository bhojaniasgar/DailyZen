import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { supabase } from '@/lib/supabase';
import { requestNotificationPermission, scheduleHabitReminder, scheduleWaterReminder, scheduleDailyQuote } from '@/lib/notifications';

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [notificationSettings, setNotificationSettings] = useState({
    tasks: false,
    water: false,
    habits: false,
    quotes: false,
    pomodoro: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotificationSettings();
    }
  }, [user]);

  const loadNotificationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_settings')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error loading notification settings:', error);
        return;
      }

      if (data?.notification_settings) {
        setNotificationSettings(data.notification_settings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationSetting = async (key: string, value: boolean) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_settings: newSettings })
        .eq('id', user?.id);

      if (error) {
        Alert.alert('Error', 'Failed to update notification settings');
        // Revert the change
        setNotificationSettings(notificationSettings);
        return;
      }

      // Request permission if enabling notifications
      if (value) {
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive reminders.'
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      setNotificationSettings(notificationSettings);
    }
  };

  const enableAllNotifications = async () => {
    const allEnabled = {
      tasks: true,
      water: true,
      habits: true,
      quotes: true,
      pomodoro: true,
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_settings: allEnabled })
        .eq('id', user?.id);

      if (error) {
        Alert.alert('Error', 'Failed to update notification settings');
        return;
      }

      setNotificationSettings(allEnabled);
      
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive reminders.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const disableAllNotifications = async () => {
    const allDisabled = {
      tasks: false,
      water: false,
      habits: false,
      quotes: false,
      pomodoro: false,
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_settings: allDisabled })
        .eq('id', user?.id);

      if (error) {
        Alert.alert('Error', 'Failed to update notification settings');
        return;
      }

      setNotificationSettings(allDisabled);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const notificationTypes = [
    {
      key: 'habits',
      title: 'Habit Reminders',
      description: 'Get notified when it\'s time to complete your habits',
      icon: 'target',
    },
    {
      key: 'tasks',
      title: 'Task Deadlines',
      description: 'Never miss important task due dates',
      icon: 'check-square',
    },
    {
      key: 'water',
      title: 'Water Reminders',
      description: 'Stay hydrated with regular water intake reminders',
      icon: 'droplets',
    },
    {
      key: 'quotes',
      title: 'Daily Quotes',
      description: 'Start your day with inspiring quotes',
      icon: 'quote',
    },
    {
      key: 'pomodoro',
      title: 'Pomodoro Timer',
      description: 'Get notified when work sessions and breaks end',
      icon: 'timer',
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loading}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading notification settings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <DynamicIcon name="chevron-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Notifications
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <Card style={styles.quickActionsCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            <Button
              title="Enable All"
              onPress={enableAllNotifications}
              style={[styles.quickActionButton, { flex: 1 }]}
            />
            <Button
              title="Disable All"
              onPress={disableAllNotifications}
              variant="outline"
              style={[styles.quickActionButton, { flex: 1 }]}
            />
          </View>
        </Card>

        {/* Notification Settings */}
        <Card style={styles.settingsCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Notification Types
          </Text>
          
          {notificationTypes.map((notif) => (
            <View key={notif.key} style={styles.notificationRow}>
              <View style={styles.notificationInfo}>
                <View style={[styles.notificationIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                  <DynamicIcon name={notif.icon} size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.notificationDetails}>
                  <Text style={[styles.notificationTitle, { color: theme.colors.text }]}>
                    {notif.title}
                  </Text>
                  <Text style={[styles.notificationDescription, { color: theme.colors.textSecondary }]}>
                    {notif.description}
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationSettings[notif.key as keyof typeof notificationSettings]}
                onValueChange={(value) => updateNotificationSetting(notif.key, value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={notificationSettings[notif.key as keyof typeof notificationSettings] ? theme.colors.primary : theme.colors.textSecondary}
              />
            </View>
          ))}
        </Card>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <DynamicIcon name="bell" size={24} color={theme.colors.accent} />
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
              About Notifications
            </Text>
          </View>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            Notifications help you stay on track with your goals and habits. You can customize which types of reminders you receive and adjust their frequency in each tool's settings.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  quickActionsCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    marginBottom: 0,
  },
  settingsCard: {
    marginBottom: 20,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationDetails: {
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
  infoCard: {
    marginBottom: 40,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});