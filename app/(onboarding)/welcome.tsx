import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { DynamicIcon } from '@/components/icons/DynamicIcon';

export default function WelcomeScreen() {
  const { theme } = useTheme();

  const handleGetStarted = () => {
    router.push('/(onboarding)/features');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconBackground, { backgroundColor: theme.colors.primary + '20' }]}>
            <DynamicIcon name="zap" size={64} color={theme.colors.primary} />
          </View>
        </View>

        <Text style={[styles.title, { color: theme.colors.text }]}>
          Welcome to DailyZen
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Your all-in-one companion for building better habits, staying organized, and living mindfully.
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <DynamicIcon name="target" size={24} color={theme.colors.primary} />
            <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
              Track habits & build streaks
            </Text>
          </View>
          
          <View style={styles.feature}>
            <DynamicIcon name="check-square" size={24} color={theme.colors.primary} />
            <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
              Manage tasks & stay organized
            </Text>
          </View>
          
          <View style={styles.feature}>
            <DynamicIcon name="trending-up" size={24} color={theme.colors.primary} />
            <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
              Visualize your progress
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Get Started"
          onPress={handleGetStarted}
          style={styles.getStartedButton}
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  features: {
    gap: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    paddingTop: 40,
  },
  getStartedButton: {
    marginBottom: 20,
  },
});