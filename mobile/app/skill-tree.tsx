import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Linking, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSkillTreeByDomain, PLATFORM_NAME_MAP } from '../src/data/skillTrees';
import { SkillTree, PlatformType, StageType } from '../src/types/skill';
import { COLORS } from '../src/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getPlatformIcon = (platform: PlatformType) => {
  switch (platform) {
    case 'bilibili':
      return { icon: 'play-circle', color: '#FB7299' };
    case 'xiaohongshu':
      return { icon: 'book', color: '#FF2442' };
    case 'mooc':
      return { icon: 'graduation-cap', color: '#5D9BFA' };
    default:
      return { icon: 'link', color: '#888' };
  }
};

const getStageColor = (stage: StageType) => {
  switch (stage) {
    case 'beginner':
      return { bg: 'rgba(93, 155, 250, 0.15)', border: 'rgba(93, 155, 250, 0.3)', text: '#5D9BFA' };
    case 'intermediate':
      return { bg: 'rgba(72, 209, 176, 0.15)', border: 'rgba(72, 209, 176, 0.3)', text: '#48D1B0' };
    case 'advanced':
      return { bg: 'rgba(255, 152, 0, 0.15)', border: 'rgba(255, 152, 0, 0.3)', text: '#FF9800' };
    default:
      return { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', text: '#fff' };
  }
};

const StageNode: React.FC<{ name: string; duration: number; stageColor: ReturnType<typeof getStageColor> }> = ({ name, duration, stageColor }) => (
  <View style={[styles.stageNode, { backgroundColor: stageColor.bg, borderColor: stageColor.border }]}>
    <Text style={[styles.stageName, { color: stageColor.text }]}>{name}</Text>
    <Text style={styles.stageDuration}>{duration}小时</Text>
  </View>
);

const SkillNodeItem: React.FC<{
  name: string;
  platform: PlatformType;
  duration: number;
  url: string;
  index: number;
  stageColor: ReturnType<typeof getStageColor>;
  onSelect?: (name: string, url: string, suggestedDuration: number) => void;
  disabled?: boolean;
}> = ({ name, platform, duration, url, index, stageColor, onSelect, disabled }) => {
  const platformInfo = getPlatformIcon(platform);

  const handlePress = () => {
    if (onSelect && !disabled) {
      onSelect(name, url, duration);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.skillNode, { borderColor: stageColor.border }, disabled && styles.skillNodeDisabled]}
      onPress={handlePress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      <View style={styles.skillNodeHeader}>
        <View style={styles.nodeBadge}>
          <Text style={styles.nodeBadgeText}>{index + 1}</Text>
        </View>
        <Ionicons name={platformInfo.icon} size={14} color={platformInfo.color} />
      </View>
      <Text style={styles.skillNodeName}>{name}</Text>
      <View style={styles.skillNodeFooter}>
        <Text style={[styles.platformText, { color: platformInfo.color }]}>
          {PLATFORM_NAME_MAP[platform]}
        </Text>
        <Text style={styles.durationText}>{duration}h</Text>
      </View>
      <View style={styles.arrowIcon}>
        <Ionicons name="chevron-right" size={14} color="#5D9BFA" />
      </View>
    </TouchableOpacity>
  );
};

const DurationModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  nodeName: string;
  url: string;
  suggestedDuration: number;
}> = ({ visible, onClose, nodeName, url, suggestedDuration }) => {
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [monsterStamina, setMonsterStamina] = useState(100);

  useEffect(() => {
    const loadStamina = async () => {
      const monster = await AsyncStorage.getItem('monster');
      if (monster) {
        setMonsterStamina(JSON.parse(monster).stamina || 100);
      }
    };
    loadStamina();
  }, []);

  const durations = [15, 25, 30, 45, 60];
  const staminaCost = 10;

  const handleConfirm = async () => {
    if (monsterStamina < staminaCost) {
      Alert.alert('体力不足', `需要 ${staminaCost} 点体力，当前体力 ${monsterStamina} 点`, [
        { text: '知道了', onPress: () => {} }
      ]);
      return;
    }

    try {
      const monster = await AsyncStorage.getItem('monster');
      if (monster) {
        const monsterData = JSON.parse(monster);
        monsterData.stamina = Math.max(0, monsterData.stamina - staminaCost);
        await AsyncStorage.setItem('monster', JSON.stringify(monsterData));
      }

      const isValidUrl = url.startsWith('http://') || url.startsWith('https://');
      if (!isValidUrl) {
        Alert.alert('错误', '链接格式不正确');
        return;
      }

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        Linking.openURL(url).catch(err => {
          console.error('Linking error:', err);
          Alert.alert('错误', '无法打开链接，请检查网络连接');
        });
      } else {
        Alert.alert('错误', '设备不支持打开此链接');
      }
      onClose();
    } catch (error) {
      console.error('Handle confirm error:', error);
      Alert.alert('错误', '操作失败，请稍后重试');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent onRequestClose={onClose} animationType="slide">
      <View style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>开始学习</Text>
            <TouchableOpacity style={styles.modalClose} onPress={onClose}>
              <Ionicons name="close" size={20} color="#888" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalNodeName}>{nodeName}</Text>

          <View style={styles.staminaInfo}>
            <View style={styles.staminaBar}>
              <View style={[styles.staminaFill, { width: `${monsterStamina}%` }]} />
            </View>
            <Text style={styles.staminaText}>体力: {monsterStamina}/100</Text>
          </View>

          <Text style={styles.modalSubtitle}>选择学习时长</Text>
          <View style={styles.durationOptions}>
            {durations.map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.durationButton,
                  selectedDuration === d && styles.durationButtonActive,
                  { backgroundColor: selectedDuration === d ? '#5D9BFA' : '#0F1030' }
                ]}
                onPress={() => setSelectedDuration(d)}
              >
                <Text style={[styles.durationTextSmall, selectedDuration === d && styles.durationTextActive]}>
                  {d}分钟
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.costInfo}>
            <Text style={styles.costText}>预计消耗体力: {staminaCost} 点</Text>
            <Text style={styles.suggestedText}>建议学习时长: {suggestedDuration}小时</Text>
          </View>

          <TouchableOpacity style={styles.modalConfirmButton} onPress={handleConfirm}>
            <Text style={styles.modalConfirmText}>开始学习</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const SkillTreeScreen = () => {
  const { domain } = useLocalSearchParams();
  const [skillTree, setSkillTree] = useState<SkillTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState({ name: '', url: '', suggestedDuration: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingNode, setEditingNode] = useState<{ stageId: string; nodeIndex: number; name: string; url: string; duration: number; stage: string } | null>(null);
  const [customNodes, setCustomNodes] = useState<{ name: string; url: string; duration: number; stage: string }[]>([]);

  useEffect(() => {
    loadSkillTree();
  }, [domain]);

  const loadSkillTree = async () => {
    setLoading(true);
    if (!domain) {
      setLoading(false);
      return;
    }

    const domainStr = domain as string;
    
    if (domainStr.startsWith('custom-')) {
      const customData = await AsyncStorage.getItem(`customModule-${domainStr}`);
      const moduleData = await AsyncStorage.getItem('savedModules');
      
      let moduleName = '自定义模块';
      if (moduleData) {
        const modules = JSON.parse(moduleData);
        const customModule = modules.find((m: any) => m.id === domainStr);
        if (customModule) {
          moduleName = customModule.name;
        }
      }

      const savedCustomNodes: { name: string; url: string; duration: number; stage: string }[] = [];
      if (customData) {
        savedCustomNodes.push(...JSON.parse(customData));
      }
      setCustomNodes(savedCustomNodes);

      const totalDuration = savedCustomNodes.reduce((sum, node) => sum + (node.duration || 1), 0) || 60;

      const stages = [
        { id: 'beginner', name: '入门阶段' },
        { id: 'intermediate', name: '进阶阶段' },
        { id: 'advanced', name: '精通阶段' },
      ].map((stage) => {
        const stageNodes = savedCustomNodes.filter(node => node.stage === stage.id);
        const stageDuration = stageNodes.reduce((sum, node) => sum + (node.duration || 1), 0) || Math.ceil(totalDuration / 3);
        
        return {
          ...stage,
          duration: stageDuration,
          nodes: stageNodes.map((node, index) => ({
            id: `custom-node-${stage.id}-${index}`,
            name: node.name || `${stage.name} 节点 ${index + 1}`,
            description: '',
            stage: stage.id,
            platform: 'bilibili',
            url: node.url || 'https://example.com',
            duration: node.duration || 1,
          })),
        };
      });

      const customTree: SkillTree = {
        id: domainStr,
        domain: domainStr,
        title: moduleName,
        description: '自定义学习模块',
        totalDuration,
        learningMethod: '按照自己的节奏学习，完成每个节点的课程',
        learningGoal: '掌握自定义学习领域的知识和技能',
        frameworkExplanation: '采用"入门-进阶-精通"三层结构，循序渐进提升技能',
        stages,
      };

      setSkillTree(customTree);
    } else {
      const tree = getSkillTreeByDomain(domainStr);
      setSkillTree(tree || null);
    }
    setLoading(false);
  };

  const handleNodeSelect = (name: string, url: string, suggestedDuration: number) => {
    setSelectedNode({ name, url, suggestedDuration });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleGoBack = () => {
    router.back();
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setEditModalVisible(false);
  };

  const handleEditNode = (stageId: string, nodeIndex: number, node: any) => {
    setEditingNode({
      stageId,
      nodeIndex,
      name: node.name,
      url: node.url,
      duration: node.duration,
      stage: node.stage || stageId,
    });
    setEditModalVisible(true);
  };

  const handleDeleteNode = async (stageId: string, nodeIndex: number) => {
    Alert.alert('确认删除', '确定要删除这个学习节点吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          const updatedNodes = customNodes.filter((_, index) => {
            const stageOrder = ['beginner', 'intermediate', 'advanced'];
            const stageIndex = stageOrder.indexOf(stageId);
            let cumulativeIndex = 0;
            for (let i = 0; i < stageIndex; i++) {
              cumulativeIndex += customNodes.filter(n => n.stage === stageOrder[i]).length;
            }
            return index !== cumulativeIndex + nodeIndex;
          });
          setCustomNodes(updatedNodes);
          await AsyncStorage.setItem(`customModule-${domain}`, JSON.stringify(updatedNodes));
          loadSkillTree();
        },
      },
    ]);
  };

  const saveEditNode = async () => {
    if (!editingNode) return;

    const stageOrder = ['beginner', 'intermediate', 'advanced'];
    const stageIndex = stageOrder.indexOf(editingNode.stageId);
    let cumulativeIndex = 0;
    for (let i = 0; i < stageIndex; i++) {
      cumulativeIndex += customNodes.filter(n => n.stage === stageOrder[i]).length;
    }
    const actualIndex = cumulativeIndex + editingNode.nodeIndex;

    const updatedNodes = [...customNodes];
    updatedNodes[actualIndex] = {
      ...updatedNodes[actualIndex],
      name: editingNode.name,
      url: editingNode.url,
      duration: editingNode.duration,
      stage: editingNode.stage,
    };
    setCustomNodes(updatedNodes);
    await AsyncStorage.setItem(`customModule-${domain}`, JSON.stringify(updatedNodes));
    setEditModalVisible(false);
    loadSkillTree();
  };

  const addNewNode = async (stage: string) => {
    const newNode = { name: '', url: '', duration: 1, stage };
    const updatedNodes = [...customNodes, newNode];
    setCustomNodes(updatedNodes);
    await AsyncStorage.setItem(`customModule-${domain}`, JSON.stringify(updatedNodes));
    loadSkillTree();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <Ionicons name="spinner" size={32} color="#5D9BFA" style={{ animation: 'spin 1s linear infinite' }} />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!skillTree) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={{ fontSize: 16, color: '#FF3B30', marginBottom: 16, textAlign: 'center' }}>技能树加载失败</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Text style={styles.backArrow}>← 返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleGoBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{skillTree.title}</Text>
          {domain && (domain as string).startsWith('custom-') && (
            <TouchableOpacity 
              style={[styles.editButton, isEditing && styles.editButtonActive]}
              onPress={toggleEditMode}
              activeOpacity={0.7}
            >
              <Text style={styles.editButtonText}>{isEditing ? '完成' : '编辑'}</Text>
            </TouchableOpacity>
          )}
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionTitle}>📚 学习方法</Text>
          <Text style={styles.descriptionText}>{skillTree.learningMethod}</Text>
          
          <Text style={styles.descriptionTitle}>🎯 学习目标</Text>
          <Text style={styles.descriptionText}>{skillTree.learningGoal}</Text>
          
          <Text style={styles.descriptionTitle}>🏗️ 框架说明</Text>
          <Text style={styles.descriptionText}>{skillTree.frameworkExplanation}</Text>
        </View>

        <View style={styles.totalDurationBadge}>
          <Ionicons name="clock" size={14} color="#5D9BFA" />
          <Text style={styles.totalDurationText}>总时长 {skillTree.totalDuration}小时</Text>
        </View>

        <View style={styles.treeContainer}>
          {skillTree.stages.map((stage, stageIndex) => {
            const stageColor = getStageColor(stage.id);
            return (
              <View key={stage.id} style={[styles.stageColumn, stageIndex === 1 && styles.middleStage]}>
                <StageNode name={stage.name} duration={stage.duration} stageColor={stageColor} />

                <View style={styles.skillNodesList}>
                  {stage.nodes.map((node, nodeIndex) => (
                    <View key={node.id} style={styles.nodeWrapper}>
                      <SkillNodeItem
                        name={node.name}
                        platform={node.platform}
                        duration={node.duration}
                        url={node.url}
                        index={nodeIndex}
                        stageColor={stageColor}
                        onSelect={isEditing ? undefined : handleNodeSelect}
                        disabled={isEditing}
                      />
                      {isEditing && (
                        <View style={styles.editActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleEditNode(stage.id, nodeIndex, node)}
                          >
                            <Ionicons name="pencil" size={16} color="#5D9BFA" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDeleteNode(stage.id, nodeIndex)}
                          >
                            <Ionicons name="trash" size={16} color="#FF6B6B" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))}
                </View>

                {isEditing && (domain as string).startsWith('custom-') && (
                  <TouchableOpacity
                    style={[styles.addStageNodeButton, { borderColor: stageColor.border }]}
                    onPress={() => addNewNode(stage.id)}
                  >
                    <Ionicons name="plus" size={16} color={stageColor.text} />
                    <Text style={[styles.addStageNodeButtonText, { color: stageColor.text }]}>
                      添加{stage.name}节点
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <DurationModal
        visible={modalVisible}
        onClose={handleCloseModal}
        nodeName={selectedNode.name}
        url={selectedNode.url}
        suggestedDuration={selectedNode.suggestedDuration}
      />

      <Modal visible={editModalVisible} transparent onRequestClose={() => setEditModalVisible(false)} animationType="slide">
        <View style={styles.modalOverlay} onPress={() => setEditModalVisible(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>编辑学习节点</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            {editingNode && (
              <>
                <TextInput
                  style={styles.formInput}
                  placeholder="课程名称"
                  placeholderTextColor="#555577"
                  value={editingNode.name}
                  onChangeText={(text) => setEditingNode({ ...editingNode, name: text })}
                />
                <TextInput
                  style={styles.formInput}
                  placeholder="课程链接"
                  placeholderTextColor="#555577"
                  value={editingNode.url}
                  onChangeText={(text) => setEditingNode({ ...editingNode, url: text })}
                />
                <TextInput
                  style={styles.formInput}
                  placeholder="时长(h)"
                  placeholderTextColor="#555577"
                  keyboardType="numeric"
                  value={String(editingNode.duration)}
                  onChangeText={(text) => setEditingNode({ ...editingNode, duration: parseFloat(text) || 1 })}
                />
                <Text style={styles.modalSubtitle}>选择阶段</Text>
                <View style={styles.stageOptions}>
                  {[{ id: 'beginner', name: '入门阶段' }, { id: 'intermediate', name: '进阶阶段' }, { id: 'advanced', name: '精通阶段' }].map((stage) => (
                    <TouchableOpacity
                      key={stage.id}
                      style={[
                        styles.stageButton,
                        editingNode.stage === stage.id && styles.stageButtonActive,
                      ]}
                      onPress={() => setEditingNode({ ...editingNode, stage: stage.id })}
                    >
                      <Text style={[styles.stageButtonText, editingNode.stage === stage.id && styles.stageButtonTextActive]}>
                        {stage.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.modalConfirmButton} onPress={saveEditNode}>
                  <Text style={styles.modalConfirmText}>保存修改</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0A0A0F',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(93, 155, 250, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  backButtonText: {
    color: '#5D9BFA',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerPlaceholder: {
    width: 40,
  },
  descriptionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5D9BFA',
    marginTop: 16,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: '#E8E8F0',
    lineHeight: 20,
  },
  totalDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(93, 155, 250, 0.15)',
    marginHorizontal: 20,
    marginBottom: 20,
    alignSelf: 'center',
  },
  totalDurationText: {
    fontSize: 12,
    color: '#5D9BFA',
    fontWeight: '600',
  },
  treeContainer: {
    paddingHorizontal: 16,
  },
  stageColumn: {
    marginBottom: 20,
  },
  middleStage: {
    marginTop: 20,
  },
  stageNode: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  stageName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  stageDuration: {
    fontSize: 10,
    color: '#888',
  },
  skillNodesList: {
    gap: 8,
  },
  skillNode: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    position: 'relative',
  },
  skillNodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  nodeBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(93, 155, 250, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeBadgeText: {
    fontSize: 10,
    color: '#5D9BFA',
    fontWeight: '700',
  },
  skillNodeName: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 16,
  },
  skillNodeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  platformText: {
    fontSize: 10,
    fontWeight: '500',
  },
  durationText: {
    fontSize: 10,
    color: '#888',
    fontWeight: '500',
  },
  durationTextSmall: {
    fontSize: 12,
    color: '#888',
  },
  arrowIcon: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
  bottomPadding: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalNodeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  staminaInfo: {
    marginBottom: 16,
  },
  staminaBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  staminaFill: {
    height: '100%',
    backgroundColor: '#3AE374',
    borderRadius: 4,
  },
  staminaText: {
    fontSize: 12,
    color: '#8888AA',
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  durationButtonActive: {
    borderColor: '#5D9BFA',
  },
  durationTextActive: {
    color: '#FFFFFF',
  },
  costInfo: {
    marginBottom: 20,
  },
  costText: {
    fontSize: 12,
    color: '#FF9800',
    marginBottom: 4,
  },
  suggestedText: {
    fontSize: 12,
    color: '#8888AA',
  },
  modalConfirmButton: {
    backgroundColor: '#5D9BFA',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  editButtonActive: {
    backgroundColor: '#5D9BFA',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nodeWrapper: {
    position: 'relative',
  },
  skillNodeDisabled: {
    opacity: 0.7,
  },
  editActions: {
    position: 'absolute',
    right: 8,
    top: 8,
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: 'rgba(93, 155, 250, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(93, 155, 250, 0.3)',
    marginHorizontal: 16,
    marginTop: 16,
  },
  addNodeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D9BFA',
  },
  addStageNodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  addStageNodeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  formInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
});

export default SkillTreeScreen;