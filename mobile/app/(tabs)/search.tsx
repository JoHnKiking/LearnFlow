import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/utils';
import { useSearch } from '../../src/hooks/useSearch';
import { showErrorAlert } from '../../src/utils';

interface SearchResult {
  id: string;
  domain: string;
  description: string;
  popularity: number;
}

const SearchScreen = () => {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const { searchDomains } = useSearch();

  const handleSearch = async () => {
    if (!keyword.trim()) {
      Alert.alert('错误', '请输入搜索关键词');
      return;
    }

    setLoading(true);
    try {
      const searchResults = await searchDomains(keyword);
      setResults(searchResults || []);
    } catch (error) {
      showErrorAlert('搜索失败', error as string);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSkillTree = (domain: string) => {
    router.push({
      pathname: '/skill-tree',
      params: { domain }
    });
  };

  const handleQuickSearch = (quickKeyword: string) => {
    setKeyword(quickKeyword);
  };

  const renderResultItem = ({ item }: { item: SearchResult }) => (
    <View style={styles.resultItem}>
      <Text style={styles.resultTitle}>{item.domain}</Text>
      <Text style={styles.resultDescription}>{item.description}</Text>
      <View style={styles.resultFooter}>
        <Text style={styles.popularityText}>热度: {item.popularity}</Text>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleViewSkillTree(item.domain)}
          activeOpacity={0.7}
        >
          <Text style={styles.viewButtonText}>查看技能树</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>搜索技能树</Text>
          <Text style={styles.subtitle}>搜索已有的技能树或热门领域</Text>
        </View>

        <View style={styles.searchCard}>
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>搜索关键词</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputPlaceholder}>{keyword || '输入关键词搜索技能树...'}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.searchButton, loading && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.searchButtonText}>
              {loading ? '搜索中...' : '搜索'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickCard}>
          <Text style={styles.sectionTitle}>热门搜索</Text>
          <View style={styles.quickButtons}>
            {['前端开发', '后端开发', '移动开发', '数据科学'].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.quickButton}
                onPress={() => handleQuickSearch(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickButtonText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {results.length > 0 ? (
          <View style={styles.resultsCard}>
            <Text style={styles.sectionTitle}>搜索结果 ({results.length})</Text>
            <FlatList
              data={results}
              renderItem={renderResultItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无搜索结果</Text>
            <Text style={styles.emptySubtext}>尝试使用其他关键词搜索</Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  searchCard: {
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    padding: 16,
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  inputPlaceholder: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
  },
  searchButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  quickCard: {
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 12,
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(93,155,250,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.25)',
  },
  quickButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '500',
  },
  resultsCard: {
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    padding: 16,
  },
  resultItem: {
    padding: 12,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
    lineHeight: 18,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularityText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(93,155,250,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.25)',
  },
  viewButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
  },
  bottomPadding: {
    height: 100,
  },
});

export default SearchScreen;
