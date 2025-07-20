import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { supabase } from '@/lib/supabase';
import { WaterEntry } from '@/types/global';
import { analytics } from '@/lib/analytics';
import { useAppStore } from '@/store/appStore';

const waterAmounts = [250, 500, 750, 1000]; // ml

const reminderIntervals = [
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
];

const funnyMessages = [
  "Time to hydrate, superstar! 💧✨",
  "Your body is thirsty for some H2O magic! 🌊",
  "Water time! Your cells are doing a little dance! 💃",
  "Ready for a splash of awesomeness? 🌟",
  "Hydration check! Let's keep that energy flowing! ⚡️",
];

export default function WaterScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { updateTodaysWaterIntake } = useAppStore();
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [reminderInterval, setReminderInterval] = useState(30);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [dailyGoal] = useState(2000); // 2L daily goal

  // Load notification settings from Supabase
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
        setNotificationsEnabled(data.notification_settings.water || false);
        setReminderInterval(data.notification_settings.waterReminderInterval || 30);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const setupNotifications = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert('Permission required', 'Please enable notifications to receive water reminders');
      return false;
    }

    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    return true;
  };

  const scheduleReminder = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    if (!notificationsEnabled) return;

    const message = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

    // Set up notification categories with actions
    await Notifications.setNotificationCategoryAsync('water_reminder', [
      {
        identifier: 'water_250',
        buttonTitle: '250ml',
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
        }
      },
      {
        identifier: 'water_500',
        buttonTitle: '500ml',
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
        }
      },
    ]);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: message,
        body: "How much water did you drink? 💧",
        data: { screen: 'water' },
        categoryIdentifier: 'water_reminder',
      },
      trigger: {
        seconds: reminderInterval * 60,
        repeats: true,
      } as any,
    });
  };

  useEffect(() => {
    if (user) {
      loadTodaysWater();
      loadNotificationSettings();
      setupNotifications();
    }
  }, [user]);

  const updateNotificationSettings = async (enabled: boolean, interval?: number) => {
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

      const currentSettings = data?.notification_settings || {};
      const newSettings = {
        ...currentSettings,
        water: enabled,
        waterReminderInterval: interval || reminderInterval
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ notification_settings: newSettings })
        .eq('id', user?.id);

      if (updateError) {
        Alert.alert('Error', 'Failed to update notification settings');
        return;
      }

      setNotificationsEnabled(enabled);
      if (interval) setReminderInterval(interval);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  useEffect(() => {
    scheduleReminder();
  }, [notificationsEnabled, reminderInterval]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      // If it's a direct tap on notification, navigate to water screen
      if (response.notification.request.content.data?.screen === 'water') {
        router.push('/tools/water');
        return;
      }

      // Handle action button presses
      const actionId = response.actionIdentifier;
      if (actionId === 'water_250') {
        addWaterEntry(250);
      } else if (actionId === 'water_500') {
        addWaterEntry(500);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const loadTodaysWater = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('water_entries')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (error) {
        Alert.alert('Error', 'Failed to load water entries');
        return;
      }

      setWaterEntries(data || []);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addWaterEntry = async (amount: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('water_entries')
        .insert([
          {
            user_id: user?.id,
            amount,
            date: today,
          },
        ]);

      if (error) {
        Alert.alert('Error', 'Failed to add water entry');
        return;
      }

      const newTotal = getTotalWater() + amount;
      analytics.waterLogged(amount, newTotal);
      updateTodaysWaterIntake(amount); // Update global state
      loadTodaysWater();
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const deleteWaterEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('water_entries')
        .delete()
        .eq('id', entryId);

      if (error) {
        Alert.alert('Error', 'Failed to delete water entry');
        return;
      }

      loadTodaysWater();
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const getTotalWater = () => {
    return waterEntries.reduce((total, entry) => total + entry.amount, 0);
  };

  const getProgressPercentage = () => {
    return Math.min((getTotalWater() / dailyGoal) * 100, 100);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 100) return theme.colors.success;
    if (percentage >= 75) return theme.colors.primary;
    if (percentage >= 50) return theme.colors.warning;
    return theme.colors.error;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <DynamicIcon name="chevron-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Water Tracker
          </Text>
          <TouchableOpacity onPress={() => setShowSettings(true)}>
            <DynamicIcon name="bell" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.loading}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading water intake...
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
          Water Tracker
        </Text>
        <TouchableOpacity onPress={() => setShowSettings(true)}>
          <DynamicIcon name="bell" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <DynamicIcon name="droplets" size={32} color={getProgressColor()} />
            <Text style={[styles.progressTitle, { color: theme.colors.text }]}>
              Today's Progress
            </Text>
          </View>
          
          <View style={styles.progressStats}>
            <Text style={[styles.progressAmount, { color: getProgressColor() }]}>
              {getTotalWater()}ml
            </Text>
            <Text style={[styles.progressGoal, { color: theme.colors.textSecondary }]}>
              of {dailyGoal}ml goal
            </Text>
          </View>

          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: getProgressColor(),
                  width: `${getProgressPercentage()}%`
                }
              ]} 
            />
          </View>

          <Text style={[styles.progressPercentage, { color: theme.colors.textSecondary }]}>
            {getProgressPercentage().toFixed(0)}% complete
          </Text>
        </Card>

        {/* Quick Add Buttons */}
        <Card style={styles.quickAddCard}>
          <Text style={[styles.quickAddTitle, { color: theme.colors.text }]}>
            Quick Add
          </Text>
          <View style={styles.quickAddButtons}>
            {waterAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[styles.quickAddButton, { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary }]}
                onPress={() => addWaterEntry(amount)}
              >
                <DynamicIcon name="droplets" size={20} color={theme.colors.primary} />
                <Text style={[styles.quickAddButtonText, { color: theme.colors.primary }]}>
                  {amount}ml
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Tips Card */}
        <Card style={styles.tipsCard}>
          <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>
            Hydration Tips
          </Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <DynamicIcon name="sun" size={16} color={theme.colors.accent} />
              <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                Drink a glass of water when you wake up
              </Text>
            </View>
            <View style={styles.tipItem}>
              <DynamicIcon name="bell" size={16} color={theme.colors.accent} />
              <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                Set reminders every 2 hours
              </Text>
            </View>
            <View style={styles.tipItem}>
              <DynamicIcon name="activity" size={16} color={theme.colors.accent} />
              <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                Drink more during exercise
              </Text>
            </View>
          </View>
        </Card>
            {/* Today's Entries */}
        <Card style={styles.entriesCard}>
          <Text style={[styles.entriesTitle, { color: theme.colors.text }]}>
            Today's Entries
          </Text>
          
          {waterEntries.length === 0 ? (
            <View style={styles.emptyEntries}>
              <Text style={[styles.emptyEntriesText, { color: theme.colors.textSecondary }]}>
                No water logged today
              </Text>
            </View>
          ) : (
            <View style={styles.entriesList}>
              {waterEntries.map((entry) => (
                <View key={entry.id} style={styles.entryItem}>
                  <View style={styles.entryInfo}>
                    <View style={[styles.entryIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                      <DynamicIcon name="droplets" size={16} color={theme.colors.primary} />
                    </View>
                    <View style={styles.entryDetails}>
                      <Text style={[styles.entryAmount, { color: theme.colors.text }]}>
                        {entry.amount}ml
                      </Text>
                      <Text style={[styles.entryTime, { color: theme.colors.textSecondary }]}>
                        {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteWaterEntry(entry.id)}
                  >
                    <DynamicIcon name="trash-2" size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </Card>

      </ScrollView>

      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Reminder Settings
              </Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <DynamicIcon name="x" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Enable Reminders
              </Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={async (value) => {
                  if (value) {
                    const hasPermission = await setupNotifications();
                    if (hasPermission) {
                      await updateNotificationSettings(true);
                    }
                  } else {
                    await updateNotificationSettings(false);
                    await Notifications.cancelAllScheduledNotificationsAsync();
                  }
                }}
              />
            </View>

            {notificationsEnabled && (
              <View style={styles.intervalSelection}>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  Reminder Interval
                </Text>
                <View style={styles.intervalButtons}>
                  {reminderIntervals.map((interval) => (
                    <TouchableOpacity
                      key={interval.value}
                      style={[
                        styles.intervalButton,
                        {
                          backgroundColor:
                            reminderInterval === interval.value
                              ? theme.colors.primary
                              : theme.colors.primary + '20',
                        },
                      ]}
                      onPress={() => updateNotificationSettings(true, interval.value)}
                    >
                      <Text
                        style={[
                          styles.intervalButtonText,
                          {
                            color:
                              reminderInterval === interval.value
                                ? theme.colors.background
                                : theme.colors.primary,
                          },
                        ]}
                      >
                        {interval.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  intervalSelection: {
    gap: 16,
  },
  intervalButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  intervalButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  intervalButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  progressCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  progressStats: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  progressGoal: {
    fontSize: 14,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickAddCard: {
    marginBottom: 20,
  },
  quickAddTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickAddButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAddButton: {
    flex: 1,
    minWidth: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  quickAddButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  entriesCard: {
    marginBottom: 20,
  },
  entriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyEntries: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyEntriesText: {
    fontSize: 16,
  },
  entriesList: {
    gap: 12,
  },
  entryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  entryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  entryDetails: {
    flex: 1,
  },
  entryAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  entryTime: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  tipsCard: {
    marginBottom: 40,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
  },
});