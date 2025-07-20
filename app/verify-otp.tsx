import React, { useState, useEffect } from 'react';
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

export default function VerifyOTPScreen() {
  const { theme } = useTheme();
  const { verifyOTP, resendOTP } = useAuth();
  const params = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const email = params.email as string;
  const type = params.type as 'signup' | 'recovery';

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      showToast('error', 'Error', 'Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const { error } = await verifyOTP(email, otp, type);
      
      if (error) {
        showToast('error', 'Error', error.message);
        return;
      }

      showToast('success', 'Success', 'Email verified successfully!');
      
      if (type === 'signup') {
        router.replace('/(tabs)');
      } else {
        router.push({ pathname: '/reset-password', params: { email } });
      }
    } catch (error) {
      showToast('error', 'Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    try {
      const { error } = await resendOTP(email, type);
      
      if (error) {
        showToast('error', 'Error', error.message);
        return;
      }

      showToast('success', 'Success', 'Verification code sent!');
      setCountdown(60);
    } catch (error) {
      showToast('error', 'Error', 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <DynamicIcon name="chevron-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Verify Email
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconBackground, { backgroundColor: theme.colors.primary + '20' }]}>
              <DynamicIcon name="mail" size={32} color={theme.colors.primary} />
            </View>
          </View>

          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Check your email
          </Text>
          
          <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
            We've sent a 6-digit verification code to {email}
          </Text>

          <Input
            label="Verification Code"
            placeholder="Enter 6-digit code"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            maxLength={6}
            style={styles.input}
            autoFocus
          />

          <Button
            title="Verify Code"
            onPress={handleVerifyOTP}
            loading={loading}
            style={styles.verifyButton}
          />

          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, { color: theme.colors.textSecondary }]}>
              Didn't receive the code?
            </Text>
            {countdown > 0 ? (
              <Text style={[styles.countdownText, { color: theme.colors.textSecondary }]}>
                Resend in {countdown}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOTP} disabled={resending}>
                <Text style={[styles.resendButton, { color: theme.colors.primary }]}>
                  {resending ? 'Sending...' : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
  verifyButton: {
    width: '100%',
    marginBottom: 24,
  },
  resendContainer: {
    alignItems: 'center',
    gap: 8,
  },
  resendText: {
    fontSize: 14,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resendButton: {
    fontSize: 14,
    fontWeight: '600',
  },
});