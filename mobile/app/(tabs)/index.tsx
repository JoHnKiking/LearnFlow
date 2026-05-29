import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
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

const CUSTOM_ICONS = ['school', 'bulb', 'star', 'flame', 'compass'];

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
  modulesGrid: {
    paddingHorizontal: 24,
    gap: 16,
  },
  moduleCard: {
    borderRadius: 20,
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
    borderRadius: 14,
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
    marginTop: 32,
  },
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
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
      borderRadius: 20,
    },
    progressBadgeText: {
      fontSize: 12,
      fontWeight: '700' as const,
      fontFamily: 'Courier',
    },
    moduleProgressBar: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
    },
    addModuleCard: {
      backgroundColor: colors.card,
      borderColor: colors.borderDark,
    },
    addModuleIcon: {
      backgroundColor: colors.borderDark,
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
    },
    tipText: {
      fontSize: 14,
      color: colors.textPrimary,
      fontFamily: 'Courier',
    },
  }), [colors, isDark]);

  const CUSTOM_COLORS = useMemo(() => [
    colors.orange, colors.purple, colors.success, colors.error, colors.warning,
  ], [colors]);

  const moduleConfigs = useMemo(() => ({
    'ai-product-manager': {
      icon: 'hardware-chip' as const,
      color: colors.primary,
      cardBg: isDark ? 'rgba(100,100,180,0.10)' : '#EAE8F6',
      category: '专业技能',
    },
    'personal-finance': {
      icon: 'trending-up' as const,
      color: colors.success,
      cardBg: isDark ? 'rgba(80,150,100,0.08)' : '#E8F0E4',
      category: '生活技能',
    },
    'english-communication': {
      icon: 'globe' as const,
      color: colors.orange,
      cardBg: isDark ? 'rgba(180,130,80,0.08)' : '#F8ECE0',
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

  const handleModuleLongPress = (moduleId: string, moduleName: string) => {
    Alert.alert(
      '删除模块',
      `确定要删除「${moduleName}」吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const stored = await AsyncStorage.getItem('selectedModules');
            if (stored) {
              const selected = JSON.parse(stored) as string[];
              const updated = selected.filter((id: string) => id !== moduleId);
              await AsyncStorage.setItem('selectedModules', JSON.stringify(updated));
              setModules(prev => prev.filter(m => m.id !== moduleId));
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[staticStyles.container, dynamicStyles.container]} edges={['top']}>
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
            const config = moduleConfigs[module.id];
            const icon = config?.icon ?? CUSTOM_ICONS[index % CUSTOM_ICONS.length];
            const color = config?.color ?? CUSTOM_COLORS[index % CUSTOM_COLORS.length];
            const cardBg = config?.cardBg ?? colors.card;
            const category = config?.category ?? '';

            return (
            <TouchableOpacity
              key={`${module.id}-${isDark ? 'd' : 'l'}`}
              style={[
                staticStyles.moduleCard,
                { backgroundColor: cardBg },
                isDark && { borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.06)' },
              ]}
              onPress={() => handleModulePress(module.id)}
              onLongPress={() => handleModuleLongPress(module.id, module.name)}
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
                      { backgroundColor: color },
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
