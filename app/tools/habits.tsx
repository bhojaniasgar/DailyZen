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
import { Habit } from '@/types/global';
import { analytics } from '@/lib/analytics';

export default function HabitsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHabits();
    }
  }, [user]);

  const loadHabits = async () => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        Alert.alert('Error', 'Failed to load habits');
        return;
      }

      setHabits(data || []);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const completeHabit = async (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];

    try {
      // Check if already completed today
      const { data: existing } = await supabase
        .from('habit_entries')
        .select('*')
        .eq('habit_id', habit.id)
        .eq('date', today)
        .single();

      if (existing) {
        Alert.alert('Already Completed', 'You have already completed this habit today!');
        return;
      }

      // Create habit entry
      const { error: entryError } = await supabase
        .from('habit_entries')
        .insert([
          {
            habit_id: habit.id,
            date: today,
            completed: true,
            count: 1,
          },
        ]);

      if (entryError) {
        Alert.alert('Error', 'Failed to complete habit');
        return;
      }

      // Update habit streak
      const newStreak = habit.streak_count + 1;
      const { error: habitError } = await supabase
        .from('habits')
        .update({
          streak_count: newStreak,
          best_streak: Math.max(newStreak, habit.best_streak || 0),
        })
        .eq('id', habit.id);

      if (habitError) {
        Alert.alert('Error', 'Failed to update habit streak');
        return;
      }

      analytics.habitCompleted(habit.id, newStreak);
      loadHabits();
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const createHabit = () => {
    // TODO: Navigate to create habit screen
    Alert.alert('Coming Soon', 'Habit creation screen will be available soon');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loading}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading habits...
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
          Habit Tracker
        </Text>
        <TouchableOpacity onPress={createHabit}>
          <DynamicIcon name="plus" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <DynamicIcon name="target" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No Habits Yet
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
              Create your first habit to start building healthy routines
            </Text>
            <Button
              title="Create Habit"
              onPress={createHabit}
              style={styles.createButton}
            />
          </View>
        ) : (
          <View style={styles.habitsList}>
            {habits.map((habit) => (
              <Card key={habit.id} style={styles.habitCard}>
                <View style={styles.habitHeader}>
                  <View style={styles.habitInfo}>
                    <View style={[styles.habitIcon, { backgroundColor: habit.color + '20' }]}>
                      <DynamicIcon name={habit.icon} size={20} color={habit.color} />
                    </View>
                    <View style={styles.habitDetails}>
                      <Text style={[styles.habitTitle, { color: theme.colors.text }]}>
                        {habit.title}
                      </Text>
                      <Text style={[styles.habitDescription, { color: theme.colors.textSecondary }]}>
                        {habit.description}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.completeButton, { backgroundColor: habit.color }]}
                    onPress={() => completeHabit(habit)}
                  >
                    <DynamicIcon name="check" size={16} color="white" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.habitStats}>
                  <View style={styles.statItem}>
                    <DynamicIcon name="zap" size={16} color={theme.colors.accent} />
                    <Text style={[styles.statText, { color: theme.colors.text }]}>
                      {habit.streak_count} day streak
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <DynamicIcon name="star" size={16} color={theme.colors.warning} />
                    <Text style={[styles.statText, { color: theme.colors.text }]}>
                      Best: {habit.best_streak || 0}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  createButton: {
    marginTop: 20,
  },
  habitsList: {
    paddingBottom: 20,
  },
  habitCard: {
    marginBottom: 16,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitDetails: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 14,
  },
  completeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
  },
});