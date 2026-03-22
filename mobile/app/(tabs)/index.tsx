import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/utils/constants';
import { getCurrentUser } from '../../src/utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ModuleType = 'ai-learning' | 'english' | 'programming';

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
  'ai-learning': {
    id: 'ai-learning',
    name: 'AI 学习',
    icon: 'brain',
    color: '#5D9BFA',
    progress: 35,
    totalNodes: 12,
    completedNodes: 4,
  },
  'english': {
    id: 'english',
    name: '英语学习',
    icon: 'book',
    color: '#3AE374',
    progress: 20,
    totalNodes: 15,
    completedNodes: 3,
  },
  'programming': {
    id: 'programming',
    name: '编程基础',
    icon: 'code-slash',
    color: '#FF7D00',
    progress: 0,
    totalNodes: 10,
    completedNodes: 0,
  },
};

const MapScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [monsterData, setMonsterData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        const monster = await AsyncStorage.getItem('monster');
        if (monster) {
          setMonsterData(JSON.parse(monster));
        }

        const selectedModules = await AsyncStorage.getItem('selectedModules');
        if (selectedModules) {
          const selected = JSON.parse(selectedModules) as ModuleType[];
          const loadedModules = selected.map(id => ({
            ...moduleConfigs[id],
            isLocked: false,
          })).filter(Boolean) as Module[];
          setModules(loadedModules);
        } else {
          setModules([{ ...moduleConfigs['ai-learning'], isLocked: false }]);
        }
      } catch (error) {
        console.error('加载数据失败:', error);
      }
    };

    loadData();
  }, []);

  const handleModulePress = (moduleId: string) => {
    router.push('/skill-tree');
  };

  const handleDailyChallenge = () => {
    router.push('/monster');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.pixelBackground} />
          
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>探险地图 🗺️</Text>
                <Text style={styles.title}>知识寻宝</Text>
              </View>

              {monsterData && (
                <TouchableOpacity onPress={() => router.push('/monster')} activeOpacity={0.7}>
                  <View style={styles.monsterAvatar}>
                    <MonsterIcon type={monsterData.type} size={48} />
                    <View style={styles.energyIndicator}>
                      <Ionicons name="flash" size={10} color="#FFFFFF" />
                      <Text style={styles.energyText}>{monsterData.energy || 100}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.statsBar}>
              <View style={styles.knowledgeIcon}>
                <Text style={styles.knowledgeAtSymbol}>@</Text>
              </View>
              <View style={styles.knowledgeInfo}>
                <Text style={styles.knowledgeLabel}>知识能量</Text>
                <Text style={styles.knowledgePoints}>
                  {monsterData?.knowledgePoints || 0} <Text style={styles.knowledgeUnit}>@</Text>
                </Text>
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelLabel}>等级</Text>
                <Text style={styles.levelText}>Lv.{monsterData?.level || 1}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.modulesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>学习模块</Text>
            <Text style={styles.moduleCount}>{modules.length}/3</Text>
          </View>

          <View style={styles.modulesContainer}>
            {modules.map((module, index) => (
              <TouchableOpacity
                key={module.id}
                onPress={() => !module.isLocked && handleModulePress(module.id)}
                disabled={module.isLocked}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.moduleCard,
                    {
                      backgroundColor: '#16213E',
                      borderColor: `${module.color}40`,
                    },
                  ]}
                >
                  <View style={styles.pixelPattern} />
                  
                  <View style={styles.moduleContent}>
                    <View style={styles.moduleTop}>
                      <View
                        style={[
                          styles.moduleIcon,
                          { backgroundColor: `${module.color}20` },
                        ]}
                      >
                        {module.isLocked ? (
                          <Ionicons name="lock-closed" size={28} color="#8888AA" />
                        ) : (
                          <Ionicons name={module.icon as any} size={28} color={module.color} />
                        )}
                      </View>

                      <View style={styles.moduleInfo}>
                        <Text
                          style={[
                            styles.moduleName,
                            { color: module.isLocked ? '#8888AA' : '#E8E8F0' },
                          ]}
                        >
                          {module.name}
                        </Text>
                        <Text style={styles.moduleProgressText}>
                          {module.completedNodes}/{module.totalNodes} 节点完成
                        </Text>
                      </View>

                      {!module.isLocked && (
                        <Ionicons name="chevron-forward" size={20} color={module.color} />
                      )}
                    </View>

                    {!module.isLocked && (
                      <View style={styles.progressBarSection}>
                        <View style={styles.progressHeader}>
                          <Text style={styles.progressLabel}>进度</Text>
                          <Text style={[styles.progressPercent, { color: module.color }]}>
                            {module.progress}%
                          </Text>
                        </View>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${module.progress}%`,
                                backgroundColor: module.color,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    )}

                    {module.isLocked && (
                      <View style={styles.lockedSection}>
                        <Text style={styles.lockedText}>🔒 升级解锁</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {modules.length < 3 && (
              <TouchableOpacity activeOpacity={0.7}>
                <View style={styles.addModuleCard}>
                  <View style={styles.addModuleContent}>
                    <View style={styles.addIcon}>
                      <Ionicons name="add" size={28} color="#5D9BFA" />
                    </View>
                    <View style={styles.addModuleInfo}>
                      <Text style={styles.addModuleName}>添加新模块</Text>
                      <Text style={styles.addModuleDescription}>自定义学习路径</Text>
                    </View>
                    <View style={styles.proBadge}>
                      <Text style={styles.proText}>PRO</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.dailyMissionSection}>
          <TouchableOpacity
            style={styles.dailyMissionButton}
            onPress={handleDailyChallenge}
            activeOpacity={0.7}
          >
            <View style={styles.dailyMissionPixelPattern} />
            <Text style={styles.dailyMissionIcon}>🎯</Text>
            <View style={styles.dailyMissionInfo}>
              <Text style={styles.dailyMissionTitle}>每日任务</Text>
              <Text style={styles.dailyMissionDescription}>完成今日学习，获得 50 @ 能量</Text>
            </View>
            <View style={styles.dailyMissionArrow}>
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const MonsterIcon = ({ type, size }: { type: 'lively' | 'calm' | 'rebel'; size: number }) => {
  const colors: Record<string, { primary: string; secondary: string }> = {
    lively: { primary: '#FF7D00', secondary: '#E66900' },
    calm: { primary: '#5D9BFA', secondary: '#4A7FD4' },
    rebel: { primary: '#7B5EA7', secondary: '#5A4280' },
  };

  const color = colors[type] || colors.calm;
  const scale = size / 100;

  return (
    <View style={[styles.monsterIcon, { width: size, height: size }]}>
      <View style={[styles.monsterHeadIcon, { width: 44 * scale, height: 36 * scale, backgroundColor: color.primary, left: 14 * scale, top: 20 * scale }]}>
        <View style={[styles.earIcon, { width: 8 * scale, height: 12 * scale, backgroundColor: color.secondary, left: -4 * scale, top: 4 * scale }]} />
        <View style={[styles.earIcon, { width: 8 * scale, height: 12 * scale, backgroundColor: color.secondary, right: -4 * scale, top: 4 * scale }]} />
        <View style={[styles.eyeIcon, { width: 12 * scale, height: 12 * scale, backgroundColor: '#FFFFFF', left: 4 * scale, top: 8 * scale }]}>
          <View style={[styles.pupilIcon, { width: 4 * scale, height: 6 * scale, backgroundColor: '#1A1A2E', left: 4 * scale, top: 2 * scale }]} />
        </View>
        <View style={[styles.eyeIcon, { width: 12 * scale, height: 12 * scale, backgroundColor: '#FFFFFF', right: 4 * scale, top: 8 * scale }]}>
          <View style={[styles.pupilIcon, { width: 4 * scale, height: 6 * scale, backgroundColor: '#1A1A2E', left: 4 * scale, top: 2 * scale }]} />
        </View>
        <View style={[styles.mouthIcon, { width: 20 * scale, height: 4 * scale, backgroundColor: '#1A1A2E', left: 12 * scale, top: 24 * scale }]} />
      </View>
      <View style={[styles.bodyIcon, { width: 36 * scale, height: 20 * scale, backgroundColor: color.primary, left: 18 * scale, top: 56 * scale }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    position: 'relative',
    paddingTop: 48,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  pixelBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F1030',
    opacity: 0.95,
  },
  headerContent: {
    paddingHorizontal: 20,
    position: 'relative',
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greeting: {
    color: '#8888AA',
    fontSize: 13,
    fontFamily: 'Courier',
  },
  title: {
    color: '#E8E8F0',
    fontWeight: '800',
    fontSize: 24,
    fontFamily: 'Courier',
  },
  monsterAvatar: {
    position: 'relative',
  },
  monsterIcon: {
    position: 'relative',
  },
  monsterHeadIcon: {
    position: 'absolute',
  },
  earIcon: {
    position: 'absolute',
  },
  eyeIcon: {
    position: 'absolute',
  },
  pupilIcon: {
    position: 'absolute',
  },
  mouthIcon: {
    position: 'absolute',
  },
  bodyIcon: {
    position: 'absolute',
  },
  energyIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#FF7D00',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  energyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  statsBar: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(93,155,250,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.2)',
  },
  knowledgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD60A',
  },
  knowledgeAtSymbol: {
    fontSize: 20,
    fontWeight: '800',
  },
  knowledgeInfo: {
    flex: 1,
  },
  knowledgeLabel: {
    color: '#8888AA',
    fontSize: 11,
    fontFamily: 'Courier',
  },
  knowledgePoints: {
    color: '#FFD60A',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Courier',
  },
  knowledgeUnit: {
    fontSize: 12,
    color: '#8888AA',
  },
  levelInfo: {
    alignItems: 'flex-end',
  },
  levelLabel: {
    color: '#8888AA',
    fontSize: 11,
    fontFamily: 'Courier',
  },
  levelText: {
    color: '#5D9BFA',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Courier',
  },
  modulesSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#E8E8F0',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  moduleCount: {
    color: '#8888AA',
    fontSize: 12,
    fontFamily: 'Courier',
  },
  modulesContainer: {
    gap: 16,
  },
  moduleCard: {
    position: 'relative',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pixelPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
  },
  moduleContent: {
    padding: 20,
    position: 'relative',
    zIndex: 1,
  },
  moduleTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  moduleIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
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
    fontFamily: 'Courier',
    marginBottom: 4,
  },
  moduleProgressText: {
    color: '#8888AA',
    fontSize: 12,
    fontFamily: 'Courier',
  },
  progressBarSection: {},
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    color: '#8888AA',
    fontSize: 11,
    fontFamily: 'Courier',
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Courier',
  },
  progressBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  lockedSection: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  lockedText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Courier',
  },
  addModuleCard: {
    position: 'relative',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  addModuleContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  addIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(93,155,250,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  addModuleInfo: {
    flex: 1,
  },
  addModuleName: {
    color: '#8888AA',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  addModuleDescription: {
    color: '#555577',
    fontSize: 12,
    fontFamily: 'Courier',
  },
  proBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,215,0,0.15)',
  },
  proText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Courier',
  },
  dailyMissionSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  dailyMissionButton: {
    width: '100%',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FF7D00',
    overflow: 'hidden',
    position: 'relative',
  },
  dailyMissionPixelPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  dailyMissionIcon: {
    fontSize: 36,
  },
  dailyMissionInfo: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  dailyMissionTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    fontFamily: 'Courier',
  },
  dailyMissionDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontFamily: 'Courier',
  },
  dailyMissionArrow: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  bottomPadding: {
    height: 100,
  },
});

export default MapScreen;
