import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { skillService } from '../src/services/api';

const HomeScreen = () => {
  const [domain, setDomain] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' | 'search' | 'stats' | 'user'

  const handleGenerateSkillTree = async () => {
    if (!domain.trim()) {
      Alert.alert('错误', '请输入领域名称');
      return;
    }

    setLoading(true);
    try {
      await skillService.generateSkillTree({ domain: domain.trim() });
      router.push({
        pathname: '/skill-tree',
        params: { domain: domain.trim() }
      });
    } catch (error) {
      Alert.alert('错误', '生成技能树失败，请检查网络连接');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchDomains = async () => {
    if (!searchKeyword.trim()) {
      Alert.alert('提示', '请输入搜索关键词');
      return;
    }

    setLoading(true);
    try {
      const result = await skillService.searchPopularDomains(searchKeyword.trim());
      Alert.alert('搜索结果', `找到 ${result.total} 个相关领域:\n${result.results.join(', ')}`);
    } catch (error) {
      Alert.alert('错误', '搜索失败，请检查网络连接');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStatistics = async () => {
    setLoading(true);
    try {
      const stats = await skillService.getStatistics();
      Alert.alert('应用统计', 
        `总技能树: ${stats.totalTrees}\n` +
        `总用户数: ${stats.totalUsers}\n` +
        `平均进度: ${stats.averageProgress}%\n` +
        `热门领域: ${stats.popularDomains.map(d => d.domain).join(', ')}`
      );
    } catch (error) {
      Alert.alert('错误', '获取统计信息失败');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendedPath = async () => {
    if (!domain.trim()) {
      Alert.alert('错误', '请输入领域名称');
      return;
    }

    setLoading(true);
    try {
      const path = await skillService.getRecommendedPath(domain.trim());
      const pathDescription = path.path.map(step => 
        `第${step.step}步: ${step.topic} (${step.estimatedTime})`
      ).join('\n');
      
      Alert.alert('推荐学习路径', 
        `领域: ${path.domain}\n` +
        `当前级别: ${path.currentLevel}\n` +
        `目标级别: ${path.targetLevel}\n` +
        `总时间: ${path.totalEstimatedTime}\n\n` +
        `学习路径:\n${pathDescription}`
      );
    } catch (error) {
      Alert.alert('错误', '获取推荐路径失败');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetLearningReport = async () => {
    setLoading(true);
    try {
      const report = await skillService.getUserLearningReport('user1');
      Alert.alert('学习报告', 
        `用户: ${report.userId}\n` +
        `统计周期: ${report.period}\n\n` +
        `学习总时长: ${report.summary.totalLearningTime}\n` +
        `完成技能数: ${report.summary.completedSkills}\n` +
        `平均进度: ${report.summary.averageProgress}%\n` +
        `连续学习: ${report.summary.streakDays}天\n\n` +
        `推荐建议:\n${report.recommendations.join('\n')}`
      );
    } catch (error) {
      Alert.alert('错误', '获取学习报告失败');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSkillTreeList = async () => {
    setLoading(true);
    try {
      const result = await skillService.getSkillTreeList(1, 5);
      const treeNames = result.trees.map(tree => tree.name).join(', ');
      Alert.alert('技能树列表', 
        `共 ${result.total} 个技能树\n\n` +
        `前5个技能树:\n${treeNames}`
      );
    } catch (error) {
      Alert.alert('错误', '获取技能树列表失败');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderGenerateTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>生成技能树</Text>
      <TextInput
        style={styles.input}
        placeholder="请输入你想学习的领域（如：前端开发、后端开发）"
        value={domain}
        onChangeText={setDomain}
        onSubmitEditing={handleGenerateSkillTree}
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleGenerateSkillTree}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '生成中...' : '生成技能树'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.secondaryButton, loading && styles.buttonDisabled]}
        onPress={handleGetRecommendedPath}
        disabled={loading || !domain.trim()}
      >
        <Text style={styles.secondaryButtonText}>获取推荐学习路径</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>搜索热门领域</Text>
      <TextInput
        style={styles.input}
        placeholder="输入关键词搜索热门领域"
        value={searchKeyword}
        onChangeText={setSearchKeyword}
        onSubmitEditing={handleSearchDomains}
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSearchDomains}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '搜索中...' : '搜索领域'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.secondaryButton, loading && styles.buttonDisabled]}
        onPress={handleGetSkillTreeList}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>查看技能树列表</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStatsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>数据统计</Text>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleGetStatistics}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '加载中...' : '查看应用统计'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.secondaryButton, loading && styles.buttonDisabled]}
        onPress={handleGetLearningReport}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>查看我的学习报告</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>LearnFlow</Text>
      <Text style={styles.subtitle}>技能树学习助手</Text>
      
      {/* 选项卡导航 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'generate' && styles.activeTab]}
          onPress={() => setActiveTab('generate')}
        >
          <Text style={[styles.tabText, activeTab === 'generate' && styles.activeTabText]}>
            生成
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
            搜索
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
            统计
          </Text>
        </TouchableOpacity>
      </View>

      {/* 选项卡内容 */}
      {activeTab === 'generate' && renderGenerateTab()}
      {activeTab === 'search' && renderSearchTab()}
      {activeTab === 'stats' && renderStatsTab()}

      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>处理中...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    width: '100%',
    height: 45,
    backgroundColor: '#34C759',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;