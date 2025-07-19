import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { DynamicIcon } from '@/components/icons/DynamicIcon';

export default function PrivacyPolicyScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <DynamicIcon name="chevron-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Data & Privacy
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Data Collection
          </Text>
          <Text style={[styles.sectionText, { color: theme.colors.textSecondary }]}>
            DailyZen collects only the data you explicitly provide through the app, including:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
              • Account information (email, name)
            </Text>
            <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
              • Habits, tasks, and personal tracking data
            </Text>
            <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
              • App preferences and settings
            </Text>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Data Storage
          </Text>
          <Text style={[styles.sectionText, { color: theme.colors.textSecondary }]}>
            Your data is securely stored using Supabase, a trusted database platform. All data is encrypted in transit and at rest. We do not share your personal data with third parties.
          </Text>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Data Control
          </Text>
          <Text style={[styles.sectionText, { color: theme.colors.textSecondary }]}>
            You have full control over your data:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
              • Export all your data at any time
            </Text>
            <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
              • Delete your account and all associated data
            </Text>
            <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
              • Modify or update your information
            </Text>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Analytics
          </Text>
          <Text style={[styles.sectionText, { color: theme.colors.textSecondary }]}>
            We collect minimal, anonymized usage analytics to improve the app experience. This includes feature usage patterns and crash reports. No personal data is included in analytics.
          </Text>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Contact
          </Text>
          <Text style={[styles.sectionText, { color: theme.colors.textSecondary }]}>
            If you have questions about your data or privacy, please contact us at privacy@dailyzen.app
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  bulletList: {
    marginTop: 8,
  },
  bulletItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});