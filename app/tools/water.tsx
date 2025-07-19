import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { supabase } from '@/lib/supabase';
import { WaterEntry } from '@/types/global';
import { analytics } from '@/lib/analytics';

const waterAmounts = [250, 500, 750, 1000]; // ml

export default function WaterScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyGoal] = useState(2000); // 2L daily goal

  useEffect(() => {
    if (user) {
      loadTodaysWater();
    }
  }, [user]);

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
        <View style={{ width: 24 }} />
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