import React from 'react';
import { ScrollView, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { ToolCard } from '@/components/dashboard/ToolCard';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/appStore';

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { dashboardTools } = useAppStore();

  // Show only first 6 tools on dashboard
  const featuredTools = dashboardTools.slice(0, 6);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <DashboardHeader />
        <QuickStats />
        
        <FlatList
          data={featuredTools}
          renderItem={({ item }) => <ToolCard tool={item} />}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.toolsGrid}
          columnWrapperStyle={styles.toolsRow}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolsGrid: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  toolsRow: {
    justifyContent: 'space-between',
  },
});