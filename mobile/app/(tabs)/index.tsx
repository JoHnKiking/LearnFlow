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
  icon: string;
  color: string;
  progress: number;
  totalNodes: number;
  completedNodes: number;
  isLocked: boolean;
}

const CUSTOM_COLORS = ['#FF7D00', '#9B59B6', '#1ABC9C', '#E74C3C', '#F39C12'];
const CUSTOM_ICONS = ['school', 'bulb', 'star', 'flame', 'compass'];

const moduleConfigs: Record<string, Omit<Module, 'isLocked'>> = {
  'ai-product-manager': {
    id: 'ai-product-manager',
    name: 'AI产品经理',
    icon: 'hardware-chip',
    color: '#5D9BFA',
    progress: 0,
    totalNodes: 9,
    completedNodes: 0,
  },
  'personal-finance': {
    id: 'personal-finance',
    name: '个人理财',
    icon: 'trending-up',
    color: '#3AE374',
    progress: 0,
    totalNodes: 9,
    completedNodes: 0,
  },
  'english-communication': {
    id: 'english-communication',
    name: '英语沟通',
    icon: 'globe',
    color: '#FF7D00',
    progress: 0,
    totalNodes: 9,
    completedNodes: 0,
  },
};

const MapScreen = () => {
  const { colors } = useTheme();
  const [modules, setModules] = useState<Module[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          console.log('[Map] 开始加载地图数据');

          const selectedModules = await AsyncStorage.getItem('selectedModules');
          const customModulesStr = await AsyncStorage.getItem('customModules');
          const customModules: Record<string, { name: string }> = customModulesStr ? JSON.parse(customModulesStr) : {};

          if (selectedModules) {
            const selected = JSON.parse(selectedModules) as string[];
            const loadedModules = selected.map((id, index) => {
              const config = moduleConfigs[id];
              if (config) {
                return { ...config, isLocked: false };
              }
              const custom = customModules[id];
              if (custom) {
                return {
                  id,
                  name: custom.name,
                  icon: CUSTOM_ICONS[index % CUSTOM_ICONS.length],
                  color: CUSTOM_COLORS[index % CUSTOM_COLORS.length],
                  progress: 0,
                  totalNodes: 9,
                  completedNodes: 0,
                  isLocked: false,
                };
              }
              return null;
            }).filter(Boolean) as Module[];
            if (loadedModules.length > 0) {
              console.log('[Map] 加载模块:', loadedModules.map(m => m.name));
              setModules(loadedModules);
            } else {
              setModules([{ ...moduleConfigs['ai-product-manager'], isLocked: false }]);
            }
          } else {
            console.log('[Map] 无已选模块，使用默认模块');
            setModules([{ ...moduleConfigs['ai-product-manager'], isLocked: false }]);
          }
        } catch (error) {
          console.error('[Map] 加载数据失败:', error);
          setModules([{ ...moduleConfigs['ai-product-manager'], isLocked: false }]);
        }
      };

      loadData();
    }, [])
  );

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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    gap: 16,
  },
  moduleIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'Courier',
    marginBottom: 8,
  },
  moduleProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  moduleProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  moduleProgressText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Courier',
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
  tipIcon: {
    fontSize: 20,
  },
  tipText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: 'Courier',
  },
  bottomPadding: {
    height: 32,
  },
}), [colors]);

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
          {modules.map((module) => (
            <TouchableOpacity
              key={module.id}
              style={[styles.moduleCard, { borderColor: module.color }]}
              onPress={() => handleModulePress(module.id)}
              onLongPress={() => handleModuleLongPress(module.id, module.name)}
              activeOpacity={0.8}
            >
              <View style={[styles.moduleIcon, { backgroundColor: module.color }]}>
                <Ionicons name={module.icon as any} size={28} color={colors.textPrimary} />
              </View>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleName}>{module.name}</Text>
                <View style={styles.moduleProgressBar}>
                  <View style={[styles.moduleProgressFill, { width: `${module.progress}%`, backgroundColor: module.color }]} />
                </View>
                <Text style={styles.moduleProgressText}>
                  {module.completedNodes}/{module.totalNodes} 节点
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}

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
              <Text style={styles.tipIcon}>🎯</Text>
              <Text style={styles.tipText}>完成每个节点的学习任务</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>⚡</Text>
              <Text style={styles.tipText}>消耗体力获取知识能量</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>🎮</Text>
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
