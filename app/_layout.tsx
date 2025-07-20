import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';


import { useState } from 'react';
import { storage } from '@/lib/storage';
import { useAppStore } from '@/store/appStore';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/components/ui/Toast';

function AppNavigator() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const { isOnboardingComplete, setOnboardingComplete } = useAppStore();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkOnboarding() {
      const completed = await storage.getBoolean('onboardingComplete');
      setOnboardingComplete(completed);
      setCheckingOnboarding(false);
    }
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (loading || checkingOnboarding) {
      console.log('Still loading or checking onboarding...', { loading, checkingOnboarding });
      return;
    }

    const navigate = async () => {
      console.log('Navigation state:', { 
        user: user ? 'exists' : 'null', 
        isOnboardingComplete, 
        loading, 
        checkingOnboarding 
      });

      try {
        if (!user) {
          console.log('No user, navigating to signin');
          await router.replace('/(auth)/signin');
          return;
        }

        if (!isOnboardingComplete) {
          console.log('Onboarding not complete, navigating to features');
          await router.replace('/(onboarding)/features');
          return;
        }

        console.log('All checks passed, navigating to tabs');
        await router.replace('/(tabs)');
      } catch (error) {
        console.error('Navigation error:', error);
        router.replace('/(auth)/signin');
      }
    };
    
    navigate();
  }, [user, loading, checkingOnboarding, isOnboardingComplete]);



  if (loading || checkingOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme?.colors?.background }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10, color: theme?.colors?.text }}>
          {loading ? 'Checking authentication...' : 'Loading your preferences...'}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme?.colors?.background }}>
        <Text style={{ color: theme?.colors?.error, marginBottom: 20 }}>{error}</Text>
        <Button onPress={() => router.replace('/(auth)/signin')} title="Return to Sign In" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="tools" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="search" />
      <Stack.Screen name="about" />
      <Stack.Screen name="data-export" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen name="theme-settings" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function Layout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <ThemeProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}