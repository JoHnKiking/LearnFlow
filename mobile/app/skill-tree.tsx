import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { skillService } from '../src/services/api';
import { SkillNode } from '../src/types/skill';

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
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('错误', '无法打开链接');
    }
  };

  const renderSkillNode = (node: SkillNode, level = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <View key={node.id} style={[styles.nodeContainer, { marginLeft: level * 20 }]}>
        <TouchableOpacity 
          style={styles.nodeHeader}
          onPress={() => hasChildren && toggleNode(node.id)}
        >
          <Text style={styles.nodeName}>{node.name}</Text>
          {hasChildren && (
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          )}
        </TouchableOpacity>
        
        {node.description && (
          <Text style={styles.nodeDescription}>{node.description}</Text>
        )}

        {isExpanded && hasChildren && (
          <View style={styles.childrenContainer}>
            {node.children!.map(child => renderSkillNode(child, level + 1))}
          </View>
        )}

        {isExpanded && node.links && node.links.length > 0 && (
          <View style={styles.linksContainer}>
            {node.links.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={styles.linkButton}
                onPress={() => handleLinkPress(link.url)}
              >
                <Text style={styles.linkText}>{link.title}</Text>
                <Text style={styles.linkType}>{link.type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>加载中...</Text>
      </View>
    );
  }

  if (!skillTree) {
    return (
      <View style={styles.container}>
        <Text>技能树加载失败</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{domain} 技能树</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {renderSkillNode(skillTree)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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