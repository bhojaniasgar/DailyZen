import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DynamicIcon } from '@/components/icons/DynamicIcon';

export default function AboutScreen() {
  const { theme } = useTheme();

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <DynamicIcon name="chevron-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          About
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.appCard}>
          <View style={styles.appHeader}>
            <View style={[styles.appIcon, { backgroundColor: theme.colors.primary + '20' }]}>
              <DynamicIcon name="zap" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.appInfo}>
              <Text style={[styles.appName, { color: theme.colors.text }]}>
                DailyZen
              </Text>
              <Text style={[styles.appVersion, { color: theme.colors.textSecondary }]}>
                Version 1.0.0
              </Text>
            </View>
          </View>
          <Text style={[styles.appDescription, { color: theme.colors.textSecondary }]}>
            Your all-in-one companion for building better habits, staying organized, and living mindfully.
          </Text>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Features
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <DynamicIcon name="target" size={16} color={theme.colors.primary} />
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                Habit tracking with streak counters
              </Text>
            </View>
            <View style={styles.featureItem}>
              <DynamicIcon name="check-square" size={16} color={theme.colors.primary} />
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                Task management and organization
              </Text>
            </View>
            <View style={styles.featureItem}>
              <DynamicIcon name="dollar-sign" size={16} color={theme.colors.primary} />
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                Expense tracking and budgeting
              </Text>
            </View>
            <View style={styles.featureItem}>
              <DynamicIcon name="droplets" size={16} color={theme.colors.primary} />
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                Water intake monitoring
              </Text>
            </View>
            <View style={styles.featureItem}>
              <DynamicIcon name="timer" size={16} color={theme.colors.primary} />
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                Pomodoro timer for productivity
              </Text>
            </View>
            <View style={styles.featureItem}>
              <DynamicIcon name="qr-code" size={16} color={theme.colors.primary} />
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                QR code and barcode scanner
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Technology
          </Text>
          <Text style={[styles.sectionText, { color: theme.colors.textSecondary }]}>
            Built with React Native, Expo, and Supabase for a secure, cross-platform experience.
          </Text>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Support
          </Text>
          <Text style={[styles.sectionText, { color: theme.colors.textSecondary }]}>
            Need help or have feedback? We'd love to hear from you.
          </Text>
          <View style={styles.supportButtons}>
            <Button
              title="Send Feedback"
              onPress={() => openLink('mailto:support@dailyzen.app')}
              style={[styles.supportButton, { flex: 1 }]}
            />
            <Button
              title="Rate App"
              onPress={() => openLink('https://apps.apple.com')}
              variant="outline"
              style={[styles.supportButton, { flex: 1 }]}
            />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Legal
          </Text>
          <TouchableOpacity 
            style={styles.legalItem}
            onPress={() => router.push('/privacy-policy')}
          >
            <Text style={[styles.legalText, { color: theme.colors.text }]}>
              Privacy Policy
            </Text>
            <DynamicIcon name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.legalItem}
            onPress={() => openLink('https://dailyzen.app/terms')}
          >
            <Text style={[styles.legalText, { color: theme.colors.text }]}>
              Terms of Service
            </Text>
            <DynamicIcon name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Made with ❤️ for better living
          </Text>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            © 2024 DailyZen
          </Text>
        </View>
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
  appCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
  },
  appDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
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
  featureList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  supportButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  supportButton: {
    marginBottom: 0,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  legalText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
  },
});