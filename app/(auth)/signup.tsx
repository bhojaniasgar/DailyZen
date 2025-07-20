import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { showToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { analytics } from '@/lib/analytics';

export default function SignUpScreen() {
  const { theme } = useTheme();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
      showToast('error', 'Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      showToast('error', 'Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      showToast('error', 'Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        showToast('error', 'Error', error.message);
      } else {
        analytics.userSignedUp('email');
        showToast('success', 'Success', 'Your account has been created successfully!');
        router.replace('/(tabs)');
      }
    } catch (error) {
      showToast('error', 'Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Create Account
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Join DailyZen and start your journey
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
          returnKeyType="next"
          autoCapitalize="words"
        />

        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input}
          returnKeyType="next"
          autoCapitalize="none"
        />
        
        <Input
          label="Password"
          placeholder="Create a password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          returnKeyType="next"
          autoCapitalize="none"
        />

        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={handleSignUp}
        />

        <Button
          title="Create Account"
          onPress={handleSignUp}
          loading={loading}
          style={styles.signUpButton}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          Already have an account?{' '}
          <Link href="/(auth)/signin" style={[styles.link, { color: theme.colors.primary }]}>
            Sign in
          </Link>
        </Text>
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
    marginTop: 40,
    marginBottom: 40,
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
  form: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
  signUpButton: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontWeight: '600',
  },
});
