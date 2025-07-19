import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ToolCard } from '@/components/dashboard/ToolCard';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/appStore';

export default function ToolsScreen() {
  const { theme } = useTheme();
  const { dashboardTools } = useAppStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          All Tools
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {dashboardTools.length} lifestyle tools available
        </Text>
      </View>

      <FlatList
        data={dashboardTools}
        renderItem={({ item }) => <ToolCard tool={item} />}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.toolsGrid}
        columnWrapperStyle={styles.toolsRow}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  toolsGrid: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  toolsRow: {
    justifyContent: 'space-between',
  },
});