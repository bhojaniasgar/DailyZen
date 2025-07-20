import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

export default function OnboardingLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="theme-selection" />
      <Stack.Screen name="permissions" />
    </Stack>
  );
}