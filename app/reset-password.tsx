import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { showToast } from '@/components/ui/Toast';

export default function ResetPasswordScreen() {
  const { theme } = useTheme();
  const { updatePassword } = useAuth();
  const params = useLocalSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const email = params.email as string;

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showToast('error', 'Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('error', 'Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      showToast('error', 'Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await updatePassword(newPassword);
      
      if (error) {
        showToast('error', 'Error', error.message);
        return;
      }

      showToast('success', 'Success', 'Password updated successfully!');
      router.replace('/(tabs)');
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
          Reset Password
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
            Create new password
          </Text>
          
          <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
            Enter a new password for your account
          </Text>

          <Input
            label="New Password"
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            style={styles.input}
            autoFocus
            autoCapitalize="none"
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
            autoCapitalize="none"
          />

          <Button
            title="Update Password"
            onPress={handleResetPassword}
            loading={loading}
            style={styles.updateButton}
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
    justifyContent: 'center',
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
  updateButton: {
    width: '100%',
    marginTop: 8,
  },
});