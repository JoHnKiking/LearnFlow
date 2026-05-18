import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ModuleType = 'ai-product-manager' | 'personal-finance' | 'english-communication' | string;

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
  const { colors } = useTheme();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isAddMode = mode === 'add';
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>([]);
  const [existingModules, setExistingModules] = useState<ModuleType[]>([]);
  const [customName, setCustomName] = useState('');
  const [fadeAnim] = useState(new Animated.Value(1));

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
    } else {
      setSelectedModules(['ai-product-manager']);
    }
  }, [isAddMode]);

  const availableModules = isAddMode
    ? predefinedModules.filter(m => !existingModules.includes(m.id))
    : predefinedModules;

  const toggleModule = (id: ModuleType) => {
    if (selectedModules.includes(id)) {
      if (isAddMode) return;
      console.log('[ModuleSelection] 取消选择模块:', id);
      setSelectedModules(selectedModules.filter(m => m !== id));
    } else {
      if (!isAddMode && selectedModules.length >= 3) return;
      console.log('[ModuleSelection] 选择模块:', id);
      setSelectedModules([...selectedModules, id]);
    }
  };

  const handleCreateCustom = async () => {
    const trimmed = customName.trim();
    if (!trimmed) {
      Alert.alert('提示', '请输入模块名称');
      return;
    }

    const customId = `custom-${Date.now()}`;
    const customModulesStr = await AsyncStorage.getItem('customModules');
    const customModules: Record<string, { name: string }> = customModulesStr ? JSON.parse(customModulesStr) : {};
    customModules[customId] = { name: trimmed };
    await AsyncStorage.setItem('customModules', JSON.stringify(customModules));

    const newSelected = [...selectedModules, customId];
    setSelectedModules(newSelected);
    setCustomName('');
    console.log('[ModuleSelection] 自定义模块创建完成:', trimmed);
  };

  const handleStart = async () => {
    console.log('[ModuleSelection] 确认选择模块:', selectedModules);
    await AsyncStorage.setItem('selectedModules', JSON.stringify(selectedModules));
    if (isAddMode) {
      console.log('[ModuleSelection] 添加模块完成，返回主页');
      router.back();
    } else {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      console.log('[ModuleSelection] 新手引导完成，进入主页');
      router.replace('/(tabs)');
    }
  };

  const styles = useMemo(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.primary,
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
    backgroundColor: colors.background,
    position: 'absolute',
    top: 2,
    left: 3,
  },
  mouthAvatar: {
    width: 16,
    height: 4,
    backgroundColor: colors.background,
    position: 'absolute',
    top: 18,
    left: 12,
  },
  bodyAvatar: {
    width: 32,
    height: 8,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: 40,
    left: 24,
  },
  bubble: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
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
    borderBottomColor: colors.primary,
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -8,
  },
  bubbleText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Courier',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Courier',
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textSecondary,
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
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.border,
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
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  customModuleInfo: {
    flex: 1,
  },
  customModuleName: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Courier',
    marginBottom: 4,
  },
  customModuleDescription: {
    color: colors.textTertiary,
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
    color: colors.warning,
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Courier',
  },
  selectedCount: {
    textAlign: 'center',
    color: colors.textSecondary,
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
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  customInputCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.borderDark,
    borderStyle: 'dashed',
    padding: 12,
    marginBottom: 8,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customTextInput: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: 'Courier',
  },
  customAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customAddBtnDisabled: {
    opacity: 0.4,
  },
}), [colors]);

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

            <Text style={styles.title}>{isAddMode ? '添加学习模块' : '选择学习模块'}</Text>
            <Text style={styles.subtitle}>{isAddMode ? `还可添加 ${3 - existingModules.length} 个模块` : '最多选择 3 个模块开始学习'}</Text>
          </Animated.View>

          <Animated.View style={[styles.modulesContainer, { opacity: fadeAnim }]}>
            {availableModules.map((module) => {
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
                          <Ionicons name="checkmark" size={18} color={colors.textPrimary} />
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            {isAddMode ? (
              <View style={styles.customInputCard}>
                <View style={styles.customInputRow}>
                  <TextInput
                    style={styles.customTextInput}
                    placeholder="输入自定义模块名称..."
                    placeholderTextColor={colors.textTertiary}
                    value={customName}
                    onChangeText={setCustomName}
                    maxLength={20}
                  />
                  <TouchableOpacity
                    style={[styles.customAddBtn, !customName.trim() && styles.customAddBtnDisabled]}
                    onPress={handleCreateCustom}
                    disabled={!customName.trim()}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={20} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.customModuleCard}>
                <View style={styles.customModuleContent}>
                  <View style={styles.customIconContainer}>
                    <Ionicons name="create" size={28} color={colors.orange} />
                  </View>
                  <View style={styles.customModuleInfo}>
                    <Text style={styles.customModuleName}>自定义模块</Text>
                    <Text style={styles.customModuleDescription}>即将开放，敬请期待</Text>
                  </View>
                </View>
              </View>
            )}
          </Animated.View>

          <Text style={styles.selectedCount}>
            {isAddMode ? `已选择 ${selectedModules.length} 个模块` : `已选择 ${selectedModules.length}/3 个模块`}
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
            onPress={handleStart}
            disabled={isAddMode ? selectedModules.length === existingModules.length : selectedModules.length === 0}
            activeOpacity={0.7}
          >
            <Text style={styles.startButtonText}>{isAddMode ? '确认添加' : '开始学习之旅 ✨'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


export default ModuleSelectionScreen;
