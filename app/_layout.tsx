import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/components/ui/Toast';

function AppNavigator() {
  const { user, loading, isOnboardingComplete } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    if (loading) {
      return; // Still loading, don't navigate yet
    }

    const navigate = async () => {
      try {
        if (!user) {
          // No user, go to sign in
          router.replace('/(auth)/signin');
          return;
        }

        if (!isOnboardingComplete) {
          // User exists but onboarding not complete
          router.replace('/(onboarding)/welcome');
          return;
        }

        // User exists and onboarding complete, go to main app
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Navigation error:', error);
        router.replace('/(auth)/signin');
      }
    };
    
    navigate();
  }, [user, loading, isOnboardingComplete]);

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: theme?.colors?.background || '#FFFFFF' 
      }}>
        <ActivityIndicator size="large" color={theme?.colors?.primary || '#3B82F6'} />
        <Text style={{ 
          marginTop: 16, 
          color: theme?.colors?.text || '#000000', 
          fontSize: 16 
        }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <>
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
        <Stack.Screen name="verify-otp" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="change-password" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <Toast config={toastConfig} />
    </>
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