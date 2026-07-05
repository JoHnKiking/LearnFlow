import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../src/contexts/ThemeContext';
import { getCurrentUser } from '../src/utils/auth';
import { userService } from '../src/services/api';

type IdentityType = 'student' | 'worker';

interface DomainOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const STUDENT_DOMAINS: DomainOption[] = [
  {
    id: 'programming-basics',
    name: '编程基础',
    description: '零基础学Python，从Hello World到小项目实战',
    icon: 'code-slash',
  },
  {
    id: 'finance-basics',
    name: '理财入门',
    description: '学会记账、攒钱，让零花钱开始生钱',
    icon: 'wallet',
  },
  {
    id: 'cet-exam',
    name: '四六级过关',
    description: '词汇→听力→阅读→写作→翻译，全攻略备考',
    icon: 'school',
  },
  {
    id: 'advanced-math',
    name: '高等数学',
    description: '微分、积分、级数与微分方程，掌握核心方法',
    icon: 'calculator',
  },
  {
    id: 'college-cs',
    name: '大学生计算机基础',
    description: '计算机原理、操作系统、网络基础',
    icon: 'laptop',
  },
  {
    id: 'linear-algebra',
    name: '线性代数',
    description: '矩阵运算、向量空间、特征值，掌握基本工具',
    icon: 'grid',
  },
];

const WORKER_DOMAINS: DomainOption[] = [
  {
    id: 'ai-product-manager',
    name: 'AI产品经理',
    description: '掌握Prompt/RAG/Agent三大AI产品兵器',
    icon: 'hardware-chip',
  },
  {
    id: 'personal-finance',
    name: '理财进阶',
    description: '构建完整理财体系，从资产配置到指数定投',
    icon: 'trending-up',
  },
  {
    id: 'english-communication',
    name: '英语沟通',
    description: '开口→听懂→实战，三阶告别哑巴英语',
    icon: 'globe',
  },
];

const IdentitySelectionScreen = () => {
  const { colors, isDark } = useTheme();
  const [step, setStep] = useState<'identity' | 'domain'>('identity');
  const [selectedIdentity, setSelectedIdentity] = useState<IdentityType | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(1));

  const domains = selectedIdentity === 'student' ? STUDENT_DOMAINS : WORKER_DOMAINS;

  /** 根据 domain ID 返回模块主题色和 cardBg */
  const getDomainStyle = useCallback((domainId: string) => {
    const CATEGORY_MAP: Record<string, { color: string; cardBg: string }> = {
      'ai-product-manager': {
        color: colors.primary,
        cardBg: isDark ? 'rgba(123,117,216,0.10)' : 'rgba(90,84,160,0.12)',
      },
      'programming-basics': {
        color: colors.primary,
        cardBg: isDark ? 'rgba(123,117,216,0.10)' : 'rgba(90,84,160,0.12)',
      },
      'personal-finance': {
        color: colors.success,
        cardBg: isDark ? 'rgba(74,152,64,0.08)' : 'rgba(90,128,64,0.12)',
      },
      'finance-basics': {
        color: colors.success,
        cardBg: isDark ? 'rgba(74,152,64,0.08)' : 'rgba(90,128,64,0.12)',
      },
      'english-communication': {
        color: colors.orange,
        cardBg: isDark ? 'rgba(212,160,88,0.08)' : 'rgba(196,154,96,0.12)',
      },
      'cet-exam': {
        color: colors.orange,
        cardBg: isDark ? 'rgba(212,160,88,0.08)' : 'rgba(196,154,96,0.12)',
      },
      'advanced-math': {
        color: colors.brandPurple,
        cardBg: isDark ? 'rgba(184,146,200,0.10)' : 'rgba(166,120,176,0.12)',
      },
      'college-cs': {
        color: colors.brandPurple,
        cardBg: isDark ? 'rgba(184,146,200,0.10)' : 'rgba(166,120,176,0.12)',
      },
      'linear-algebra': {
        color: colors.brandPurple,
        cardBg: isDark ? 'rgba(184,146,200,0.10)' : 'rgba(166,120,176,0.12)',
      },
    };
    return CATEGORY_MAP[domainId] || { color: colors.primary, cardBg: colors.card };
  }, [colors, isDark]);

  const handleSelectIdentity = (identity: IdentityType) => {
    console.log('[Identity] 选择身份:', identity);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setSelectedIdentity(identity);
      setStep('domain');
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  const saveIdentityToBackend = async () => {
    try {
      const user = await getCurrentUser();
      if (user?.id && selectedIdentity) {
        await userService.updateIdentity(selectedIdentity);
        console.log('[Identity] 身份已保存到服务端:', selectedIdentity);
      }
    } catch (error) {
      console.warn('[Identity] 保存身份到服务端失败:', error);
    }
  };

  const handleStart = useCallback(async () => {
    // 保存身份到后端
    await saveIdentityToBackend();

    // 如果有选领域，直接覆写 selectedModules（新手引导阶段不应保留旧数据）
    if (selectedDomain) {
      await AsyncStorage.setItem('selectedModules', JSON.stringify([selectedDomain]));
    }

    console.log('[Identity] 完成新手引导，进入主应用');
    router.replace('/(tabs)');
  }, [selectedDomain, selectedIdentity]);

  const handleSkip = useCallback(async () => {
    await saveIdentityToBackend();
    console.log('[Identity] 跳过领域选择，进入主应用');
    router.replace('/(tabs)');
  }, []);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 48,
      paddingBottom: 32,
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 32,
    },
    stepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 26,
      fontWeight: '600',

      marginBottom: 8,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 14,

      textAlign: 'center',
      lineHeight: 22,
    },
    identityCards: {
      gap: 16,
    },
    identityCard: {
      borderRadius: 20,
      borderWidth: 2,
      padding: 24,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    identityIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    identityInfo: {
      flex: 1,
    },
    identityName: {
      fontSize: 20,
      fontWeight: '600',

      marginBottom: 4,
    },
    identityDesc: {
      fontSize: 13,

    },
    domainCards: {
      gap: 16,
    },
    domainCard: {
      borderRadius: 20,
      borderWidth: 2,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      overflow: 'hidden',
      position: 'relative',
    },
    domainCardSelected: {
      borderWidth: 2.5,
    },
    domainIconContainer: {
      width: 52,
      height: 52,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    domainInfo: {
      flex: 1,
    },
    domainName: {
      fontSize: 17,
      fontWeight: '600',

      marginBottom: 4,
    },
    domainDescription: {
      fontSize: 12,

      lineHeight: 18,
    },
    checkCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    skipSection: {
      marginTop: 24,
      alignItems: 'center',
    },
    skipButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
    skipText: {
      fontSize: 14,
      color: colors.textSecondary,

    },
    spacer: {
      flex: 1,
    },
    startButton: {
      paddingVertical: 16,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 24,
    },
    startButtonText: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: '600',

    },
  }), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 步骤指示器 */}
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, { backgroundColor: step === 'identity' ? colors.primary : colors.primary }]} />
          <View style={[styles.stepDot, { backgroundColor: step === 'domain' ? colors.primary : colors.border }]} />
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          {step === 'identity' ? (
            <>
              {/* 第一步：选择身份 */}
              <View style={styles.header}>
                <Text style={styles.title}>选择你的身份</Text>
                <Text style={styles.subtitle}>告诉我们你的状态，我们为你推荐最适合的学习内容</Text>
              </View>

              <View style={styles.identityCards}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSelectIdentity('student')}
                >
                  <View style={[styles.identityCard, {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  }]}>
                    <View style={[styles.identityIconContainer, { backgroundColor: '#4A90D9' + '20' }]}>
                      <Text style={{ fontSize: 32 }}>🎒</Text>
                    </View>
                    <View style={styles.identityInfo}>
                      <Text style={[styles.identityName, { color: colors.textPrimary }]}>我在上学</Text>
                      <Text style={[styles.identityDesc, { color: colors.textSecondary }]}>大学生/研究生，利用课余时间充电</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSelectIdentity('worker')}
                >
                  <View style={[styles.identityCard, {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  }]}>
                    <View style={[styles.identityIconContainer, { backgroundColor: '#7B75D8' + '20' }]}>
                      <Text style={{ fontSize: 32 }}>💼</Text>
                    </View>
                    <View style={styles.identityInfo}>
                      <Text style={[styles.identityName, { color: colors.textPrimary }]}>我已工作</Text>
                      <Text style={[styles.identityDesc, { color: colors.textSecondary }]}>职场人士，利用碎片时间提升竞争力</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* 第二步：选择学习领域 */}
              <View style={styles.header}>
                <Text style={styles.title}>推荐学习领域</Text>
                <Text style={styles.subtitle}>
                  根据你的身份，为你精选了以下学习方向
                </Text>
              </View>

              <View style={styles.domainCards}>
                {domains.map((domain) => {
                  const isSelected = selectedDomain === domain.id;
                  const ds = getDomainStyle(domain.id);
                  return (
                    <TouchableOpacity
                      key={domain.id}
                      activeOpacity={0.7}
                      onPress={() => setSelectedDomain(domain.id)}
                    >
                      <View style={[
                        styles.domainCard,
                        {
                          backgroundColor: isSelected ? ds.color + '15' : colors.card,
                          borderColor: isSelected ? ds.color : colors.border,
                        },
                        isDark && isSelected && { borderColor: ds.color },
                      ]}>
                        <View style={[styles.domainIconContainer, {
                          backgroundColor: ds.color,
                          shadowColor: isSelected ? ds.color : 'transparent',
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: isSelected ? 4 : 0,
                        }]}>
                          <Ionicons name={domain.icon as any} size={26} color="#FFFFFF" />
                        </View>
                        <View style={styles.domainInfo}>
                          <Text style={[styles.domainName, { color: isSelected ? ds.color : colors.textPrimary }]}>
                            {domain.name}
                          </Text>
                          <Text style={[styles.domainDescription, { color: colors.textSecondary }]}>
                            {domain.description}
                          </Text>
                        </View>
                        {isSelected && (
                          <View style={[styles.checkCircle, { backgroundColor: ds.color }]}>
                            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 跳过 */}
              <View style={styles.skipSection}>
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                  <Ionicons name="arrow-forward" size={14} color={colors.textSecondary} />
                  <Text style={styles.skipText}>以上没有感兴趣的，可在app内自主添加</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>

        <View style={styles.spacer} />

        {/* 底部按钮 */}
        {step === 'domain' && (
          <TouchableOpacity
            style={[
              styles.startButton,
              {
                backgroundColor: selectedDomain ? colors.primary : colors.surface,
                opacity: selectedDomain ? 1 : 0.5,
                shadowColor: selectedDomain ? colors.primary : 'transparent',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.35,
                shadowRadius: 24,
                elevation: selectedDomain ? 5 : 0,
              },
            ]}
            onPress={handleStart}
            disabled={!selectedDomain}
            activeOpacity={0.7}
          >
            <Text style={styles.startButtonText}>开始学习</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default IdentitySelectionScreen;
