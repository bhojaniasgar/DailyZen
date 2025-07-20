import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { showToast } from '@/components/ui/Toast';

export default function ChangePasswordScreen() {
  const { theme } = useTheme();
  const { updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('error', 'Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('error', 'Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      showToast('error', 'Error', 'Password must be at least 6 characters');
      return;
    }

    if (currentPassword === newPassword) {
      showToast('error', 'Error', 'New password must be different from current password');
      return;
    }

    setLoading(true);
    try {
      const { error } = await updatePassword(newPassword);
      
      if (error) {
        showToast('error', 'Error', error.message);
        return;
      }

      showToast('success', 'Success', 'Password changed successfully!');
      router.back();
    } catch (error) {
      showToast('error', 'Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <DynamicIcon name="chevron-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Change Password
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconBackground, { backgroundColor: theme.colors.primary + '20' }]}>
              <DynamicIcon name="lock" size={32} color={theme.colors.primary} />
            </View>
          </View>

          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Update your password
          </Text>
          
          <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
            Enter your current password and choose a new one
          </Text>

          <Input
            label="Current Password"
            placeholder="Enter current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            style={styles.input}
            autoCapitalize="none"
          />

          <Input
            label="New Password"
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            style={styles.input}
            autoCapitalize="none"
          />

          <Input
            label="Confirm New Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
            autoCapitalize="none"
          />

          <Button
            title="Change Password"
            onPress={handleChangePassword}
            loading={loading}
            style={styles.changeButton}
          />
        </Card>
      </View>
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
    paddingTop: 40,
  },
  card: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  input: {
    marginBottom: 16,
    width: '100%',
  },
  changeButton: {
    width: '100%',
    marginTop: 8,
  },
});