import React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface StatItemProps {
  label: string;
  value: string;
  icon: string;
  color: string;
}

function StatItem({ label, value, icon, color }: StatItemProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.statItem}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <DynamicIcon name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

export function QuickStats() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    habits: '0',
    tasks: '0',
    streak: '0',
    water: '0L',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Load habits count and best streak
      const { data: habitsData } = await supabase
        .from('habits')
        .select('id, streak_count')
        .eq('user_id', user?.id);
      
      // Load pending tasks count
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', user?.id)
        .eq('completed', false);
      
      // Load today's water intake
      const { data: waterData } = await supabase
        .from('water_entries')
        .select('amount')
        .eq('user_id', user?.id)
        .eq('date', today);
      
      const habitsCount = habitsData?.length || 0;
      const tasksCount = tasksData?.length || 0;
      const bestStreak = Math.max(...(habitsData?.map(h => h.streak_count) || [0]));
      const totalWater = (waterData?.reduce((sum, entry) => sum + entry.amount, 0) || 0) / 1000; // Convert to liters
      
      setStats({
        habits: habitsCount.toString(),
        tasks: tasksCount.toString(),
        streak: bestStreak.toString(),
        water: `${totalWater.toFixed(1)}L`,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh stats when component becomes visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        loadStats();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const statsData = [
    { label: 'Habits', value: stats.habits, icon: 'target', color: theme.colors.primary },
    { label: 'Tasks', value: stats.tasks, icon: 'check-square', color: theme.colors.success },
    { label: 'Streak', value: stats.streak, icon: 'zap', color: theme.colors.accent },
    { label: 'Water', value: stats.water, icon: 'droplets', color: '#06B6D4' },
  ];

  if (loading) {
    return (
      <Card style={styles.container}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Today's Progress
        </Text>
        <View style={styles.statsContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading...
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Today's Progress
      </Text>
      <View style={styles.statsContainer}>
        {statsData.map((stat, index) => (
          <StatItem key={index} {...stat} />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});