import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CUTE_COLORS, SPACING, BORDER_RADIUS } from '../src/utils/constants';

const OnboardingScreen = () => {
  const [step, setStep] = useState(1);
  const [monsterName, setMonsterName] = useState('');
  const [selectedPersonality, setSelectedPersonality] = useState<'cheerful' | 'calm' | 'rebellious' | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const personalities = [
    { key: 'cheerful' as const, label: '活泼', description: '充满活力，积极向上！', color: CUTE_COLORS.GOLD },
    { key: 'calm' as const, label: '沉稳', description: '冷静思考，专注学习', color: CUTE_COLORS.SKY_BLUE },
    { key: 'rebellious' as const, label: '叛逆', description: '有自己的想法和节奏', color: CUTE_COLORS.PURPLE },
  ];

  const domains = [
    { key: '编程探险', label: '编程探险', description: '学习编程技能', color: CUTE_COLORS.SKY_BLUE },
    { key: '英语秘境', label: '英语秘境', description: '探索英语世界', color: CUTE_COLORS.MINT },
    { key: '自定义', label: '自定义', description: '创建你自己的领域', color: CUTE_COLORS.PINK },
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>欢迎来到知识星球!</Text>
      <View style={styles.textBox}>
        <Text style={styles.text}>
          在遥远的知识星球，每个学习者都有一只伴生怪兽。
          它们以"好奇心"为食，但学习之路充满诱惑与疲惫。
        </Text>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
        <Text style={styles.buttonText}>开始冒险！</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>孵化你的小怪兽</Text>
      <View style={styles.monsterBox}>
        <Text style={styles.monsterEmoji}>🐲</Text>
      </View>
      <TextInput
        value={monsterName}
        onChangeText={setMonsterName}
        placeholder="给你的怪兽起个名字"
        placeholderTextColor={CUTE_COLORS.GRAY}
        style={styles.input}
      />
      <Text style={styles.subtitle}>选择性格</Text>
      <View style={styles.optionsContainer}>
        {personalities.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[
              styles.optionButton,
              selectedPersonality === p.key && styles.optionButtonActive,
              { backgroundColor: selectedPersonality === p.key ? p.color : CUTE_COLORS.WHITE }
            ]}
            onPress={() => setSelectedPersonality(p.key)}
          >
            <Text style={[
              styles.optionButtonText,
              selectedPersonality === p.key && styles.optionButtonTextActive
            ]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.secondaryButton, { flex: 1, marginRight: SPACING.SMALL }]} 
          onPress={handleBack}
        >
          <Text style={styles.buttonText}>返回</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { flex: 1, marginLeft: SPACING.SMALL },
            (!monsterName || !selectedPersonality) && styles.buttonDisabled
          ]}
          onPress={handleNext}
          disabled={!monsterName || !selectedPersonality}
        >
          <Text style={styles.buttonText}>下一步</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>选择学习领域</Text>
      <View style={styles.optionsContainer}>
        {domains.map((d) => (
          <TouchableOpacity
            key={d.key}
            style={[
              styles.optionButton,
              selectedDomain === d.key && styles.optionButtonActive,
              { backgroundColor: selectedDomain === d.key ? d.color : CUTE_COLORS.WHITE }
            ]}
            onPress={() => setSelectedDomain(d.key)}
          >
            <Text style={[
              styles.optionButtonText,
              selectedDomain === d.key && styles.optionButtonTextActive
            ]}>
              {d.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.textBox}>
        <Text style={styles.text}>
          准备好了吗？让我们的冒险开始吧！
        </Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.secondaryButton, { flex: 1, marginRight: SPACING.SMALL }]} 
          onPress={handleBack}
        >
          <Text style={styles.buttonText}>返回</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { flex: 1, marginLeft: SPACING.SMALL },
            !selectedDomain && styles.buttonDisabled
          ]}
          onPress={handleNext}
          disabled={!selectedDomain}
        >
          <Text style={styles.buttonText}>开始学习！</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>✨ LearnFlow</Text>
          <Text style={styles.progressText}>Step {step}/3</Text>
        </View>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CUTE_COLORS.WARM_WHITE,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.LARGE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.XLARGE,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: CUTE_COLORS.PINK,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: CUTE_COLORS.DARK_GRAY,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: CUTE_COLORS.DARK_GRAY,
    marginBottom: SPACING.LARGE,
    textAlign: 'center',
  },
  textBox: {
    backgroundColor: CUTE_COLORS.CREAM,
    borderRadius: BORDER_RADIUS.LARGE,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  text: {
    fontSize: 16,
    color: CUTE_COLORS.DARK_GRAY,
    lineHeight: 24,
  },
  monsterBox: {
    backgroundColor: CUTE_COLORS.PINK,
    borderRadius: BORDER_RADIUS.XLARGE,
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.LARGE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  monsterEmoji: {
    fontSize: 80,
  },
  input: {
    height: 52,
    borderWidth: 2,
    borderColor: CUTE_COLORS.LIGHT_PINK,
    backgroundColor: CUTE_COLORS.WHITE,
    borderRadius: BORDER_RADIUS.MEDIUM,
    paddingHorizontal: SPACING.MEDIUM,
    fontSize: 16,
    color: CUTE_COLORS.DARK_GRAY,
    marginBottom: SPACING.LARGE,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CUTE_COLORS.DARK_GRAY,
    marginBottom: SPACING.MEDIUM,
  },
  optionsContainer: {
    marginBottom: SPACING.LARGE,
  },
  optionButton: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.MEDIUM,
    marginBottom: SPACING.SMALL,
    borderWidth: 2,
    borderColor: CUTE_COLORS.LIGHT_PINK,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  optionButtonActive: {
    borderWidth: 0,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: CUTE_COLORS.DARK_GRAY,
  },
  optionButtonTextActive: {
    color: CUTE_COLORS.WHITE,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: CUTE_COLORS.PINK,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.MEDIUM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: CUTE_COLORS.SKY_BLUE,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.MEDIUM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: CUTE_COLORS.GRAY,
  },
  buttonText: {
    color: CUTE_COLORS.WHITE,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default OnboardingScreen;
