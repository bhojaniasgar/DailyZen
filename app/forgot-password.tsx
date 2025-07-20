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

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      showToast('error', 'Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        showToast('error', 'Error', error.message);
        return;
      }

      showToast('success', 'Success', 'Password reset instructions sent to your email');
      router.push({ pathname: '/verify-otp', params: { email, type: 'recovery' } });
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
          Forgot Password
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
            Reset your password
          </Text>
          
          <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
            Enter your email address and we'll send you a verification code to reset your password.
          </Text>

          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={styles.input}
            autoFocus
            autoCapitalize="none"
          />

          <Button
            title="Send Reset Code"
            onPress={handleResetPassword}
            loading={loading}
            style={styles.resetButton}
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
    marginBottom: 24,
    width: '100%',
  },
  resetButton: {
    width: '100%',
  },
});