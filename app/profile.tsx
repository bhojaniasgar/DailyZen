import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DynamicIcon } from '@/components/icons/DynamicIcon';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Update user profile in Supabase
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFullName(user?.full_name || '');
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <DynamicIcon name="chevron-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Profile
        </Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <DynamicIcon name={isEditing ? 'x' : 'edit'} size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <TouchableOpacity style={styles.avatarButton}>
              <DynamicIcon name="camera" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            {isEditing ? (
              <Input
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
              />
            ) : (
              <View style={styles.infoRow}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                  Full Name
                </Text>
                <Text style={[styles.value, { color: theme.colors.text }]}>
                  {user?.full_name || 'Not set'}
                </Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Email
              </Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {user?.email}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Member Since
              </Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </Text>
            </View>
          </View>

          {isEditing && (
            <View style={styles.editActions}>
              <Button
                title="Cancel"
                onPress={handleCancel}
                variant="outline"
                style={[styles.editButton, { flex: 1 }]}
              />
              <Button
                title="Save"
                onPress={handleSave}
                loading={loading}
                style={[styles.editButton, { flex: 1 }]}
              />
            </View>
          )}
        </Card>

        <Card style={styles.statsCard}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Your Stats
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                12
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Active Habits
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                87%
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Completion Rate
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.accent }]}>
                45
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Best Streak
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.warning }]}>
                156
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Tasks Completed
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.preferencesCard}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Preferences
          </Text>
          <TouchableOpacity 
            style={styles.preferenceRow}
            onPress={() => router.push('/notifications')}
          >
            <DynamicIcon name="bell" size={20} color={theme.colors.primary} />
            <Text style={[styles.preferenceLabel, { color: theme.colors.text }]}>
              Notifications
            </Text>
            <DynamicIcon name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.preferenceRow}
            onPress={() => router.push('/theme-settings')}
          >
            <DynamicIcon name="star" size={20} color={theme.colors.primary} />
            <Text style={[styles.preferenceLabel, { color: theme.colors.text }]}>
              Theme
            </Text>
            <DynamicIcon name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.preferenceRow}
            onPress={() => router.push('/data-export')}
          >
            <DynamicIcon name="activity" size={20} color={theme.colors.primary} />
            <Text style={[styles.preferenceLabel, { color: theme.colors.text }]}>
              Data Export
            </Text>
            <DynamicIcon name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
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
  profileCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarSection: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
  },
  avatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    width: '100%',
    gap: 16,
  },
  input: {
    marginBottom: 0,
  },
  infoRow: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  editButton: {
    marginBottom: 0,
  },
  statsCard: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  preferencesCard: {
    marginBottom: 40,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  preferenceLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});