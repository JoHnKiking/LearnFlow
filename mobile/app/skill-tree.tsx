import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { skillService } from '../src/services/api';
import { SkillNode } from '../src/types/skill';
import { SkillTreeNode } from '../src/components/skill-tree';
import { Button, Loading } from '../src/components/ui';
import { showErrorAlert } from '../src/utils';

const SkillTreeScreen = () => {
  const { domain } = useLocalSearchParams();
  const [skillTree, setSkillTree] = useState<SkillNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSkillTree();
  }, [domain]);

  const loadSkillTree = async () => {
    if (!domain) return;
    
    setLoading(true);
    try {
      const tree = await skillService.generateSkillTree({ domain: domain as string });
      setSkillTree(tree);
      setExpandedNodes(new Set([tree.id]));
    } catch (error) {
      Alert.alert('错误', '加载技能树失败');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleLinkPress = async (url: string) => {
    try {
      // 这里需要导入Linking，但为了简化，我们可以在SkillTreeNode组件内部处理
      // 或者使用utils中的工具函数
      Alert.alert('提示', `准备打开链接: ${url}`);
    } catch (error) {
      showErrorAlert('无法打开链接');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Loading visible={true} message="加载技能树中..." />
        </View>
      </SafeAreaView>
    );
  }

  if (!skillTree) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={{ fontSize: 16, color: '#FF3B30', marginBottom: 16, textAlign: 'center' }}>技能树加载失败</Text>
          <Button
            title="返回"
            onPress={() => router.back()}
            variant="outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            title="← 返回"
            onPress={() => router.back()}
            variant="outline"
            size="small"
            fullWidth={false}
          />
          <Text style={styles.headerTitle}>{domain} 技能树</Text>
        </View>
        
        <ScrollView style={styles.content}>
          <SkillTreeNode
            node={skillTree}
            level={0}
            isExpanded={expandedNodes.has(skillTree.id)}
            onToggle={toggleNode}
            onLinkPress={handleLinkPress}
          />
        </ScrollView>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  nodeContainer: {
    marginBottom: 10,
  },
  nodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  nodeName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  expandIcon: {
    fontSize: 12,
    color: '#666',
  },
  nodeDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginLeft: 10,
  },
  childrenContainer: {
    marginTop: 5,
  },
  linksContainer: {
    marginTop: 10,
  },
  linkButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#e8f4fd',
    borderRadius: 6,
    marginBottom: 5,
  },
  linkText: {
    fontSize: 14,
    color: '#007AFF',
    flex: 1,
  },
  linkType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#ddd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

export default SkillTreeScreen;