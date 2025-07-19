import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { DynamicIcon } from '@/components/icons/DynamicIcon';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'habit' | 'task' | 'quote' | 'tool';
  route?: string;
}

export default function SearchScreen() {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (query.length > 2) {
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const performSearch = (searchQuery: string) => {
    // TODO: Implement actual search across all data
    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: 'Morning Exercise',
        description: 'Daily habit - 5 day streak',
        type: 'habit',
        route: '/tools/habits',
      },
      {
        id: '2',
        title: 'Finish project proposal',
        description: 'High priority task - Due tomorrow',
        type: 'task',
        route: '/tools/todos',
      },
      {
        id: '3',
        title: 'The only way to do great work...',
        description: 'Steve Jobs - Motivation',
        type: 'quote',
        route: '/tools/quotes',
      },
    ].filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setResults(mockResults);
  };

  const handleResultPress = (result: SearchResult) => {
    if (result.route) {
      router.push(result.route as any);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'habit': return 'target';
      case 'task': return 'check-square';
      case 'quote': return 'quote';
      case 'tool': return 'star';
      default: return 'search';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
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

        {results.length > 0 && (
          <View style={styles.results}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Results ({results.length})
            </Text>
            {results.map((result) => (
              <Card key={result.id} onPress={() => handleResultPress(result)} style={styles.resultCard}>
                <View style={styles.resultContent}>
                  <View style={[styles.resultIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                    <DynamicIcon name={getResultIcon(result.type)} size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={[styles.resultTitle, { color: theme.colors.text }]}>
                      {result.title}
                    </Text>
                    <Text style={[styles.resultDescription, { color: theme.colors.textSecondary }]}>
                      {result.description}
                    </Text>
                  </View>
                  <DynamicIcon name="chevron-right" size={16} color={theme.colors.textSecondary} />
                </View>
              </Card>
            ))}
          </View>
        )}

        {query.length > 2 && results.length === 0 && (
          <View style={styles.noResults}>
            <DynamicIcon name="search" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.noResultsText, { color: theme.colors.textSecondary }]}>
              No results found for "{query}"
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
    backgroundColor: 'rgba(0,0,0,0.05)',
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
  },
  noResults: {
    alignItems: 'center',
    marginTop: 60,
    gap: 16,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
  },
});