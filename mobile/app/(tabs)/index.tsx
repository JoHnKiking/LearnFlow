import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../src/contexts/ThemeContext';
import SubscriptionModal from '../../src/components/SubscriptionModal';
import { proService } from '../../src/services/api';
import { SUBSCRIPTION_STORAGE_KEY } from '../../src/utils/pricing';
import { getCurrentUser } from '../../src/utils/auth';
import { getSkillTreeByDomain } from '../../src/data/skillTrees';

interface Module {
  id: string;
  name: string;
  progress: number;
  totalNodes: number;
  completedNodes: number;
  isLocked: boolean;
  isCustom?: boolean;
}

// 自定义模块调色板 — 从品牌色系衍生（金/紫/粉/绿），暗色模式偏饱和，浅色模式偏柔和
const CUSTOM_PALETTE_DARK = [
  { color: '#C49A5C', icon: 'star' },        // 暖金
  { color: '#8B7EE0', icon: 'diamond' },     // 紫
  { color: '#D87898', icon: 'heart' },       // 粉
  { color: '#5AAD68', icon: 'leaf' },        // 绿
  { color: '#D4A060', icon: 'flame' },       // 橙金
  { color: '#7B6ED0', icon: 'flash' },       // 深紫
  { color: '#C87088', icon: 'compass' },     // 玫瑰
  { color: '#50A888', icon: 'water' },       // 青绿
  { color: '#D8B050', icon: 'sunny' },       // 亮金
  { color: '#9888E0', icon: 'sparkles' },    // 淡紫
  { color: '#C87868', icon: 'bulb' },        // 珊瑚
  { color: '#48A068', icon: 'earth' },       // 苔绿
  { color: '#B88050', icon: 'bonfire' },     // 古铜
  { color: '#A898D8', icon: 'moon' },        // 薰衣草
];
const CUSTOM_PALETTE_LIGHT = [
  { color: '#D4B898', icon: 'star' },        // 暖金
  { color: '#B8B0E8', icon: 'diamond' },     // 紫
  { color: '#E8B8C8', icon: 'heart' },       // 粉
  { color: '#A0C8A8', icon: 'leaf' },        // 绿
  { color: '#E0C0A0', icon: 'flame' },       // 橙金
  { color: '#C0B8E0', icon: 'flash' },       // 深紫
  { color: '#D8B0B8', icon: 'compass' },     // 玫瑰
  { color: '#A0C8B8', icon: 'water' },       // 青绿
  { color: '#E0D0A8', icon: 'sunny' },       // 亮金
  { color: '#C8C0E8', icon: 'sparkles' },    // 淡紫
  { color: '#D8B0A0', icon: 'bulb' },        // 珊瑚
  { color: '#A0C0A0', icon: 'earth' },       // 苔绿
  { color: '#D0B088', icon: 'bonfire' },     // 古铜
  { color: '#C8B8D8', icon: 'moon' },        // 薰衣草
];

const staticStyles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  // 背景装饰
  decorCircleTL: {
    position: 'absolute', top: -40, left: -50, width: 160, height: 160,
    borderRadius: 80, opacity: 0.5,
  },
  decorCircleBR: {
    position: 'absolute', bottom: -60, right: -40, width: 180, height: 180,
    borderRadius: 90, opacity: 0.4,
  },
  decorDot1: {
    position: 'absolute', top: 120, right: 20, width: 4, height: 4, borderRadius: 2,
  },
  decorDot2: {
    position: 'absolute', top: 280, right: 45, width: 3, height: 3, borderRadius: 1.5,
  },
  header: {
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  modulesGrid: { paddingHorizontal: 24, gap: 14 },
  moduleCard: {
    borderRadius: 20, padding: 16, position: 'relative', overflow: 'hidden',
  },
  decorationCircle: {
    position: 'absolute', top: -20, right: -10, width: 100, height: 100, borderRadius: 50,
  },
  darkGlow: {
    position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: 60,
  },
  moduleCardContent: { position: 'relative', zIndex: 1 },
  moduleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  moduleIcon: {
    width: 48, height: 48, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  moduleInfo: { flex: 1 },
  moduleProgressBar: { width: '100%', height: 8, borderRadius: 9999, overflow: 'hidden' },
  moduleProgressFill: { height: '100%', borderRadius: 9999 },
  addModuleCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 16,
    borderWidth: 2, borderStyle: 'dashed', padding: 16, gap: 16,
  },
  addModuleIcon: {
    width: 52, height: 52, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  section: { paddingHorizontal: 24, marginTop: 32 },
  tipsContainer: { gap: 12 },
  tipCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, gap: 12,
  },
  bottomPadding: { height: 32 },
});

const MapScreen = () => {
  const { isDark, colors } = useTheme();
  const [modules, setModules] = useState<Module[]>([]);
  const [showProModal, setShowProModal] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        if (user?.id) {
          const status = await proService.getStatus(user.id);
          setIsPro(status.isPro);
        }
      } catch {}
    })();
  }, []);

  // 动态样式
  const dynamicStyles = useMemo(() => ({
    container: { flex: 1, backgroundColor: colors.background },
    greeting: { fontSize: 28, fontWeight: '600' as const, color: colors.textPrimary, marginBottom: 6 },
    subtitle: { fontSize: 15, color: colors.textSecondary },
    moduleName: { fontSize: 17, fontWeight: '600' as const, color: colors.textPrimary },
    moduleCategory: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    progressBadge: {
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
      borderWidth: 1, borderColor: colors.badgeBorder, backgroundColor: colors.badgeBg,
    },
    progressBadgeText: { fontSize: 12, fontWeight: '600' as const, color: colors.badgeText },
    addModuleCard: {
      backgroundColor: colors.cardAdd, borderColor: colors.border,
      shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04, shadowRadius: 3, elevation: 2,
    },
    addModuleIcon: { backgroundColor: colors.borderLight },
    addModuleName: { fontSize: 17, fontWeight: '600' as const, color: colors.textPrimary, marginBottom: 4 },
    addModuleHint: { fontSize: 13, color: colors.textSecondary },
    sectionTitle: { fontSize: 15, fontWeight: '600' as const, color: colors.textSecondary, marginBottom: 16 },
    tipCard: {
      backgroundColor: colors.tipBg, borderWidth: 1, borderColor: colors.hairline,
      shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04, shadowRadius: 3, elevation: 2,
    },
    tipText: { fontSize: 15, color: colors.textPrimary, lineHeight: 22 },
  }), [colors]);

  const customPalette = isDark ? CUSTOM_PALETTE_DARK : CUSTOM_PALETTE_LIGHT;

  const moduleConfigs = useMemo(() => ({
    'ai-product-manager': {
      icon: 'hardware-chip' as const, color: colors.primary, cardBg: colors.cardAi,
      category: '专业技能', badgeBorder: colors.badgeBorderAi,
      progressFill: isDark ? colors.progressFillAi : colors.progressFill,
    },
    'personal-finance': {
      icon: 'trending-up' as const, color: colors.success, cardBg: colors.cardLife,
      category: '生活技能', badgeBorder: colors.badgeBorderLife,
      progressFill: isDark ? colors.progressFillLife : colors.progressFill,
    },
    'english-communication': {
      icon: 'globe' as const, color: colors.orange, cardBg: colors.cardLang,
      category: '语言学习', badgeBorder: colors.badgeBorderLang,
      progressFill: isDark ? colors.progressFillLang : colors.accentOrange,
    },
    'programming-basics': {
      icon: 'code-slash' as const, color: colors.primary, cardBg: colors.cardAi,
      category: '专业技能', badgeBorder: colors.badgeBorderAi,
      progressFill: isDark ? colors.progressFillAi : colors.progressFill,
    },
    'finance-basics': {
      icon: 'wallet' as const, color: colors.success, cardBg: colors.cardLife,
      category: '生活技能', badgeBorder: colors.badgeBorderLife,
      progressFill: isDark ? colors.progressFillLife : colors.progressFill,
    },
    'cet-exam': {
      icon: 'school' as const, color: colors.orange, cardBg: colors.cardLang,
      category: '语言学习', badgeBorder: colors.badgeBorderLang,
      progressFill: isDark ? colors.progressFillLang : colors.accentOrange,
    },
    'office-skills': {
      icon: 'desktop' as const, color: colors.success, cardBg: colors.cardLife,
      category: '暑假专区', badgeBorder: colors.badgeBorderLife,
      progressFill: isDark ? colors.progressFillLife : colors.progressFill,
    },
    'vibe-coding': {
      icon: 'code-slash' as const, color: colors.success, cardBg: colors.cardLife,
      category: '暑假专区', badgeBorder: colors.badgeBorderLife,
      progressFill: isDark ? colors.progressFillLife : colors.progressFill,
    },
    'speech-expression': {
      icon: 'mic' as const, color: colors.success, cardBg: colors.cardLife,
      category: '暑假专区', badgeBorder: colors.badgeBorderLife,
      progressFill: isDark ? colors.progressFillLife : colors.progressFill,
    },
    'video-editing': {
      icon: 'videocam' as const, color: colors.success, cardBg: colors.cardLife,
      category: '暑假专区', badgeBorder: colors.badgeBorderLife,
      progressFill: isDark ? colors.progressFillLife : colors.progressFill,
    },
  }), [colors, isDark]);

  const loadModules = useCallback(async () => {
    try {
      console.log('[Map] 开始加载地图数据, isDark=', isDark);
      const selectedModules = await AsyncStorage.getItem('selectedModules');
      const customModulesStr = await AsyncStorage.getItem('customModules');
      const customModules: Record<string, { name: string }> = customModulesStr ? JSON.parse(customModulesStr) : {};

      const presetNames: Record<string, string> = {
        'ai-product-manager': 'AI产品经理',
        'personal-finance': '个人理财',
        'english-communication': '英语沟通',
        'programming-basics': '编程基础',
        'finance-basics': '理财入门',
        'cet-exam': '四六级过关',
        'office-skills': '基础办公技能',
        'vibe-coding': 'Vibe Coding 启蒙',
        'speech-expression': '演讲表达',
        'video-editing': '视频剪辑',
        'advanced-math': '高等数学',
        'college-cs': '大学生计算机基础',
        'linear-algebra': '线性代数',
      };

      if (selectedModules) {
        const selected = JSON.parse(selectedModules) as string[];
        const loadedModules = await Promise.all(selected.map(async (id) => {
          if (presetNames[id]) {
            // 从 skill tree 获取真实节点数
            const tree = getSkillTreeByDomain(id);
            const totalNodes = tree ? tree.stages.reduce((sum, s) => sum + s.nodes.length, 0) : 9;
            // 从本地进度获取完成数
            let completedNodes = 0;
            try {
              const progressStr = await AsyncStorage.getItem(`nodeProgresses_${id}`);
              if (progressStr) {
                const progresses = JSON.parse(progressStr) as Record<string, string>;
                completedNodes = Object.values(progresses).filter(s => s === 'done').length;
              }
            } catch {}
            const progress = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
            return { id, name: presetNames[id], progress, totalNodes, completedNodes, isLocked: false };
          }
          const custom = customModules[id];
          if (custom) {
            // 自定义模块：从 customNodes 数量获取 totalNodes
            let totalNodes = 0;
            let completedNodes = 0;
            try {
              const nodesStr = await AsyncStorage.getItem(`customNodes_${id}`);
              if (nodesStr) {
                const nodes = JSON.parse(nodesStr) as any[];
                totalNodes = nodes.length;
              }
              const progressStr = await AsyncStorage.getItem(`nodeProgresses_${id}`);
              if (progressStr) {
                const progresses = JSON.parse(progressStr) as Record<string, string>;
                completedNodes = Object.values(progresses).filter(s => s === 'done').length;
              }
            } catch {}
            const progress = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
            return { id, name: custom.name, progress, totalNodes, completedNodes, isLocked: false, isCustom: true };
          }
          return null;
        }));
        const validModules = loadedModules.filter(Boolean) as Module[];
        // 尊重用户意图：selectedModules 存在时始终使用它，哪怕为空
        console.log('[Map] 加载模块:', validModules.map(m => `${m.name}(${m.progress}%)`));
        setModules(validModules);
        return;
      }
      console.log('[Map] 使用默认模块');
      setModules([{ id: 'ai-product-manager', name: 'AI产品经理', progress: 0, totalNodes: 9, completedNodes: 0, isLocked: false }]);
    } catch (error) {
      console.error('[Map] 加载数据失败:', error);
      setModules([{ id: 'ai-product-manager', name: 'AI产品经理', progress: 0, totalNodes: 9, completedNodes: 0, isLocked: false }]);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadModules(); }, [loadModules]));

  const handleModulePress = (moduleId: string) => {
    console.log('[Map] 点击模块:', moduleId);
    router.push({ pathname: '/skill-tree', params: { domain: moduleId } });
  };

  const handleModuleLongPress = async (moduleId: string, moduleName: string) => {
    Alert.alert(
      '删除模块',
      `确定要删除「${moduleName}」吗？\n学习进度将被清除。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除', style: 'destructive',
          onPress: async () => {
            const stored = await AsyncStorage.getItem('selectedModules');
            if (stored) {
              const selected = JSON.parse(stored) as string[];
              const updated = selected.filter((id: string) => id !== moduleId);
              await AsyncStorage.setItem('selectedModules', JSON.stringify(updated));
            }
            const cm = await AsyncStorage.getItem('customModules');
            if (cm) {
              const parsed = JSON.parse(cm);
              delete parsed[moduleId];
              await AsyncStorage.setItem('customModules', JSON.stringify(parsed));
            }
            await AsyncStorage.multiRemove([`customStages_${moduleId}`, `customNodes_${moduleId}`]);
            // 清理节点进度和奖励标记
            await AsyncStorage.multiRemove([
              `nodeProgresses_${moduleId}`,
              `moduleRewarded_${moduleId}`,
            ]);
            try {
              const { domainService } = await import('../../src/services/api');
              await domainService.deleteDomain(moduleId);
            } catch (e) {
              console.warn('[Map] 删除服务端领域失败:', e);
            }
            setModules(prev => prev.filter(m => m.id !== moduleId));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[staticStyles.safeArea, dynamicStyles.container]} edges={['top']}>
      {/* 背景装饰 */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <View style={[staticStyles.decorCircleTL, { backgroundColor: colors.decorCircle }]} />
        <View style={[staticStyles.decorCircleBR, { backgroundColor: colors.decorCircle }]} />
        <View style={[staticStyles.decorDot1, { backgroundColor: colors.brandPurple, opacity: 0.5 }]} />
        <View style={[staticStyles.decorDot2, { backgroundColor: colors.brandPink, opacity: 0.4 }]} />
      </View>
      <ScrollView contentContainerStyle={staticStyles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 顶部标题栏 */}
        <View style={staticStyles.header}>
          <View>
            <Text style={dynamicStyles.greeting}>学习地图</Text>
            <Text style={dynamicStyles.subtitle}>选择一个模块开始学习</Text>
          </View>
          <TouchableOpacity
            onPress={() => { if (!isPro) setShowProModal(true); }}
            activeOpacity={isPro ? 1 : 0.7}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 4,
              paddingHorizontal: 10, paddingVertical: 6,
              backgroundColor: isPro ? colors.pro : colors.proBg,
              borderWidth: 1.5, borderColor: colors.proBorder,
              borderRadius: 2,
            }}
          >
            <Ionicons name="diamond" size={14} color={isPro ? colors.onPrimary : colors.pro} />
            <Text style={{ fontSize: 11, fontWeight: '700' as const, color: isPro ? colors.onPrimary : colors.pro, fontFamily: 'Courier' }}>{isPro ? 'PRO' : 'Pro'}</Text>
          </TouchableOpacity>
        </View>

        {/* 模块列表 */}
        <View style={staticStyles.modulesGrid}>
          {modules.map((module, index) => {
            const config = moduleConfigs[module.id];
            const paletteItem = customPalette[index % customPalette.length];
            const icon = config?.icon ?? paletteItem.icon;
            const color = config?.color ?? paletteItem.color;
            const cardBg = config?.cardBg ?? colors.card;
            const category = config?.category ?? '';
            return (
              <TouchableOpacity
                key={module.id}
                style={[
                  staticStyles.moduleCard,
                  { backgroundColor: cardBg },
                  { borderWidth: 1, borderColor: colors.hairline },
                  { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
                ]}
                onPress={() => handleModulePress(module.id)}
                onLongPress={() => handleModuleLongPress(module.id, module.name)}
                activeOpacity={0.8}
              >
                {isDark && <View style={[staticStyles.darkGlow, { backgroundColor: color + '10' }]} />}
                {!isDark && <View style={[staticStyles.decorationCircle, { backgroundColor: color + '14' }]} />}
                <View style={staticStyles.moduleCardContent}>
                  <View style={staticStyles.moduleRow}>
                    <View style={[staticStyles.moduleIcon, { backgroundColor: color, borderWidth: 0, borderRadius: 10 }]}>
                      <Ionicons name={icon as any} size={22} color={colors.onPrimary} />
                    </View>
                    <View style={staticStyles.moduleInfo}>
                      <Text style={dynamicStyles.moduleName}>{module.name}</Text>
                      {category ? <Text style={dynamicStyles.moduleCategory}>{category}</Text> : null}
                    </View>
                    <View style={[dynamicStyles.progressBadge, { borderColor: config?.badgeBorder ?? colors.badgeBorder }]}>
                      <Text style={dynamicStyles.progressBadgeText}>{module.progress}%</Text>
                    </View>
                  </View>
                  <View style={[staticStyles.moduleProgressBar, { backgroundColor: colors.progressTrack }]}>
                    <View style={[staticStyles.moduleProgressFill, { width: `${module.progress}%`, backgroundColor: config?.progressFill ?? colors.progressFill }]} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* 添加模块 */}
          <TouchableOpacity
            style={[staticStyles.addModuleCard, dynamicStyles.addModuleCard]}
            onPress={() => router.push('/module-selection?mode=add')}
            activeOpacity={0.8}
          >
            <View style={[staticStyles.addModuleIcon, dynamicStyles.addModuleIcon]}>
              <Ionicons name="add" size={28} color={colors.textSecondary} />
            </View>
            <View style={staticStyles.moduleInfo}>
              <Text style={dynamicStyles.addModuleName}>添加模块</Text>
              <Text style={dynamicStyles.addModuleHint}>选择预设模块或创建自定义领域</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* 学习提示 */}
        <View style={staticStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>学习提示</Text>
          <View style={staticStyles.tipsContainer}>
            {[
              { icon: 'checkmark-circle' as const, color: colors.accentGreen, text: '完成学习任务获取额外能量' },
              { icon: 'flash' as const, color: colors.accentOrange, text: '消耗体力跳转学习资源' },
              { icon: 'trash-outline' as const, color: colors.textTertiary, text: '长按模块卡片可删除' },
            ].map((tip, i) => (
              <TouchableOpacity key={i} style={[staticStyles.tipCard, dynamicStyles.tipCard]} activeOpacity={0.8}>
                <Ionicons name={tip.icon} size={18} color={tip.color} />
                <Text style={dynamicStyles.tipText}>{tip.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={staticStyles.bottomPadding} />
      </ScrollView>

      <SubscriptionModal visible={showProModal} onClose={() => setShowProModal(false)} onProActivated={() => setIsPro(true)} />
    </SafeAreaView>
  );
};

export default MapScreen;
