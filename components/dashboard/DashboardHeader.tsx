import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { router } from 'expo-router';

export function DashboardHeader() {
  const { theme } = useTheme();
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const handleSearchPress = () => {
    router.push('/search');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.greetingContainer}>
        <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
          {getGreeting()}
        </Text>
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {user?.full_name || 'Welcome to DailyZen'}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
          onPress={handleSearchPress}
        >
          <DynamicIcon name="search" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
          onPress={handleProfilePress}
        >
          <DynamicIcon name="user" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});