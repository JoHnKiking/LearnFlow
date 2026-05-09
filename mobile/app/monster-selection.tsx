import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

type MonsterType = 'lively' | 'calm' | 'rebel';

const monsters = [
  {
    id: 'lively' as MonsterType,
    name: '活力小怪',
    personality: '元气满满',
    color: '#FF7D00',
    description: '适合快节奏碎片化学习',
    trait: '专属特权：单次学习任务时长直接减少 5 分钟',
  },
  {
    id: 'calm' as MonsterType,
    name: '沉稳小怪',
    personality: '冷静沉着',
    color: '#5D9BFA',
    description: '擅长深度思考',
    trait: '专属特权：每日额外赠送 20 点体力，可多 2 次知识节点跳转（原有基础 10 次，叠加后 12 次）',
  },
  {
    id: 'rebel' as MonsterType,
    name: '叛逆小怪',
    personality: '个性独立',
    color: '#7B5EA7',
    description: '有主见爱探索、敢于挑战',
    trait: '专属特权：小游戏获得的体力、能量全部双倍',
  },
];

const MonsterSelectionScreen = () => {
  const [selectedType, setSelectedType] = useState<MonsterType>('calm');
  const [monsterName, setMonsterName] = useState('');
  const [step, setStep] = useState<'select' | 'name'>('select');
  const [fadeAnim] = useState(new Animated.Value(1));

  const handleSelectMonster = (type: MonsterType) => {
    setSelectedType(type);
  };

  const handleContinue = async () => {
    if (step === 'select') {
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
      await AsyncStorage.setItem('monster', JSON.stringify(monsterData));
      router.replace('/module-selection');
    }
  };

  const selectedMonster = monsters.find(m => m.id === selectedType);

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
              {monsters.map((monster, index) => {
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
                          backgroundColor: isSelected ? monster.color : '#0F1030',
                          borderColor: monster.color,
                        },
                      ]}
                    >
                      <View style={styles.monsterCardContent}>
                        <View style={styles.monsterIconContainer}>
                          <MonsterIcon type={monster.id} size={80} />
                        </View>

                        <View style={styles.monsterInfo}>
                          <Text style={[styles.monsterName, { color: isSelected ? '#FFFFFF' : '#E8E8F0' }]}>
                            {monster.name}
                          </Text>
                          <Text style={[styles.monsterDescription, { color: isSelected ? 'rgba(255,255,255,0.9)' : '#8888AA' }]}>
                            {monster.description}
                          </Text>
                          <View
                            style={[
                              styles.traitBadge,
                              {
                                backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(93,155,250,0.15)',
                              },
                            ]}
                          >
                            <Text style={[styles.traitText, { color: isSelected ? '#FFFFFF' : monster.color }]}>
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
                placeholderTextColor="#555577"
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
                  ? '#2A2A4A'
                  : 'rgba(93,155,250,0.8)',
                opacity: step === 'name' && !monsterName.trim() ? 0.5 : 1,
                shadowColor: step === 'name' && !monsterName.trim() ? 'transparent' : COLORS.PRIMARY,
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

const MonsterIcon = ({ type, size }: { type: MonsterType; size: number }) => {
  const colors: Record<MonsterType, { primary: string; secondary: string }> = {
    lively: { primary: '#FF7D00', secondary: '#E66900' },
    calm: { primary: '#5D9BFA', secondary: '#4A7FD4' },
    rebel: { primary: '#7B5EA7', secondary: '#5A4280' },
  };

  const color = colors[type];
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
      {type === 'lively' && (
        <>
          <View style={[styles.sparkleIcon, { width: 4 * scale, height: 4 * scale, backgroundColor: '#FFD60A', left: 2 * scale, top: 8 * scale }]} />
          <View style={[styles.sparkleIcon, { width: 4 * scale, height: 4 * scale, backgroundColor: '#FFD60A', right: 2 * scale, top: 16 * scale }]} />
        </>
      )}
      {type === 'rebel' && (
        <>
          <View style={[styles.lightningIcon, { width: 4 * scale, height: 10 * scale, backgroundColor: '#FFD60A', left: 4 * scale, top: 10 * scale }]} />
        </>
      )}
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
    marginBottom: 32,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    fontFamily: 'Courier',
    marginBottom: 8,
  },
  subtitle: {
    color: '#8888AA',
    fontSize: 14,
    fontFamily: 'Courier',
  },
  monstersContainer: {
    gap: 16,
  },
  monsterCard: {
    borderRadius: 24,
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
    fontWeight: '700',
    fontFamily: 'Courier',
    marginBottom: 4,
  },
  monsterDescription: {
    fontSize: 12,
    fontFamily: 'Courier',
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
    fontFamily: 'Courier',
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
    color: '#FFD60A',
    fontSize: 12,
    fontFamily: 'Courier',
    fontWeight: '600',
  },
  checkMark: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    backgroundColor: '#0F1030',
    borderRadius: 16,
    borderWidth: 2,
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Courier',
    fontWeight: '700',
    textAlign: 'center',
  },
  charCount: {
    marginTop: 12,
    color: '#8888AA',
    fontSize: 12,
    fontFamily: 'Courier',
  },
  spacer: {
    flex: 1,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
});

export default MonsterSelectionScreen;
