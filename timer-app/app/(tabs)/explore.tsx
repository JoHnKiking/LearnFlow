import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
  Linking
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateMonsterImage, generateMonsterDialogue, generateAdventureMap } from '../api/kimi';

// 探险地图接口
interface AdventureMap {
  id: string;
  domainId: string;
  name: string;
  nodes: MapNode[];
  edges: MapEdge[];
  currentNodeId: string;
}

// 地图节点接口
interface MapNode {
  id: string;
  type: 'start' | 'resource' | 'monster' | 'treasure' | 'boss';
  x: number;
  y: number;
  isDiscovered: boolean;
  isCompleted: boolean;
  title: string;
  description: string;
  imageUrl: string;
  reward?: string;
  resourceUrl?: string; // 学习资源链接
  difficulty: number; // 难度等级 1-5
}

// 地图边接口
interface MapEdge {
  id: string;
  from: string;
  to: string;
  isUnlocked: boolean;
}

// 怪物接口
interface Monster {
  id: string;
  name: string;
  personality: string;
  dialogues: string[];
  imageUrl: string;
  isDefeated: boolean;
}

// 生成AI学习路径地图
const generateAIMap = (domainId: string): AdventureMap => {
  const nodes: MapNode[] = [
    {
      id: 'start',
      type: 'start',
      x: 50,
      y: 10,
      isDiscovered: true,
      isCompleted: true,
      title: 'AI学习起点',
      description: '开始你的AI学习探险之旅！',
      imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20AI%20learning%20starting%20point%20with%20bright%20path&image_size=square',
      difficulty: 1,
    },
    // 基础概念部分
    {
      id: 'ai_basics',
      type: 'resource',
      x: 25,
      y: 30,
      isDiscovered: false,
      isCompleted: false,
      title: 'AI基础概念',
      description: '了解人工智能的基本概念和发展历史',
      imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20AI%20basics%20concepts%20with%20brain%20icon&image_size=square',
      reward: 'AI基础认知',
      resourceUrl: 'https://www.coursera.org/learn/ai-for-everyone',
      difficulty: 1,
    },
    {
      id: 'math_basics',
      type: 'resource',
      x: 75,
      y: 30,
      isDiscovered: false,
      isCompleted: false,
      title: '数学基础',
      description: '复习必要的数学知识：线性代数、微积分、概率统计',
      imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20math%20basics%20with%20numbers%20and%20formulas&image_size=square',
      reward: '数学思维',
      resourceUrl: 'https://www.coursera.org/specializations/mathematics-machine-learning',
      difficulty: 2,
    },
    {
      id: 'math_monster',
      type: 'monster',
      x: 50,
      y: 45,
      isDiscovered: false,
      isCompleted: false,
      title: '数学挑战',
      description: '测试你的数学基础是否扎实',
      imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20math%20monster%20with%20numbers%20and%20formulas&image_size=square',
      difficulty: 2,
    },
    // 机器学习基础
    {
      id: 'ml_basics',
      type: 'resource',
      x: 25,
      y: 60,
      isDiscovered: false,
      isCompleted: false,
      title: '机器学习基础',
      description: '学习机器学习的基本原理和算法',
      imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20machine%20learning%20basics%20with%20data%20points&image_size=square',
      reward: 'ML基础技能',
      resourceUrl: 'https://www.coursera.org/learn/machine-learning',
      difficulty: 3,
    },
    {
      id: 'data_preprocessing',
      type: 'resource',
      x: 75,
      y: 60,
      isDiscovered: false,
      isCompleted: false,
      title: '数据预处理',
      description: '学习数据清洗、特征工程等预处理技术',
      imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20data%20preprocessing%20with%20clean%20and%20dirty%20data&image_size=square',
      reward: '数据处理能力',
      resourceUrl: 'https://www.coursera.org/learn/data-cleaning',
      difficulty: 3,
    },
    {
      id: 'ml_monster',
      type: 'monster',
      x: 50,
      y: 75,
      isDiscovered: false,
      isCompleted: false,
      title: 'ML算法挑战',
      description: '测试你对机器学习算法的理解',
      imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20ML%20algorithm%20monster%20with%20decision%20trees&image_size=square',
      difficulty: 3,
    },
    // 深度学习基础
    {
      id: 'dl_basics',
      type: 'resource',
      x: 25,
      y: 90,
      isDiscovered: false,
      isCompleted: false,
      title: '深度学习基础',
      description: '学习神经网络和深度学习的基本原理',
      imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20deep%20learning%20basics%20with%20neural%20network&image_size=square',
      reward: 'DL基础技能',
      resourceUrl: 'https://www.coursera.org/specializations/deep-learning',
      difficulty: 4,
    },
    {
      id: 'dl_frameworks',
      type: 'resource',
      x: 75,
      y: 90,
      isDiscovered: false,
      isCompleted: false,
      title: '深度学习框架',
      description: '学习使用TensorFlow和PyTorch等深度学习框架',
      imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20deep%20learning%20frameworks%20with%20code&image_size=square',
      reward: '框架使用能力',
      resourceUrl: 'https://www.coursera.org/learn/introduction-tensorflow',
      difficulty: 4,
    },
    // AI应用部分
    {
      id: 'ai_applications',
      type: 'treasure',
      x: 50,
      y: 110,
      isDiscovered: false,
      isCompleted: false,
      title: 'AI应用实践',
      description: '探索AI在各个领域的应用',
      imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20AI%20applications%20treasure%20with%20various%20use%20cases&image_size=square',
      reward: 'AI应用能力',
      resourceUrl: 'https://www.coursera.org/learn/ai-for-business',
      difficulty: 5,
    },
  ];

  const edges: MapEdge[] = [
    { id: 'edge1', from: 'start', to: 'ai_basics', isUnlocked: true },
    { id: 'edge2', from: 'start', to: 'math_basics', isUnlocked: true },
    { id: 'edge3', from: 'ai_basics', to: 'math_monster', isUnlocked: false },
    { id: 'edge4', from: 'math_basics', to: 'math_monster', isUnlocked: false },
    { id: 'edge5', from: 'math_monster', to: 'ml_basics', isUnlocked: false },
    { id: 'edge6', from: 'math_monster', to: 'data_preprocessing', isUnlocked: false },
    { id: 'edge7', from: 'ml_basics', to: 'ml_monster', isUnlocked: false },
    { id: 'edge8', from: 'data_preprocessing', to: 'ml_monster', isUnlocked: false },
    { id: 'edge9', from: 'ml_monster', to: 'dl_basics', isUnlocked: false },
    { id: 'edge10', from: 'ml_monster', to: 'dl_frameworks', isUnlocked: false },
    { id: 'edge11', from: 'dl_basics', to: 'ai_applications', isUnlocked: false },
    { id: 'edge12', from: 'dl_frameworks', to: 'ai_applications', isUnlocked: false },
  ];

  return {
    id: `map-${domainId}`,
    domainId,
    name: 'AI学习探险地图',
    nodes,
    edges,
    currentNodeId: 'start',
  };
};

// 模拟怪物数据
const mockMonster: Monster = {
  id: 'monster1',
  name: '逻辑小怪',
  personality: '调皮但聪明，喜欢考验别人的逻辑思维',
  dialogues: [
    '嘿！想通过这里？先回答我的问题！',
    '编程的世界里，逻辑是最重要的！',
    '如果你能解决我的谜题，我就放你过去！',
    '不错嘛，看来你有点本事！',
    '哈哈，被难住了？再想想！',
  ],
  imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20friendly%20logic%20monster%20with%20big%20eyes&image_size=square',
  isDefeated: false,
};

const { width, height } = Dimensions.get('window');

export default function ExploreScreen() {
  const [map, setMap] = useState<AdventureMap | null>(null);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [showMonster, setShowMonster] = useState(false);
  const [currentMonster, setCurrentMonster] = useState<Monster | null>(null);
  const [stamina, setStamina] = useState(100);
  const [energy, setEnergy] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('生成探险地图中...');

  useEffect(() => {
    // 生成探险地图
    loadAdventureMap();
  }, []);

  const loadAdventureMap = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('生成AI学习路径地图中...');
      
      // 使用新的AI学习路径地图
      const aiMap = generateAIMap('ai');
      
      setMap(aiMap);
      setSelectedNode(aiMap.nodes.find(n => n.id === aiMap.currentNodeId)!);
    } catch (error) {
      console.error('Error loading adventure map:', error);
      // 使用AI学习路径地图
      const defaultMap = generateAIMap('ai');
      setMap(defaultMap);
      setSelectedNode(defaultMap.nodes.find(n => n.id === defaultMap.currentNodeId)!);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodePress = async (node: MapNode) => {
    if (!node.isDiscovered) {
      // 消耗体力
      setStamina(prev => Math.max(0, prev - 10));
      setEnergy(prev => Math.max(0, prev - 5));
      
      // 发现节点
      const updatedNodes = map!.nodes.map(n => 
        n.id === node.id ? { ...n, isDiscovered: true } : n
      );
      setMap(prev => ({ ...prev!, nodes: updatedNodes }));
      setSelectedNode({ ...node, isDiscovered: true });
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // 如果是怪物节点，使用 AI 生成怪物
      if (node.type === 'monster') {
        await generateAndShowMonster(node);
      }
    } else {
      setSelectedNode(node);
    }
  };

  const generateAndShowMonster = async (node: MapNode) => {
    try {
      setLoadingMessage('生成怪物中...');
      setIsLoading(true);
      
      // 生成怪物形象
      const monsterImageUrl = await generateMonsterImage(`${node.title}, ${node.description}`);
      
      // 生成怪物对话
      const monsterDialogue = await generateMonsterDialogue(
        '调皮但聪明，喜欢考验别人的逻辑思维',
        `玩家到达了「${node.title}」节点，需要挑战怪物才能继续前进`
      );
      
      // 创建怪物对象
      const monster: Monster = {
        id: `monster-${Date.now()}`,
        name: node.title,
        personality: '调皮但聪明，喜欢考验别人的逻辑思维',
        dialogues: [monsterDialogue, '不错嘛，看来你有点本事！', '哈哈，被难住了？再想想！', '编程的世界里，逻辑是最重要的！'],
        imageUrl: monsterImageUrl,
        isDefeated: false,
      };
      
      setCurrentMonster(monster);
      setShowMonster(true);
    } catch (error) {
      console.error('Error generating monster:', error);
      // 使用默认怪物
      setCurrentMonster(mockMonster);
      setShowMonster(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteNode = (node: MapNode) => {
    // 标记节点为完成
    const updatedNodes = map!.nodes.map(n => 
      n.id === node.id ? { ...n, isCompleted: true } : n
    );
    setMap(prev => ({ ...prev!, nodes: updatedNodes }));
    setSelectedNode({ ...node, isCompleted: true });
    
    // 解锁相邻节点
    const updatedEdges = map!.edges.map(edge => {
      if (edge.from === node.id) {
        return { ...edge, isUnlocked: true };
      }
      return edge;
    });
    setMap(prev => ({ ...prev!, edges: updatedEdges }));
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleMonsterDefeat = () => {
    // 标记怪物为击败
    setCurrentMonster(prev => ({ ...prev!, isDefeated: true }));
    setShowMonster(false);
    
    // 完成当前节点
    if (selectedNode && selectedNode.type === 'monster') {
      handleCompleteNode(selectedNode);
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // 打开学习资源链接
  const openResourceUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        console.error('无法打开链接:', url);
      }
    } catch (error) {
      console.error('打开链接失败:', error);
    }
  };

  // 根据节点类型返回颜色
  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'start': return '#4ecdc4';
      case 'resource': return '#3498db';
      case 'monster': return '#e74c3c';
      case 'treasure': return '#f39c12';
      case 'boss': return '#9b59b6';
      default: return '#7f8c8d';
    }
  };

  // 将节点类型转换为中文名称
  const getNodeTypeName = (type: string): string => {
    switch (type) {
      case 'start': return '起点';
      case 'resource': return '资源';
      case 'monster': return '怪物';
      case 'treasure': return '宝藏';
      case 'boss': return ' boss';
      default: return '未知';
    }
  };

  const drawEdge = (edge: MapEdge) => {
    const fromNode = map!.nodes.find(n => n.id === edge.from);
    const toNode = map!.nodes.find(n => n.id === edge.to);
    
    if (!fromNode || !toNode) return null;
    
    const fromX = (fromNode.x / 100) * width * 0.8 + width * 0.1;
    const fromY = (fromNode.y / 100) * height * 0.5 + height * 0.2;
    const toX = (toNode.x / 100) * width * 0.8 + width * 0.1;
    const toY = (toNode.y / 100) * height * 0.5 + height * 0.2;
    
    return (
      <View 
        key={edge.id}
        style={[
          styles.edge,
          {
            position: 'absolute',
            left: Math.min(fromX, toX),
            top: Math.min(fromY, toY),
            width: Math.abs(toX - fromX),
            height: Math.abs(toY - fromY),
            transform: [
              {
                rotate: `${Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI}deg`,
              },
            ],
            opacity: edge.isUnlocked ? 1 : 0.3,
          },
        ]}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ecdc4" />
        <Text style={styles.loadingText}>{loadingMessage}</Text>
      </View>
    );
  }

  if (!map) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载失败，请重试</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAdventureMap}>
          <Text style={styles.retryButtonText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* 资源状态栏 */}
      <View style={styles.statusBar}>
        <View style={styles.resourceBar}>
          <Text style={styles.resourceLabel}>体力</Text>
          <View style={styles.resourceProgress}>
            <View 
              style={[
                styles.resourceFill,
                { width: `${stamina}%`, backgroundColor: '#4ecdc4' }
              ]}
            />
          </View>
          <Text style={styles.resourceValue}>{stamina}/100</Text>
        </View>
        <View style={styles.resourceBar}>
          <Text style={styles.resourceLabel}>精力</Text>
          <View style={styles.resourceProgress}>
            <View 
              style={[
                styles.resourceFill,
                { width: `${energy}%`, backgroundColor: '#ff6b6b' }
              ]}
            />
          </View>
          <Text style={styles.resourceValue}>{energy}/100</Text>
        </View>
      </View>
      
      {/* 探险地图 */}
      <View style={styles.mapContainer}>
        <Text style={styles.mapTitle}>{map.name}</Text>
        
        <View style={styles.mapView}>
          {/* 绘制边 */}
          {map.edges.map(edge => drawEdge(edge))}
          
          {/* 绘制节点 */}
          {map.nodes.map((node) => {
            const nodeX = (node.x / 100) * width * 0.8 + width * 0.1;
            const nodeY = (node.y / 100) * height * 0.5 + height * 0.2;
            
            return (
              <TouchableOpacity
                key={node.id}
                style={[
                  styles.node,
                  {
                    position: 'absolute',
                    left: nodeX - 25,
                    top: nodeY - 25,
                  },
                  node.isCompleted && styles.nodeCompleted,
                  !node.isDiscovered && styles.nodeUndiscovered,
                ]}
                onPress={() => handleNodePress(node)}
                disabled={!node.isDiscovered && !map.edges.some(edge => 
                  edge.to === node.id && edge.isUnlocked
                )}
              >
                <Image 
                  source={{ uri: node.imageUrl }} 
                  style={[
                    styles.nodeImage,
                    !node.isDiscovered && styles.nodeImageUndiscovered,
                  ]}
                />
                <Text style={styles.nodeTitle}>{node.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      
      {/* 节点信息 */}
      {selectedNode && (
        <View style={styles.nodeInfo}>
          <Text style={styles.nodeInfoTitle}>{selectedNode.title}</Text>
          <View style={styles.nodeInfoMeta}>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>难度: {selectedNode.difficulty}/5</Text>
            </View>
            {selectedNode.type && (
              <View style={[styles.typeBadge, { backgroundColor: getTypeColor(selectedNode.type) }]}>
                <Text style={styles.typeText}>{getNodeTypeName(selectedNode.type)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.nodeInfoDescription}>{selectedNode.description}</Text>
          {selectedNode.reward && (
            <Text style={styles.nodeInfoReward}>奖励: {selectedNode.reward}</Text>
          )}
          {selectedNode.resourceUrl && (
            <TouchableOpacity 
              style={styles.resourceButton}
              onPress={() => openResourceUrl(selectedNode.resourceUrl!)}
            >
              <Text style={styles.resourceButtonText}>打开学习资源</Text>
            </TouchableOpacity>
          )}
          {selectedNode.isDiscovered && !selectedNode.isCompleted && (
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={() => handleCompleteNode(selectedNode)}
            >
              <Text style={styles.completeButtonText}>完成学习</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* 怪物对话 */}
      {showMonster && currentMonster && (
        <View style={styles.monsterDialog}>
          <Image 
            source={{ uri: currentMonster.imageUrl }} 
            style={styles.monsterImage}
          />
          <Text style={styles.monsterName}>{currentMonster.name}</Text>
          <Text style={styles.monsterDialogText}>
            {currentMonster.dialogues[Math.floor(Math.random() * currentMonster.dialogues.length)]}
          </Text>
          <View style={styles.monsterActions}>
            <TouchableOpacity 
              style={styles.monsterButton}
              onPress={handleMonsterDefeat}
            >
              <Text style={styles.monsterButtonText}>挑战</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.monsterButton, styles.monsterButtonSecondary]}
              onPress={() => setShowMonster(false)}
            >
              <Text style={styles.monsterButtonText}>稍后</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    fontSize: 18,
    color: '#4ecdc4',
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: '#4ecdc4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f7fff7',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#16213e',
    borderBottomWidth: 2,
    borderBottomColor: '#4ecdc4',
  },
  resourceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  resourceLabel: {
    fontSize: 14,
    color: '#f7fff7',
    marginRight: 10,
    width: 40,
  },
  resourceProgress: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 10,
  },
  resourceFill: {
    height: '100%',
    borderRadius: 5,
  },
  resourceValue: {
    fontSize: 12,
    color: '#a8dadc',
    width: 45,
  },
  mapContainer: {
    flex: 1,
    padding: 20,
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ecdc4',
    textAlign: 'center',
    marginBottom: 20,
  },
  mapView: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'rgba(22, 33, 62, 0.5)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4ecdc4',
  },
  edge: {
    position: 'absolute',
    backgroundColor: '#4ecdc4',
    height: 2,
  },
  node: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  nodeCompleted: {
    borderWidth: 2,
    borderColor: '#27ae60',
    borderRadius: 25,
  },
  nodeUndiscovered: {
    opacity: 0.6,
  },
  nodeImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  nodeImageUndiscovered: {
    opacity: 0.5,
  },
  nodeTitle: {
    fontSize: 10,
    color: '#f7fff7',
    marginTop: 2,
    textAlign: 'center',
  },
  nodeInfo: {
    backgroundColor: 'rgba(22, 33, 62, 0.8)',
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: '#4ecdc4',
  },
  nodeInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ecdc4',
    marginBottom: 10,
  },
  nodeInfoDescription: {
    fontSize: 14,
    color: '#a8dadc',
    marginBottom: 10,
  },
  nodeInfoReward: {
    fontSize: 14,
    color: '#ffd93d',
    marginBottom: 15,
  },
  completeButton: {
    backgroundColor: '#27ae60',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f7fff7',
  },
  
  // 节点信息元数据样式
  nodeInfoMeta: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  difficultyBadge: {
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3498db',
  },
  difficultyText: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: 'bold',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    color: '#f7fff7',
    fontWeight: 'bold',
  },
  
  // 资源按钮样式
  resourceButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  resourceButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f7fff7',
  },
  monsterDialog: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(22, 33, 62, 0.95)',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ff6b6b',
    alignItems: 'center',
  },
  monsterImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  monsterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 10,
  },
  monsterDialogText: {
    fontSize: 14,
    color: '#a8dadc',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  monsterActions: {
    flexDirection: 'row',
    gap: 10,
  },
  monsterButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  monsterButtonSecondary: {
    backgroundColor: 'rgba(255, 107, 107, 0.5)',
  },
  monsterButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f7fff7',
  },
});
