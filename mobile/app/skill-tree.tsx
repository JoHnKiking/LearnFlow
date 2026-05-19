/**
 * SkillTreeScreen — 技能树 / 课程详情页
 *
 * 功能概览：
 * 1. 展示模块的「学习方法 / 学习目标 / 框架说明」描述区域
 * 2. 以「大标题（阶段）→ 小结点」的树形结构展示所有学习节点
 * 3. 点击结点 → 弹出 DurationModal → 选择时长 → 扣除体力 → 进入番茄钟页面
 * 4. 支持添加 / 删除自定义大标题和自定义学习结点
 * 5. 支持编辑自定义结点和大标题的文本内容
 * 6. 纯自定义模块（无默认 SkillTree）也可正常展示与编辑
 *
 * 数据存储（AsyncStorage）：
 * - customModules: { [moduleId]: { name, description } }  自定义模块元信息
 * - customStages_${domain}: [{ id, name }]                自定义大标题
 * - customNodes_${domain}: [{ id, stageId, name, url, platform, duration }] 自定义结点
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity,
  Modal, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSkillTreeByDomain, PLATFORM_NAME_MAP } from '../src/data/skillTrees';
import { SkillTree, PlatformType, StageType, SkillNode, SkillStage } from '../src/types/skill';
import { useTheme } from '../src/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { monsterService } from '../src/services/api';
import { getCurrentUser } from '../src/utils/auth';

// ---- 本地类型定义 ----

/** 自定义大标题（阶段）的结构 */
interface CustomStage {
  id: string;
  name: string;
}

/** 自定义学习结点的结构 */
interface CustomNode {
  id: string;
  stageId: string; // 归属哪个大标题
  name: string;
  url: string;
  platform: PlatformType;
  duration: number; // 预估学习时长（小时）
}

// ---- 平台选项常量 ----

const PLATFORM_OPTIONS: { key: PlatformType; label: string; icon: string; color: string }[] = [
  { key: 'bilibili', label: 'B站', icon: 'play-circle', color: '#FB7299' },
  { key: 'xiaohongshu', label: '小红书', icon: 'book', color: '#FF2442' },
  { key: 'mooc', label: '中国大学MOOC', icon: 'school', color: '#5D9BFA' },
];

// ---- 工具函数 ----

/** 获取平台对应的图标和颜色 */
const getPlatformIcon = (platform: PlatformType) => {
  switch (platform) {
    case 'bilibili': return { icon: 'play-circle', color: '#FB7299' };
    case 'xiaohongshu': return { icon: 'book', color: '#FF2442' };
    case 'mooc': return { icon: 'school', color: '#5D9BFA' };
    default: return { icon: 'link', color: '#888' };
  }
};

/** 获取阶段对应的颜色配置 */
const getStageColor = (stage: StageType | string) => {
  switch (stage) {
    case 'beginner': return { bg: 'rgba(93,155,250,0.15)', border: 'rgba(93,155,250,0.3)', text: '#5D9BFA' };
    case 'intermediate': return { bg: 'rgba(72,209,176,0.15)', border: 'rgba(72,209,176,0.3)', text: '#48D1B0' };
    case 'advanced': return { bg: 'rgba(255,152,0,0.15)', border: 'rgba(255,152,0,0.3)', text: '#FF9800' };
    default: return { bg: 'rgba(93,155,250,0.15)', border: 'rgba(93,155,250,0.3)', text: '#5D9BFA' };
  }
};

// ===================== 子组件：大标题结点 =====================

/**
 * StageNode — 展示一个大标题（阶段），显示名称和总时长
 * 如果 isCustom 为 true，长按可触发删除
 */
const StageNode: React.FC<{
  name: string; duration: number;
  stageColor: ReturnType<typeof getStageColor>;
  onLongPress?: () => void; onEdit?: () => void;
  isCustom?: boolean;
}> = ({ name, duration, stageColor, onLongPress, onEdit, isCustom }) => (
  <TouchableOpacity
    onLongPress={onLongPress}
    onPress={isCustom ? onEdit : undefined}
    disabled={!isCustom}
    activeOpacity={isCustom ? 0.6 : 1}
  >
    <View style={[s.stageNode, { backgroundColor: stageColor.bg, borderColor: stageColor.border }]}>
      <View style={s.stageNodeRow}>
        <Text style={[s.stageName, { color: stageColor.text }]}>{name}</Text>
        {isCustom && <Ionicons name="create-outline" size={10} color={stageColor.text} style={{ marginLeft: 4 }} />}
      </View>
      <Text style={s.stageDuration}>{duration}小时</Text>
    </View>
  </TouchableOpacity>
);

// ===================== 子组件：学习结点卡片 =====================

/**
 * SkillNodeItem — 展示一个学习结点，包含序号、平台图标、名称、链接、时长
 * 点击触发 onSelect → 弹出 DurationModal
 * 长按 / 编辑按钮触发 onEdit → 弹出编辑表单
 */
const SkillNodeItem: React.FC<{
  name: string; platform: PlatformType; duration: number; url: string;
  index: number; stageColor: ReturnType<typeof getStageColor>;
  onSelect: (name: string, url: string, suggestedDuration: number) => void;
  onLongPress?: () => void; onEdit?: () => void;
  isCustom?: boolean;
}> = ({ name, platform, duration, url, index, stageColor, onSelect, onLongPress, onEdit, isCustom }) => {
  const platformInfo = getPlatformIcon(platform);
  return (
    <TouchableOpacity
      style={[s.skillNode, { borderColor: stageColor.border }]}
      onPress={() => onSelect(name, url, duration)}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={s.skillNodeHeader}>
        <View style={s.nodeBadge}>
          <Text style={s.nodeBadgeText}>{index + 1}</Text>
        </View>
        <Ionicons name={platformInfo.icon as any} size={14} color={platformInfo.color} />
        {isCustom && (
          <TouchableOpacity onPress={onEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="create-outline" size={12} color="#888" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={s.skillNodeName}>{name}</Text>
      <View style={s.skillNodeFooter}>
        <Text style={[s.platformText, { color: platformInfo.color }]}>
          {PLATFORM_NAME_MAP[platform] ?? platform}
        </Text>
        <Text style={s.durationText}>{duration}h</Text>
      </View>
      <View style={s.arrowIcon}>
        <Ionicons name="chevron-forward" size={14} color="#5D9BFA" />
      </View>
    </TouchableOpacity>
  );
};

// ===================== 模态框：选择学习时长 =====================

const DurationModal: React.FC<{
  visible: boolean; onClose: () => void;
  nodeName: string; url: string; suggestedDuration: number;
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
        setMonsterStamina(typeof data.stamina === 'number' ? data.stamina : 100);
        setMaxStamina(data.type === 'calm' ? 120 : 100);
      }
    };
    loadStamina();
  }, [visible]);

  const durations = [15, 25, 30, 45, 60];
  const staminaCost = Math.ceil(selectedDuration / 5);

  const handleConfirm = async () => {
    if (monsterStamina < staminaCost) {
      Alert.alert('体力不足', `需要 ${staminaCost} 点体力，当前体力 ${monsterStamina} 点`);
      return;
    }
    try {
      const monster = await AsyncStorage.getItem('monster');
      if (monster) {
        const m = JSON.parse(monster);
        m.stamina = Math.max(0, m.stamina - staminaCost);
        await AsyncStorage.setItem('monster', JSON.stringify(m));
      }
      const user = await getCurrentUser();
      if (user?.id) await monsterService.consumeStamina(user.id, staminaCost).catch(() => {});

      onClose();
      router.push({
        pathname: '/pomodoro',
        params: { nodeName, url, duration: String(selectedDuration) },
      });
    } catch {
      Alert.alert('错误', '操作失败');
    }
  };

  if (!visible) return null;
  return (
    <Modal visible transparent onRequestClose={onClose} animationType="fade">
      <TouchableOpacity style={s.overlayLight} onPress={onClose} activeOpacity={1}>
        <View style={s.modalCard} onStartShouldSetResponder={() => true}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>开始学习</Text>
            <TouchableOpacity style={s.modalClose} onPress={onClose}>
              <Ionicons name="close" size={20} color="#888" />
            </TouchableOpacity>
          </View>
          <Text style={s.modalNodeName}>{nodeName}</Text>
          <View style={s.staminaInfo}>
            <View style={s.staminaBar}>
              <View style={[s.staminaFill, { width: `${Math.min(100, (monsterStamina / maxStamina) * 100)}%` }]} />
            </View>
            <Text style={s.staminaText}>体力: {monsterStamina}/{maxStamina}</Text>
          </View>
          <Text style={s.modalSubtitle}>选择学习时长</Text>
          <View style={s.durationOptions}>
            {durations.map(d => (
              <TouchableOpacity
                key={d}
                onPress={() => setSelectedDuration(d)}
                style={[s.durationButton, selectedDuration === d && s.durationButtonActive,
                  { backgroundColor: selectedDuration === d ? '#5D9BFA' : '#0F1030' },
                ]}>
                <Text style={[s.durationTextSmall, selectedDuration === d && s.durationTextActive]}>{d}分钟</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.costInfo}>
            <Text style={s.costText}>预计消耗体力: {staminaCost} 点</Text>
            <Text style={s.suggestedText}>建议学习时长: {suggestedDuration}小时</Text>
          </View>
          <TouchableOpacity style={s.modalConfirmBtn} onPress={handleConfirm}>
            <Text style={s.modalConfirmText}>开始学习</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ===================== 主组件 =====================

const SkillTreeScreen = () => {
  const { domain } = useLocalSearchParams();
  const { colors } = useTheme();

  // ---- 技能树数据 ----
  const [skillTree, setSkillTree] = useState<SkillTree | null>(null);
  const [loading, setLoading] = useState(true);

  // ---- DurationModal 相关 ----
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState({ name: '', url: '', suggestedDuration: 0 });

  // ---- 自定义数据 ----
  const [customStages, setCustomStages] = useState<CustomStage[]>([]);
  const [customNodes, setCustomNodes] = useState<CustomNode[]>([]);
  const [customDescription, setCustomDescription] = useState('');

  // ---- 添加大标题 / 结点的弹窗 ----
  const [addStageVisible, setAddStageVisible] = useState(false);
  const [addNodeVisible, setAddNodeVisible] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeUrl, setNewNodeUrl] = useState('');
  const [newNodePlatform, setNewNodePlatform] = useState<PlatformType>('bilibili');
  const [targetStageId, setTargetStageId] = useState(''); // 当前要添加结点的目标大标题 ID

  // ---- 编辑自定义结点 / 大标题的弹窗 ----
  const [editNodeVisible, setEditNodeVisible] = useState(false);
  const [editStageVisible, setEditStageVisible] = useState(false);
  // 编辑中的临时状态
  const [editingNode, setEditingNode] = useState<CustomNode | null>(null);
  const [editingStage, setEditingStage] = useState<CustomStage | null>(null);
  const [editNodeName, setEditNodeName] = useState('');
  const [editNodeUrl, setEditNodeUrl] = useState('');
  const [editNodePlatform, setEditNodePlatform] = useState<PlatformType>('bilibili');
  const [editStageName, setEditStageName] = useState('');

  // ---- Toast ----
  const [toastMessage, setToastMessage] = useState('');

  // ===================== 数据加载 =====================

  useEffect(() => {
    loadAllData();
  }, [domain]);

  /** 加载默认技能树 + 自定义数据 */
  const loadAllData = async () => {
    if (!domain) return;
    setLoading(true);

    // 1. 尝试加载默认技能树
    const tree = getSkillTreeByDomain(domain as string);
    setSkillTree(tree || null);

    // 2. 加载自定义模块元信息（名称 + 介绍）
    const customModulesStr = await AsyncStorage.getItem('customModules');
    if (customModulesStr) {
      const customModules: Record<string, { name: string; description: string }> = JSON.parse(customModulesStr);
      if (customModules[domain as string]) {
        setCustomDescription(customModules[domain as string].description || '');
      }
    }

    // 3. 加载自定义大标题和结点
    await loadCustomData();
    setLoading(false);
  };

  /** 从 AsyncStorage 加载自定义的大标题和结点 */
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

  /** 保存自定义大标题到 AsyncStorage */
  const saveCustomStages = async (stages: CustomStage[]) => {
    if (!domain) return;
    await AsyncStorage.setItem(`customStages_${domain}`, JSON.stringify(stages));
    setCustomStages(stages);
  };

  /** 保存自定义结点到 AsyncStorage */
  const saveCustomNodes = async (nodes: CustomNode[]) => {
    if (!domain) return;
    await AsyncStorage.setItem(`customNodes_${domain}`, JSON.stringify(nodes));
    setCustomNodes(nodes);
  };

  // ===================== 添加大标题 =====================

  const handleAddStage = () => {
    if (!newStageName.trim()) return;
    const id = `custom_${Date.now()}`;
    saveCustomStages([...customStages, { id, name: newStageName.trim() }]);
    setNewStageName('');
    setAddStageVisible(false);
    showToast('大标题添加成功');
  };

  // ===================== 添加结点 =====================

  const handleAddNode = () => {
    if (!newNodeName.trim() || !newNodeUrl.trim()) return;
    const node: CustomNode = {
      id: `custom-node_${Date.now()}`,
      stageId: targetStageId,
      name: newNodeName.trim(),
      url: newNodeUrl.trim(),
      platform: newNodePlatform,
      duration: 1,
    };
    saveCustomNodes([...customNodes, node]);
    setNewNodeName(''); setNewNodeUrl(''); setNewNodePlatform('bilibili');
    setAddNodeVisible(false);
    showToast('结点添加成功');
  };

  const openAddNodeForStage = (stageId: string) => {
    setTargetStageId(stageId);
    setAddNodeVisible(true);
  };

  // ===================== 删除大标题 / 结点 =====================

  const handleDeleteStage = (stageId: string, stageName: string) => {
    Alert.alert('删除大标题', `确定要删除「${stageName}」及其下所有结点吗？`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive',
        onPress: async () => {
          await saveCustomStages(customStages.filter(s => s.id !== stageId));
          await saveCustomNodes(customNodes.filter(n => n.stageId !== stageId));
        }},
    ]);
  };

  const handleDeleteNode = (nodeId: string, nodeName: string) => {
    Alert.alert('删除结点', `确定要删除「${nodeName}」吗？`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive',
        onPress: async () => saveCustomNodes(customNodes.filter(n => n.id !== nodeId)),
      },
    ]);
  };

  // ===================== 编辑自定义大标题 -====================

  const openEditStage = (stage: CustomStage) => {
    setEditingStage(stage);
    setEditStageName(stage.name);
    setEditStageVisible(true);
  };

  const handleSaveEditStage = () => {
    if (!editingStage || !editStageName.trim()) return;
    saveCustomStages(customStages.map(s =>
      s.id === editingStage.id ? { ...s, name: editStageName.trim() } : s,
    ));
    setEditStageVisible(false);
    showToast('大标题已更新');
  };

  // ===================== 编辑自定义结点 =====================

  const openEditNode = (node: CustomNode) => {
    setEditingNode(node);
    setEditNodeName(node.name);
    setEditNodeUrl(node.url);
    setEditNodePlatform(node.platform);
    setEditNodeVisible(true);
  };

  const handleSaveEditNode = () => {
    if (!editingNode || !editNodeName.trim() || !editNodeUrl.trim()) return;
    saveCustomNodes(customNodes.map(n =>
      n.id === editingNode.id
        ? { ...n, name: editNodeName.trim(), url: editNodeUrl.trim(), platform: editNodePlatform }
        : n,
    ));
    setEditNodeVisible(false);
    showToast('结点已更新');
  };

  // ===================== 结点跳转 =====================

  const handleNodeSelect = (name: string, url: string, suggestedDuration: number) => {
    setSelectedNode({ name, url, suggestedDuration });
    setModalVisible(true);
  };

  // ---- 返回上一页 ----
  const handleGoBack = () => router.back();

  // ---- Toast 辅助函数 ----
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2000);
  };

  // ===================== 数据合并 =====================

  /**
   * 合并默认 SkillTree 的 stages 与自定义 stages
   * - 如果是纯自定义模块（无默认 SkillTree），只展示自定义数据
   * - 如果同时存在，默认数据在前，自定义数据追加在后
   */
  const mergedStages = useMemo(() => {
    // 默认阶段数据（可能为空）
    const defaultStages: (SkillStage & { isCustom?: boolean })[] =
      (skillTree?.stages ?? []).map(s => ({ ...s, isCustom: false }));

    // 将自定义结点按 stageId 分组，构造 SkillStage 数组
    const customStageList: (SkillStage & { isCustom?: boolean })[] = customStages.map(cs => {
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
      return {
        id: cs.id as StageType,
        name: cs.name,
        duration: stageNodes.reduce((sum, n) => sum + n.duration, 0),
        nodes: stageNodes,
        isCustom: true,
      };
    });

    return [...defaultStages, ...customStageList];
  }, [skillTree, customStages, customNodes]);

  /** 总学习时长：默认基础 + 自定义结点累加 */
  const totalDuration = useMemo(() => {
    const base = skillTree?.totalDuration ?? 0;
    return base + customNodes.reduce((sum, n) => sum + n.duration, 0);
  }, [skillTree, customNodes]);

  // ===================== 加载中状态 =====================

  if (loading) {
    return (
      <SafeAreaView style={[s.safeArea, { backgroundColor: colors.background }]}>
        <View style={s.container}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[s.loadingText, { color: colors.textSecondary }]}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ===================== 空状态：完全无数据 =====================

  // 如果既没有默认 SkillTree，也没有任何自定义数据 → 显示空状态
  const isEmpty = !skillTree && customStages.length === 0;

  if (isEmpty) {
    return (
      <SafeAreaView style={[s.safeArea, { backgroundColor: colors.background }]}>
        <View style={s.emptyContainer}>
          <Ionicons name="book-outline" size={48} color={colors.textTertiary} />
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 12, textAlign: 'center' }}>
            暂无学习内容，请添加大标题和结点
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
            <TouchableOpacity style={s.emptyBtn} onPress={() => setAddStageVisible(true)}>
              <Text style={[s.emptyBtnText, { color: colors.primary }]}>添加大标题</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={s.backBtn} onPress={handleGoBack}>
            <Text style={s.backArrow}>← 返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ===================== 正常渲染 =====================

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ---- 顶部导航栏 ---- */}
        <View style={[s.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity style={s.backBtnRect} onPress={handleGoBack}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
            {skillTree?.title ?? (customDescription ? '自定义模块' : '学习课程')}
          </Text>
          <View style={s.headerPlaceholder} />
        </View>

        {/* ---- 描述区域 ---- */}
        <View style={s.descriptionSection}>
          {/* 学习方法：仅默认模块展示 */}
          {skillTree?.learningMethod ? (
            <>
              <Text style={[s.descriptionTitle, { color: colors.primary }]}>📚 学习方法</Text>
              <Text style={[s.descriptionText, { color: colors.textPrimary }]}>{skillTree.learningMethod}</Text>
            </>
          ) : null}

          {/* 学习目标：默认模块展示，自定义模块展示其介绍 */}
          <Text style={[s.descriptionTitle, { color: colors.primary }]}>🎯 学习目标</Text>
          <Text style={[s.descriptionText, { color: colors.textPrimary }]}>
            {skillTree?.learningGoal ?? customDescription ?? '自定义学习模块'}
          </Text>

          {/* 框架说明：仅默认模块展示 */}
          {skillTree?.frameworkExplanation ? (
            <>
              <Text style={[s.descriptionTitle, { color: colors.primary }]}>🏗️ 框架说明</Text>
              <Text style={[s.descriptionText, { color: colors.textPrimary }]}>
                {skillTree.frameworkExplanation}
              </Text>
            </>
          ) : null}
        </View>

        {/* ---- 总时长徽章 ---- */}
        <View style={s.totalDurationBadge}>
          <Ionicons name="time" size={14} color={colors.primary} />
          <Text style={[s.totalDurationText, { color: colors.primary }]}>总时长 {totalDuration}小时</Text>
        </View>

        {/* ---- 技能树主体 ---- */}
        <View style={s.treeContainer}>
          {mergedStages.map((stage, stageIndex) => {
            const stageColor = getStageColor(stage.id);
            // 找到对应的自定义大标题对象（用于编辑回调）
            const customStageObj = customStages.find(cs => cs.id === stage.id);
            return (
              <View key={stage.id} style={[s.stageColumn, stageIndex === 1 && s.middleStage]}>
                {/* 大标题 */}
                <StageNode
                  name={stage.name}
                  duration={stage.duration}
                  stageColor={stageColor}
                  isCustom={stage.isCustom}
                  onLongPress={stage.isCustom ? () => handleDeleteStage(stage.id, stage.name) : undefined}
                  onEdit={stage.isCustom ? () => openEditStage(customStageObj!) : undefined}
                />

                {/* 该大标题下的结点列表 */}
                <View style={s.skillNodesList}>
                  {stage.nodes.map((node, nodeIndex) => {
                    const customNodeObj = customNodes.find(cn => cn.id === node.id);
                    const isCustomNode = !!customNodeObj;
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
                        onEdit={isCustomNode ? () => openEditNode(customNodeObj!) : undefined}
                      />
                    );
                  })}

                  {/* 为当前大标题添加结点 */}
                  <TouchableOpacity
                    style={s.addNodeBtn}
                    onPress={() => openAddNodeForStage(stage.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.addNodeText, { color: colors.primary }]}>添加结点</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* ---- 添加大标题按钮 ---- */}
        <TouchableOpacity
          style={[s.addStageBtn, { borderColor: colors.primary }]}
          onPress={() => setAddStageVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[s.addStageText, { color: colors.primary }]}>添加大标题</Text>
        </TouchableOpacity>

        <View style={s.bottomPadding} />
      </ScrollView>

      {/* ===================== 各种模态框 ===================== */}

      {/* 学习时长选择 */}
      <DurationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        nodeName={selectedNode.name}
        url={selectedNode.url}
        suggestedDuration={selectedNode.suggestedDuration}
      />

      {/* 添加大标题 */}
      <Modal visible={addStageVisible} transparent onRequestClose={() => setAddStageVisible(false)} animationType="fade">
        <TouchableOpacity style={s.modalOverlay} onPress={() => setAddStageVisible(false)} activeOpacity={1}>
          <View style={[s.modalContent, { backgroundColor: colors.surface }]} onStartShouldSetResponder={() => true}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: colors.textPrimary }]}>添加大标题</Text>
              <TouchableOpacity style={s.modalClose} onPress={() => setAddStageVisible(false)}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[s.addInput, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.inputBorder }]}
              placeholder="输入大标题名称"
              placeholderTextColor={colors.textTertiary}
              value={newStageName} onChangeText={setNewStageName}
              maxLength={20} autoFocus
            />
            <TouchableOpacity
              style={[s.modalConfirmBtn, !newStageName.trim() && { opacity: 0.5 }]}
              onPress={handleAddStage} disabled={!newStageName.trim()}
            >
              <Text style={s.modalConfirmText}>确认添加</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 添加结点 */}
      <Modal visible={addNodeVisible} transparent onRequestClose={() => setAddNodeVisible(false)} animationType="fade">
        <TouchableOpacity style={s.modalOverlay} onPress={() => setAddNodeVisible(false)} activeOpacity={1}>
          <View style={[s.modalContent, { backgroundColor: colors.surface }]} onStartShouldSetResponder={() => true}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: colors.textPrimary }]}>添加结点</Text>
              <TouchableOpacity style={s.modalClose} onPress={() => setAddNodeVisible(false)}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[s.addLabel, { color: colors.textSecondary }]}>结点名称</Text>
            <TextInput
              style={[s.addInput, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.inputBorder }]}
              placeholder="输入结点名称" placeholderTextColor={colors.textTertiary}
              value={newNodeName} onChangeText={setNewNodeName} maxLength={30}
            />
            <Text style={[s.addLabel, { color: colors.textSecondary }]}>学习链接</Text>
            <TextInput
              style={[s.addInput, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.inputBorder }]}
              placeholder="https://..." placeholderTextColor={colors.textTertiary}
              value={newNodeUrl} onChangeText={setNewNodeUrl}
              autoCapitalize="none" keyboardType="url"
            />
            <Text style={[s.addLabel, { color: colors.textSecondary }]}>平台</Text>
            <View style={s.platformSelector}>
              {PLATFORM_OPTIONS.map(opt => (
                <TouchableOpacity key={opt.key}
                  style={[s.platformOption, newNodePlatform === opt.key && { backgroundColor: opt.color + '20', borderColor: opt.color }]}
                  onPress={() => setNewNodePlatform(opt.key)}
                >
                  <Ionicons name={opt.icon as any} size={16} color={opt.color} />
                  <Text style={[s.platformOptionText, { color: newNodePlatform === opt.key ? opt.color : colors.textSecondary }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[s.modalConfirmBtn, (!newNodeName.trim() || !newNodeUrl.trim()) && { opacity: 0.5 }]}
              onPress={handleAddNode} disabled={!newNodeName.trim() || !newNodeUrl.trim()}
            >
              <Text style={s.modalConfirmText}>确认添加</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 编辑大标题 */}
      <Modal visible={editStageVisible} transparent onRequestClose={() => setEditStageVisible(false)} animationType="fade">
        <TouchableOpacity style={s.modalOverlay} onPress={() => setEditStageVisible(false)} activeOpacity={1}>
          <View style={[s.modalContent, { backgroundColor: colors.surface }]} onStartShouldSetResponder={() => true}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: colors.textPrimary }]}>编辑大标题</Text>
              <TouchableOpacity style={s.modalClose} onPress={() => setEditStageVisible(false)}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[s.addInput, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.inputBorder }]}
              placeholder="输入大标题名称" placeholderTextColor={colors.textTertiary}
              value={editStageName} onChangeText={setEditStageName}
              maxLength={20} autoFocus
            />
            <TouchableOpacity
              style={[s.modalConfirmBtn, !editStageName.trim() && { opacity: 0.5 }]}
              onPress={handleSaveEditStage} disabled={!editStageName.trim()}
            >
              <Text style={s.modalConfirmText}>保存更改</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 编辑结点 */}
      <Modal visible={editNodeVisible} transparent onRequestClose={() => setEditNodeVisible(false)} animationType="fade">
        <TouchableOpacity style={s.modalOverlay} onPress={() => setEditNodeVisible(false)} activeOpacity={1}>
          <View style={[s.modalContent, { backgroundColor: colors.surface }]} onStartShouldSetResponder={() => true}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: colors.textPrimary }]}>编辑结点</Text>
              <TouchableOpacity style={s.modalClose} onPress={() => setEditNodeVisible(false)}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[s.addLabel, { color: colors.textSecondary }]}>结点名称</Text>
            <TextInput
              style={[s.addInput, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.inputBorder }]}
              placeholder="结点名称" placeholderTextColor={colors.textTertiary}
              value={editNodeName} onChangeText={setEditNodeName} maxLength={30}
            />
            <Text style={[s.addLabel, { color: colors.textSecondary }]}>学习链接</Text>
            <TextInput
              style={[s.addInput, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.inputBorder }]}
              placeholder="https://..." placeholderTextColor={colors.textTertiary}
              value={editNodeUrl} onChangeText={setEditNodeUrl}
              autoCapitalize="none" keyboardType="url"
            />
            <Text style={[s.addLabel, { color: colors.textSecondary }]}>平台</Text>
            <View style={s.platformSelector}>
              {PLATFORM_OPTIONS.map(opt => (
                <TouchableOpacity key={opt.key}
                  style={[s.platformOption, editNodePlatform === opt.key && { backgroundColor: opt.color + '20', borderColor: opt.color }]}
                  onPress={() => setEditNodePlatform(opt.key)}
                >
                  <Ionicons name={opt.icon as any} size={16} color={opt.color} />
                  <Text style={[s.platformOptionText, { color: editNodePlatform === opt.key ? opt.color : colors.textSecondary }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[s.modalConfirmBtn, (!editNodeName.trim() || !editNodeUrl.trim()) && { opacity: 0.5 }]}
              onPress={handleSaveEditNode} disabled={!editNodeName.trim() || !editNodeUrl.trim()}
            >
              <Text style={s.modalConfirmText}>保存更改</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Toast */}
      {toastMessage !== '' && (
        <View style={s.toast}>
          <Ionicons name="checkmark-circle" size={18} color="#3AE374" />
          <Text style={s.toastText}>{toastMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

// ===================== 样式表 =====================

const s = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 14, marginTop: 12 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyBtn: {
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(93,155,250,0.4)',
  },
  emptyBtnText: { fontSize: 13, fontWeight: '600' },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  // 顶部栏
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  backBtnRect: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(93,155,250,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerPlaceholder: { width: 40 },
  // 描述区
  descriptionSection: { paddingHorizontal: 20, marginBottom: 20 },
  descriptionTitle: { fontSize: 14, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  descriptionText: { fontSize: 13, lineHeight: 20 },
  // 时长徽章
  totalDurationBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: 'rgba(93,155,250,0.15)', marginHorizontal: 20, marginBottom: 20, alignSelf: 'center',
  },
  totalDurationText: { fontSize: 12, fontWeight: '600' },
  // 技能树容器
  treeContainer: { paddingHorizontal: 16 },
  stageColumn: { marginBottom: 20 },
  middleStage: { marginTop: 20 },
  // 大标题
  stageNode: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    borderWidth: 1, alignItems: 'center', marginBottom: 12,
  },
  stageNodeRow: { flexDirection: 'row', alignItems: 'center' },
  stageName: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  stageDuration: { fontSize: 10, color: '#888' },
  // 结点列表
  skillNodesList: { gap: 8 },
  skillNode: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1,
    borderRadius: 12, padding: 12, position: 'relative',
  },
  skillNodeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  nodeBadge: {
    width: 20, height: 20, borderRadius: 6,
    backgroundColor: 'rgba(93,155,250,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  nodeBadgeText: { fontSize: 10, color: '#5D9BFA', fontWeight: '700' },
  skillNodeName: { fontSize: 13, color: '#fff', fontWeight: '600', marginBottom: 8, lineHeight: 16 },
  skillNodeFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  platformText: { fontSize: 10, fontWeight: '500' },
  durationText: { fontSize: 10, color: '#888', fontWeight: '500' },
  arrowIcon: { position: 'absolute', right: 12, bottom: 12 },
  // 添加结点按钮
  addNodeBtn: {
    alignItems: 'center', justifyContent: 'center', paddingVertical: 10,
    borderRadius: 10, borderWidth: 1, borderStyle: 'dashed',
    borderColor: 'rgba(93,155,250,0.3)', marginTop: 4,
  },
  addNodeText: { fontSize: 12, fontWeight: '600' },
  // 添加大标题按钮
  addStageBtn: {
    alignItems: 'center', justifyContent: 'center', marginHorizontal: 16,
    paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', marginTop: 8,
  },
  addStageText: { fontSize: 14, fontWeight: '700' },
  // 返回按钮（空状态用）
  backBtn: {
    marginTop: 24, paddingVertical: 10, paddingHorizontal: 24,
    borderRadius: 10, backgroundColor: 'rgba(93,155,250,0.2)',
  },
  // 输入框通用
  addInput: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 14, marginBottom: 12,
  },
  addLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  // 平台选择
  platformSelector: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  platformOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  platformOptionText: { fontSize: 11, fontWeight: '600' },
  bottomPadding: { height: 40 },
  // 模态框通用
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalContent: { width: '100%', borderRadius: 20, padding: 24 },
  // 卡片式弹出（学习时长选择用）
  overlayLight: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: {
    width: '100%', maxWidth: 380, borderRadius: 20, padding: 24,
    backgroundColor: '#1A1A3E', borderWidth: 1, borderColor: 'rgba(93,155,250,0.3)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalClose: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  modalNodeName: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 16 },
  // 体力信息
  staminaInfo: { marginBottom: 16 },
  staminaBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  staminaFill: { height: '100%', backgroundColor: '#3AE374', borderRadius: 4 },
  staminaText: { fontSize: 12, color: '#8888AA' },
  modalSubtitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 },
  // 时长选项
  durationOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  durationButton: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  durationButtonActive: { borderColor: '#5D9BFA' },
  durationTextSmall: { fontSize: 12, color: '#888' },
  durationTextActive: { color: '#FFFFFF' },
  costInfo: { marginBottom: 20 },
  costText: { fontSize: 12, color: '#FF9800', marginBottom: 4 },
  suggestedText: { fontSize: 12, color: '#8888AA' },
  modalConfirmBtn: { backgroundColor: '#5D9BFA', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalConfirmText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  // Toast
  toast: {
    position: 'absolute', bottom: 40, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(0,0,0,0.85)', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12,
  },
  toastText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});

export default SkillTreeScreen;