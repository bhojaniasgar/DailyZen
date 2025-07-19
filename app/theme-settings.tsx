import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { themes } from '@/constants/themes';
import { ThemeName } from '@/types/global';

export default function ThemeSettingsScreen() {
  const { theme, themeName, setTheme } = useTheme();

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
  };

  const getThemeDescription = (themeKey: ThemeName): string => {
    const descriptions = {
      'calm-blue': 'Serene and focused, perfect for productivity',
      'solar-dark': 'Bold and energetic, great for night owls',
      'nature-green': 'Fresh and natural, inspired by the outdoors',
      'sunset-orange': 'Warm and vibrant, full of energy',
      'minimal-white': 'Clean and simple, distraction-free',
    };
    return descriptions[themeKey];
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <DynamicIcon name="chevron-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Theme Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Choose a theme that suits your style and preferences
        </Text>

        {Object.entries(themes).map(([key, themeData]) => (
          <Card key={key} style={styles.themeCard}>
            <TouchableOpacity
              style={styles.themeContent}
              onPress={() => handleThemeChange(key as ThemeName)}
            >
              <View style={styles.themeInfo}>
                <View style={styles.themeColors}>
                  <View style={[styles.colorCircle, { backgroundColor: themeData.colors.primary }]} />
                  <View style={[styles.colorCircle, { backgroundColor: themeData.colors.secondary }]} />
                  <View style={[styles.colorCircle, { backgroundColor: themeData.colors.accent }]} />
                </View>
                
                <View style={styles.themeDetails}>
                  <Text style={[styles.themeName, { color: theme.colors.text }]}>
                    {themeData.displayName}
                  </Text>
                  <Text style={[styles.themeDescription, { color: theme.colors.textSecondary }]}>
                    {getThemeDescription(key as ThemeName)}
                  </Text>
                </View>
              </View>

              {themeName === key && (
                <View style={styles.selectedIcon}>
                  <DynamicIcon name="check" size={20} color={theme.colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          </Card>
        ))}

        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <DynamicIcon name="star" size={24} color={theme.colors.accent} />
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
              About Themes
            </Text>
          </View>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            Themes change the overall appearance of the app, including colors, backgrounds, and visual elements. Your theme preference is saved to your profile and will sync across all your devices.
          </Text>
        </Card>
      </ScrollView>
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
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  themeCard: {
    marginBottom: 16,
  },
  themeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  themeDetails: {
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
  infoCard: {
    marginTop: 20,
    marginBottom: 40,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});