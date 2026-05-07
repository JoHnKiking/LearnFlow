import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../src/utils/constants';
import { getCurrentUser } from '../../src/utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ModuleType = 'ai-product-manager' | 'personal-finance' | 'english-communication';

interface Module {
  id: ModuleType;
  name: string;
  icon: string;
  color: string;
  progress: number;
  totalNodes: number;
  completedNodes: number;
  isLocked: boolean;
}

const moduleConfigs: Record<ModuleType, Omit<Module, 'isLocked'>> = {
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

const { width, height } = Dimensions.get('window');
const BLOCK_SIZE = 60;
const COLS = Math.ceil(width / BLOCK_SIZE) + 1;
const ROWS = Math.ceil(height / BLOCK_SIZE) + 1;

const AnimatedBackground = () => {
  return (
    <View style={styles.bgContainer}>
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F1030']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      <View style={styles.blockContainer}>
        {Array.from({ length: ROWS }).map((_, row) =>
          Array.from({ length: COLS }).map((_, col) => {
            const isEven = (row + col) % 2 === 0;
            return (
              <View
                key={`${row}-${col}`}
                style={[
                  styles.block,
                  isEven ? styles.blockEven : styles.blockOdd,
                ]}
              />
            );
          })
        )}
      </View>
    </View>
  );
};

const MapScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setIsLoggedIn(!!currentUser);

        const selectedModules = await AsyncStorage.getItem('selectedModules');
        if (selectedModules) {
          const selected = JSON.parse(selectedModules) as ModuleType[];
          const loadedModules = selected.map(id => ({
            ...moduleConfigs[id],
            isLocked: false,
          })).filter(Boolean) as Module[];
          if (loadedModules.length > 0) {
            setModules(loadedModules);
          } else {
            setModules([{ ...moduleConfigs['ai-product-manager'], isLocked: false }]);
          }
        } else {
          setModules([{ ...moduleConfigs['ai-product-manager'], isLocked: false }]);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        setModules([{ ...moduleConfigs['ai-product-manager'], isLocked: false }]);
      }
    };

    loadData();
  }, []);

  const handleModulePress = (moduleId: string) => {
    router.push({ pathname: '/skill-tree', params: { domain: moduleId } });
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
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
                activeOpacity={0.8}
              >
                <View style={[styles.moduleIcon, { backgroundColor: module.color }]}>
                  <Ionicons name={module.icon as any} size={28} color="#FFFFFF" />
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
                <Ionicons name="chevron-right" size={20} color="#8888AA" />
              </TouchableOpacity>
            ))}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  blockContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  block: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
  },
  blockEven: {
    backgroundColor: 'rgba(93, 155, 250, 0.03)',
  },
  blockOdd: {
    backgroundColor: 'rgba(15, 16, 48, 0.05)',
  },
  safeArea: {
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
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Courier',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8888AA',
    fontFamily: 'Courier',
  },
  modulesGrid: {
    paddingHorizontal: 24,
    gap: 16,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 16, 48, 0.85)',
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
    color: '#FFFFFF',
    fontFamily: 'Courier',
    marginBottom: 8,
  },
  moduleProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    color: '#8888AA',
    fontFamily: 'Courier',
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Courier',
    marginBottom: 16,
  },
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 16, 48, 0.85)',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipText: {
    fontSize: 14,
    color: '#E8E8F0',
    fontFamily: 'Courier',
  },
  bottomPadding: {
    height: 32,
  },
});

export default MapScreen;
