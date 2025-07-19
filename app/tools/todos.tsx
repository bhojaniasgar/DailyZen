import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types/global';
import { analytics } from '@/lib/analytics';

export default function TodosScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        Alert.alert('Error', 'Failed to load tasks');
        return;
      }

      setTasks(data || []);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .insert([
          {
            user_id: user?.id,
            title: newTaskTitle.trim(),
            description: newTaskDescription.trim(),
            priority: newTaskPriority,
            category: 'general',
            completed: false,
          },
        ]);

      if (error) {
        Alert.alert('Error', 'Failed to add task');
        return;
      }

      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('medium');
      setShowAddForm(false);
      loadTasks();
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          completed: !task.completed,
          completed_at: !task.completed ? new Date().toISOString() : null,
        })
        .eq('id', task.id);

      if (error) {
        Alert.alert('Error', 'Failed to update task');
        return;
      }

      if (!task.completed) {
        analytics.taskCompleted(task.id, task.priority);
      }
      loadTasks();
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const deleteTask = async (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId);

              if (error) {
                Alert.alert('Error', 'Failed to delete task');
                return;
              }

              loadTasks();
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <DynamicIcon name="chevron-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            To-Do List
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loading}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading tasks...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <DynamicIcon name="chevron-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          To-Do List
        </Text>
        <TouchableOpacity onPress={() => setShowAddForm(true)}>
          <DynamicIcon name="plus" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showAddForm && (
          <Card style={styles.addForm}>
            <Text style={[styles.formTitle, { color: theme.colors.text }]}>
              Add New Task
            </Text>
            <Input
              label="Title"
              placeholder="Enter task title"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              style={styles.input}
            />
            <Input
              label="Description (Optional)"
              placeholder="Enter task description"
              value={newTaskDescription}
              onChangeText={setNewTaskDescription}
              multiline
              style={styles.input}
            />
            <View style={styles.prioritySelector}>
              <Text style={[styles.priorityLabel, { color: theme.colors.text }]}>
                Priority
              </Text>
              <View style={styles.priorityButtons}>
                {(['low', 'medium', 'high'] as const).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                      newTaskPriority === priority && { backgroundColor: getPriorityColor(priority) + '20', borderColor: getPriorityColor(priority) }
                    ]}
                    onPress={() => setNewTaskPriority(priority)}
                  >
                    <Text style={[
                      styles.priorityButtonText,
                      { color: theme.colors.text },
                      newTaskPriority === priority && { color: getPriorityColor(priority) }
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.formActions}>
              <Button
                title="Cancel"
                onPress={() => setShowAddForm(false)}
                variant="outline"
                style={[styles.formButton, { flex: 1 }]}
              />
              <Button
                title="Add Task"
                onPress={addTask}
                style={[styles.formButton, { flex: 1 }]}
              />
            </View>
          </Card>
        )}

        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <DynamicIcon name="check-square" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No Tasks Yet
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
              Add your first task to get organized
            </Text>
            <Button
              title="Add Task"
              onPress={() => setShowAddForm(true)}
              style={styles.createButton}
            />
          </View>
        ) : (
          <View style={styles.tasksList}>
            {tasks.map((task) => (
              <Card key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      { borderColor: theme.colors.border },
                      task.completed && { backgroundColor: theme.colors.success, borderColor: theme.colors.success }
                    ]}
                    onPress={() => toggleTask(task)}
                  >
                    {task.completed && (
                      <DynamicIcon name="check" size={16} color="white" />
                    )}
                  </TouchableOpacity>
                  <View style={styles.taskInfo}>
                    <Text style={[
                      styles.taskTitle,
                      { color: theme.colors.text },
                      task.completed && { textDecorationLine: 'line-through', color: theme.colors.textSecondary }
                    ]}>
                      {task.title}
                    </Text>
                    {task.description && (
                      <Text style={[styles.taskDescription, { color: theme.colors.textSecondary }]}>
                        {task.description}
                      </Text>
                    )}
                    <View style={styles.taskMeta}>
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                        <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                          {task.priority}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteTask(task.id)}
                  >
                    <DynamicIcon name="trash-2" size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  addForm: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  prioritySelector: {
    marginBottom: 16,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  formButton: {
    marginBottom: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  createButton: {
    marginTop: 20,
  },
  tasksList: {
    paddingBottom: 20,
  },
  taskCard: {
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});