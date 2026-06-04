import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../src/contexts/ThemeContext';

interface Module {
  id: string;
  name: string;
  progress: number;
  totalNodes: number;
  completedNodes: number;
  isLocked: boolean;
  isCustom?: boolean;
}

// 自定义模块调色板 — 深色/浅色各一套，(颜色, 图标) 配对
const CUSTOM_PALETTE_DARK = [
  { color: '#D05858', icon: 'flame' },       // 0 红
  { color: '#D4A058', icon: 'sunny' },       // 1 琥珀
  { color: '#4EA8B8', icon: 'water' },       // 2 青
  { color: '#6B6BD4', icon: 'flash' },       // 3 靛蓝
  { color: '#E07860', icon: 'bulb' },        // 4 珊瑚
  { color: '#88B848', icon: 'leaf' },        // 5 黄绿
  { color: '#9B6BC8', icon: 'diamond' },     // 6 紫罗兰
  { color: '#58A8B0', icon: 'earth' },       // 7 蓝绿
  { color: '#C87090', icon: 'heart' },       // 8 玫瑰
  { color: '#78A8D0', icon: 'compass' },     // 9 天蓝
  { color: '#B8A048', icon: 'star' },        // 10 金
  { color: '#D078D0', icon: 'sparkles' },    // 11 品红
  { color: '#68B068', icon: 'leaf' },        // 12 翠绿
  { color: '#C86848', icon: 'bonfire' },     // 13 橙棕
];
const CUSTOM_PALETTE_LIGHT = [
  { color: '#C45A5A', icon: 'flame' },       // 0
  { color: '#C49A60', icon: 'sunny' },       // 1
  { color: '#4A90A0', icon: 'water' },       // 2
  { color: '#5A5AB8', icon: 'flash' },       // 3
  { color: '#D46850', icon: 'bulb' },        // 4
  { color: '#7AA838', icon: 'leaf' },        // 5
  { color: '#8C5CB0', icon: 'diamond' },     // 6
  { color: '#4898A0', icon: 'earth' },       // 7
  { color: '#B86080', icon: 'heart' },       // 8
  { color: '#6898C0', icon: 'compass' },     // 9
  { color: '#A89038', icon: 'star' },        // 10
  { color: '#C068C0', icon: 'sparkles' },    // 11
  { color: '#58A058', icon: 'leaf' },        // 12
  { color: '#B85838', icon: 'bonfire' },     // 13
];

// 静态样式 — 不随主题变化的布局属性
const staticStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  planetDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  planet1: {
    position: 'absolute',
    top: -10,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    opacity: 0.15,
  },
  planet2: {
    position: 'absolute',
    top: 30,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  planet3: {
    position: 'absolute',
    top: 70,
    right: -15,
    width: 65,
    height: 65,
    borderRadius: 32,
  },
  planetRing: {
    position: 'absolute',
    top: 45,
    right: 20,
    width: 90,
    height: 32,
    borderWidth: 3,
    borderRadius: 45,
    transform: [{ rotate: '-20deg' }],
  },
  star1: {
    position: 'absolute',
    top: 80,
    left: 30,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  star2: {
    position: 'absolute',
    top: 320,
    left: 70,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  star3: {
    position: 'absolute',
    top: 550,
    left: 20,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  // 像素点（远离标题区域，散布在卡片区域）
  pixel3: {
    position: 'absolute', top: 280, left: 100, width: 5, height: 5, borderRadius: 1,
  },
  pixel4: {
    position: 'absolute', top: 380, left: 40, width: 3, height: 3, borderRadius: 1,
  },
  pixel5: {
    position: 'absolute', top: 520, left: 60, width: 4, height: 4, borderRadius: 1,
  },
  pixel7: {
    position: 'absolute', top: 220, right: 140, width: 5, height: 5, borderRadius: 1,
  },
  pixel8: {
    position: 'absolute', top: 340, right: 70, width: 4, height: 4, borderRadius: 1,
  },
  pixel9: {
    position: 'absolute', top: 460, right: 120, width: 3, height: 3, borderRadius: 1,
  },
  pixel10: {
    position: 'absolute', top: 600, left: 100, width: 5, height: 5, borderRadius: 1,
  },
  pixel12: {
    position: 'absolute', top: 420, right: 30, width: 6, height: 6, borderRadius: 2,
  },
  modulesGrid: {
    paddingHorizontal: 24,
    gap: 16,
  },
  moduleCard: {
    borderRadius: 12,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  decorationCircle: {
    position: 'absolute',
    top: -20,
    right: -10,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  darkGlow: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  moduleCardContent: {
    position: 'relative',
    zIndex: 1,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  moduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleProgressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  moduleProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  addModuleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: 16,
    gap: 16,
  },
  addModuleIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 40,
  },
  tipsContainer: {
    gap: 16,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 14,
    gap: 12,
  },
  bottomPadding: {
    height: 32,
  },
});

const MapScreen = () => {
  const { isDark, colors } = useTheme();
  const [modules, setModules] = useState<Module[]>([]);

  // 动态样式 — 随主题变化的属性（普通对象，不使用 StyleSheet.create）
  const dynamicStyles = useMemo(() => ({
    container: {
      backgroundColor: colors.background,
    },
    greeting: {
      fontSize: 28,
      fontWeight: '800' as const,
      color: colors.textPrimary,
      fontFamily: 'Courier',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Courier',
    },
    moduleName: {
      fontSize: 16,
      fontWeight: '700' as const,
      color: colors.textPrimary,
      fontFamily: 'Courier',
    },
    moduleCategory: {
      fontSize: 11,
      color: colors.textSecondary,
      fontFamily: 'Courier',
      marginTop: 2,
    },
    progressBadge: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    progressBadgeText: {
      fontSize: 12,
      fontWeight: '700' as const,
      fontFamily: 'Courier',
    },
    moduleProgressBar: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
      height: 8,
    },
    addModuleCard: {
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    addModuleIcon: {
      backgroundColor: colors.primary + '20',
      borderRadius: 8,
    },
    addModuleName: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.primary,
      fontFamily: 'Courier',
      marginBottom: 4,
    },
    addModuleHint: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Courier',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.textPrimary,
      fontFamily: 'Courier',
      marginBottom: 16,
    },
    tipCard: {
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.border,
    },
    tipText: {
      fontSize: 14,
      color: colors.textPrimary,
      fontFamily: 'Courier',
    },
  }), [colors, isDark]);

  // 根据当前主题选择自定义模块调色板
  const customPalette = isDark ? CUSTOM_PALETTE_DARK : CUSTOM_PALETTE_LIGHT;

  const moduleConfigs = useMemo(() => ({
    'ai-product-manager': {
      icon: 'hardware-chip' as const,
      color: colors.primary,
      cardBg: isDark ? 'rgba(100,100,180,0.10)' : 'rgba(234,232,246,0.50)',
      category: '专业技能',
    },
    'personal-finance': {
      icon: 'trending-up' as const,
      color: colors.success,
      cardBg: isDark ? 'rgba(80,150,100,0.08)' : 'rgba(232,240,228,0.50)',
      category: '生活技能',
    },
    'english-communication': {
      icon: 'globe' as const,
      color: colors.orange,
      cardBg: isDark ? 'rgba(180,130,80,0.08)' : 'rgba(248,236,224,0.50)',
      category: '语言学习',
    },
    'programming-basics': {
      icon: 'code-slash' as const,
      color: colors.primary,
      cardBg: isDark ? 'rgba(123,117,216,0.10)' : 'rgba(90,84,160,0.12)',
      category: '专业技能',
    },
    'finance-basics': {
      icon: 'wallet' as const,
      color: colors.success,
      cardBg: isDark ? 'rgba(74,152,64,0.08)' : 'rgba(90,128,64,0.12)',
      category: '生活技能',
    },
    'cet-exam': {
      icon: 'school' as const,
      color: colors.orange,
      cardBg: isDark ? 'rgba(212,160,88,0.08)' : 'rgba(196,154,96,0.12)',
      category: '语言学习',
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
      };

      if (selectedModules) {
        const selected = JSON.parse(selectedModules) as string[];
        const loadedModules = selected.map((id) => {
          if (presetNames[id]) {
            return { id, name: presetNames[id], progress: 0, totalNodes: 9, completedNodes: 0, isLocked: false };
          }
          const custom = customModules[id];
          if (custom) {
            return {
              id,
              name: custom.name,
              progress: 0,
              totalNodes: 9,
              completedNodes: 0,
              isLocked: false,
              isCustom: true,
            };
          }
          return null;
        }).filter(Boolean) as Module[];
        if (loadedModules.length > 0) {
          console.log('[Map] 加载模块:', loadedModules.map(m => m.name));
          setModules(loadedModules);
          return;
        }
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
    // 预设模块不允许删除
    const presetModules = ['ai-product-manager', 'personal-finance', 'english-communication'];
    if (presetModules.includes(moduleId)) {
      Alert.alert('提示', '预设模块不可删除');
      return;
    }
    // 从 AsyncStorage 移除
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
    try {
      const { domainService } = await import('../../src/services/api');
      await domainService.deleteDomain(moduleId);
    } catch (e) {
      console.warn('[Map] 删除服务端领域失败:', e);
    }
    setModules(prev => prev.filter(m => m.id !== moduleId));
  };

  // 左滑删除组件
  const SwipeableRow = ({ children, moduleName, moduleId }: { children: React.ReactNode; moduleName: string; moduleId: string }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const panResponder = useRef(PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderMove: (_, gs) => { if (gs.dx < 0) translateX.setValue(Math.max(gs.dx, -80)); },
      onPanResponderRelease: (_, gs) => {
        Animated.spring(translateX, { toValue: gs.dx < -40 ? -80 : 0, useNativeDriver: true }).start();
      },
    })).current;

    const handleSwipeDelete = () => {
      Alert.alert('删除模块', `确定要删除「${moduleName}」吗？`, [
        { text: '取消', style: 'cancel', onPress: () => Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start() },
        { text: '删除', style: 'destructive', onPress: () => handleModuleLongPress(moduleId, moduleName) },
      ]);
    };

    return (
      <View style={{ position: 'relative', borderRadius: 20, marginBottom: 12, backgroundColor: colors.backgroundLight }}>
        {/* 红色删除按钮 —— 仅在卡片左滑后可见 */}
        <TouchableOpacity
          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', borderTopRightRadius: 20, borderBottomRightRadius: 20 }}
          onPress={handleSwipeDelete}
        >
          <Ionicons name="trash" size={24} color="#fff" />
        </TouchableOpacity>
        {/* 卡片内容 —— 覆盖在删除按钮上方，左滑时移开露出按钮 */}
        <Animated.View style={{ zIndex: 1, elevation: 1, transform: [{ translateX }], backgroundColor: colors.backgroundLight, borderRadius: 20, overflow: 'hidden' }} {...panResponder.panHandlers}>
          {children}
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[staticStyles.container, dynamicStyles.container]} edges={['top']}>
      {/* 星球装饰背景 */}
      <View style={staticStyles.planetDecorations} pointerEvents="none">
        <View style={[staticStyles.planet1, { borderColor: colors.primary }]} />
        <View style={[staticStyles.planet2, { backgroundColor: colors.warning + '20' }]} />
        <View style={[staticStyles.planet3, { backgroundColor: colors.success + '15' }]} />
        <View style={[staticStyles.planetRing, { borderColor: colors.primary + '30' }]} />
        <View style={[staticStyles.star1, { backgroundColor: colors.primary }]} />
        <View style={[staticStyles.star2, { backgroundColor: colors.warning }]} />
        <View style={[staticStyles.star3, { backgroundColor: colors.success }]} />
        {/* 像素点——远离标题，散布在卡片区域 */}
        <View style={[staticStyles.pixel3, { backgroundColor: '#4ADE80' }]} />
        <View style={[staticStyles.pixel4, { backgroundColor: '#FF6B6B' }]} />
        <View style={[staticStyles.pixel5, { backgroundColor: '#60A5FA' }]} />
        <View style={[staticStyles.pixel7, { backgroundColor: '#F472B6' }]} />
        <View style={[staticStyles.pixel8, { backgroundColor: '#34D399' }]} />
        <View style={[staticStyles.pixel9, { backgroundColor: '#FBBF24' }]} />
        <View style={[staticStyles.pixel10, { backgroundColor: '#818CF8' }]} />
        <View style={[staticStyles.pixel12, { backgroundColor: '#60A5FA' }]} />
      </View>
      <ScrollView
        contentContainerStyle={staticStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={staticStyles.header}>
          <View>
            <Text style={dynamicStyles.greeting}>学习地图</Text>
            <Text style={dynamicStyles.subtitle}>选择一个模块开始学习</Text>
          </View>
        </View>

        <View style={staticStyles.modulesGrid}>
          {modules.map((module, index) => {
            // 实时从 moduleConfigs 派生展示属性，不经过任何中间状态
            const config = moduleConfigs[module.id as keyof typeof moduleConfigs];
            const paletteEntry = customPalette[index % customPalette.length];
            const icon = config?.icon ?? paletteEntry.icon;
            const color = config?.color ?? paletteEntry.color;
            // 预设模块用配置的背景色，自定义模块根据图标颜色生成对应淡色背景
            const cardBg = config?.cardBg ?? (isDark ? color + '10' : color + '14');
            const category = config?.category ?? '';

            return (
            <SwipeableRow key={`${module.id}-${isDark ? 'd' : 'l'}`} moduleName={module.name} moduleId={module.id}>
            <TouchableOpacity
              style={[
                staticStyles.moduleCard,
                { backgroundColor: cardBg },
                isDark && { borderWidth: 2, borderColor: colors.primary + '40' },
                !isDark && { borderWidth: 2, borderColor: colors.border },
              ]}
              onPress={() => handleModulePress(module.id)}
              activeOpacity={0.8}
            >
              {isDark && (
                <View style={[staticStyles.darkGlow, { backgroundColor: color + '10' }]} />
              )}
              {!isDark && (
                <View style={[staticStyles.decorationCircle, { backgroundColor: color + '14' }]} />
              )}
              <View style={staticStyles.moduleCardContent}>
                <View style={staticStyles.moduleRow}>
                  <View
                    style={[
                      staticStyles.moduleIcon,
                      { backgroundColor: color, borderWidth: 2, borderColor: colors.textInverse + '20' },
                      isDark && { shadowColor: color, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
                    ]}
                  >
                    <Ionicons name={icon as any} size={22} color="#FFFFFF" />
                  </View>
                  <View style={staticStyles.moduleInfo}>
                    <Text style={dynamicStyles.moduleName}>{module.name}</Text>
                    {category ? (
                      <Text style={dynamicStyles.moduleCategory}>{category}</Text>
                    ) : null}
                  </View>
                  <View style={[dynamicStyles.progressBadge, { backgroundColor: color + '26' }]}>
                    <Text style={[dynamicStyles.progressBadgeText, { color }]}>
                      {module.progress}%
                    </Text>
                  </View>
                </View>
                <View style={[staticStyles.moduleProgressBar, dynamicStyles.moduleProgressBar]}>
                  <View
                    style={[
                      staticStyles.moduleProgressFill,
                      { width: `${module.progress}%`, backgroundColor: color },
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>
            </SwipeableRow>
            );
          })}

          <TouchableOpacity
            style={[staticStyles.addModuleCard, dynamicStyles.addModuleCard]}
            onPress={() => router.push('/module-selection?mode=add')}
            activeOpacity={0.8}
          >
            <View style={[staticStyles.addModuleIcon, dynamicStyles.addModuleIcon]}>
              <Ionicons name="add" size={28} color={colors.primary} />
            </View>
            <View style={staticStyles.moduleInfo}>
              <Text style={dynamicStyles.addModuleName}>添加模块</Text>
              <Text style={dynamicStyles.addModuleHint}>选择预设模块或创建自定义领域</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={staticStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>学习提示</Text>
          <View style={staticStyles.tipsContainer}>
            <View style={[staticStyles.tipCard, dynamicStyles.tipCard]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.error} />
              <Text style={dynamicStyles.tipText}>完成每个节点的学习任务</Text>
            </View>
            <View style={[staticStyles.tipCard, dynamicStyles.tipCard]}>
              <Ionicons name="flash" size={18} color={colors.warning} />
              <Text style={dynamicStyles.tipText}>消耗体力获取知识能量</Text>
            </View>
            <View style={[staticStyles.tipCard, dynamicStyles.tipCard]}>
              <Ionicons name="rocket" size={18} color={colors.textSecondary} />
              <Text style={dynamicStyles.tipText}>玩游戏恢复体力</Text>
            </View>
          </View>
        </View>

        <View style={staticStyles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MapScreen;
