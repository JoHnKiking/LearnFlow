import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import { storage, STORAGE_KEYS } from '../src/utils/storage';
import { MONSTER_CONFIG } from '../src/utils/constants';
import { monsterService } from '../src/services/api';
import { getCurrentUser } from '../src/utils/auth';
import MonsterIcon from '../src/components/MonsterIcon';

type MonsterType = 'lively' | 'calm' | 'rebel';

const MonsterSelectionScreen = () => {
  const { colors } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.replace('/login');
      }
    };
    checkAuth();
  }, []);

  const [selectedType, setSelectedType] = useState<MonsterType>('calm');
  const [monsterName, setMonsterName] = useState('');
  const [step, setStep] = useState<'select' | 'name'>('select');
  const [fadeAnim] = useState(new Animated.Value(1));

  const monsters = useMemo(() => [
    {
      id: 'lively' as MonsterType,
      name: '活力小怪',
      personality: '元气满满',
      color: colors.orange,
      // 选中背景用实色暖橘，与怪兽本身的亮橙拉开差异
      selectedBg: '#f1ddc5fe',
      description: '适合快节奏碎片化学习',
      trait: '专属特权：单次学习任务时长直接减少 5 分钟',
    },
    {
      id: 'calm' as MonsterType,
      name: '沉稳小怪',
      personality: '冷静沉着',
      color: MONSTER_CONFIG.COLORS.calm.primary,
      // 选中背景用实色浅粉，与怪兽本身的粉色调拉开差异
      selectedBg: '#f1c0d0ff',
      description: '擅长深度思考',
      trait: '专属特权：每日额外赠送 20 点体力，可多 2 次跳转',
    },
    {
      id: 'rebel' as MonsterType,
      name: '叛逆小怪',
      personality: '个性独立',
      color: MONSTER_CONFIG.COLORS.rebel.primary,
      // 选中背景用实色浅紫，与怪兽本身的紫色调拉开差异
      selectedBg: '#d0c0e8ff',
      description: '有主见爱探索、敢于挑战',
      trait: '专属特权：小游戏获得的体力、能量双倍',
    },
  ], [colors]);

  const handleSelectMonster = (type: MonsterType) => {
    console.log('[MonsterSelection] 选择怪物类型:', type);
    setSelectedType(type);
  };

  const handleContinue = async () => {
    if (step === 'select') {
      console.log('[MonsterSelection] 进入命名步骤');
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setStep('name');
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      const maxStamina = selectedType === 'calm' ? 120 : 100;
      const monsterData = {
        type: selectedType,
        name: monsterName || monsters.find(m => m.id === selectedType)?.name || '小怪兽',
        level: 1,
        exp: 0,
        stamina: maxStamina,
        maxStamina,
        paiEnergy: 50,
        maxPaiEnergy: 50,
        knowledgePoints: 0,
        createdAt: new Date().toISOString(),
      };
      console.log('[MonsterSelection] 创建怪物数据:', monsterData.name, '类型:', selectedType);
      await storage.setItem(STORAGE_KEYS.MONSTER, monsterData);
      console.log('[MonsterSelection] 怪物数据已保存到本地');

      try {
        const user = await getCurrentUser();
        if (user?.id) {
          console.log('[MonsterSelection] 同步怪物到服务端 - 用户ID:', user.id);
          await monsterService.createMonster({
            userId: user.id,
            name: monsterData.name,
            personality: selectedType,
          });
          console.log('[MonsterSelection] 怪物已同步到服务端');
        }
      } catch (error) {
        console.error('[MonsterSelection] 同步怪物到服务端失败:', error);
      }

      router.replace('/identity-selection');
    }
  };

  const selectedMonster = monsters.find(m => m.id === selectedType);

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
      
    },
    monstersContainer: {
      gap: 16,
    },
    monsterCard: {
      borderRadius: 20,
      borderWidth: 2,
      overflow: 'hidden',
    },
    monsterCardContent: {
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    monsterIconContainer: {
      flexShrink: 0,
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
    sparkleIcon: {
      position: 'absolute',
    },
    lightningIcon: {
      position: 'absolute',
    },
    monsterInfo: {
      flex: 1,
    },
    monsterName: {
      fontSize: 18,
      fontWeight: '600',
      
      marginBottom: 4,
    },
    monsterDescription: {
      fontSize: 12,
      
      marginBottom: 6,
    },
    traitBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    traitText: {
      fontSize: 11,
      fontWeight: '600',
      
    },
    tipContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,214,10,0.1)',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginTop: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,214,10,0.3)',
    },
    tipIcon: {
      fontSize: 16,
      marginRight: 8,
    },
    tipText: {
      color: colors.warning,
      fontSize: 12,
      
      fontWeight: '600',
    },
    checkMark: {
      width: 32,
      height: 32,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.3)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    nameInputContainer: {
      alignItems: 'center',
    },
    selectedMonsterIcon: {
      marginBottom: 24,
    },
    nameInput: {
      width: '100%',
      paddingHorizontal: 24,
      paddingVertical: 16,
      backgroundColor: colors.inputBg,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      color: colors.textPrimary,
      fontSize: 20,
      
      fontWeight: '600',
      textAlign: 'center',
    },
    charCount: {
      marginTop: 12,
      color: colors.textSecondary,
      fontSize: 12,
      
    },
    spacer: {
      flex: 1,
    },
    continueButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 24,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    continueButtonText: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: '600',
      
    },
  }), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.pixelBackground} />

          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <Text style={styles.title}>
              {step === 'select' ? '选择你的怪兽伙伴' : '给它起个名字吧'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'select' ? '每种怪兽都有独特的性格' : '这将是你最好的学习伙伴'}
            </Text>
          </Animated.View>

          {step === 'select' ? (
            <Animated.View style={[styles.monstersContainer, { opacity: fadeAnim }]}>
              {monsters.map((monster) => {
                const isSelected = selectedType === monster.id;
                return (
                  <TouchableOpacity
                    key={monster.id}
                    onPress={() => handleSelectMonster(monster.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.monsterCard,
                        {
                          backgroundColor: isSelected ? monster.selectedBg : colors.card,
                          borderColor: monster.color,
                        },
                      ]}
                    >
                      <View style={styles.monsterCardContent}>
                        <View style={styles.monsterIconContainer}>
                          <MonsterIcon type={monster.id} size={80} />
                        </View>

                        <View style={styles.monsterInfo}>
                          <Text style={[styles.monsterName, { color: isSelected ? monster.color : colors.textPrimary }]}>
                            {monster.name}
                          </Text>
                          <Text style={[styles.monsterDescription, { color: isSelected ? (monster.color + 'CC') : colors.textSecondary }]}>
                            {monster.description}
                          </Text>
                          <View
                            style={[
                              styles.traitBadge,
                              {
                                backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.borderLight,
                              },
                            ]}
                          >
                            <Text style={[styles.traitText, { color: monster.color }]}>
                              ✨ {monster.trait}
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
              <View style={styles.tipContainer}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.tipText}>温馨提示：选定小怪兽后，暂不支持更换修改</Text>
              </View>
            </Animated.View>
          ) : (
            <Animated.View style={[styles.nameInputContainer, { opacity: fadeAnim }]}>
              <View style={styles.selectedMonsterIcon}>
                <MonsterIcon type={selectedType} size={120} />
              </View>

              <TextInput
                style={[
                  styles.nameInput,
                  { borderColor: selectedMonster?.color },
                ]}
                value={monsterName}
                onChangeText={setMonsterName}
                placeholder={selectedMonster?.name || '小怪兽'}
                placeholderTextColor={colors.textTertiary}
                maxLength={12}
                autoFocus
              />

              <Text style={styles.charCount}>
                {monsterName.length}/12 字符
              </Text>
            </Animated.View>
          )}

          <View style={styles.spacer} />

          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor: step === 'name' && !monsterName.trim()
                  ? colors.surface
                  : colors.primary,
                opacity: step === 'name' && !monsterName.trim() ? 0.5 : 1,
                shadowColor: step === 'name' && !monsterName.trim() ? 'transparent' : colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: step === 'name' && !monsterName.trim() ? 0 : 0.35,
                shadowRadius: 24,
                elevation: step === 'name' && !monsterName.trim() ? 0 : 5,
              },
            ]}
            onPress={handleContinue}
            disabled={step === 'name' && !monsterName.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.continueButtonText}>
              {step === 'select' ? '确认选择' : '开始冒险'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MonsterSelectionScreen;
