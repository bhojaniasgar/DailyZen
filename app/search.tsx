import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { supabase } from '@/lib/supabase';
import { SearchResult } from '@/types/global';

export default function SearchScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length > 2) {
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search habits
      const { data: habits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);

      habits?.forEach(habit => {
        searchResults.push({
          id: habit.id,
          title: habit.title,
          description: habit.description || 'Habit',
          type: 'habit',
          route: '/tools/habits',
          data: habit,
        });
      });

      // Search tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);

      tasks?.forEach(task => {
        searchResults.push({
          id: task.id,
          title: task.title,
          description: task.description || `${task.priority} priority task`,
          type: 'task',
          route: '/tools/todos',
          data: task,
        });
      });

      // Search expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .or(`category.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);

      expenses?.forEach(expense => {
        searchResults.push({
          id: expense.id,
          title: `$${expense.amount} - ${expense.category}`,
          description: expense.description || expense.category,
          type: 'expense',
          route: '/tools/expenses',
          data: expense,
        });
      });

      // Search quotes
      const { data: quotes } = await supabase
        .from('quotes')
        .select('*')
        .or(`text.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
        .limit(10);

      quotes?.forEach(quote => {
        searchResults.push({
          id: quote.id,
          title: quote.text.substring(0, 50) + '...',
          description: `by ${quote.author}`,
          type: 'quote',
          route: '/tools/quotes',
          data: quote,
        });
      });

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultPress = (result: SearchResult) => {
    // Add to recent searches
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(s => s !== query)].slice(0, 5);
      return updated;
    });

    if (result.route) {
      router.push(result.route as any);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'habit': return 'target';
      case 'task': return 'check-square';
      case 'expense': return 'dollar-sign';
      case 'quote': return 'quote';
      case 'tool': return 'star';
      default: return 'search';
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'habit': return theme.colors.primary;
      case 'task': return theme.colors.success;
      case 'expense': return theme.colors.warning;
      case 'quote': return theme.colors.accent;
      case 'tool': return theme.colors.secondary;
      default: return theme.colors.textSecondary;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <DynamicIcon name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search habits, tasks, quotes..."
            placeholderTextColor={theme.colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.cancelButton, { color: theme.colors.primary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {query.length === 0 && (
          <View style={styles.suggestions}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Recent Searches
            </Text>
            {recentSearches.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No recent searches
              </Text>
            ) : (
              recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentSearch}
                  onPress={() => setQuery(search)}
                >
                  <DynamicIcon name="search" size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.recentSearchText, { color: theme.colors.text }]}>
                    {search}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Searching...
            </Text>
          </View>
        )}

        {results.length > 0 && (
          <View style={styles.results}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Results ({results.length})
            </Text>
            {results.map((result) => (
              <Card key={`${result.type}-${result.id}`} onPress={() => handleResultPress(result)} style={styles.resultCard}>
                <View style={styles.resultContent}>
                  <View style={[styles.resultIcon, { backgroundColor: getResultColor(result.type) + '20' }]}>
                    <DynamicIcon name={getResultIcon(result.type)} size={20} color={getResultColor(result.type)} />
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={[styles.resultTitle, { color: theme.colors.text }]}>
                      {result.title}
                    </Text>
                    <Text style={[styles.resultDescription, { color: theme.colors.textSecondary }]}>
                      {result.description}
                    </Text>
                    <Text style={[styles.resultType, { color: getResultColor(result.type) }]}>
                      {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                    </Text>
                  </View>
                  <DynamicIcon name="chevron-right" size={16} color={theme.colors.textSecondary} />
                </View>
              </Card>
            ))}
          </View>
        )}

        {query.length > 2 && results.length === 0 && !loading && (
          <View style={styles.noResults}>
            <DynamicIcon name="search" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.noResultsText, { color: theme.colors.textSecondary }]}>
              No results found for "{query}"
            </Text>
            <Text style={[styles.noResultsSubtext, { color: theme.colors.textSecondary }]}>
              Try searching for habits, tasks, expenses, or quotes
            </Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  suggestions: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  recentSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  recentSearchText: {
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    fontSize: 16,
  },
  results: {
    marginTop: 20,
  },
  resultCard: {
    marginBottom: 12,
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  resultType: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  noResults: {
    alignItems: 'center',
    marginTop: 60,
    gap: 16,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});