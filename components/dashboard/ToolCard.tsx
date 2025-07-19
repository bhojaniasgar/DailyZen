import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { useTheme } from '@/hooks/useTheme';
import { ToolConfig } from '@/types/global';
import { router } from 'expo-router';

interface ToolCardProps {
  tool: ToolConfig;
}

export function ToolCard({ tool }: ToolCardProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    router.push(tool.route as any);
  };

  return (
    <Card onPress={handlePress} style={styles.container}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconBackground, { backgroundColor: theme.colors.primary + '20' }]}>
          <DynamicIcon
            name={tool.icon}
            size={28}
            color={theme.colors.primary}
          />
        </View>
        {tool.isPremium && (
          <View style={[styles.premiumBadge, { backgroundColor: theme.colors.accent }]}>
            <Text style={styles.premiumText}>PRO</Text>
          </View>
        )}
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {tool.name}
      </Text>
      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
        {tool.description}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
    minHeight: 120,
  },
  iconContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  iconBackground: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});