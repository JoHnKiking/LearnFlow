import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlatformType } from '../src/types/skill';

// ---- 平台选项（与 skill-tree 保持一致） ----
const PLATFORM_OPTIONS: { key: PlatformType; label: string; icon: string; color: string }[] = [
  { key: 'bilibili', label: 'B站', icon: 'play-circle', color: '#FB7299' },
  { key: 'xiaohongshu', label: '小红书', icon: 'book', color: '#FF2442' },
  { key: 'mooc', label: '中国大学MOOC', icon: 'school', color: '#5D9BFA' },
];

// ---- 类型定义 ----

type ModuleType = 'ai-product-manager' | 'personal-finance' | 'english-communication' | string;

interface Module {
  id: ModuleType;
  name: string;
  icon: string;
  color: string;
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
  {
    id: 'ai-product-manager', name: 'AI产品经理', icon: 'hardware-chip',
    color: '#5D9BFA', description: '掌握AI产品设计与落地', difficulty: '中级',
  },
  {
    id: 'personal-finance', name: '个人理财', icon: 'trending-up',
    color: '#3AE374', description: '建立科学理财观念', difficulty: '初级',
  },
  {
    id: 'english-communication', name: '英语沟通', icon: 'language',
    color: '#FF7D00', description: '提升英语听说能力', difficulty: '初级',
  },
];

// ---- 工具函数 ----
let draftIdCounter = 0;
const generateDraftId = () => `draft_${Date.now()}_${draftIdCounter++}`;

const ModuleSelectionScreen = () => {
  const { colors } = useTheme();
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

  // ---- 初始化 ----
  useEffect(() => {
    if (isAddMode) {
      const loadExisting = async () => {
        const stored = await AsyncStorage.getItem('selectedModules');
        if (stored) {
          const parsed = JSON.parse(stored) as ModuleType[];
          setExistingModules(parsed);
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

  // ---- 预设模块：过滤已选中的 ----
  const availableModules = isAddMode
    ? predefinedModules.filter(m => !existingModules.includes(m.id))
    : predefinedModules;

  // ---- 预设模块：切换选中 ----
  const toggleModule = (id: ModuleType) => {
    if (selectedModules.includes(id)) {
      if (isAddMode) return;
      setSelectedModules(selectedModules.filter(m => m !== id));
    } else {
      if (!isAddMode && selectedModules.length >= 3) return;
      setSelectedModules([...selectedModules, id]);
    }
  };

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

  /** 提交自定义模块：保存 SkillTree 结构 + 自定义模块信息 + 更新 selectedModules */
  const handleCreateCustomModule = async () => {
    const error = validateCustomForm();
    if (error) {
      Alert.alert('提示', error);
      return;
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
    const newSelected = [...selectedModules, moduleId];
    await AsyncStorage.setItem('selectedModules', JSON.stringify(newSelected));

    setToastMessage('模块创建成功');
    setTimeout(() => {
      setToastMessage('');
      router.back();
    }, 1500);
  };

  // ---- 预设模块：确认选择 ----
  const handleConfirmPreset = async () => {
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
    title: { color: colors.textPrimary, fontSize: 24, fontWeight: '800', fontFamily: 'Courier', marginBottom: 4 },
    subtitle: { color: colors.textSecondary, fontSize: 13, fontFamily: 'Courier', marginBottom: 24 },
    // 输入框通用
    input: {
      backgroundColor: colors.inputBg, borderRadius: 12, borderWidth: 1,
      borderColor: colors.inputBorder, paddingHorizontal: 16, paddingVertical: 14,
      fontSize: 16, color: colors.textPrimary, fontFamily: 'Courier', marginBottom: 16,
    },
    inputMultiline: {
      minHeight: 80, textAlignVertical: 'top',
    },
    // 分区标题
    sectionTitle: {
      color: colors.textPrimary, fontSize: 16, fontWeight: '700',
      fontFamily: 'Courier', marginBottom: 12, marginTop: 8,
    },
    sectionHint: {
      color: colors.textTertiary, fontSize: 12, fontFamily: 'Courier',
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
    stageLabel: { color: colors.primary, fontSize: 14, fontWeight: '700', fontFamily: 'Courier' },
    stageRemoveBtn: {
      width: 28, height: 28, borderRadius: 14, backgroundColor: colors.border,
      alignItems: 'center', justifyContent: 'center',
    },
    stageInput: {
      backgroundColor: colors.inputBg, borderRadius: 10, borderWidth: 1,
      borderColor: colors.inputBorder, paddingHorizontal: 14, paddingVertical: 12,
      fontSize: 15, color: colors.textPrimary, fontFamily: 'Courier', marginBottom: 14,
    },
    // 小结点区域
    nodeSection: { marginTop: 4 },
    nodeLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', fontFamily: 'Courier', marginBottom: 8 },
    nodeCard: {
      backgroundColor: colors.backgroundDark, borderRadius: 12, padding: 12,
      marginBottom: 8, position: 'relative',
    },
    nodeHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
    },
    nodeIndex: { color: colors.textTertiary, fontSize: 12, fontFamily: 'Courier' },
    nodeNameInput: {
      backgroundColor: colors.inputBg, borderRadius: 8, borderWidth: 1,
      borderColor: colors.inputBorder, paddingHorizontal: 12, paddingVertical: 10,
      fontSize: 14, color: colors.textPrimary, fontFamily: 'Courier', marginBottom: 6,
    },
    nodeUrlInput: {
      backgroundColor: colors.inputBg, borderRadius: 8, borderWidth: 1,
      borderColor: colors.inputBorder, paddingHorizontal: 12, paddingVertical: 10,
      fontSize: 13, color: colors.textPrimary, fontFamily: 'Courier', marginBottom: 6,
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
    addNodeBtnText: { color: colors.primary, fontSize: 13, fontWeight: '600', fontFamily: 'Courier' },
    addStageBtn: {
      borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.borderDark,
      borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8, marginBottom: 24,
    },
    addStageBtnText: { color: colors.primary, fontSize: 14, fontWeight: '700', fontFamily: 'Courier' },
    // 确认按钮
    confirmBtn: {
      backgroundColor: 'rgba(93,155,250,0.85)', borderRadius: 16, paddingVertical: 16,
      alignItems: 'center', marginTop: 4, marginBottom: 32,
      shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3, shadowRadius: 16, elevation: 5,
    },
    confirmBtnDisabled: { backgroundColor: '#2A2A4A', opacity: 0.5, shadowOpacity: 0 },
    confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', fontFamily: 'Courier' },
    // Toast
    toast: {
      position: 'absolute', bottom: 40, left: 20, right: 20,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      backgroundColor: 'rgba(0,0,0,0.85)', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12,
    },
    toastText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    // 预设模块卡片（复用原有设计）
    modulesContainer: { gap: 16 },
    moduleCard: { borderRadius: 24, borderWidth: 2, overflow: 'hidden' },
    moduleCardContent: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconContainer: {
      width: 56, height: 56, borderRadius: 16, alignItems: 'center',
      justifyContent: 'center', flexShrink: 0,
    },
    moduleInfo: { flex: 1 },
    moduleName: { fontSize: 18, fontWeight: '700', fontFamily: 'Courier', marginBottom: 4 },
    moduleDescription: { fontSize: 13, fontFamily: 'Courier', marginBottom: 6 },
    difficultyBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    difficultyText: { fontSize: 11, fontWeight: '600', fontFamily: 'Courier' },
    checkMark: {
      width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.3)',
      alignItems: 'center', justifyContent: 'center',
    },
    selectedCount: { textAlign: 'center', color: colors.textSecondary, fontSize: 13, fontFamily: 'Courier', marginTop: 24 },
    spacer: { flex: 1 },
    startButton: {
      paddingVertical: 16, borderRadius: 16, alignItems: 'center',
      justifyContent: 'center', marginTop: 24,
    },
    startButtonText: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', fontFamily: 'Courier' },
    // no more modules hint
    emptyHint: {
      color: colors.textSecondary, fontSize: 14, fontFamily: 'Courier',
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
    bubbleText: { color: colors.textPrimary, fontSize: 14, fontFamily: 'Courier' },
  }), [colors]);

  // ---- 渲染：预设模块选择界面 ----
  const renderPresetSelection = () => (
    <Animated.View style={[styles.modulesContainer, { opacity: fadeAnim }]}>
      {availableModules.length === 0 && isAddMode ? (
        <Text style={styles.emptyHint}>所有预设模块已添加</Text>
      ) : (
        availableModules.map((module) => {
          const isSelected = selectedModules.includes(module.id) && !existingModules.includes(module.id);
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
                    backgroundColor: isSelected ? module.color : colors.backgroundDark,
                    borderColor: module.color,
                  },
                ]}
              >
                <View style={styles.moduleCardContent}>
                  <View style={[styles.iconContainer, {
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : module.color,
                  }]}>
                    <Ionicons name={module.icon as any} size={28} color={isSelected ? '#FFFFFF' : colors.background} />
                  </View>
                  <View style={styles.moduleInfo}>
                    <Text style={[styles.moduleName, { color: isSelected ? '#FFFFFF' : colors.textPrimary }]}>
                      {module.name}
                    </Text>
                    <Text style={[styles.moduleDescription, {
                      color: isSelected ? 'rgba(255,255,255,0.9)' : colors.textSecondary,
                    }]}>
                      {module.description}
                    </Text>
                    <View style={[styles.difficultyBadge, {
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(93,155,250,0.15)',
                    }]}>
                      <Text style={[styles.difficultyText, { color: isSelected ? '#FFFFFF' : module.color }]}>
                        {module.difficulty}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <View style={styles.checkMark}>
                      <Ionicons name="checkmark" size={18} color={colors.textPrimary} />
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </Animated.View>
  );

  // ---- 渲染：自定义模块创建表单 ----
  const renderCustomForm = () => (
    <>
      {/* ===== 第一步：输入模块名称 ===== */}
      <Text style={styles.sectionTitle}>模块名称</Text>
      <TextInput
        style={styles.input}
        placeholder="输入自定义模块名称，如「Swift 开发」"
        placeholderTextColor={colors.textTertiary}
        value={customName}
        onChangeText={setCustomName}
        maxLength={20}
        returnKeyType="next"
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

      {/* ===== 第三步：创建模块结点 ===== */}
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
    <View style={styles.monsterAvatar}>
      <View style={styles.monsterHeadAvatar}>
        <View style={styles.monsterEyesAvatar}>
          <View style={styles.eyeAvatar}><View style={styles.pupilAvatar} /></View>
          <View style={styles.eyeAvatar}><View style={styles.pupilAvatar} /></View>
        </View>
        <View style={styles.mouthAvatar} />
      </View>
      <View style={styles.bodyAvatar} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
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
                {/* 预设模块选择（add 模式下也可添加预设） */}
                {availableModules.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>预设模块</Text>
                    {renderPresetSelection()}
                    {selectedModules.length > existingModules.length && (
                      <>
                        <Text style={styles.selectedCount}>
                          新选 {selectedModules.length - existingModules.length} 个预设模块
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.startButton,
                            {
                              backgroundColor: 'rgba(93,155,250,0.8)',
                              shadowColor: colors.primary,
                              shadowOffset: { width: 0, height: 8 },
                              shadowOpacity: 0.35,
                              shadowRadius: 24,
                              elevation: 5,
                              marginBottom: 16,
                            },
                          ]}
                          onPress={handleConfirmPreset}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.startButtonText}>确认添加预设模块 ✨</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    <Text style={[styles.sectionTitle, { marginTop: 8 }]}>或创建自定义模块</Text>
                  </>
                )}
                {renderCustomForm()}
              </>
            ) : (
              <>{/* 初始选择模式：只显示预设模块 */}
                <Animated.View style={{ opacity: fadeAnim }}>
                  {renderPresetSelection()}
                </Animated.View>

                <Text style={styles.selectedCount}>
                  已选择 {selectedModules.length}/3 个模块
                </Text>

                <View style={styles.spacer} />

                <TouchableOpacity
                  style={[
                    styles.startButton,
                    {
                      backgroundColor: selectedModules.length === 0 ? '#2A2A4A' : 'rgba(93,155,250,0.8)',
                      opacity: selectedModules.length === 0 ? 0.5 : 1,
                      shadowColor: selectedModules.length === 0 ? 'transparent' : colors.primary,
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: selectedModules.length === 0 ? 0 : 0.35,
                      shadowRadius: 24,
                      elevation: selectedModules.length === 0 ? 0 : 5,
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
    </SafeAreaView>
  );
};

export default ModuleSelectionScreen;