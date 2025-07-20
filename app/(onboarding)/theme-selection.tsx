import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { themes } from '@/constants/themes';

export default function ThemeSelection() {
  const router = useRouter();
  const { setTheme } = useTheme();

  const handleThemeSelect = async (themeName: string) => {
    await setTheme(themeName);
    router.push('/(onboarding)/permissions');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Theme</Text>
      <Text style={styles.subtitle}>Select a theme that suits your style</Text>
      
      <View style={styles.themeGrid}>
        {Object.entries(themes).map(([name, theme]) => (
          <Card
            key={name}
            style={[styles.themeCard, { backgroundColor: theme.colors.background }]}
            onPress={() => handleThemeSelect(name)}
          >
            <View style={styles.themePreview}>
              <View style={[styles.colorSwatch, { backgroundColor: theme.colors.primary }]} />
              <View style={[styles.colorSwatch, { backgroundColor: theme.colors.secondary }]} />
              <View style={[styles.colorSwatch, { backgroundColor: theme.colors.accent }]} />
            </View>
            <Text style={[styles.themeName, { color: theme.colors.text }]}>{name}</Text>
          </Card>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  themeCard: {
    width: '48%',
    padding: 16,
    marginBottom: 16,
  },
  themePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  themeName: {
    textAlign: 'center',
    fontWeight: '600',
  },
});
