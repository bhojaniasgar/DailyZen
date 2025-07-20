import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { supabase } from '@/lib/supabase';
import { Habit, HabitEntry } from '@/types/global';
import { analytics } from '@/lib/analytics';

const habitIcons = ['target', 'heart', 'zap', 'star', 'coffee', 'book', 'activity', 'sun'];
const habitColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

export default function HabitsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<Record<string, HabitEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState({
    title: '',
    description: '',
    icon: 'target',
    color: '#3B82F6',
    frequency: 'daily' as 'daily' | 'weekly' | 'custom',
    target_count: 1,
  });

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

      const loadedHabits = data || [];
      setHabits(loadedHabits);

      // Load habit entries for each habit
      if (loadedHabits.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        });

        const entriesPromises = loadedHabits.map(async (habit) => {
          const { data: entries } = await supabase
            .from('habit_entries')
            .select('*')
            .eq('habit_id', habit.id)
            .in('date', last7Days)
            .order('date', { ascending: false });
          
          return { habitId: habit.id, entries: entries || [] };
        });

        const entriesResults = await Promise.all(entriesPromises);
        const entriesMap: Record<string, HabitEntry[]> = {};
        entriesResults.forEach(({ habitId, entries }) => {
          entriesMap[habitId] = entries;
        });
        setHabitEntries(entriesMap);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async () => {
    if (!newHabit.title.trim()) {
      Alert.alert('Error', 'Please enter a habit title');
      return;
    }

    try {
      const { error } = await supabase
        .from('habits')
        .insert([
          {
            user_id: user?.id,
            title: newHabit.title.trim(),
            description: newHabit.description.trim(),
            icon: newHabit.icon,
            color: newHabit.color,
            frequency: newHabit.frequency,
            target_count: newHabit.target_count,
            streak_count: 0,
            best_streak: 0,
            reminder_enabled: true,
          },
        ]);

      if (error) {
        Alert.alert('Error', 'Failed to add habit');
        return;
      }

      setNewHabit({
        title: '',
        description: '',
        icon: 'target',
        color: '#3B82F6',
        frequency: 'daily',
        target_count: 1,
      });
      setShowAddForm(false);
      loadHabits();
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const completeHabit = async (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];

    try {
      // Check if already completed today
      const existingEntries = habitEntries[habit.id] || [];
      const todayEntry = existingEntries.find(entry => entry.date === today);

      if (todayEntry) {
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

  const deleteHabit = async (habitId: string) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit? This will also delete all associated entries.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('habits')
                .delete()
                .eq('id', habitId);

              if (error) {
                Alert.alert('Error', 'Failed to delete habit');
                return;
              }

              loadHabits();
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  const isCompletedToday = (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];
    const entries = habitEntries[habit.id] || [];
    return entries.some(entry => entry.date === today && entry.completed);
  };

  const getWeeklyProgress = (habit: Habit) => {
    const entries = habitEntries[habit.id] || [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const entry = entries.find(e => e.date === date);
      return entry?.completed || false;
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <DynamicIcon name="chevron-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Habit Tracker
          </Text>
          <View style={{ width: 24 }} />
        </View>
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
        <TouchableOpacity onPress={() => setShowAddForm(true)}>
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
              onPress={() => setShowAddForm(true)}
              style={styles.createButton}
            />
          </View>
        ) : (
          <View style={styles.habitsList}>
            {habits.map((habit) => {
              const weeklyProgress = getWeeklyProgress(habit);
              const completedToday = isCompletedToday(habit);
              
              return (
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
                        {habit.description && (
                          <Text style={[styles.habitDescription, { color: theme.colors.textSecondary }]}>
                            {habit.description}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.habitActions}>
                      <TouchableOpacity
                        style={[
                          styles.completeButton, 
                          { 
                            backgroundColor: completedToday ? habit.color : habit.color + '20',
                            borderColor: habit.color 
                          }
                        ]}
                        onPress={() => completeHabit(habit)}
                        disabled={completedToday}
                      >
                        <DynamicIcon 
                          name="check" 
                          size={16} 
                          color={completedToday ? 'white' : habit.color} 
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteHabit(habit.id)}
                      >
                        <DynamicIcon name="trash-2" size={16} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
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

                  <View style={styles.weeklyProgress}>
                    <Text style={[styles.progressTitle, { color: theme.colors.textSecondary }]}>
                      Last 7 days
                    </Text>
                    <View style={styles.progressDots}>
                      {weeklyProgress.map((completed, index) => (
                        <View
                          key={index}
                          style={[
                            styles.progressDot,
                            {
                              backgroundColor: completed ? habit.color : theme.colors.border,
                            }
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Habit Modal */}
      <Modal
        visible={showAddForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddForm(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Create New Habit
              </Text>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <DynamicIcon name="x" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Input
                label="Habit Title"
                placeholder="e.g., Morning Exercise"
                value={newHabit.title}
                onChangeText={(text) => setNewHabit(prev => ({ ...prev, title: text }))}
                style={styles.input}
              />

              <Input
                label="Description (Optional)"
                placeholder="Brief description of your habit"
                value={newHabit.description}
                onChangeText={(text) => setNewHabit(prev => ({ ...prev, description: text }))}
                multiline
                style={styles.input}
              />

              <View style={styles.iconSelector}>
                <Text style={[styles.selectorLabel, { color: theme.colors.text }]}>
                  Choose Icon
                </Text>
                <View style={styles.iconGrid}>
                  {habitIcons.map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconOption,
                        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                        newHabit.icon === icon && { borderColor: theme.colors.primary, borderWidth: 2 }
                      ]}
                      onPress={() => setNewHabit(prev => ({ ...prev, icon }))}
                    >
                      <DynamicIcon name={icon} size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.colorSelector}>
                <Text style={[styles.selectorLabel, { color: theme.colors.text }]}>
                  Choose Color
                </Text>
                <View style={styles.colorGrid}>
                  {habitColors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        newHabit.color === color && { borderColor: theme.colors.text, borderWidth: 3 }
                      ]}
                      onPress={() => setNewHabit(prev => ({ ...prev, color }))}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.targetSelector}>
                <Text style={[styles.selectorLabel, { color: theme.colors.text }]}>
                  Daily Target
                </Text>
                <View style={styles.targetButtons}>
                  {[1, 2, 3, 5].map((count) => (
                    <TouchableOpacity
                      key={count}
                      style={[
                        styles.targetButton,
                        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                        newHabit.target_count === count && { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary }
                      ]}
                      onPress={() => setNewHabit(prev => ({ ...prev, target_count: count }))}
                    >
                      <Text style={[
                        styles.targetButtonText,
                        { color: theme.colors.text },
                        newHabit.target_count === count && { color: theme.colors.primary }
                      ]}>
                        {count}x
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setShowAddForm(false)}
                variant="outline"
                style={[styles.modalButton, { flex: 1 }]}
              />
              <Button
                title="Create Habit"
                onPress={addHabit}
                style={[styles.modalButton, { flex: 1 }]}
              />
            </View>
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
  habitActions: {
    flexDirection: 'row',
    gap: 8,
  },
  completeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
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
  weeklyProgress: {
    marginTop: 8,
  },
  progressTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 4,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
    maxHeight: '90%',
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
  modalForm: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
  iconSelector: {
    marginBottom: 24,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  colorSelector: {
    marginBottom: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 0,
  },
  targetSelector: {
    marginBottom: 24,
  },
  targetButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  targetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  targetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    marginBottom: 0,
  },
});