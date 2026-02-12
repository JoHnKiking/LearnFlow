import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSkillTree, useSearch, useStatistics } from '../src/hooks';
import { Button, Input, Loading } from '../src/components/ui';
import { COLORS, SPACING, showErrorAlert } from '../src/utils';

const HomeScreen = () => {
  const [domain, setDomain] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' | 'search' | 'stats' | 'user'
  
  const { loading: skillTreeLoading, generateSkillTree, getRecommendedPath } = useSkillTree();
  const { loading: searchLoading, searchDomains, getSkillTreeList } = useSearch();
  const { loading: statsLoading, getStatistics, getLearningReport } = useStatistics();
  
  const loading = skillTreeLoading || searchLoading || statsLoading;

  // 生成指定领域的技能树并跳转到技能树页面
  const handleGenerateSkillTree = async () => {
    await generateSkillTree(domain);
  };

  // 搜索热门领域并显示搜索结果
  const handleSearchDomains = async () => {
    const result = await searchDomains(searchKeyword);
    if (result) {
      Alert.alert('搜索结果', `找到 ${result.total} 个相关领域:\n${result.results.join(', ')}`);
    }
  };

  // 获取应用统计数据并显示统计信息
  const handleGetStatistics = async () => {
    const stats = await getStatistics();
    if (stats) {
      Alert.alert('应用统计', 
        `总技能树: ${stats.totalTrees}\n` +
        `总用户数: ${stats.totalUsers}\n` +
        `平均进度: ${stats.averageProgress}%\n` +
        `热门领域: ${stats.popularDomains.map((d: any) => d.domain).join(', ')}`
      );
    }
  };

  // 获取指定领域的推荐学习路径并显示路径信息
  const handleGetRecommendedPath = async () => {
    const path = await getRecommendedPath(domain);
    if (path) {
      const pathDescription = path.path.map((step: any) => 
        `第${step.step}步: ${step.topic} (${step.estimatedTime})`
      ).join('\n');
      
      Alert.alert('推荐学习路径', 
        `领域: ${path.domain}\n` +
        `当前级别: ${path.currentLevel}\n` +
        `目标级别: ${path.targetLevel}\n` +
        `总时间: ${path.totalEstimatedTime}\n\n` +
        `学习路径:\n${pathDescription}`
      );
    }
  };

  // 获取用户学习报告并显示报告信息
  const handleGetLearningReport = async () => {
    const report = await getLearningReport('user1');
    if (report) {
      Alert.alert('学习报告', 
        `用户: ${report.userId}\n` +
        `统计周期: ${report.period}\n\n` +
        `学习总时长: ${report.summary.totalLearningTime}\n` +
        `完成技能数: ${report.summary.completedSkills}\n` +
        `平均进度: ${report.summary.averageProgress}%\n` +
        `连续学习: ${report.summary.streakDays}天\n\n` +
        `推荐建议:\n${report.recommendations.join('\n')}`
      );
    }
  };

  // 获取应用中的技能树列表并显示列表信息
  const handleGetSkillTreeList = async () => {
    const result = await getSkillTreeList(1, 5);
    if (result) {
      const treeNames = result.trees.map((tree: any) => tree.name).join(', ');
      Alert.alert('技能树列表', 
        `共 ${result.total} 个技能树\n\n` +
        `前5个技能树:\n${treeNames}`
      );
    }
  };

  // 渲染生成技能树的标签页内容
  const renderGenerateTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>生成技能树</Text>
      <Input
        value={domain}
        onChangeText={setDomain}
        placeholder="请输入你想学习的领域（如：前端开发、后端开发）"
        onSubmitEditing={handleGenerateSkillTree}
      />
      
      <Button
        title={loading ? '生成中...' : '生成技能树'}
        onPress={handleGenerateSkillTree}
        disabled={loading}
        fullWidth
      />

      <Button
        title="获取推荐学习路径"
        onPress={handleGetRecommendedPath}
        disabled={loading || !domain.trim()}
        variant="secondary"
        fullWidth
      />
    </View>
  );

  // 渲染搜索热门领域的标签页内容
  const renderSearchTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>搜索热门领域</Text>
      <Input
        value={searchKeyword}
        onChangeText={setSearchKeyword}
        placeholder="输入关键词搜索热门领域"
        onSubmitEditing={handleSearchDomains}
      />
      
      <Button
        title={loading ? '搜索中...' : '搜索领域'}
        onPress={handleSearchDomains}
        disabled={loading}
        fullWidth
      />

      <Button
        title="查看技能树列表"
        onPress={handleGetSkillTreeList}
        disabled={loading}
        variant="secondary"
        fullWidth
      />
    </View>
  );

  // 渲染数据统计的标签页内容
  const renderStatsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>数据统计</Text>
      
      <Button
        title={loading ? '加载中...' : '查看应用统计'}
        onPress={handleGetStatistics}
        disabled={loading}
        fullWidth
      />

      <Button
        title="查看我的学习报告"
        onPress={handleGetLearningReport}
        disabled={loading}
        variant="secondary"
        fullWidth
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
      <Text style={styles.title}>LearnFlow</Text>
      <Text style={styles.subtitle}>技能树学习助手</Text>
      
      {/* 选项卡导航 */}
      <View style={styles.tabContainer}>
        <Button
          title="生成"
          onPress={() => setActiveTab('generate')}
          variant={activeTab === 'generate' ? 'primary' : 'outline'}
          size="small"
          fullWidth={false}
        />
        
        <Button
          title="搜索"
          onPress={() => setActiveTab('search')}
          variant={activeTab === 'search' ? 'primary' : 'outline'}
          size="small"
          fullWidth={false}
        />
        
        <Button
          title="统计"
          onPress={() => setActiveTab('stats')}
          variant={activeTab === 'stats' ? 'primary' : 'outline'}
          size="small"
          fullWidth={false}
        />
      </View>

      {/* 选项卡内容 */}
      {activeTab === 'generate' && renderGenerateTab()}
      {activeTab === 'search' && renderSearchTab()}
      {activeTab === 'stats' && renderStatsTab()}

      <Loading visible={loading} message="处理中..." />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
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