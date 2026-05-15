import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ModuleType = 'ai-product-manager' | 'personal-finance' | 'english-communication';

interface Module {
  id: ModuleType;
  name: string;
  icon: string;
  color: string;
  description: string;
  difficulty: string;
}

const predefinedModules: Module[] = [
  {
    id: 'ai-product-manager',
    name: 'AI产品经理',
    icon: 'hardware-chip',
    color: '#5D9BFA',
    description: '掌握AI产品设计与落地',
    difficulty: '中级',
  },
  {
    id: 'personal-finance',
    name: '个人理财',
    icon: 'trending-up',
    color: '#3AE374',
    description: '建立科学理财观念',
    difficulty: '初级',
  },
  {
    id: 'english-communication',
    name: '英语沟通',
    icon: 'language',
    color: '#FF7D00',
    description: '提升英语听说能力',
    difficulty: '初级',
  },
];

const ModuleSelectionScreen = () => {
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>(['ai-product-manager']);
  const [fadeAnim] = useState(new Animated.Value(1));

  const toggleModule = (id: ModuleType) => {
    if (selectedModules.includes(id)) {
      console.log('[ModuleSelection] 取消选择模块:', id);
      setSelectedModules(selectedModules.filter(m => m !== id));
    } else {
      if (selectedModules.length < 3) {
        console.log('[ModuleSelection] 选择模块:', id);
        setSelectedModules([...selectedModules, id]);
      }
    }
  };

  const handleStart = async () => {
    console.log('[ModuleSelection] 确认选择模块:', selectedModules);
    await AsyncStorage.setItem('selectedModules', JSON.stringify(selectedModules));
    await AsyncStorage.setItem('onboardingCompleted', 'true');
    console.log('[ModuleSelection] 新手引导完成，进入主页');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.pixelBackground} />

          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <View style={styles.monsterAvatarContainer}>
              <MonsterAvatar />
            </View>

            <View style={styles.bubble}>
              <View style={styles.bubbleTail} />
              <Text style={styles.bubbleText}>小怪兽，我们要探索哪些领域呢？</Text>
            </View>

            <Text style={styles.title}>选择学习模块</Text>
            <Text style={styles.subtitle}>最多选择 3 个模块开始学习</Text>
          </Animated.View>

          <Animated.View style={[styles.modulesContainer, { opacity: fadeAnim }]}>
            {predefinedModules.map((module, index) => {
              const isSelected = selectedModules.includes(module.id);
              const canSelect = selectedModules.length < 3 || isSelected;

              return (
                <TouchableOpacity
                  key={module.id}
                  onPress={() => canSelect && toggleModule(module.id)}
                  disabled={!canSelect}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.moduleCard,
                      {
                        backgroundColor: isSelected ? module.color : '#0F1030',
                        borderColor: module.color,
                        opacity: canSelect ? 1 : 0.5,
                      },
                    ]}
                  >
                    <View style={styles.moduleCardContent}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : module.color,
                          },
                        ]}
                      >
                        <Ionicons
                          name={module.icon as any}
                          size={28}
                          color={isSelected ? '#FFFFFF' : '#1A1A2E'}
                        />
                      </View>

                      <View style={styles.moduleInfo}>
                        <Text style={[styles.moduleName, { color: isSelected ? '#FFFFFF' : '#E8E8F0' }]}>
                          {module.name}
                        </Text>
                        <Text style={[styles.moduleDescription, { color: isSelected ? 'rgba(255,255,255,0.9)' : '#8888AA' }]}>
                          {module.description}
                        </Text>
                        <View
                          style={[
                            styles.difficultyBadge,
                            {
                              backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(93,155,250,0.15)',
                            },
                          ]}
                        >
                          <Text style={[styles.difficultyText, { color: isSelected ? '#FFFFFF' : module.color }]}>
                            {module.difficulty}
                          </Text>
                        </View>
                      </View>

                      {isSelected && (
                        <View style={styles.checkMark}>
                          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            <View style={styles.customModuleCard}>
              <View style={styles.customModuleContent}>
                <View style={styles.customIconContainer}>
                  <Ionicons name="add" size={28} color="#8888AA" />
                </View>

                <View style={styles.customModuleInfo}>
                  <Text style={styles.customModuleName}>自定义模块</Text>
                  <Text style={styles.customModuleDescription}>即将开放，敬请期待</Text>
                </View>

                <View style={styles.proBadge}>
                  <Text style={styles.proText}>PRO</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <Text style={styles.selectedCount}>已选择 {selectedModules.length}/3 个模块</Text>

          <View style={styles.spacer} />

          <TouchableOpacity
            style={[
              styles.startButton,
              {
                backgroundColor: selectedModules.length === 0 ? '#2A2A4A' : 'rgba(93,155,250,0.8)',
                opacity: selectedModules.length === 0 ? 0.5 : 1,
                shadowColor: selectedModules.length === 0 ? 'transparent' : COLORS.PRIMARY,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: selectedModules.length === 0 ? 0 : 0.35,
                shadowRadius: 24,
                elevation: selectedModules.length === 0 ? 0 : 5,
              },
            ]}
            onPress={handleStart}
            disabled={selectedModules.length === 0}
            activeOpacity={0.7}
          >
            <Text style={styles.startButtonText}>开始学习之旅 ✨</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const MonsterAvatar = () => {
  return (
    <View style={styles.monsterAvatar}>
      <View style={styles.monsterHeadAvatar}>
        <View style={styles.monsterEyesAvatar}>
          <View style={styles.eyeAvatar}>
            <View style={styles.pupilAvatar} />
          </View>
          <View style={styles.eyeAvatar}>
            <View style={styles.pupilAvatar} />
          </View>
        </View>
        <View style={styles.mouthAvatar} />
      </View>
      <View style={styles.bodyAvatar} />
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    position: 'relative',
  },
  pixelBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  monsterAvatarContainer: {
    marginBottom: 16,
  },
  monsterAvatar: {
    width: 80,
    height: 80,
    position: 'relative',
  },
  monsterHeadAvatar: {
    width: 40,
    height: 24,
    backgroundColor: '#5D9BFA',
    position: 'absolute',
    top: 16,
    left: 20,
  },
  monsterEyesAvatar: {
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    top: 8,
    left: 8,
  },
  eyeAvatar: {
    width: 10,
    height: 10,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  pupilAvatar: {
    width: 4,
    height: 5,
    backgroundColor: '#1A1A2E',
    position: 'absolute',
    top: 2,
    left: 3,
  },
  mouthAvatar: {
    width: 16,
    height: 4,
    backgroundColor: '#1A1A2E',
    position: 'absolute',
    top: 18,
    left: 12,
  },
  bodyAvatar: {
    width: 32,
    height: 8,
    backgroundColor: '#5D9BFA',
    position: 'absolute',
    top: 40,
    left: 24,
  },
  bubble: {
    backgroundColor: '#0F1030',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#5D9BFA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 20,
  },
  bubbleTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#5D9BFA',
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -8,
  },
  bubbleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Courier',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Courier',
    marginBottom: 4,
  },
  subtitle: {
    color: '#8888AA',
    fontSize: 13,
    fontFamily: 'Courier',
  },
  modulesContainer: {
    gap: 16,
  },
  moduleCard: {
    borderRadius: 24,
    borderWidth: 2,
    overflow: 'hidden',
  },
  moduleCardContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
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
  moduleDescription: {
    fontSize: 13,
    fontFamily: 'Courier',
    marginBottom: 6,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Courier',
  },
  checkMark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customModuleCard: {
    backgroundColor: '#0F1030',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
    overflow: 'hidden',
    opacity: 0.6,
  },
  customModuleContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  customIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  customModuleInfo: {
    flex: 1,
  },
  customModuleName: {
    color: '#8888AA',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Courier',
    marginBottom: 4,
  },
  customModuleDescription: {
    color: '#555577',
    fontSize: 13,
    fontFamily: 'Courier',
  },
  proBadge: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  proText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Courier',
  },
  selectedCount: {
    textAlign: 'center',
    color: '#8888AA',
    fontSize: 13,
    fontFamily: 'Courier',
    marginTop: 24,
  },
  spacer: {
    flex: 1,
  },
  startButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
});

export default ModuleSelectionScreen;