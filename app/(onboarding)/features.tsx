import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DynamicIcon } from '@/components/icons/DynamicIcon';

const features = [
  {
    icon: 'target',
    title: 'Habit Tracker',
    description: 'Build lasting habits with streak tracking and smart reminders',
  },
  {
    icon: 'check-square',
    title: 'Task Manager',
    description: 'Stay organized with priorities, categories, and due dates',
  },
  {
    icon: 'dollar-sign',
    title: 'Expense Tracker',
    description: 'Monitor spending with detailed categorization and charts',
  },
  {
    icon: 'droplets',
    title: 'Water Tracker',
    description: 'Stay hydrated with intake logging and reminders',
  },
  {
    icon: 'timer',
    title: 'Pomodoro Timer',
    description: 'Boost productivity with focused work sessions',
  },
  {
    icon: 'quote',
    title: 'Daily Quotes',
    description: 'Get inspired with motivational quotes and wisdom',
  },
];

export default function FeaturesScreen() {
  const { theme } = useTheme();

  const handleContinue = () => {
    router.push('/(onboarding)/themes');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Powerful Tools
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Everything you need to live better, all in one place
        </Text>
      </View>

      <ScrollView style={styles.features} showsVerticalScrollIndicator={false}>
        {features.map((feature, index) => (
          <Card key={index} style={styles.featureCard}>
            <View style={styles.featureContent}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <DynamicIcon name={feature.icon} size={32} color={theme.colors.primary} />
              </View>
              <View style={styles.featureInfo}>
                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          style={styles.continueButton}
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
  features: {
    flex: 1,
  },
  featureCard: {
    marginBottom: 16,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingTop: 20,
  },
  continueButton: {
    marginBottom: 20,
  },
});