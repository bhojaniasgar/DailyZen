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
import { Expense } from '@/types/global';
import { analytics } from '@/lib/analytics';

const categories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Education',
  'Other',
];

export default function ExpensesScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState(categories[0]);
  const [newExpenseDescription, setNewExpenseDescription] = useState('');

  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

  const loadExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (error) {
        Alert.alert('Error', 'Failed to load expenses');
        return;
      }

      setExpenses(data || []);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async () => {
    const amount = parseFloat(newExpenseAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const { error } = await supabase
        .from('expenses')
        .insert([
          {
            user_id: user?.id,
            amount,
            category: newExpenseCategory,
            description: newExpenseDescription.trim(),
            date: new Date().toISOString().split('T')[0],
          },
        ]);

      if (error) {
        Alert.alert('Error', 'Failed to add expense');
        return;
      }

      analytics.expenseAdded(amount, newExpenseCategory);
      setNewExpenseAmount('');
      setNewExpenseCategory(categories[0]);
      setNewExpenseDescription('');
      setShowAddForm(false);
      loadExpenses();
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const deleteExpense = async (expenseId: string) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', expenseId);

              if (error) {
                Alert.alert('Error', 'Failed to delete expense');
                return;
              }

              loadExpenses();
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      'Food & Dining': 'coffee',
      'Transportation': 'fuel',
      'Shopping': 'shopping-bag',
      'Entertainment': 'star',
      'Bills & Utilities': 'zap',
      'Healthcare': 'heart',
      'Travel': 'map-pin',
      'Education': 'book',
      'Other': 'more-horizontal',
    };
    return iconMap[category] || 'dollar-sign';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <DynamicIcon name="chevron-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Expense Tracker
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loading}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading expenses...
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
          Expense Tracker
        </Text>
        <TouchableOpacity onPress={() => setShowAddForm(true)}>
          <DynamicIcon name="plus" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
            Total Expenses
          </Text>
          <Text style={[styles.summaryAmount, { color: theme.colors.primary }]}>
            ${getTotalExpenses().toFixed(2)}
          </Text>
          <Text style={[styles.summaryPeriod, { color: theme.colors.textSecondary }]}>
            This month
          </Text>
        </Card>

        {showAddForm && (
          <Card style={styles.addForm}>
            <Text style={[styles.formTitle, { color: theme.colors.text }]}>
              Add New Expense
            </Text>
            <Input
              label="Amount"
              placeholder="0.00"
              value={newExpenseAmount}
              onChangeText={setNewExpenseAmount}
              keyboardType="numeric"
              style={styles.input}
            />
            <View style={styles.categorySelector}>
              <Text style={[styles.categoryLabel, { color: theme.colors.text }]}>
                Category
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                      newExpenseCategory === category && { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary }
                    ]}
                    onPress={() => setNewExpenseCategory(category)}
                  >
                    <DynamicIcon 
                      name={getCategoryIcon(category)} 
                      size={16} 
                      color={newExpenseCategory === category ? theme.colors.primary : theme.colors.textSecondary} 
                    />
                    <Text style={[
                      styles.categoryButtonText,
                      { color: theme.colors.text },
                      newExpenseCategory === category && { color: theme.colors.primary }
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <Input
              label="Description (Optional)"
              placeholder="What was this expense for?"
              value={newExpenseDescription}
              onChangeText={setNewExpenseDescription}
              style={styles.input}
            />
            <View style={styles.formActions}>
              <Button
                title="Cancel"
                onPress={() => setShowAddForm(false)}
                variant="outline"
                style={[styles.formButton, { flex: 1 }]}
              />
              <Button
                title="Add Expense"
                onPress={addExpense}
                style={[styles.formButton, { flex: 1 }]}
              />
            </View>
          </Card>
        )}

        {expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <DynamicIcon name="dollar-sign" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No Expenses Yet
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
              Start tracking your expenses to better manage your budget
            </Text>
            <Button
              title="Add Expense"
              onPress={() => setShowAddForm(true)}
              style={styles.createButton}
            />
          </View>
        ) : (
          <View style={styles.expensesList}>
            {expenses.map((expense) => (
              <Card key={expense.id} style={styles.expenseCard}>
                <View style={styles.expenseHeader}>
                  <View style={styles.expenseInfo}>
                    <View style={[styles.expenseIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                      <DynamicIcon name={getCategoryIcon(expense.category)} size={20} color={theme.colors.primary} />
                    </View>
                    <View style={styles.expenseDetails}>
                      <Text style={[styles.expenseCategory, { color: theme.colors.text }]}>
                        {expense.category}
                      </Text>
                      {expense.description && (
                        <Text style={[styles.expenseDescription, { color: theme.colors.textSecondary }]}>
                          {expense.description}
                        </Text>
                      )}
                      <Text style={[styles.expenseDate, { color: theme.colors.textSecondary }]}>
                        {new Date(expense.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.expenseActions}>
                    <Text style={[styles.expenseAmount, { color: theme.colors.text }]}>
                      ${expense.amount.toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteExpense(expense.id)}
                    >
                      <DynamicIcon name="trash-2" size={16} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
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
  summaryCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryPeriod: {
    fontSize: 14,
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
  categorySelector: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    gap: 6,
  },
  categoryButtonText: {
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
  expensesList: {
    paddingBottom: 20,
  },
  expenseCard: {
    marginBottom: 12,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expenseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  expenseDescription: {
    fontSize: 14,
    marginBottom: 2,
  },
  expenseDate: {
    fontSize: 12,
  },
  expenseActions: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  deleteButton: {
    padding: 4,
  },
});