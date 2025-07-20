import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { themes } from '@/constants/themes';
import { ThemeName } from '@/types/global';

export default function SettingsScreen() {
  const { theme, themeName, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
          }
        },
      ]
    );
  };

  const handleThemeChange = async (newTheme: ThemeName) => {
    setLoading(true);
    setTheme(newTheme);
    setLoading(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Settings
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <DynamicIcon name="user" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Profile
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.profileInfo}
            onPress={() => router.push('/profile')}
          >
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={[styles.profileName, { color: theme.colors.text }]}>
                {user?.full_name || 'User'}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>
                {user?.email}
              </Text>
            </View>
            <DynamicIcon name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Theme Section */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <DynamicIcon name="star" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Theme
            </Text>
          </View>
          
          <View style={styles.themeOptions}>
            {Object.entries(themes).map(([key, themeData]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.themeOption,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                  themeName === key && { borderColor: theme.colors.primary, borderWidth: 2 }
                ]}
                onPress={() => handleThemeChange(key as ThemeName)}
              >
                <View style={styles.themeColors}>
                  <View style={[styles.colorDot, { backgroundColor: themeData.colors.primary }]} />
                  <View style={[styles.colorDot, { backgroundColor: themeData.colors.secondary }]} />
                  <View style={[styles.colorDot, { backgroundColor: themeData.colors.accent }]} />
                </View>
                <Text style={[styles.themeLabel, { color: theme.colors.text }]}>
                  {themeData.displayName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Security Section */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <DynamicIcon name="lock" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Security
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => router.push('/change-password')}
          >
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              Change Password
            </Text>
            <DynamicIcon name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* App Settings */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <DynamicIcon name="settings" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              App Settings
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => router.push('/notifications')}
          >
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              Notifications
            </Text>
            <DynamicIcon name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => router.push('/privacy-policy')}
          >
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              Data & Privacy
            </Text>
            <DynamicIcon name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => router.push('/data-export')}
          >
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              Export Data
            </Text>
            <DynamicIcon name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => router.push('/about')}
          >
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              About
            </Text>
            <DynamicIcon name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Sign Out */}
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          style={styles.signOutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  themeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    flex: 1,
  },
  themeColors: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  signOutButton: {
    marginTop: 20,
    marginBottom: 40,
  },
});