import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../src/contexts/ThemeContext';
import MonsterIcon from '../src/components/MonsterIcon';
import { SPACING } from '../src/utils/constants';

const OnboardingPage2Screen = () => {
  const { colors } = useTheme();

  const handleNext = () => {
    console.log('[OnboardingPage2] 进入下一页');
    router.replace('/onboarding3');
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.XLARGE,
      paddingBottom: 100,
    },
    monstersRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    monsterGap: {
      width: 16,
    },
    dotsDecoration: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      width: 220,
      marginBottom: 24,
    },
    dot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      margin: 4,
      backgroundColor: colors.primary,
      opacity: 0.6,
    },
    companionText: {
      fontSize: 14,
      color: colors.textTertiary,
      marginBottom: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: SPACING.MEDIUM,
    },
    text: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: SPACING.SMALL,
      lineHeight: 24,
    },
    highlightText: {
      fontSize: 15,
      color: colors.primary,
      textAlign: 'center',
      marginTop: SPACING.MEDIUM,
    },
    footer: {
      position: 'absolute',
      bottom: 40,
      left: 0,
      right: 0,
      paddingHorizontal: SPACING.XLARGE,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
    },
    buttonArrow: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
      marginLeft: 4,
    },
    buttonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.monstersRow}>
          <MonsterIcon type="lively" size={80} />
          <View style={styles.monsterGap} />
          <MonsterIcon type="calm" size={80} />
          <View style={styles.monsterGap} />
          <MonsterIcon type="rebel" size={80} />
        </View>

        <View style={styles.dotsDecoration}>
          {Array.from({ length: 24 }).map((_, i) => (
            <View key={i} style={[styles.dot, { opacity: 0.3 + (i % 3) * 0.2 }]} />
          ))}
        </View>

        <Text style={styles.companionText}>三只小伙伴等你一起学习</Text>

        <Text style={styles.title}>一键生成学习路径</Text>
        <Text style={styles.text}>解锁学习节点，跳转学习资源，完成冒险</Text>
        <Text style={styles.highlightText}>完成不同时长的学习，会获得不同数量的 Π 能量</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.8}>
          <View style={styles.buttonRow}>
            <Text style={styles.buttonText}>开始</Text>
            <Text style={styles.buttonArrow}>{'>'}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingPage2Screen;
