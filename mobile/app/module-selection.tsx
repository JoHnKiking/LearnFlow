import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView,
  TextInput, Alert, KeyboardAvoidingView, Platform, Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MonsterIcon from '../src/components/MonsterIcon';
import { PlatformType } from '../src/types/skill';
import { API_BASE_URL, MONSTER_CONFIG } from '../src/utils/constants';
import { storage, STORAGE_KEYS } from '../src/utils/storage';
import SubscriptionModal from '../src/components/SubscriptionModal';
import { getCurrentUser } from '../src/utils/auth';
import { proService } from '../src/services/api';
import { useProStatus } from '../src/hooks/useProStatus';


// ---- 平台选项（与 skill-tree 保持一致） ----
const PLATFORM_OPTIONS: { key: PlatformType; label: string; icon: string; color: string }[] = [
  { key: 'bilibili', label: 'B站', icon: 'play-circle', color: '#FB7299' },
  { key: 'xiaohongshu', label: '小红书', icon: 'book', color: '#FF2442' },
  { key: 'mooc', label: '中国大学MOOC', icon: 'school', color: '#5D9BFA' },
];

// ---- 类型定义 ----

type ModuleType = 'ai-product-manager' | 'personal-finance' | 'english-communication' | string;

type ModuleCategory = 'student' | 'summer' | 'college' | 'work';

interface Module {
  id: ModuleType;
  name: string;
  icon: string;
  category: ModuleCategory;
  description: string;
  difficulty: string;
}

/** 自定义模块中一个大标题（阶段） */
interface CustomStageDraft {
  localId: string; // 临时 ID，提交时替换为正式 ID
  name: string;
}

/** 自定义模块中一个小结点 */
interface CustomNodeDraft {
  localId: string;
  stageLocalId: string; // 归属哪个大标题
  name: string;
  url: string;
  platform: PlatformType;
}

// ---- 预设模块列表 ----
const predefinedModules: Module[] = [
  // ---- 学生专区 ----
  { id: 'english-communication', name: '英语沟通', icon: 'language',
    category: 'student', description: '提升英语听说能力，达到日常流利对话水平', difficulty: '初级' },
  { id: 'cet-exam', name: '四六级过关', icon: 'school',
    category: 'student', description: '高效备战四六级，目标一次性通过并取得高分', difficulty: '初级' },
  // ---- 暑假专区 ----
  { id: 'office-skills', name: '基础办公技能', icon: 'desktop',
    category: 'summer', description: '熟练使用Word/Excel/PPT，达到独立完成办公文档与数据处理水平', difficulty: '初级' },
  { id: 'vibe-coding', name: 'Vibe Coding 启蒙', icon: 'code-slash',
    category: 'summer', description: '像聊天一样写代码：把想法说给AI，它帮你实现', difficulty: '初级' },
  { id: 'speech-expression', name: '演讲表达', icon: 'mic',
    category: 'summer', description: '克服演讲恐惧，能独立完成10分钟有逻辑、有感染力的公开演讲', difficulty: '初级' },
  { id: 'video-editing', name: '视频剪辑', icon: 'videocam',
    category: 'summer', description: '掌握剪辑全流程，能独立产出高质量短视频作品', difficulty: '初级' },
  // ---- 大学课程 ----
  { id: 'advanced-math', name: '高等数学', icon: 'calculator',
    category: 'college', description: '微分、积分、级数与微分方程，掌握高等数学核心概念与解题方法', difficulty: '高级' },
  { id: 'college-cs', name: '大学生计算机基础', icon: 'laptop',
    category: 'college', description: '计算机原理、操作系统、网络基础，构建计算机科学知识体系', difficulty: '初级' },
  { id: 'linear-algebra', name: '线性代数', icon: 'grid',
    category: 'college', description: '矩阵运算、向量空间、特征值与特征向量，掌握线性代数基本工具', difficulty: '中级' },
  // ---- 工作专区 ----
  { id: 'ai-product-manager', name: 'AI产品经理', icon: 'hardware-chip',
    category: 'work', description: '掌握AI产品设计与落地，达到独立负责AI产品模块的能力', difficulty: '中级' },
  { id: 'programming-basics', name: '编程基础', icon: 'code-slash',
    category: 'work', description: '从零开始学编程，达到能独立开发简单后端服务的能力', difficulty: '初级' },
];

// ---- 工具函数 ----
let draftIdCounter = 0;
const generateDraftId = () => `draft_${Date.now()}_${draftIdCounter++}`;

const ModuleSelectionScreen = () => {
  const { colors } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.replace('/login');
      }
    };
    checkAuth();
  }, []);

  // 根据分类获取颜色（从品牌色系衍生）
  const getCategoryColor = (category: ModuleCategory): string => {
    switch (category) {
      case 'student': return colors.brandPink;
      case 'summer': return colors.success;
      case 'college': return colors.brandPurple;
      case 'work': return colors.warning;
    }
  };
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isAddMode = mode === 'add';

  // ---- 预设模块选择相关状态 ----
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>([]);
  const [existingModules, setExistingModules] = useState<ModuleType[]>([]);
  const [fadeAnim] = useState(new Animated.Value(1));

  // ---- 自定义模块创建相关状态 ----
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  // 大标题草稿列表，确保至少有一个
  const [stageDrafts, setStageDrafts] = useState<CustomStageDraft[]>([]);
  // 小结点草稿列表
  const [nodeDrafts, setNodeDrafts] = useState<CustomNodeDraft[]>([]);
  // toast 提示
  const [toastMessage, setToastMessage] = useState('');
  // AI 加载状态
  const [aiLoading, setAiLoading] = useState(false);
  // 添加模式下的 tab 切换
  const [activeAddTab, setActiveAddTab] = useState<'official' | 'aicustom'>('official');
  // Pro 弹窗
  const [showProModal, setShowProModal] = useState(false);
  // 专区折叠状态（默认全部展开）
  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>({
    student: true,
    summer: true,
    college: true,
    work: true,
  });

  // ---- 初始化 ----
  useEffect(() => {
    if (isAddMode) {
      const loadExisting = async () => {
        const stored = await AsyncStorage.getItem('selectedModules');
        if (stored) {
          const parsed = JSON.parse(stored) as ModuleType[];
          setExistingModules(parsed);
          // 进入添加模式时，初始选中已有模块，防止覆盖
          setSelectedModules(parsed);
        }
      };
      loadExisting();
      // 初始化时预创建 1 个大标题和 1 个小结点
      const stageId = generateDraftId();
      const nodeId = generateDraftId();
      setStageDrafts([{ localId: stageId, name: '' }]);
      setNodeDrafts([{ localId: nodeId, stageLocalId: stageId, name: '', url: '', platform: 'bilibili' }]);
    } else {
      setSelectedModules(['ai-product-manager']);
    }
  }, [isAddMode]);

  // ---- 预设模块：列表（全部展示，不消失） ----
  const availableModules = predefinedModules;

  // ---- 预设模块：切换选中 ----
  const toggleModule = (id: ModuleType) => {
    if (isAddMode) {
      // 添加模式：官方领域 tab 下只能单选，AI自定义 tab 下可多选
      if (activeAddTab === 'official') {
        // 单选：点击已选中的取消，点击新的替换
        if (selectedModules.includes(id)) {
          setSelectedModules(selectedModules.filter(m => m !== id));
        } else {
          setSelectedModules([id]);
        }
      } else {
        // AI自定义 tab 下多选（追加已有模块）
        if (selectedModules.includes(id)) {
          setSelectedModules(selectedModules.filter(m => m !== id));
        } else {
          setSelectedModules([...selectedModules, id]);
        }
      }
    } else {
      // 初始选择模式下多选（最多3个）
      if (selectedModules.includes(id)) {
        setSelectedModules(selectedModules.filter(m => m !== id));
      } else {
        if (selectedModules.length >= 3) return;
        setSelectedModules([...selectedModules, id]);
      }
    }
  };

  // ---- Pro 检测（以数据库 is_pro 字段为准） ----
  const { isPro, refresh: refreshPro } = useProStatus();

  // ===================== 自定义模块：大标题操作 =====================

  /** 添加一个大标题草稿 */
  const handleAddStage = () => {
    const newId = generateDraftId();
    setStageDrafts(prev => [...prev, { localId: newId, name: '' }]);
  };

  /** 更新大标题名称 */
  const handleStageNameChange = (stageId: string, name: string) => {
    setStageDrafts(prev => prev.map(s => s.localId === stageId ? { ...s, name } : s));
  };

  /** 删除一个大标题，同时连带删除其下的小结点草稿 */
  const handleRemoveStage = (stageId: string) => {
    setStageDrafts(prev => prev.filter(s => s.localId !== stageId));
    setNodeDrafts(prev => prev.filter(n => n.stageLocalId !== stageId));
  };

  // ===================== 自定义模块：小结点操作 =====================

  /** 为指定大标题添加一个小结点草稿 */
  const handleAddNode = (stageLocalId: string) => {
    setNodeDrafts(prev => [...prev, {
      localId: generateDraftId(),
      stageLocalId,
      name: '',
      url: '',
      platform: 'bilibili',
    }]);
  };

  /** 更新小结点字段 */
  const handleNodeChange = (nodeId: string, field: keyof CustomNodeDraft, value: string) => {
    setNodeDrafts(prev => prev.map(n => n.localId === nodeId ? { ...n, [field]: value } : n));
  };

  /** 删除小结点草稿 */
  const handleRemoveNode = (nodeId: string) => {
    setNodeDrafts(prev => prev.filter(n => n.localId !== nodeId));
  };

  // ===================== 验证 & 提交 =====================

  /** 验证自定义模块创建表单 */
  const validateCustomForm = (): string | null => {
    if (!customName.trim()) return '请输入模块名称';
    if (!customDescription.trim()) return '请输入模块介绍';
    // 验证每个大标题都有名称
    for (const stage of stageDrafts) {
      if (!stage.name.trim()) return '每个大标题都需要填写名称';
    }
    // 验证每个大标题下至少有一个有效的小结点
    for (const stage of stageDrafts) {
      const stageNodes = nodeDrafts.filter(n => n.stageLocalId === stage.localId);
      if (stageNodes.length === 0) return `大标题「${stage.name || '未命名'}」下至少需要一个结点`;
      for (const node of stageNodes) {
        if (!node.name.trim()) return '每个结点都需要填写名称';
        if (!node.url.trim()) return '每个结点都需要填写链接';
        const isValidUrl = node.url.trim().startsWith('http://') || node.url.trim().startsWith('https://');
        if (!isValidUrl) return '链接格式不正确，需要以 http:// 或 https:// 开头';
      }
    }
    return null; // 验证通过
  };

  // ---- AI 一键填充接口响应类型 ----
  interface AIFillNode {
    nodeName: string;
    subNodes: { subName: string; link: string }[];
  }
  interface AIFillResponse {
    data: {
      moduleDescription: string;
      nodes: AIFillNode[];
    };
  }

  /** AI 一键填充自定义模块内容 */
  const handleAIFill = async () => {
    if (!customName.trim()) {
      Alert.alert('提示', '请先填写模块名称');
      return;
    }
    if (!customDescription.trim()) {
      Alert.alert('提示', '请先填写模块介绍');
      return;
    }

    // 免费用户：检查是否已有自定义模块
    if (!isPro) {
      const hasCustom = existingModules.some(id => id.startsWith('custom-'));
      if (hasCustom) {
        Alert.alert('提示', '免费额度已用完，请升级 Pro 无限畅用', [
          { text: '取消', style: 'cancel' },
          { text: '了解 Pro', onPress: () => setShowProModal(true) },
        ]);
        return;
      }
    }

    setAiLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_BASE_URL}/ai/fill-module`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleName: customName.trim(),
          moduleDescription: customDescription.trim(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('AI生成失败，请重试');
      }

      const result: AIFillResponse = await response.json();

      if (!result.data || !result.data.moduleDescription || !Array.isArray(result.data.nodes)) {
        throw new Error('数据解析异常，请重试');
      }

      // 保留用户填写的模块介绍，不覆盖
      // 只填充 AI 生成的大标题和小结点

      // 清空现有草稿并填充 AI 生成的大标题和小结点
      const newStages: CustomStageDraft[] = [];
      const newNodes: CustomNodeDraft[] = [];

      result.data.nodes.forEach((node, si) => {
        const stageId = `ai_stage_${Date.now()}_${si}`;
        newStages.push({ localId: stageId, name: node.nodeName });

        (node.subNodes || []).forEach((sub) => {
          newNodes.push({
            localId: `ai_node_${Date.now()}_${si}_${newNodes.length}`,
            stageLocalId: stageId,
            name: sub.subName || '',
            url: sub.link || '',
            platform: 'bilibili',
          });
        });
      });

      setStageDrafts(newStages);
      setNodeDrafts(newNodes);

      Alert.alert('生成成功', 'AI 已为你自动填充模块内容，请检查并修改后提交');
    } catch (error: any) {
      if (error.name === 'AbortError') {
        Alert.alert('生成失败', '网络异常，请稍后重试');
      } else {
        Alert.alert('生成失败', error.message || 'AI生成失败，请重试');
      }
    } finally {
      setAiLoading(false);
    }
  };

  /** 提交自定义模块 */
  const handleCreateCustomModule = async () => {
    const error = validateCustomForm();
    if (error) {
      Alert.alert('提示', error);
      return;
    }

    // 免费用户：检查是否已有自定义模块
    if (!isPro) {
      const hasCustom = existingModules.some(id => id.startsWith('custom-'));
      if (hasCustom) {
        Alert.alert('提示', '免费额度已用完，请升级 Pro 无限畅用', [
          { text: '取消', style: 'cancel' },
          { text: '了解 Pro', onPress: () => setShowProModal(true) },
        ]);
        return;
      }
    }

    const moduleId = `custom-${Date.now()}`;

    // 1. 保存自定义模块元信息（名称 + 介绍）
    const customModulesStr = await AsyncStorage.getItem('customModules');
    const customModules: Record<string, { name: string; description: string }> = customModulesStr
      ? JSON.parse(customModulesStr) : {};
    customModules[moduleId] = {
      name: customName.trim(),
      description: customDescription.trim(),
    };
    await AsyncStorage.setItem('customModules', JSON.stringify(customModules));

    // 2. 将草稿转换为正式的自定义 stages/nodes 并保存到 AsyncStorage
    const formalStages: { id: string; name: string }[] = stageDrafts.map(s => ({
      id: `custom-stage_${s.localId}`,
      name: s.name.trim(),
    }));

    const formalNodes: {
      id: string; stageId: string; name: string;
      url: string; platform: PlatformType; duration: number;
    }[] = nodeDrafts.map(n => {
      return {
        id: `custom-node_${n.localId}`,
        stageId: `custom-stage_${n.stageLocalId}`,
        name: n.name.trim(),
        url: n.url.trim(),
        platform: n.platform,
        duration: 1, // 默认1小时，用户后续可在结点中调整
      };
    });

    await AsyncStorage.setItem(`customStages_${moduleId}`, JSON.stringify(formalStages));
    await AsyncStorage.setItem(`customNodes_${moduleId}`, JSON.stringify(formalNodes));

    // 3. 更新 selectedModules
    const newSelected = [...existingModules, moduleId];
    await AsyncStorage.setItem('selectedModules', JSON.stringify(newSelected));

    setToastMessage('模块创建成功');
    setTimeout(() => {
      setToastMessage('');
      router.back();
    }, 1500);
  };

  // ---- 预设模块：确认选择 ----
  const handleConfirmPreset = async () => {
    const newIds = selectedModules.filter(id => !existingModules.includes(id));
    if (newIds.length === 0) return;
    // 免费用户检测：已有官方（预设）模块则禁止添加第二个
    const presetIds = new Set(predefinedModules.map(m => m.id));
    const hasPreset = existingModules.some(id => presetIds.has(id));
    if (!isPro && hasPreset) {
      Alert.alert('提示', '免费用户仅可选择/拥有一个官方模块，请先删除原有官方模块');
      return;
    }
    await AsyncStorage.setItem('selectedModules', JSON.stringify(selectedModules));
    if (isAddMode) {
      router.back();
    } else {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      router.replace('/(tabs)');
    }
  };

  // ---- styles ----
  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { flexGrow: 1 },
    content: { flex: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 },
    // 标题区
    title: { color: colors.textPrimary, fontSize: 24, fontWeight: '600', marginBottom: 4 },
    subtitle: { color: colors.textSecondary, fontSize: 13, marginBottom: 24 },
    // 输入框通用
    input: {
      backgroundColor: colors.inputBg, borderRadius: 10, borderWidth: 1,
      borderColor: colors.inputBorder, paddingHorizontal: 16, paddingVertical: 14,
      fontSize: 16, color: colors.textPrimary, marginBottom: 16,
    },
    inputMultiline: {
      minHeight: 80, textAlignVertical: 'top',
    },
    // 分区标题
    sectionTitle: {
      color: colors.textPrimary, fontSize: 16, fontWeight: '600',
      marginBottom: 12, marginTop: 8,
    },
    zoneTitle: {
      color: colors.textPrimary, fontSize: 15, fontWeight: '700',
      marginBottom: 10, marginTop: 4,
    },
    sectionHint: {
      color: colors.textTertiary, fontSize: 12,
      marginBottom: 16, marginTop: -8,
    },
    // 大标题卡片
    stageCard: {
      backgroundColor: colors.card, borderRadius: 16, borderWidth: 1,
      borderColor: colors.border, padding: 16, marginBottom: 12,
    },
    stageHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
    },
    stageLabel: { color: colors.primary, fontSize: 14, fontWeight: '600' },
    stageRemoveBtn: {
      width: 28, height: 28, borderRadius: 14, backgroundColor: colors.border,
      alignItems: 'center', justifyContent: 'center',
    },
    stageInput: {
      backgroundColor: colors.inputBg, borderRadius: 10, borderWidth: 1,
      borderColor: colors.inputBorder, paddingHorizontal: 14, paddingVertical: 12,
      fontSize: 15, color: colors.textPrimary, marginBottom: 14,
    },
    // 小结点区域
    nodeSection: { marginTop: 4 },
    nodeLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 },
    nodeCard: {
      backgroundColor: colors.surface, borderRadius: 14, padding: 12,
      marginBottom: 8, position: 'relative',
    },
    nodeHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
    },
    nodeIndex: { color: colors.textTertiary, fontSize: 12 },
    nodeNameInput: {
      backgroundColor: colors.inputBg, borderRadius: 10, borderWidth: 1,
      borderColor: colors.inputBorder, paddingHorizontal: 12, paddingVertical: 10,
      fontSize: 14, color: colors.textPrimary, marginBottom: 6,
    },
    nodeUrlInput: {
      backgroundColor: colors.inputBg, borderRadius: 10, borderWidth: 1,
      borderColor: colors.inputBorder, paddingHorizontal: 12, paddingVertical: 10,
      fontSize: 13, color: colors.textPrimary, marginBottom: 6,
    },
    // 平台选择器
    platformRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
    platformChip: {
      flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 10, paddingVertical: 6,
      borderRadius: 8, borderWidth: 1, borderColor: colors.border,
    },
    platformChipActive: { borderColor: 'transparent' },
    platformChipText: { fontSize: 11, fontWeight: '600' },
    // 添加按钮
    addNodeBtn: {
      borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderDark,
      borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 4,
    },
    addNodeBtnText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
    addStageBtn: {
      borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.borderDark,
      borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8, marginBottom: 24,
    },
    addStageBtnText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
    // 确认按钮
    confirmBtn: {
      backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 16,
      alignItems: 'center', marginTop: 4, marginBottom: 32,
      shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
    },
    confirmBtnDisabled: { backgroundColor: colors.border, opacity: 0.5, shadowOpacity: 0 },
    confirmBtnText: { color: colors.onPrimary, fontSize: 16, fontWeight: '600' },
    // Toast
    toast: {
      position: 'absolute', bottom: 40, left: 20, right: 20,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      backgroundColor: 'rgba(0,0,0,0.85)', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12,
    },
    toastText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
    // 添加模式 tab 切换
    addTabs: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 2,
      padding: 3,
      marginBottom: 20,
    },
    addTab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 2,
      alignItems: 'center',
    },
    addTabActive: {
      backgroundColor: colors.primary,
    },
    addTabText: {
      fontSize: 13,
      fontWeight: '600',
      fontFamily: 'Courier',
    },
    // 预设模块卡片 — 主页风格（水平布局）
    modulesContainer: {
      gap: 10,
    },
    moduleCard: {
      borderRadius: 2,
      borderWidth: 2,
      overflow: 'hidden',
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 8,
    },
    moduleCardIcon: {
      width: 44,
      height: 44,
      borderRadius: 2,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    moduleCardInfo: {
      flex: 1,
    },
    moduleCardName: {
      fontSize: 14,
      fontWeight: '700',
      fontFamily: 'Courier',
      marginBottom: 2,
    },
    moduleCardCategory: {
      fontSize: 11,
      fontWeight: '500',
      fontFamily: 'Courier',
    },
    moduleCardCheck: {
      width: 24,
      height: 24,
      borderRadius: 2,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    selectedCount: { textAlign: 'center', color: colors.textSecondary, fontSize: 13, marginTop: 24 },
    spacer: { flex: 1 },
    bottomBar: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.hairline },
    startButton: {
      paddingVertical: 16, borderRadius: 16, alignItems: 'center',
      justifyContent: 'center', marginTop: 24,
    },
    startButtonText: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
    // no more modules hint
    emptyHint: {
      color: colors.textSecondary, fontSize: 14,
      textAlign: 'center', marginTop: 40,
    },
    // 标头小怪兽
    header: { alignItems: 'center', marginBottom: 24 },
    monsterAvatarContainer: { marginBottom: 16 },
    monsterAvatar: { width: 80, height: 80, position: 'relative' },
    monsterHeadAvatar: { width: 40, height: 24, backgroundColor: colors.primary, position: 'absolute', top: 16, left: 20 },
    monsterEyesAvatar: { flexDirection: 'row', gap: 8, position: 'absolute', top: 8, left: 8 },
    eyeAvatar: { width: 10, height: 10, backgroundColor: '#FFFFFF', position: 'relative' },
    pupilAvatar: { width: 4, height: 5, backgroundColor: colors.background, position: 'absolute', top: 2, left: 3 },
    mouthAvatar: { width: 16, height: 4, backgroundColor: colors.background, position: 'absolute', top: 18, left: 12 },
    bodyAvatar: { width: 32, height: 8, backgroundColor: colors.primary, position: 'absolute', top: 40, left: 24 },
    bubble: {
      backgroundColor: colors.card, borderRadius: 16, borderWidth: 2, borderColor: colors.primary,
      paddingHorizontal: 24, paddingVertical: 12, marginBottom: 20,
    },
    bubbleTail: {
      width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 8,
      borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: colors.primary,
      position: 'absolute', top: -8, left: '50%', marginLeft: -8,
    },
    bubbleText: { color: colors.textPrimary, fontSize: 14 },

    // ---- AI 填充 ----
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    nameInput: { flex: 1 },
    aiFillBtn: {
      backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 14,
      paddingVertical: 14, justifyContent: 'center', alignItems: 'center',
      shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, minWidth: 110,
    },
    aiFillBtnDisabled: { backgroundColor: colors.border, shadowOpacity: 0 },
    aiFillBtnText: { color: colors.onPrimary, fontSize: 13, fontWeight: '700' },

    // ---- AI 加载 Modal ----
    aiModalOverlay: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center', alignItems: 'center',
    },
    aiModalCard: {
      backgroundColor: colors.surface, borderRadius: 20, padding: 40,
      alignItems: 'center', borderWidth: 1, borderColor: colors.border,
      marginHorizontal: 40,
    },
    aiModalTitle: {
      color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginTop: 20,
    },
    aiModalSubtitle: {
      color: colors.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center',
    },
  }), [colors]);

  // ---- 渲染：预设模块选择界面（按分区展示） ----
  const renderPresetSelection = () => {
    const zones: { key: ModuleCategory; title: string }[] = [
      { key: 'student', title: '学生专区' },
      { key: 'summer', title: '暑假专区' },
      { key: 'college', title: '大学课程' },
      { key: 'work', title: '工作专区' },
    ];

    const renderModuleCard = (module: Module) => {
      const isSelected = selectedModules.includes(module.id);
      const catColor = getCategoryColor(module.category);
      return (
        <TouchableOpacity
          key={module.id}
          onPress={() => toggleModule(module.id)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.moduleCard,
              {
                backgroundColor: isSelected ? catColor : colors.surface,
                borderColor: catColor,
                shadowColor: isSelected ? catColor : colors.shadow,
                shadowOffset: { width: isSelected ? 3 : 0, height: isSelected ? 3 : 0 },
                shadowOpacity: isSelected ? 0.5 : 0,
                shadowRadius: 0,
                elevation: isSelected ? 3 : 0,
              },
            ]}
          >
            <View style={[styles.moduleCardIcon, {
              backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : catColor,
            }]}>
              <Ionicons name={module.icon as any} size={22} color={'#FFFFFF'} />
            </View>
            <View style={styles.moduleCardInfo}>
              <Text
                style={[styles.moduleCardName, { color: isSelected ? colors.onPrimary : colors.textPrimary }]}
              >
                {module.name}
              </Text>
              <Text
                style={[styles.moduleCardCategory, { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textTertiary }]}
              >
                {module.category === 'student' ? '学生专区' : module.category === 'summer' ? '暑假专区' : module.category === 'college' ? '大学课程' : '工作专区'}
              </Text>
            </View>
            {isSelected && (
              <View style={[styles.moduleCardCheck, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <View style={styles.modulesContainer}>
        {availableModules.length === 0 && isAddMode ? (
          <Text style={styles.emptyHint}>所有预设模块已添加</Text>
        ) : (
          zones.map((zone) => {
            const zoneModules = availableModules.filter((m) => m.category === zone.key);
            if (zoneModules.length === 0) return null;
            const isExpanded = expandedZones[zone.key];
            return (
              <View key={zone.key} style={{ marginBottom: 16 }}>
                <TouchableOpacity
                  onPress={() => setExpandedZones(prev => ({ ...prev, [zone.key]: !prev[zone.key] }))}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}
                >
                  <Text style={[styles.zoneTitle, { color: colors.textPrimary }]}>
                    {zone.title}
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                {isExpanded && zoneModules.map((module) => renderModuleCard(module))}
              </View>
            );
          })
        )}
      </View>
    );
  };

  // ---- 渲染：自定义模块创建表单 ----
  const renderCustomForm = () => (
    <>
      {/* ===== 第一步：输入模块名称 ===== */}
      <Text style={styles.sectionTitle}>模块名称</Text>
      <TextInput
        style={[styles.input, styles.nameInput]}
        placeholder="输入自定义模块名称，如「Swift 开发」"
        placeholderTextColor={colors.textTertiary}
        value={customName}
        onChangeText={setCustomName}
        maxLength={20}
        returnKeyType="done"
      />

      {/* ===== 第二步：输入模块介绍 ===== */}
      <Text style={styles.sectionTitle}>模块介绍</Text>
      <Text style={styles.sectionHint}>描述该模块的学习内容和目标</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        placeholder="输入一段模块介绍，如「从零开始学习 Swift 语言与 iOS 开发」"
        placeholderTextColor={colors.textTertiary}
        value={customDescription}
        onChangeText={setCustomDescription}
        maxLength={200}
        multiline
        numberOfLines={3}
      />

      {/* ===== 第三步：AI 一键生成 ===== */}
      <TouchableOpacity
        style={[styles.aiFillBtn, { width: '100%' }, aiLoading && styles.aiFillBtnDisabled]}
        onPress={handleAIFill}
        disabled={aiLoading}
        activeOpacity={0.7}
      >
        {aiLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.aiFillBtnText}>✨ AI一键生成</Text>
        )}
      </TouchableOpacity>

      {/* ===== 第四步：创建模块结点 ===== */}
      <Text style={styles.sectionTitle}>模块结点</Text>
      <Text style={styles.sectionHint}>至少需要一个大标题和一个学习结点</Text>

      {/* 遍历所有大标题草稿 */}
      {stageDrafts.map((stage, stageIndex) => {
        const stageNodes = nodeDrafts.filter(n => n.stageLocalId === stage.localId);
        return (
          <View key={stage.localId} style={styles.stageCard}>
            {/* 大标题头部：标签 + 删除按钮 */}
            <View style={styles.stageHeader}>
              <Text style={styles.stageLabel}>大标题 {stageIndex + 1}</Text>
              {stageDrafts.length > 1 && (
                <TouchableOpacity
                  style={styles.stageRemoveBtn}
                  onPress={() => handleRemoveStage(stage.localId)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={14} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* 大标题名称输入 */}
            <TextInput
              style={styles.stageInput}
              placeholder="输入大标题，如「初级阶段」「基础入门」"
              placeholderTextColor={colors.textTertiary}
              value={stage.name}
              onChangeText={(text) => handleStageNameChange(stage.localId, text)}
              maxLength={20}
            />

            {/* 该大标题下的小结点列表 */}
            <View style={styles.nodeSection}>
              <Text style={styles.nodeLabel}>学习结点</Text>
              {stageNodes.map((node, nodeIndex) => (
                <View key={node.localId} style={styles.nodeCard}>
                  {/* 结点头部：序号 + 删除 */}
                  <View style={styles.nodeHeader}>
                    <Text style={styles.nodeIndex}>结点 {nodeIndex + 1}</Text>
                    {stageNodes.length > 1 && (
                      <TouchableOpacity
                        onPress={() => handleRemoveNode(node.localId)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* 结点名称 */}
                  <TextInput
                    style={styles.nodeNameInput}
                    placeholder="输入结点名称，如「Swift 基础语法」"
                    placeholderTextColor={colors.textTertiary}
                    value={node.name}
                    onChangeText={(text) => handleNodeChange(node.localId, 'name', text)}
                    maxLength={30}
                  />

                  {/* 结点链接 */}
                  <TextInput
                    style={styles.nodeUrlInput}
                    placeholder="输入学习链接 (https://...)"
                    placeholderTextColor={colors.textTertiary}
                    value={node.url}
                    onChangeText={(text) => handleNodeChange(node.localId, 'url', text)}
                    autoCapitalize="none"
                    keyboardType="url"
                  />

                  {/* 平台选择器 */}
                  <View style={styles.platformRow}>
                    {PLATFORM_OPTIONS.map(opt => {
                      const isActive = node.platform === opt.key;
                      return (
                        <TouchableOpacity
                          key={opt.key}
                          style={[
                            styles.platformChip,
                            isActive && { backgroundColor: opt.color + '20', borderColor: opt.color },
                          ]}
                          onPress={() => handleNodeChange(node.localId, 'platform', opt.key)}
                        >
                          <Ionicons name={opt.icon as any} size={14} color={opt.color} />
                          <Text style={[
                            styles.platformChipText,
                            { color: isActive ? opt.color : colors.textSecondary },
                          ]}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}

              {/* 为当前大标题添加更多结点 */}
              <TouchableOpacity
                style={styles.addNodeBtn}
                onPress={() => handleAddNode(stage.localId)}
                activeOpacity={0.7}
              >
                <Text style={styles.addNodeBtnText}>+ 添加结点</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {/* ===== 添加更多大标题 ===== */}
      <TouchableOpacity
        style={styles.addStageBtn}
        onPress={handleAddStage}
        activeOpacity={0.7}
      >
        <Text style={styles.addStageBtnText}>+ 添加大标题</Text>
      </TouchableOpacity>

      {/* ===== 第四步：确认添加 ===== */}
      <TouchableOpacity
        style={styles.confirmBtn}
        onPress={handleCreateCustomModule}
        activeOpacity={0.8}
      >
        <Text style={styles.confirmBtnText}>确认添加</Text>
      </TouchableOpacity>
    </>
  );

  // ---- 小怪兽头像（复用） ----
  const MonsterAvatar = () => (
    <MonsterIcon type="calm" size={80} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: isAddMode ? 100 : 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* ---- 头部小怪兽 ---- */}
            {!isAddMode && (
              <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                <View style={styles.monsterAvatarContainer}>
                  <MonsterAvatar />
                </View>
                <View style={styles.bubble}>
                  <View style={styles.bubbleTail} />
                  <Text style={styles.bubbleText}>小怪兽，我们要探索哪些领域呢？</Text>
                </View>
              </Animated.View>
            )}

            {/* ---- 标题 ---- */}
            <Text style={styles.title}>{isAddMode ? '创建自定义模块' : '选择学习模块'}</Text>
            <Text style={styles.subtitle}>
              {isAddMode
                ? '填写模块信息并创建学习结点，构建属于你的学习地图'
                : '最多选择 3 个模块开始学习'}
            </Text>

            {/* ---- 根据模式渲染不同内容 ---- */}
            {isAddMode ? (
              <>
                {/* Tab 切换器 */}
                <View style={styles.addTabs}>
                  <TouchableOpacity
                    style={[styles.addTab, activeAddTab === 'official' && styles.addTabActive]}
                    onPress={() => setActiveAddTab('official')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.addTabText, {
                      color: activeAddTab === 'official' ? colors.onPrimary : colors.textSecondary,
                    }]}>官方模块</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.addTab, activeAddTab === 'aicustom' && styles.addTabActive]}
                    onPress={() => setActiveAddTab('aicustom')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.addTabText, {
                      color: activeAddTab === 'aicustom' ? colors.onPrimary : colors.textSecondary,
                    }]}>AI 自定义</Text>
                  </TouchableOpacity>
                </View>

                {/* 官方模块 tab */}
                {activeAddTab === 'official' && (
                  <>
                    {availableModules.length === 0 ? (
                      <Text style={styles.emptyHint}>所有预设模块已添加</Text>
                    ) : (
                      <>
                        {renderPresetSelection()}
                    {selectedModules.length > 0 && (
                          <TouchableOpacity
                            style={[styles.startButton, {
                              backgroundColor: colors.primary,
                              shadowColor: colors.shadow,
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
                              marginTop: 16,
                            }]}
                            onPress={handleConfirmPreset}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.startButtonText}>确认添加预设模块 ✨</Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* AI 自定义 tab */}
                {activeAddTab === 'aicustom' && renderCustomForm()}
              </>
            ) : (
              <>
                <Animated.View style={{ opacity: fadeAnim }}>
                  {renderPresetSelection()}
                </Animated.View>

                <Text style={styles.selectedCount}>
                  已选择 {selectedModules.length}/3 个模块
                </Text>

                {/* 确认按钮放在 ScrollView 内，确保可滚动到 */}
                <TouchableOpacity
                  style={[
                    styles.startButton,
                    {
                      backgroundColor: selectedModules.length === 0 ? colors.border : colors.primary,
                      opacity: selectedModules.length === 0 ? 0.5 : 1,
                      shadowColor: selectedModules.length === 0 ? 'transparent' : colors.shadow,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: selectedModules.length === 0 ? 0 : 0.08,
                      shadowRadius: 12,
                      elevation: selectedModules.length === 0 ? 0 : 3,
                      marginTop: 16,
                    },
                  ]}
                  onPress={handleConfirmPreset}
                  disabled={selectedModules.length === 0}
                  activeOpacity={0.7}
                >
                  <Text style={styles.startButtonText}>开始学习之旅 ✨</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ---- Toast 提示 ---- */}
      {toastMessage !== '' && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={18} color="#3AE374" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* ---- AI 生成进度弹窗（不可关闭） ---- */}
      <Modal visible={aiLoading} transparent animationType="fade">
        <View style={styles.aiModalOverlay}>
          <View style={styles.aiModalCard}>
            <ActivityIndicator size="large" color="#5D9BFA" />
            <Text style={styles.aiModalTitle}>AI 正在生成</Text>
            <Text style={styles.aiModalSubtitle}>
              AI正在生成学习内容，请稍候...
            </Text>
          </View>
        </View>
      </Modal>
      <SubscriptionModal visible={showProModal} onClose={() => setShowProModal(false)} onProActivated={refreshPro} />
    </SafeAreaView>
  );
};

export default ModuleSelectionScreen;