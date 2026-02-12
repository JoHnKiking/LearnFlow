import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ImageBackground,
  Image,
  ActivityIndicator,
  TextInput,
  Animated
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { generateMonsterImage } from '../api/kimi';

// 领域数据接口
interface Domain {
  id: string;
  name: string;
  description: string;
  price: number;
  isUnlocked: boolean;
  imageUrl: string;
  progress: number;
}

// 模拟领域数据
const mockDomains: Domain[] = [
  {
    id: '1',
    name: '编程基础',
    description: '学习编程的基本概念和语法',
    price: 0, // 免费解锁
    isUnlocked: true,
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20programming%20domain%20with%20code%20symbols%20and%20digital%20elements&image_size=square',
    progress: 0,
  },
  {
    id: '2',
    name: '数学思维',
    description: '培养数学思维和解决问题的能力',
    price: 6,
    isUnlocked: false,
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20math%20domain%20with%20numbers%20and%20geometric%20shapes&image_size=square',
    progress: 0,
  },
  {
    id: '3',
    name: '语言学习',
    description: '学习新语言的词汇和语法',
    price: 6,
    isUnlocked: false,
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20language%20learning%20domain%20with%20letters%20and%20words&image_size=square',
    progress: 0,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [domains, setDomains] = useState<Domain[]>(mockDomains);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [showAdventure, setShowAdventure] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showMonsterCreation, setShowMonsterCreation] = useState(false);
  const [monsterName, setMonsterName] = useState('');
  const [generatedMonster, setGeneratedMonster] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [changeCount, setChangeCount] = useState(0);
  const [maxChangeCount] = useState(3);
  const [monsterOptions, setMonsterOptions] = useState<string[]>([]);
  const [selectedMonsterIndex, setSelectedMonsterIndex] = useState(0);
  
  // 小怪兽位置动画
  const monsterPosition = useRef(new Animated.Value(0)).current;

  // 加载用户数据
  useEffect(() => {
    loadUserData();
  }, []);
  
  // 当 introStep 改变时，更新小怪兽位置
  useEffect(() => {
    Animated.timing(monsterPosition, {
      toValue: introStep * 33,
      duration: 1000, // 1秒的动画
      useNativeDriver: false, // 因为我们要改变 left 属性，不能使用原生驱动
    }).start();
  }, [introStep, monsterPosition]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        // 加载用户的解锁状态和进度
        setIsFirstTime(false);
        setShowIntro(false);
        setUserName(parsedData.userName || '');
        setMonsterName(parsedData.monsterName || '');
      } else {
        // 首次启动
        setIsFirstTime(true);
        setShowIntro(true);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  };

  const saveUserData = async () => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify({
        unlockedDomains: domains.filter(d => d.isUnlocked).map(d => d.id),
        progress: domains.reduce((acc, domain) => {
          acc[domain.id] = domain.progress;
          return acc;
        }, {} as Record<string, number>),
      }));
    } catch (error) {
      console.error('保存用户数据失败:', error);
    }
  };

  const handleDomainSelect = (domain: Domain) => {
    if (domain.isUnlocked) {
      setSelectedDomain(domain);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // 导航到探险地图页面
      router.push('explore');
    } else {
      // 这里可以处理购买逻辑
      console.log('需要购买该领域:', domain.name);
    }
  };

  const handleDomainPurchase = (domain: Domain) => {
    // 模拟购买成功
    const updatedDomains = domains.map(d => 
      d.id === domain.id ? { ...d, isUnlocked: true } : d
    );
    setDomains(updatedDomains);
    saveUserData();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleNextIntroStep = () => {
    setIntroStep(prev => prev + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleStartAdventure = () => {
    setShowIntro(false);
    setShowMonsterCreation(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // 生成随机的怪物特征，增加多样性
  const getRandomMonsterFeatures = () => {
    // 更多颜色选项
    const colors = ['bright blue', 'vibrant green', 'sunny yellow', 'soft pink', 'deep purple', 'orange', 'cyan', 'magenta', 'lime green', 'sky blue', 'golden yellow', 'lavender', 'teal', 'coral', 'emerald'];
    
    // 更多身体特征
    const features = ['big eyes', 'small horns', 'wings', 'tail', 'fuzzy fur', 'glowing eyes', 'stripes', 'spots', 'antennae', 'floppy ears', 'sharp claws', 'round body', 'long neck', 'multiple eyes', 'spikes', 'feathers', 'scales', 'puffy cheeks', 'beak', 'tentacles'];
    
    // 更多性格特征
    const personalities = ['playful', 'curious', 'friendly', 'mischievous', 'gentle', 'energetic', 'wise', 'silly', 'brave', 'shy', 'creative', 'calm', 'excited', 'mysterious', 'cheerful'];
    
    // 更多环境灵感
    const environments = ['forest', 'mountain', 'ocean', 'space', 'castle', 'garden', 'cave', 'cloud', 'desert', 'volcano', 'ice land', 'swamp', 'city', 'meadow', 'underwater'];
    
    // 更多怪物类型
    const monsterTypes = ['cute', 'fantasy', 'magical', 'tech', 'nature', 'fire', 'water', 'earth', 'air', 'light', 'dark'];
    
    // 随机选择多个特征
    const getRandomItems = (array: string[], count: number) => {
      const shuffled = [...array].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };
    
    // 随机选择颜色
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    // 随机选择2-3个特征
    const selectedFeatures = getRandomItems(features, Math.floor(Math.random() * 2) + 2);
    
    // 随机选择性格
    const randomPersonality = personalities[Math.floor(Math.random() * personalities.length)];
    
    // 随机选择环境
    const randomEnvironment = environments[Math.floor(Math.random() * environments.length)];
    
    // 随机选择怪物类型
    const randomType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
    
    return {
      color: randomColor,
      features: selectedFeatures,
      personality: randomPersonality,
      environment: randomEnvironment,
      type: randomType
    };
  };

  const generateMonster = async () => {
    try {
      setIsGenerating(true);
      
      // 获取随机怪物特征
      const features = getRandomMonsterFeatures();
      
      // 构建更丰富的特征描述
      const featuresDescription = features.features.join(', ');
      
      // 根据用户名称和随机特征生成怪物提示词
      const prompt = `cute friendly learning monster for ${userName || 'adventurer'}, pixel art style, ${features.color}, 8-bit graphics, ${featuresDescription}, ${features.personality} personality, inspired by ${features.environment}, ${features.type} type monster, ${monsterName ? `named ${monsterName}` : ''}, unique design, completely different from previous monsters, vibrant colors, cute but with character, high quality pixel art`;
      
      console.log('生成怪物的prompt:', prompt);
      
      const monsterImage = await generateMonsterImage(prompt);
      
      // 添加到怪物选项数组中
      setMonsterOptions(prev => [...prev, monsterImage]);
      // 更新当前选中的怪物为新生成的
      setSelectedMonsterIndex(prev => prev + 1);
      setGeneratedMonster(monsterImage);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('生成怪物失败:', error);
      // 生成更随机的fallback图像
      const randomFeatures = getRandomMonsterFeatures();
      const fallbackPrompt = `pixel style friendly monster with ${randomFeatures.features[0]}, ${randomFeatures.color}, ${randomFeatures.environment} theme, ${Math.random()}`;
      const fallbackImage = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(fallbackPrompt)}&image_size=square`;
      setMonsterOptions(prev => [...prev, fallbackImage]);
      setSelectedMonsterIndex(prev => prev + 1);
      setGeneratedMonster(fallbackImage);
    } finally {
      setIsGenerating(false);
    }
  };

  const changeMonster = async () => {
    if (changeCount < maxChangeCount) {
      setChangeCount(prev => prev + 1);
      await generateMonster();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleConfirmMonster = () => {
    // 保存怪物信息
    const userData = {
      userName: userName || '冒险者',
      monsterName: monsterName || '学习伙伴',
      monsterImage: generatedMonster,
      unlockedDomains: ['1'],
      progress: { '1': 0 }
    };
    AsyncStorage.setItem('userData', JSON.stringify(userData));
    
    setShowMonsterCreation(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // 重置用户数据，重新体验用户旅程
  const resetUserData = async () => {
    try {
      // 清除存储的用户数据
      await AsyncStorage.removeItem('userData');
      
      // 重置状态
      setIsFirstTime(true);
      setShowIntro(true);
      setShowMonsterCreation(false);
      setUserName('');
      setMonsterName('');
      setGeneratedMonster('');
      setMonsterOptions([]);
      setSelectedMonsterIndex(0);
      setChangeCount(0);
      setIntroStep(0);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log('用户数据已重置，可以重新体验旅程');
    } catch (error) {
      console.error('重置用户数据失败:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* 引导流程 - 小怪兽走路版 */}
      {showIntro && (
        <View style={styles.walkingIntroContainer}>
          {/* 背景地图 */}
          <Image 
            source={{ uri: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20adventure%20path%20with%20grass%20and%20trees%20on%20sides&image_size=landscape_16_9' }} 
            style={styles.walkingMap}
            resizeMode="cover"
          />
          
          {/* 小怪兽 */}
          <Animated.View style={{
            position: 'absolute',
            left: monsterPosition.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            bottom: '10%',
          }}>
            <Image 
              source={{ uri: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20cute%20walking%20monster%20with%20friendly%20face&image_size=square' }} 
              style={styles.walkingMonster}
            />
          </Animated.View>
          
          {/* 弹窗 */}
          <View style={styles.introPopup}>
            {introStep === 0 && (
              <View style={styles.popupContent}>
                <Image 
                  source={{ uri: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20game%20logo%20LearnFlow&image_size=square' }} 
                  style={styles.popupImage}
                />
                <Text style={styles.popupTitle}>欢迎来到 LearnFlow！</Text>
                <Text style={styles.popupText}>
                  这是一个将学习变成探险的神奇世界！
                  通过游戏化的方式，让学习变得更加有趣和高效。
                </Text>
                <View style={styles.popupButtons}>
                  <TouchableOpacity 
                    style={styles.popupButton}
                    onPress={handleNextIntroStep}
                  >
                    <Text style={styles.popupButtonText}>开始冒险</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {introStep === 1 && (
              <View style={styles.popupContent}>
                <Image 
                  source={{ uri: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20adventure%20map%20with%20nodes&image_size=square' }} 
                  style={styles.popupImage}
                />
                <Text style={styles.popupTitle}>探索知识地图</Text>
                <Text style={styles.popupText}>
                  每个领域都有独特的探险地图，
                  你需要探索节点、完成任务、解锁知识宝藏。
                </Text>
                <View style={styles.popupButtons}>
                  <TouchableOpacity 
                    style={styles.popupButton}
                    onPress={handleNextIntroStep}
                  >
                    <Text style={styles.popupButtonText}>了解更多</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {introStep === 2 && (
              <View style={styles.popupContent}>
                <Image 
                  source={{ uri: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20friendly%20monster%20character&image_size=square' }} 
                  style={styles.popupImage}
                />
                <Text style={styles.popupTitle}>结识怪物伙伴</Text>
                <Text style={styles.popupText}>
                  你将拥有一个独特的怪物伙伴，
                  它会陪伴你学习，有时也会考验你的知识。
                </Text>
                <View style={styles.popupButtons}>
                  <TouchableOpacity 
                    style={styles.popupButton}
                    onPress={handleStartAdventure}
                  >
                    <Text style={styles.popupButtonText}>创建伙伴</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
      
      {/* 怪物生成界面 */}
      {showMonsterCreation && (
        <View style={styles.monsterCreationContainer}>
          <ScrollView style={styles.monsterCreationScroll}>
            <Text style={styles.monsterCreationTitle}>创建你的怪物伙伴</Text>
            <Text style={styles.monsterCreationSubtitle}>它将陪伴你度过整个学习之旅</Text>
            
            <View style={styles.monsterPreview}>
              {generatedMonster ? (
                <Image 
                  source={{ uri: generatedMonster }} 
                  style={styles.monsterImage}
                />
              ) : (
                <View style={styles.monsterPlaceholder}>
                  <Text style={styles.monsterPlaceholderText}>输入你的名字并点击生成怪物</Text>
                </View>
              )}
            </View>
            
            {/* 怪物选择选项 */}
            {monsterOptions.length > 0 && (
              <View style={styles.monsterOptions}>
                <Text style={styles.monsterOptionsTitle}>选择你的怪物伙伴：</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.monsterOptionsScroll}
                >
                  {monsterOptions.map((monster, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.monsterOption,
                        selectedMonsterIndex === index && styles.monsterOptionSelected
                      ]}
                      onPress={() => {
                        setSelectedMonsterIndex(index);
                        setGeneratedMonster(monster);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <Image 
                        source={{ uri: monster }} 
                        style={styles.monsterOptionImage}
                      />
                      <Text style={styles.monsterOptionNumber}>#{index + 1}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            
            <View style={styles.monsterNameInput}>
              <Text style={styles.monsterNameLabel}>请输入你的名字：</Text>
              <TextInput
                style={styles.monsterNameInputTextInput}
                placeholder="输入你的名字..."
                value={userName}
                onChangeText={setUserName}
                returnKeyType="next"
              />
              
              <Text style={styles.monsterNameLabel}>给你的怪物起个名字：</Text>
              <TextInput
                style={styles.monsterNameInputTextInput}
                placeholder="输入怪物名字..."
                value={monsterName}
                onChangeText={setMonsterName}
                returnKeyType="done"
                onSubmitEditing={generateMonster}
              />
              
              <TouchableOpacity 
                style={styles.generateButton}
                onPress={generateMonster}
                disabled={isGenerating || !userName}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#f7fff7" />
                ) : (
                  <Text style={styles.generateButtonText}>生成怪物</Text>
                )}
              </TouchableOpacity>
              
              {generatedMonster && (
                <TouchableOpacity 
                  style={[
                    styles.changeButton,
                    changeCount >= maxChangeCount && styles.changeButtonDisabled
                  ]}
                  onPress={changeMonster}
                  disabled={changeCount >= maxChangeCount || isGenerating}
                >
                  <Text style={styles.changeButtonText}>
                    换一换 ({changeCount}/{maxChangeCount})
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleConfirmMonster}
                disabled={!generatedMonster}
              >
                <Text style={styles.confirmButtonText}>确认伙伴</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}
      
      {/* 主界面 */}
      {!showIntro && !showMonsterCreation && (
        <ScrollView style={styles.scrollView}>
          {/* 游戏标题 */}
          <View style={styles.header}>
            <Image 
              source={{ uri: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20LearnFlow%20logo%20with%20wizard%20hat&image_size=square' }} 
              style={styles.logo}
            />
            <Text style={styles.title}>LearnFlow</Text>
            <Text style={styles.subtitle}>智能学习探险</Text>
          </View>

          {/* 游戏介绍 */}
          <View style={styles.intro}>
            <Text style={styles.introText}>
              选择一个领域开始你的学习探险之旅！
              通过探索地图、与怪物互动，解锁知识宝藏。
            </Text>
          </View>

          {/* 领域选择 */}
          <View style={styles.domainsSection}>
            <Text style={styles.sectionTitle}>学习领域</Text>
            
            <View style={styles.domainsGrid}>
              {domains.map((domain) => (
                <TouchableOpacity
                  key={domain.id}
                  style={[styles.domainCard, !domain.isUnlocked && styles.domainCardLocked]}
                  onPress={() => handleDomainSelect(domain)}
                  activeOpacity={0.8}
                >
                  <ImageBackground
                    source={{ uri: domain.imageUrl }}
                    style={styles.domainImage}
                    imageStyle={styles.domainImageStyle}
                  >
                    <View style={styles.domainOverlay}>
                      <Text style={styles.domainName}>{domain.name}</Text>
                      <Text style={styles.domainDescription} numberOfLines={2}>
                        {domain.description}
                      </Text>
                      {!domain.isUnlocked && (
                        <View style={styles.priceTag}>
                          <Text style={styles.priceText}>¥{domain.price}</Text>
                        </View>
                      )}
                      {domain.isUnlocked && domain.progress > 0 && (
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressFill, 
                              { width: `${domain.progress}%` }
                            ]}
                          />
                          <Text style={styles.progressText}>{domain.progress}%</Text>
                        </View>
                      )}
                    </View>
                  </ImageBackground>
                  {!domain.isUnlocked && (
                    <TouchableOpacity
                      style={styles.purchaseButton}
                      onPress={() => handleDomainPurchase(domain)}
                    >
                      <Text style={styles.purchaseButtonText}>购买</Text>
                    </TouchableOpacity>
                  )}
                  {domain.isUnlocked && (
                    <View style={styles.unlockedBadge}>
                      <Text style={styles.unlockedBadgeText}>已解锁</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 游戏特色 */}
          <View style={styles.features}>
            <Text style={styles.sectionTitle}>游戏特色</Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>🎮</Text>
                </View>
                <Text style={styles.featureText}>游戏化学习体验</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>🧠</Text>
                </View>
                <Text style={styles.featureText}>AI 生成探险内容</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>👾</Text>
                </View>
                <Text style={styles.featureText}>有个性的怪物伙伴</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>📚</Text>
                </View>
                <Text style={styles.featureText}>知识图谱解锁</Text>
              </View>
            </View>
          </View>
          
          {/* 重置按钮 - 用于重新体验用户旅程 */}
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetUserData}
          >
            <Text style={styles.resetButtonText}>重新体验旅程</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  
  // 引导流程样式
  introContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  introScroll: {
    flex: 1,
    padding: 20,
  },
  introStep: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  introImage: {
    width: 200,
    height: 200,
    marginBottom: 30,
    borderRadius: 20,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4ecdc4',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  introText: {
    fontSize: 16,
    color: '#f7fff7',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  
  // 小怪兽走路引导样式
  walkingIntroContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#1a1a2e',
  },
  walkingMap: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  walkingMonster: {
    position: 'absolute',
    width: 80,
    height: 80,
  },
  introPopup: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(22, 33, 62, 0.95)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#4ecdc4',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  popupContent: {
    alignItems: 'center',
  },
  popupImage: {
    width: 120,
    height: 120,
    borderRadius: 15,
    marginBottom: 20,
  },
  popupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ecdc4',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  popupText: {
    fontSize: 16,
    color: '#a8dadc',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  popupButtons: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
  },
  popupButton: {
    backgroundColor: '#4ecdc4',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2c3e50',
  },
  popupButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f7fff7',
  },
  nextButton: {
    backgroundColor: '#4ecdc4',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#2c3e50',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f7fff7',
  },
  
  // 怪物生成界面样式
  monsterCreationContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  monsterCreationScroll: {
    flex: 1,
    padding: 20,
  },
  monsterCreationTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4ecdc4',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  monsterCreationSubtitle: {
    fontSize: 16,
    color: '#a8dadc',
    textAlign: 'center',
    marginBottom: 40,
  },
  monsterPreview: {
    alignItems: 'center',
    marginBottom: 30,
  },
  monsterImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#ff6b6b',
  },
  monsterPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#16213e',
    borderWidth: 4,
    borderColor: '#4ecdc4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monsterPlaceholderText: {
    fontSize: 14,
    color: '#a8dadc',
    textAlign: 'center',
  },
  generateButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#2c3e50',
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f7fff7',
  },
  monsterNameInput: {
    backgroundColor: 'rgba(22, 33, 62, 0.8)',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4ecdc4',
  },
  monsterNameLabel: {
    fontSize: 16,
    color: '#f7fff7',
    marginBottom: 15,
    textAlign: 'center',
  },
  monsterNameInputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4ecdc4',
  },
  monsterNameInputText: {
    fontSize: 16,
    color: '#f7fff7',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2c3e50',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f7fff7',
  },
  monsterNameInputTextInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#4ecdc4',
    color: '#f7fff7',
    fontSize: 16,
    textAlign: 'center',
  },
  changeButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#2c3e50',
  },
  changeButtonDisabled: {
    backgroundColor: '#7f8c8d',
    borderColor: '#34495e',
  },
  changeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f7fff7',
  },
  
  // 主界面样式
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4ecdc4',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 18,
    color: '#f7fff7',
    marginTop: 10,
    fontFamily: 'monospace',
  },
  intro: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#4ecdc4',
  },
  domainsSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ecdc4',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  domainsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  domainCard: {
    width: '48%',
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#16213e',
    borderWidth: 2,
    borderColor: '#4ecdc4',
    position: 'relative',
  },
  domainCardLocked: {
    borderColor: '#ff6b6b',
    opacity: 0.8,
  },
  domainImage: {
    width: '100%',
    height: 150,
  },
  domainImageStyle: {
    borderRadius: 12,
  },
  domainOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    padding: 15,
  },
  domainName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f7fff7',
    marginBottom: 5,
  },
  domainDescription: {
    fontSize: 12,
    color: '#a8dadc',
    marginBottom: 10,
  },
  priceTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  priceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f7fff7',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ecdc4',
  },
  progressText: {
    position: 'absolute',
    top: -15,
    right: 10,
    fontSize: 10,
    color: '#4ecdc4',
    fontWeight: 'bold',
  },
  purchaseButton: {
    backgroundColor: '#ff6b6b',
    padding: 10,
    alignItems: 'center',
  },
  purchaseButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f7fff7',
  },
  unlockedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#27ae60',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  unlockedBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f7fff7',
  },
  features: {
    marginBottom: 40,
  },
  featuresList: {
    backgroundColor: 'rgba(22, 33, 62, 0.8)',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4ecdc4',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 16,
    color: '#f7fff7',
  },
  
  // 怪物选项样式
  monsterOptions: {
    marginVertical: 20,
  },
  monsterOptionsTitle: {
    fontSize: 16,
    color: '#f7fff7',
    textAlign: 'center',
    marginBottom: 15,
  },
  monsterOptionsScroll: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  monsterOption: {
    marginHorizontal: 10,
    alignItems: 'center',
  },
  monsterOptionSelected: {
    transform: [{ scale: 1.1 }],
  },
  monsterOptionImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#4ecdc4',
  },
  monsterOptionNumber: {
    marginTop: 5,
    fontSize: 12,
    color: '#a8dadc',
    fontWeight: 'bold',
  },
  
  // 重置按钮样式
  resetButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 30,
    borderWidth: 2,
    borderColor: '#2c3e50',
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f7fff7',
  },
});