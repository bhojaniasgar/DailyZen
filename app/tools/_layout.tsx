import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

export default function ToolsLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    />
  );
}