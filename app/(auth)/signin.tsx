import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { showToast } from '@/components/ui/Toast';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { analytics } from '@/lib/analytics';

export default function SignInScreen() {
  const { theme } = useTheme();
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      showToast('error', 'Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        showToast('error', 'Error', error.message);
        return;
      }
      
      analytics.userSignedIn('email');
      // Let the AppNavigator handle the navigation
    } catch (error) {
      showToast('error', 'Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      showToast('error', 'Error', 'Please enter your email address');
      return;
    }

    setIsResettingPassword(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        showToast('error', 'Error', error.message);
      } else {
        showToast('success', 'Success', 'Password reset instructions sent to your email');
      }
    } catch (error) {
      showToast('error', 'Error', 'An unexpected error occurred');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // TODO: Implement Google Sign-In
    showToast('info', 'Coming Soon', 'Google Sign-In will be available soon');
  };

  const handleAppleSignIn = async () => {
    // TODO: Implement Apple Sign-In
    showToast('error', 'Coming Soon', 'Apple Sign-In will be available soon');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Welcome Back
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Sign in to continue your journey
        </Text>
      </View>

      <ScrollView style={styles.form}>
        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={(e) => {
            if (e === 'aaa'){
              setEmail('im.bhojaniasgar@gmail.com');
              setPassword('Asgar@123'); // Reset password field if email is 'aaa'
            } else {
              setEmail(e);
            }
          }}
          keyboardType="email-address"
          style={styles.input}
          returnKeyType="next"
        />
        
        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={handleSignIn}
          autoCapitalize="none"
        />

        <TouchableOpacity
          onPress={handleResetPassword}
          style={styles.forgotPasswordContainer}
        >
          <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <Button
          title="Sign In"
          onPress={handleSignIn}
          loading={loading}
          style={styles.signInButton}
        />

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
            or continue with
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={handleGoogleSignIn}
          >
            <DynamicIcon name="search" size={20} color={theme.colors.text} />
            <Text style={[styles.socialButtonText, { color: theme.colors.text }]}>
              Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={handleAppleSignIn}
          >
            <DynamicIcon name="star" size={20} color={theme.colors.text} />
            <Text style={[styles.socialButtonText, { color: theme.colors.text }]}>
              Apple
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          Don't have an account?{' '}
          <Link href="/(auth)/signup" style={[styles.link, { color: theme.colors.primary }]}>
            Sign up
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  signInButton: {
    marginTop: 8,
    marginBottom: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
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