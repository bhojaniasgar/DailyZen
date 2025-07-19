import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { supabase } from '@/lib/supabase';

export default function DataExportScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);

  const exportData = async (dataType: string) => {
    if (!user) return;

    setExporting(true);
    try {
      let data;
      let filename;

      switch (dataType) {
        case 'habits':
          const { data: habitsData } = await supabase
            .from('habits')
            .select('*, habit_entries(*)')
            .eq('user_id', user.id);
          data = habitsData;
          filename = 'habits_export.json';
          break;

        case 'tasks':
          const { data: tasksData } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id);
          data = tasksData;
          filename = 'tasks_export.json';
          break;

        case 'expenses':
          const { data: expensesData } = await supabase
            .from('expenses')
            .select('*')
            .eq('user_id', user.id);
          data = expensesData;
          filename = 'expenses_export.json';
          break;

        case 'water':
          const { data: waterData } = await supabase
            .from('water_entries')
            .select('*')
            .eq('user_id', user.id);
          data = waterData;
          filename = 'water_export.json';
          break;

        case 'fuel':
          const { data: fuelData } = await supabase
            .from('fuel_entries')
            .select('*')
            .eq('user_id', user.id);
          data = fuelData;
          filename = 'fuel_export.json';
          break;

        case 'all':
          const [habits, tasks, expenses, water, fuel, pomodoro, scans] = await Promise.all([
            supabase.from('habits').select('*, habit_entries(*)').eq('user_id', user.id),
            supabase.from('tasks').select('*').eq('user_id', user.id),
            supabase.from('expenses').select('*').eq('user_id', user.id),
            supabase.from('water_entries').select('*').eq('user_id', user.id),
            supabase.from('fuel_entries').select('*').eq('user_id', user.id),
            supabase.from('pomodoro_sessions').select('*').eq('user_id', user.id),
            supabase.from('scan_history').select('*').eq('user_id', user.id),
          ]);

          data = {
            habits: habits.data,
            tasks: tasks.data,
            expenses: expenses.data,
            water_entries: water.data,
            fuel_entries: fuel.data,
            pomodoro_sessions: pomodoro.data,
            scan_history: scans.data,
            exported_at: new Date().toISOString(),
          };
          filename = 'complete_data_export.json';
          break;

        default:
          throw new Error('Invalid data type');
      }

      const jsonData = JSON.stringify(data, null, 2);
      
      // Share the data
      await Share.share({
        message: jsonData,
        title: `DailyZen ${dataType} Export`,
      });

    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'There was an error exporting your data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const deleteAllData = async () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete ALL your data including habits, tasks, expenses, and more. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user) return;

              // Delete all user data
              await Promise.all([
                supabase.from('habit_entries').delete().eq('habit_id', user.id),
                supabase.from('habits').delete().eq('user_id', user.id),
                supabase.from('tasks').delete().eq('user_id', user.id),
                supabase.from('expenses').delete().eq('user_id', user.id),
                supabase.from('water_entries').delete().eq('user_id', user.id),
                supabase.from('fuel_entries').delete().eq('user_id', user.id),
                supabase.from('pomodoro_sessions').delete().eq('user_id', user.id),
                supabase.from('scan_history').delete().eq('user_id', user.id),
                supabase.from('user_poll_votes').delete().eq('user_id', user.id),
                supabase.from('user_quote_favorites').delete().eq('user_id', user.id),
              ]);

              Alert.alert('Success', 'All your data has been deleted.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const exportOptions = [
    {
      key: 'habits',
      title: 'Habits & Entries',
      description: 'Export all your habits and completion history',
      icon: 'target',
    },
    {
      key: 'tasks',
      title: 'Tasks & To-Dos',
      description: 'Export all your tasks and completion status',
      icon: 'check-square',
    },
    {
      key: 'expenses',
      title: 'Expenses',
      description: 'Export all your expense tracking data',
      icon: 'dollar-sign',
    },
    {
      key: 'water',
      title: 'Water Intake',
      description: 'Export all your water consumption logs',
      icon: 'droplets',
    },
    {
      key: 'fuel',
      title: 'Fuel & Mileage',
      description: 'Export all your vehicle fuel and mileage data',
      icon: 'fuel',
    },
    {
      key: 'all',
      title: 'Complete Export',
      description: 'Export all your data in one comprehensive file',
      icon: 'download',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <DynamicIcon name="chevron-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Data Export
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <DynamicIcon name="download" size={24} color={theme.colors.primary} />
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
              Export Your Data
            </Text>
          </View>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            Download your data in JSON format. You can use this to backup your information or transfer it to another service.
          </Text>
        </Card>

        <Card style={styles.exportCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Export Options
          </Text>
          
          {exportOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={styles.exportOption}
              onPress={() => exportData(option.key)}
              disabled={exporting}
            >
              <View style={styles.exportOptionInfo}>
                <View style={[styles.exportIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                  <DynamicIcon name={option.icon} size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.exportDetails}>
                  <Text style={[styles.exportTitle, { color: theme.colors.text }]}>
                    {option.title}
                  </Text>
                  <Text style={[styles.exportDescription, { color: theme.colors.textSecondary }]}>
                    {option.description}
                  </Text>
                </View>
              </View>
              <DynamicIcon name="download" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </Card>

        <Card style={styles.dangerCard}>
          <View style={styles.dangerHeader}>
            <DynamicIcon name="trash-2" size={24} color={theme.colors.error} />
            <Text style={[styles.dangerTitle, { color: theme.colors.error }]}>
              Danger Zone
            </Text>
          </View>
          <Text style={[styles.dangerText, { color: theme.colors.textSecondary }]}>
            Permanently delete all your data. This action cannot be undone.
          </Text>
          <Button
            title="Delete All Data"
            onPress={deleteAllData}
            variant="outline"
            style={[styles.deleteButton, { borderColor: theme.colors.error }]}
          />
        </Card>

        <Card style={styles.helpCard}>
          <View style={styles.helpHeader}>
            <DynamicIcon name="help-circle" size={24} color={theme.colors.accent} />
            <Text style={[styles.helpTitle, { color: theme.colors.text }]}>
              Need Help?
            </Text>
          </View>
          <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
            Exported data is in JSON format and can be opened with any text editor. For large exports, consider using a JSON viewer for better readability.
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
  infoCard: {
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  exportCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  exportOptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exportDetails: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exportDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  dangerCard: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  dangerText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  deleteButton: {
    marginBottom: 0,
  },
  helpCard: {
    marginBottom: 40,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
  },
});