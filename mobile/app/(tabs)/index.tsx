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

const MapScreen = () => {
  const { isDark, colors } = useTheme();
  const [modules, setModules] = useState<Module[]>([]);

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
      console.log('[Map] 开始加载地图数据');
      const selectedModules = await AsyncStorage.getItem('selectedModules');
      const customModulesStr = await AsyncStorage.getItem('customModules');
      const customModules: Record<string, { name: string }> = customModulesStr ? JSON.parse(customModulesStr) : {};

      if (selectedModules) {
        const selected = JSON.parse(selectedModules) as string[];
        const loadedModules = selected.map((id) => {
          const config = moduleConfigs[id];
          if (config) {
            // 预设模块：name 从内置映射获取
            const presetNames: Record<string, string> = {
              'ai-product-manager': 'AI产品经理',
              'personal-finance': '个人理财',
              'english-communication': '英语沟通',
            };
            return { id, name: presetNames[id] ?? id, progress: 0, totalNodes: 9, completedNodes: 0, isLocked: false };
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

  const styles = useMemo(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    fontFamily: 'Courier',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Courier',
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
  moduleName: {
    fontSize: 16,
    fontWeight: '700',
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
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  moduleProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
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
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.borderDark,
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
    backgroundColor: colors.borderDark,
    flexShrink: 0,
  },
  addModuleName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'Courier',
    marginBottom: 4,
  },
  addModuleHint: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Courier',
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'Courier',
    marginBottom: 16,
  },
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: 'Courier',
  },
  bottomPadding: {
    height: 32,
  },
}), [colors, isDark]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>学习地图</Text>
            <Text style={styles.subtitle}>选择一个模块开始学习</Text>
          </View>
        </View>

        <View style={styles.modulesGrid}>
          {modules.map((module, index) => {
            // 从 moduleConfigs 实时派生展示属性（不依赖任何中间状态）
            // 每次渲染都使用当前的 moduleConfigs，确保主题切换后立即生效
            const config = moduleConfigs[module.id];
            const icon = config?.icon ?? CUSTOM_ICONS[index % CUSTOM_ICONS.length];
            const color = config?.color ?? CUSTOM_COLORS[index % CUSTOM_COLORS.length];
            const cardBg = config?.cardBg ?? colors.card;
            const category = config?.category ?? '';
            return (
            <TouchableOpacity
              key={module.id}
              style={[styles.moduleCard, { backgroundColor: cardBg }, isDark && { borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.06)' }]}
              onPress={() => handleModulePress(module.id)}
              onLongPress={() => handleModuleLongPress(module.id, module.name)}
              activeOpacity={0.8}
            >
              {/* 装饰光晕（深色模式） */}
              {isDark && <View style={[styles.darkGlow, { backgroundColor: color + '10' }]} />}
              {/* 装饰圆（浅色模式） */}
              {!isDark && <View style={[styles.decorationCircle, { backgroundColor: color + '14' }]} />}
              {/* 内容 */}
              <View style={styles.moduleCardContent}>
                <View style={styles.moduleRow}>
                  <View style={[styles.moduleIcon, { backgroundColor: color }, isDark && { shadowColor: color, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 }]}>
                    <Ionicons name={icon as any} size={22} color="#FFFFFF" />
                  </View>
                  <View style={styles.moduleInfo}>
                    <Text style={styles.moduleName}>{module.name}</Text>
                    {category ? <Text style={styles.moduleCategory}>{category}</Text> : null}
                  </View>
                  <View style={[styles.progressBadge, { backgroundColor: color + '26' }]}>
                    <Text style={[styles.progressBadgeText, { color }]}>{module.progress}%</Text>
                  </View>
                </View>
                <View style={styles.moduleProgressBar}>
                  <View style={[styles.moduleProgressFill, { width: `${module.progress}%`, backgroundColor: color }]} />
                </View>
              </View>
            </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.addModuleCard}
            onPress={() => router.push('/module-selection?mode=add')}
            activeOpacity={0.8}
          >
            <View style={styles.addModuleIcon}>
              <Ionicons name="add" size={28} color={colors.primary} />
            </View>
            <View style={styles.moduleInfo}>
              <Text style={styles.addModuleName}>添加模块</Text>
              <Text style={styles.addModuleHint}>选择预设模块或创建自定义领域</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>学习提示</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipCard}>
              <Ionicons name="checkmark-circle" size={18} color={colors.error} />
              <Text style={styles.tipText}>完成每个节点的学习任务</Text>
            </View>
            <View style={styles.tipCard}>
              <Ionicons name="flash" size={18} color={colors.warning} />
              <Text style={styles.tipText}>消耗体力获取知识能量</Text>
            </View>
            <View style={styles.tipCard}>
              <Ionicons name="rocket" size={18} color={colors.textSecondary} />
              <Text style={styles.tipText}>玩游戏恢复体力</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );


};

export default MapScreen;
