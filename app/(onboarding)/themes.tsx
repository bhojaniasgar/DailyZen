import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { themes } from '@/constants/themes';
import { ThemeName } from '@/types/global';
import { DynamicIcon } from '@/components/icons/DynamicIcon';

export default function ThemesScreen() {
  const { theme, themeName, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(themeName);

  const handleThemeSelect = (themeKey: ThemeName) => {
    setSelectedTheme(themeKey);
    setTheme(themeKey);
  };

  const handleContinue = () => {
    router.push('/(onboarding)/notifications');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Choose Your Theme
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Personalize your experience with a theme that suits you
        </Text>
      </View>

      <ScrollView style={styles.themes} showsVerticalScrollIndicator={false}>
        {Object.entries(themes).map(([key, themeData]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.themeCard,
              { backgroundColor: themeData.colors.surface, borderColor: themeData.colors.border },
              selectedTheme === key && { borderColor: theme.colors.primary, borderWidth: 2 }
            ]}
            onPress={() => handleThemeSelect(key as ThemeName)}
          >
            <View style={styles.themeContent}>
              <View style={styles.themeColors}>
                <View style={[styles.colorCircle, { backgroundColor: themeData.colors.primary }]} />
                <View style={[styles.colorCircle, { backgroundColor: themeData.colors.secondary }]} />
                <View style={[styles.colorCircle, { backgroundColor: themeData.colors.accent }]} />
              </View>
              
              <View style={styles.themeInfo}>
                <Text style={[styles.themeName, { color: themeData.colors.text }]}>
                  {themeData.displayName}
                </Text>
                <Text style={[styles.themeDescription, { color: themeData.colors.textSecondary }]}>
                  {getThemeDescription(key as ThemeName)}
                </Text>
              </View>

              {selectedTheme === key && (
                <View style={styles.selectedIcon}>
                  <DynamicIcon name="check" size={20} color={theme.colors.primary} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
}

function getThemeDescription(themeName: ThemeName): string {
  const descriptions = {
    'calm-blue': 'Serene and focused, perfect for productivity',
    'solar-dark': 'Bold and energetic, great for night owls',
    'nature-green': 'Fresh and natural, inspired by the outdoors',
    'sunset-orange': 'Warm and vibrant, full of energy',
    'minimal-white': 'Clean and simple, distraction-free',
  };
  return descriptions[themeName];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
  themes: {
    flex: 1,
  },
  themeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  themeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeColors: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 16,
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  selectedIcon: {
    marginLeft: 12,
  },
  footer: {
    paddingTop: 20,
  },
  continueButton: {
    marginBottom: 20,
  },
});