import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Linking, Modal, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSkillTreeByDomain, PLATFORM_NAME_MAP } from '../src/data/skillTrees';
import { SkillTree, PlatformType, StageType, SkillNode, SkillStage } from '../src/types/skill';
import { useTheme } from '../src/contexts/ThemeContext';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { monsterService } from '../src/services/api';
import { getCurrentUser } from '../src/utils/auth';

interface CustomStage {
  id: string;
  name: string;
}

interface CustomNode {
  id: string;
  stageId: string;
  name: string;
  url: string;
  platform: PlatformType;
  duration: number;
}

const PLATFORM_OPTIONS: { key: PlatformType; label: string; icon: string; color: string }[] = [
  { key: 'bilibili', label: 'B站', icon: 'play-circle', color: '#FB7299' },
  { key: 'xiaohongshu', label: '小红书', icon: 'book', color: '#FF2442' },
  { key: 'mooc', label: '中国大学MOOC', icon: 'school', color: '#5D9BFA' },
];

const getPlatformIcon = (platform: PlatformType) => {
  switch (platform) {
    case 'bilibili':
      return { icon: 'play-circle', color: '#FB7299' };
    case 'xiaohongshu':
      return { icon: 'book', color: '#FF2442' };
    case 'mooc':
      return { icon: 'school', color: '#5D9BFA' };
    default:
      return { icon: 'link', color: '#888' };
  }
};

const getStageColor = (stage: StageType | string) => {
  switch (stage) {
    case 'beginner':
      return { bg: 'rgba(93, 155, 250, 0.15)', border: 'rgba(93, 155, 250, 0.3)', text: '#5D9BFA' };
    case 'intermediate':
      return { bg: 'rgba(72, 209, 176, 0.15)', border: 'rgba(72, 209, 176, 0.3)', text: '#48D1B0' };
    case 'advanced':
      return { bg: 'rgba(255, 152, 0, 0.15)', border: 'rgba(255, 152, 0, 0.3)', text: '#FF9800' };
    default:
      return { bg: 'rgba(93, 155, 250, 0.15)', border: 'rgba(93, 155, 250, 0.3)', text: '#5D9BFA' };
  }
};

const StageNode: React.FC<{ name: string; duration: number; stageColor: ReturnType<typeof getStageColor>; onLongPress?: () => void; isCustom?: boolean }> = ({ name, duration, stageColor, onLongPress, isCustom }) => (
  <TouchableOpacity
    style={[styles.stageNode, { backgroundColor: stageColor.bg, borderColor: stageColor.border }]}
    onLongPress={onLongPress}
    disabled={!isCustom}
    activeOpacity={isCustom ? 0.6 : 1}
  >
    <View style={styles.stageNodeRow}>
      <Text style={[styles.stageName, { color: stageColor.text }]}>{name}</Text>
      {isCustom && <Ionicons name="create-outline" size={10} color={stageColor.text} style={{ marginLeft: 4 }} />}
    </View>
    <Text style={styles.stageDuration}>{duration}小时</Text>
  </TouchableOpacity>
);

const SkillNodeItem: React.FC<{
  name: string;
  platform: PlatformType;
  duration: number;
  url: string;
  index: number;
  stageColor: ReturnType<typeof getStageColor>;
  onSelect: (name: string, url: string, suggestedDuration: number) => void;
  onLongPress?: () => void;
  isCustom?: boolean;
}> = ({ name, platform, duration, url, index, stageColor, onSelect, onLongPress, isCustom }) => {
  const platformInfo = getPlatformIcon(platform);

  return (
    <TouchableOpacity
      style={[styles.skillNode, { borderColor: stageColor.border }]}
      onPress={() => onSelect(name, url, duration)}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.skillNodeHeader}>
        <View style={styles.nodeBadge}>
          <Text style={styles.nodeBadgeText}>{index + 1}</Text>
        </View>
        <Ionicons name={platformInfo.icon as any} size={14} color={platformInfo.color} />
        {isCustom && <Ionicons name="create-outline" size={10} color="#888" style={{ marginLeft: 4 }} />}
      </View>
      <Text style={styles.skillNodeName}>{name}</Text>
      <View style={styles.skillNodeFooter}>
        <Text style={[styles.platformText, { color: platformInfo.color }]}>
          {PLATFORM_NAME_MAP[platform]}
        </Text>
        <Text style={styles.durationText}>{duration}h</Text>
      </View>
      <View style={styles.arrowIcon}>
        <Ionicons name="chevron-forward" size={14} color="#5D9BFA" />
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
  const [maxStamina, setMaxStamina] = useState(100);

  useEffect(() => {
    if (!visible) return;
    setSelectedDuration(25);
    const loadStamina = async () => {
      const monster = await AsyncStorage.getItem('monster');
      if (monster) {
        const data = JSON.parse(monster);
        const stamina = typeof data.stamina === 'number' ? data.stamina : 100;
        const max = data.type === 'calm' ? 120 : 100;
        setMonsterStamina(stamina);
        setMaxStamina(max);
      }
    };
    loadStamina();
  }, [visible]);

  const durations = [15, 25, 30, 45, 60];
  const staminaCost = Math.ceil(selectedDuration / 5);

  const handleConfirm = async () => {
    console.log(`[SkillTree] 确认学习 - 节点: ${nodeName}, 时长: ${selectedDuration}分钟, 体力消耗: ${staminaCost}`);
    if (monsterStamina < staminaCost) {
      console.log(`[SkillTree] 体力不足 - 需要: ${staminaCost}, 当前: ${monsterStamina}`);
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
        setMonsterStamina(monsterData.stamina);
        console.log(`[SkillTree] 体力更新 - 剩余: ${monsterData.stamina}/${monsterData.maxStamina}`);
      }

      const user = await getCurrentUser();
      if (user?.id) {
        try {
          await monsterService.consumeStamina(user.id, staminaCost);
          console.log(`[SkillTree] 服务端体力扣除成功 - 用户ID: ${user.id}, 扣除: ${staminaCost}`);
        } catch (err) {
          console.error('[SkillTree] 服务端体力扣除失败:', err);
        }
      }

      const isValidUrl = url.startsWith('http://') || url.startsWith('https://');
      if (!isValidUrl) {
        console.log(`[SkillTree] 无效URL: ${url}`);
        Alert.alert('错误', '链接格式不正确');
        return;
      }

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        console.log(`[SkillTree] 打开链接: ${url}`);
        Linking.openURL(url).catch(err => {
          console.error('[SkillTree] 打开链接失败:', err);
          Alert.alert('错误', '无法打开链接，请检查网络连接');
        });
      } else {
        console.log(`[SkillTree] 设备不支持打开链接: ${url}`);
        Alert.alert('错误', '设备不支持打开此链接');
      }
      onClose();
    } catch (error) {
      console.error('[SkillTree] 操作失败:', error);
      Alert.alert('错误', '操作失败，请稍后重试');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent onRequestClose={onClose} animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
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
              <View style={[styles.staminaFill, { width: `${Math.min(100, (monsterStamina / maxStamina) * 100)}%` }]} />
            </View>
            <Text style={styles.staminaText}>体力: {monsterStamina}/{maxStamina}</Text>
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
      </TouchableOpacity>
    </Modal>
  );
};

const SkillTreeScreen = () => {
  const { domain } = useLocalSearchParams();
  const { colors } = useTheme();
  const [skillTree, setSkillTree] = useState<SkillTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState({ name: '', url: '', suggestedDuration: 0 });

  const [customStages, setCustomStages] = useState<CustomStage[]>([]);
  const [customNodes, setCustomNodes] = useState<CustomNode[]>([]);

  const [addStageVisible, setAddStageVisible] = useState(false);
  const [addNodeVisible, setAddNodeVisible] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeUrl, setNewNodeUrl] = useState('');
  const [newNodePlatform, setNewNodePlatform] = useState<PlatformType>('bilibili');
  const [targetStageId, setTargetStageId] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadSkillTree();
    loadCustomData();
  }, [domain]);

  const loadSkillTree = () => {
    setLoading(true);
    if (domain) {
      const tree = getSkillTreeByDomain(domain as string);
      setSkillTree(tree || null);
      setLoading(false);
    }
  };

  const loadCustomData = async () => {
    if (!domain) return;
    try {
      const stagesJson = await AsyncStorage.getItem(`customStages_${domain}`);
      const nodesJson = await AsyncStorage.getItem(`customNodes_${domain}`);
      if (stagesJson) setCustomStages(JSON.parse(stagesJson));
      if (nodesJson) setCustomNodes(JSON.parse(nodesJson));
    } catch (e) {
      console.error('[SkillTree] 加载自定义数据失败:', e);
    }
  };

  const saveCustomStages = async (stages: CustomStage[]) => {
    if (!domain) return;
    await AsyncStorage.setItem(`customStages_${domain}`, JSON.stringify(stages));
    setCustomStages(stages);
  };

  const saveCustomNodes = async (nodes: CustomNode[]) => {
    if (!domain) return;
    await AsyncStorage.setItem(`customNodes_${domain}`, JSON.stringify(nodes));
    setCustomNodes(nodes);
  };

  const handleAddStage = () => {
    if (!newStageName.trim()) return;
    const id = `custom_${Date.now()}`;
    const stage: CustomStage = { id, name: newStageName.trim() };
    const updated = [...customStages, stage];
    saveCustomStages(updated);
    setNewStageName('');
    setAddStageVisible(false);
    setToastMessage('大标题添加成功');
    setTimeout(() => setToastMessage(''), 2000);
  };

  const handleAddNode = () => {
    if (!newNodeName.trim() || !newNodeUrl.trim()) return;
    const id = `custom_node_${Date.now()}`;
    const node: CustomNode = {
      id,
      stageId: targetStageId,
      name: newNodeName.trim(),
      url: newNodeUrl.trim(),
      platform: newNodePlatform,
      duration: 1,
    };
    const updated = [...customNodes, node];
    saveCustomNodes(updated);
    setNewNodeName('');
    setNewNodeUrl('');
    setNewNodePlatform('bilibili');
    setAddNodeVisible(false);
    setToastMessage('节点添加成功');
    setTimeout(() => setToastMessage(''), 2000);
  };

  const handleDeleteStage = (stageId: string, stageName: string) => {
    Alert.alert('删除大标题', `确定要删除「${stageName}」及其下所有节点吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          const updatedStages = customStages.filter(s => s.id !== stageId);
          const updatedNodes = customNodes.filter(n => n.stageId !== stageId);
          await saveCustomStages(updatedStages);
          await saveCustomNodes(updatedNodes);
        },
      },
    ]);
  };

  const handleDeleteNode = (nodeId: string, nodeName: string) => {
    Alert.alert('删除节点', `确定要删除「${nodeName}」吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          const updated = customNodes.filter(n => n.id !== nodeId);
          await saveCustomNodes(updated);
        },
      },
    ]);
  };

  const openAddNodeForStage = (stageId: string) => {
    setTargetStageId(stageId);
    setAddNodeVisible(true);
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

  const mergedStages = useMemo(() => {
    if (!skillTree) return [];
    const stages: (SkillStage & { isCustom?: boolean })[] = skillTree.stages.map(s => ({ ...s, isCustom: false }));

    customStages.forEach(cs => {
      const stageNodes = customNodes
        .filter(n => n.stageId === cs.id)
        .map((n): SkillNode => ({
          id: n.id,
          name: n.name,
          description: '',
          stage: 'beginner' as StageType,
          platform: n.platform,
          url: n.url,
          duration: n.duration,
        }));
      stages.push({
        id: cs.id as StageType,
        name: cs.name,
        duration: stageNodes.reduce((sum, n) => sum + n.duration, 0),
        nodes: stageNodes,
        isCustom: true,
      });
    });

    return stages;
  }, [skillTree, customStages, customNodes]);

  const totalDuration = useMemo(() => {
    const base = skillTree?.totalDuration || 0;
    const customTotal = customNodes.reduce((sum, n) => sum + n.duration, 0);
    return base + customTotal;
  }, [skillTree, customNodes]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>加载中...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!skillTree) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.container}>
          <Text style={{ fontSize: 16, color: colors.error, marginBottom: 16, textAlign: 'center' }}>技能树加载失败</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backArrow}>← 返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{skillTree.title}</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.descriptionSection}>
          <Text style={[styles.descriptionTitle, { color: colors.primary }]}>📚 学习方法</Text>
          <Text style={[styles.descriptionText, { color: colors.textPrimary }]}>{skillTree.learningMethod}</Text>

          <Text style={[styles.descriptionTitle, { color: colors.primary }]}>🎯 学习目标</Text>
          <Text style={[styles.descriptionText, { color: colors.textPrimary }]}>{skillTree.learningGoal}</Text>

          <Text style={[styles.descriptionTitle, { color: colors.primary }]}>🏗️ 框架说明</Text>
          <Text style={[styles.descriptionText, { color: colors.textPrimary }]}>{skillTree.frameworkExplanation}</Text>
        </View>

        <View style={styles.totalDurationBadge}>
          <Ionicons name="time" size={14} color={colors.primary} />
          <Text style={[styles.totalDurationText, { color: colors.primary }]}>总时长 {totalDuration}小时</Text>
        </View>

        <View style={styles.treeContainer}>
          {mergedStages.map((stage, stageIndex) => {
            const stageColor = getStageColor(stage.id);
            return (
              <View key={stage.id} style={[styles.stageColumn, stageIndex === 1 && styles.middleStage]}>
                <StageNode
                  name={stage.name}
                  duration={stage.duration}
                  stageColor={stageColor}
                  isCustom={stage.isCustom}
                  onLongPress={stage.isCustom ? () => handleDeleteStage(stage.id, stage.name) : undefined}
                />

                <View style={styles.skillNodesList}>
                  {stage.nodes.map((node, nodeIndex) => {
                    const isCustomNode = customNodes.some(cn => cn.id === node.id);
                    return (
                      <SkillNodeItem
                        key={node.id}
                        name={node.name}
                        platform={node.platform}
                        duration={node.duration}
                        url={node.url}
                        index={nodeIndex}
                        stageColor={stageColor}
                        onSelect={handleNodeSelect}
                        isCustom={isCustomNode}
                        onLongPress={isCustomNode ? () => handleDeleteNode(node.id, node.name) : undefined}
                      />
                    );
                  })}

                  <TouchableOpacity
                    style={styles.addNodeBtn}
                    onPress={() => openAddNodeForStage(stage.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.addNodeText, { color: colors.primary }]}>添加节点</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.addStageBtn, { borderColor: colors.primary }]}
          onPress={() => setAddStageVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.addStageText, { color: colors.primary }]}>添加大标题</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <DurationModal
        visible={modalVisible}
        onClose={handleCloseModal}
        nodeName={selectedNode.name}
        url={selectedNode.url}
        suggestedDuration={selectedNode.suggestedDuration}
      />

      <Modal visible={addStageVisible} transparent onRequestClose={() => setAddStageVisible(false)} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setAddStageVisible(false)} activeOpacity={1}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>添加大标题</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setAddStageVisible(false)}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.addInput, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.inputBorder }]}
              placeholder="输入大标题名称"
              placeholderTextColor={colors.textTertiary}
              value={newStageName}
              onChangeText={setNewStageName}
              maxLength={20}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.modalConfirmButton, !newStageName.trim() && { opacity: 0.5 }]}
              onPress={handleAddStage}
              disabled={!newStageName.trim()}
            >
              <Text style={styles.modalConfirmText}>确认添加</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={addNodeVisible} transparent onRequestClose={() => setAddNodeVisible(false)} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setAddNodeVisible(false)} activeOpacity={1}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>添加节点</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setAddNodeVisible(false)}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.addLabel, { color: colors.textSecondary }]}>节点名称</Text>
            <TextInput
              style={[styles.addInput, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.inputBorder }]}
              placeholder="输入节点名称"
              placeholderTextColor={colors.textTertiary}
              value={newNodeName}
              onChangeText={setNewNodeName}
              maxLength={30}
            />

            <Text style={[styles.addLabel, { color: colors.textSecondary }]}>学习链接</Text>
            <TextInput
              style={[styles.addInput, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.inputBorder }]}
              placeholder="输入链接地址 (https://...)"
              placeholderTextColor={colors.textTertiary}
              value={newNodeUrl}
              onChangeText={setNewNodeUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={[styles.addLabel, { color: colors.textSecondary }]}>平台</Text>
            <View style={styles.platformSelector}>
              {PLATFORM_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.platformOption,
                    newNodePlatform === opt.key && { backgroundColor: opt.color + '20', borderColor: opt.color },
                  ]}
                  onPress={() => setNewNodePlatform(opt.key)}
                >
                  <Ionicons name={opt.icon as any} size={16} color={opt.color} />
                  <Text style={[styles.platformOptionText, { color: newNodePlatform === opt.key ? opt.color : colors.textSecondary }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.modalConfirmButton, (!newNodeName.trim() || !newNodeUrl.trim()) && { opacity: 0.5 }]}
              onPress={handleAddNode}
              disabled={!newNodeName.trim() || !newNodeUrl.trim()}
            >
              <Text style={styles.modalConfirmText}>确认添加</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {toastMessage !== '' && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={18} color="#3AE374" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    marginTop: 16,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
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
  stageNodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  addNodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(93, 155, 250, 0.3)',
    marginTop: 4,
  },
  addNodeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addStageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addStageText: {
    fontSize: 14,
    fontWeight: '700',
  },
  addInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  addLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  platformSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  platformOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  platformOptionText: {
    fontSize: 11,
    fontWeight: '600',
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
  toast: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SkillTreeScreen;