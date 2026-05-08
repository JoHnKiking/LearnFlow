import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../src/utils/constants';
import { getCurrentUser } from '../../src/utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ModuleType = 'ai-product-manager' | 'personal-finance' | 'english-communication' | string;

interface Module {
  id: string;
  name: string;
  icon: string;
  color: string;
  progress: number;
  totalNodes: number;
  completedNodes: number;
  isLocked: boolean;
  isCustom: boolean;
}

const defaultModuleConfigs: Record<string, Omit<Module, 'isLocked' | 'isCustom'>> = {
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

const availableIcons = [
  { name: 'hardware-chip', label: '芯片' },
  { name: 'trending-up', label: '趋势' },
  { name: 'globe', label: '全球' },
  { name: 'book-open', label: '书籍' },
  { name: 'code', label: '代码' },
  { name: 'palette', label: '设计' },
  { name: 'music', label: '音乐' },
  { name: 'camera', label: '摄影' },
  { name: 'dumbbell', label: '健身' },
  { name: 'utensils', label: '烹饪' },
];

const availableColors = [
  '#5D9BFA', '#3AE374', '#FF7D00', '#FF6B6B', '#A855F7', '#EC4899', '#06B6D4', '#84CC16',
];

const getStageColor = (stage: string) => {
  switch (stage) {
    case 'beginner':
      return { bg: 'rgba(93, 155, 250, 0.2)', border: '#5D9BFA', text: '#5D9BFA' };
    case 'intermediate':
      return { bg: 'rgba(72, 209, 176, 0.2)', border: '#48D1B0', text: '#48D1B0' };
    case 'advanced':
      return { bg: 'rgba(255, 152, 0, 0.2)', border: '#FF9800', text: '#FF9800' };
    default:
      return { bg: 'rgba(255,255,255,0.1)', border: '#888', text: '#888' };
  }
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: '',
    icon: 'book-open',
    color: '#5D9BFA',
    totalNodes: 9,
  });
  const [customNodes, setCustomNodes] = useState<{ name: string; url: string; duration: number; stage: string }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setIsLoggedIn(!!currentUser);

        const savedModules = await AsyncStorage.getItem('savedModules');
        if (savedModules) {
          const loadedModules = JSON.parse(savedModules) as Module[];
          setModules(loadedModules);
        } else {
          setModules([{ ...defaultModuleConfigs['ai-product-manager'], isLocked: false, isCustom: false }]);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        setModules([{ ...defaultModuleConfigs['ai-product-manager'], isLocked: false, isCustom: false }]);
      }
    };

    loadData();
  }, []);

  const saveModules = async (newModules: Module[]) => {
    setModules(newModules);
    await AsyncStorage.setItem('savedModules', JSON.stringify(newModules));
  };

  const handleModulePress = (moduleId: string) => {
    router.push({ pathname: '/skill-tree', params: { domain: moduleId } });
  };

  const handleAddDefaultModule = async (moduleId: ModuleType) => {
    const selectedModuleIds = modules.map(m => m.id);
    if (selectedModuleIds.includes(moduleId)) {
      Alert.alert('提示', '该模块已添加');
      return;
    }

    const newModules = [...modules, { ...defaultModuleConfigs[moduleId], isLocked: false, isCustom: false }];
    await saveModules(newModules);
    setShowAddModal(false);
    Alert.alert('🎉 成功', `已添加「${defaultModuleConfigs[moduleId].name}」模块`);
  };

  const getAvailableDefaultModules = () => {
    const selectedIds = modules.map(m => m.id);
    return Object.keys(defaultModuleConfigs).filter(id => !selectedIds.includes(id)) as ModuleType[];
  };

  const addCustomNode = () => {
    setCustomNodes([...customNodes, { name: '', url: '', duration: 1, stage: 'beginner' }]);
  };

  const removeCustomNode = (index: number) => {
    setCustomNodes(customNodes.filter((_, i) => i !== index));
  };

  const updateCustomNode = (index: number, field: string, value: string | number) => {
    const updated = [...customNodes];
    updated[index] = { ...updated[index], [field]: value };
    setCustomNodes(updated);
  };

  const handleCreateCustomModule = async () => {
    if (!customForm.name.trim()) {
      Alert.alert('提示', '请输入模块名称');
      return;
    }

    const moduleId = 'custom-' + Date.now();
    
    const validNodes = customNodes.filter(node => node.name.trim() && node.url.trim());
    const totalNodes = validNodes.length > 0 ? validNodes.length : customForm.totalNodes;
    
    const newModule: Module = {
      id: moduleId,
      name: customForm.name.trim(),
      icon: customForm.icon,
      color: customForm.color,
      progress: 0,
      totalNodes,
      completedNodes: 0,
      isLocked: false,
      isCustom: true,
    };

    const newModules = [...modules, newModule];
    await saveModules(newModules);

    if (validNodes.length > 0) {
      await AsyncStorage.setItem(`customModule-${moduleId}`, JSON.stringify(validNodes));
    }

    setShowCustomModal(false);
    setCustomForm({ name: '', icon: 'book-open', color: '#5D9BFA', totalNodes: 9 });
    setCustomNodes([]);
    Alert.alert('🎉 成功', `已创建自定义模块「${customForm.name}」`);
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

            <TouchableOpacity
              style={styles.addModuleCard}
              onPress={() => setShowAddModal(true)}
              activeOpacity={0.8}
            >
              <View style={styles.addModuleIcon}>
                <Ionicons name="plus" size={28} color="#5D9BFA" />
              </View>
              <View style={styles.moduleInfo}>
                <Text style={styles.addModuleName}>添加学习模块</Text>
                <Text style={styles.addModuleText}>选择预设领域或创建自定义</Text>
              </View>
              <Ionicons name="chevron-right" size={20} color="#5D9BFA" />
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

      <Modal visible={showAddModal} transparent onRequestClose={() => setShowAddModal(false)} animationType="slide">
        <View style={styles.modalOverlay} onPress={() => setShowAddModal(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>添加学习模块</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>选择预设领域</Text>

            <View style={styles.availableModulesList}>
              {getAvailableDefaultModules().map((moduleId) => {
                const module = defaultModuleConfigs[moduleId];
                return (
                  <TouchableOpacity
                    key={moduleId}
                    style={[styles.availableModuleItem, { borderColor: module.color }]}
                    onPress={() => handleAddDefaultModule(moduleId)}
                  >
                    <View style={[styles.availableModuleIcon, { backgroundColor: module.color }]}>
                      <Ionicons name={module.icon as any} size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.availableModuleInfo}>
                      <Text style={styles.availableModuleName}>{module.name}</Text>
                      <Text style={styles.availableModuleDesc}>包含 {module.totalNodes} 个学习节点</Text>
                    </View>
                    <Ionicons name="plus" size={18} color={module.color} />
                  </TouchableOpacity>
                );
              })}

              {getAvailableDefaultModules().length === 0 && (
                <Text style={styles.noModulesText}>所有预设模块已添加</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.createCustomButton}
              onPress={() => {
                setShowAddModal(false);
                setShowCustomModal(true);
              }}
            >
              <Ionicons name="plus-circle" size={20} color="#5D9BFA" />
              <Text style={styles.createCustomButtonText}>创建自定义模块</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showCustomModal} transparent onRequestClose={() => setShowCustomModal(false)} animationType="slide">
        <View style={styles.modalOverlay} onPress={() => setShowCustomModal(false)}>
          <View style={styles.modalContentLarge} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>创建自定义模块</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowCustomModal(false)}>
                <Ionicons name="close" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.customFormContainer}>
              <Text style={styles.formLabel}>模块名称</Text>
              <TextInput
                style={styles.formInput}
                placeholder="输入模块名称，如：绘画入门"
                placeholderTextColor="#555577"
                value={customForm.name}
                onChangeText={(text) => setCustomForm({ ...customForm, name: text })}
              />

              <Text style={styles.formLabel}>选择图标</Text>
              <View style={styles.iconSelector}>
                {availableIcons.map((icon) => (
                  <TouchableOpacity
                    key={icon.name}
                    style={[styles.iconOption, customForm.icon === icon.name && styles.iconOptionActive]}
                    onPress={() => setCustomForm({ ...customForm, icon: icon.name })}
                  >
                    <Ionicons name={icon.name as any} size={24} color={customForm.icon === icon.name ? '#5D9BFA' : '#888'} />
                    <Text style={styles.iconLabel}>{icon.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>选择颜色</Text>
              <View style={styles.colorSelector}>
                {availableColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[styles.colorOption, { backgroundColor: color }, customForm.color === color && styles.colorOptionActive]}
                    onPress={() => setCustomForm({ ...customForm, color })}
                  />
                ))}
              </View>

              <Text style={styles.formLabel}>添加学习节点（可选）</Text>
              <Text style={styles.formHint}>您可以添加课程链接，也可以稍后在技能树中添加</Text>

              {customNodes.map((node, index) => (
                <View key={index} style={styles.nodeItem}>
                  <Text style={styles.nodeLabel}>节点 {index + 1}</Text>
                  <TextInput
                    style={styles.nodeInput}
                    placeholder="课程名称"
                    placeholderTextColor="#555577"
                    value={node.name}
                    onChangeText={(text) => updateCustomNode(index, 'name', text)}
                  />
                  <TextInput
                    style={styles.nodeInput}
                    placeholder="课程链接"
                    placeholderTextColor="#555577"
                    value={node.url}
                    onChangeText={(text) => updateCustomNode(index, 'url', text)}
                  />
                  <View style={styles.nodeStageRow}>
                    <Text style={styles.nodeStageLabel}>所属阶段：</Text>
                    <View style={styles.stageSelector}>
                      {[
                        { value: 'beginner', label: '入门' },
                        { value: 'intermediate', label: '进阶' },
                        { value: 'advanced', label: '精通' },
                      ].map((stage) => (
                        <TouchableOpacity
                          key={stage.value}
                          style={[
                            styles.stageOption,
                            node.stage === stage.value && styles.stageOptionActive,
                            { backgroundColor: node.stage === stage.value ? getStageColor(stage.value).bg : 'rgba(255,255,255,0.05)' },
                            { borderColor: node.stage === stage.value ? getStageColor(stage.value).border : 'transparent' },
                          ]}
                          onPress={() => updateCustomNode(index, 'stage', stage.value)}
                        >
                          <Text style={{ color: node.stage === stage.value ? getStageColor(stage.value).text : '#888', fontSize: 12 }}>
                            {stage.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={styles.nodeDurationRow}>
                    <TextInput
                      style={styles.nodeDurationInput}
                      placeholder="时长(h)"
                      placeholderTextColor="#555577"
                      keyboardType="numeric"
                      value={String(node.duration)}
                      onChangeText={(text) => updateCustomNode(index, 'duration', parseFloat(text) || 1)}
                    />
                    <TouchableOpacity
                      style={styles.removeNodeButton}
                      onPress={() => removeCustomNode(index)}
                    >
                      <Ionicons name="trash" size={16} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.addNodeButton} onPress={addCustomNode}>
                <Ionicons name="plus" size={16} color="#5D9BFA" />
                <Text style={styles.addNodeButtonText}>添加节点</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.createButton} onPress={handleCreateCustomModule}>
              <Text style={styles.createButtonText}>创建模块</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addModuleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(93, 155, 250, 0.3)',
    padding: 16,
    gap: 16,
    borderStyle: 'dashed',
  },
  addModuleIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(93, 155, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  addModuleName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5D9BFA',
    fontFamily: 'Courier',
    marginBottom: 4,
  },
  addModuleText: {
    fontSize: 12,
    color: '#8888AA',
    fontFamily: 'Courier',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8888AA',
    marginBottom: 16,
  },
  availableModulesList: {
    gap: 12,
  },
  availableModuleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  availableModuleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  availableModuleInfo: {
    flex: 1,
  },
  availableModuleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  availableModuleDesc: {
    fontSize: 12,
    color: '#8888AA',
  },
  noModulesText: {
    fontSize: 14,
    color: '#8888AA',
    textAlign: 'center',
    padding: 20,
  },
  createCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    marginTop: 12,
    backgroundColor: 'rgba(93, 155, 250, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(93, 155, 250, 0.3)',
  },
  createCustomButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D9BFA',
  },
  modalContentLarge: {
    width: '100%',
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  customFormContainer: {
    gap: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  formHint: {
    fontSize: 12,
    color: '#8888AA',
    marginBottom: 8,
  },
  iconSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOptionActive: {
    borderColor: '#5D9BFA',
    backgroundColor: 'rgba(93, 155, 250, 0.15)',
  },
  iconLabel: {
    fontSize: 10,
    color: '#8888AA',
    marginTop: 4,
  },
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionActive: {
    borderColor: '#FFFFFF',
  },
  nodeItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  nodeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8888AA',
  },
  nodeInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 10,
    color: '#FFFFFF',
    fontSize: 13,
  },
  nodeDurationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  nodeDurationInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 10,
    color: '#FFFFFF',
    fontSize: 13,
  },
  removeNodeButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    backgroundColor: 'rgba(93, 155, 250, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(93, 155, 250, 0.3)',
  },
  addNodeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5D9BFA',
  },
  nodeStageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nodeStageLabel: {
    fontSize: 12,
    color: '#8888AA',
  },
  stageSelector: {
    flexDirection: 'row',
    gap: 6,
  },
  stageOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  stageOptionActive: {
    borderWidth: 1,
  },
  createButton: {
    backgroundColor: '#5D9BFA',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default MapScreen;
