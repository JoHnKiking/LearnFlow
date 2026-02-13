import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Input, Loading } from '../../src/components/ui';
import { useSearch } from '../../src/hooks/useSearch';
import { COLORS, SPACING, showErrorAlert } from '../../src/utils';

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
        <Button 
          title="查看技能树" 
          onPress={() => handleViewSkillTree(item.domain)}
          variant="outline"
          size="small"
          fullWidth={false}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading visible={true} message="搜索中..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>搜索技能树</Text>
          <Text style={styles.subtitle}>搜索已有的技能树或热门领域</Text>
        </View>

        <View style={styles.searchContainer}>
          <Input
            placeholder="输入关键词搜索技能树..."
            value={keyword}
            onChangeText={setKeyword}
            label="搜索关键词"
          />
          
          <Button 
            title="搜索" 
            onPress={handleSearch}
            variant="primary"
            size="large"
          />
        </View>

        <View style={styles.quickContainer}>
          <Text style={styles.sectionTitle}>热门搜索</Text>
          <View style={styles.quickButtons}>
            <Button 
              title="前端开发" 
              onPress={() => handleQuickSearch('前端开发')}
              variant="outline"
              size="small"
              fullWidth={false}
            />
            <Button 
              title="后端开发" 
              onPress={() => handleQuickSearch('后端开发')}
              variant="outline"
              size="small"
              fullWidth={false}
            />
            <Button 
              title="移动开发" 
              onPress={() => handleQuickSearch('移动开发')}
              variant="outline"
              size="small"
              fullWidth={false}
            />
            <Button 
              title="数据科学" 
              onPress={() => handleQuickSearch('数据科学')}
              variant="outline"
              size="small"
              fullWidth={false}
            />
          </View>
        </View>

        {results.length > 0 ? (
          <View style={styles.resultsContainer}>
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
    padding: SPACING.LARGE,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.XLARGE,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  searchContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LARGE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: SPACING.XLARGE,
  },
  quickContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LARGE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: SPACING.XLARGE,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MEDIUM,
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SMALL,
  },
  resultsContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LARGE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultItem: {
    padding: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    marginBottom: SPACING.MEDIUM,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SMALL,
    lineHeight: 20,
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
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.XLARGE,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SMALL,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default SearchScreen;