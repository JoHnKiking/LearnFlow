import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../src/contexts/ThemeContext';
import { SPACING } from '../src/utils/constants';

const OnboardingPage3Screen = () => {
  const { colors } = useTheme();

  const handleNext = () => {
    console.log('[OnboardingPage3] 进入怪兽选择');
    router.replace('/monster-selection');
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
    nodeGraph: {
      width: 220,
      height: 220,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 40,
    },
    centerNode: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },
    centerNodeText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    topNode: {
      position: 'absolute',
      top: 0,
      alignItems: 'center',
    },
    leftNode: {
      position: 'absolute',
      left: 0,
      top: '50%',
      marginTop: -30,
      alignItems: 'center',
    },
    rightNode: {
      position: 'absolute',
      right: 0,
      top: '50%',
      marginTop: -30,
      alignItems: 'center',
    },
    bottomNode: {
      position: 'absolute',
      bottom: 0,
      alignItems: 'center',
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    iconText: {
      fontSize: 24,
    },
    nodeLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    lineHorizontal: {
      position: 'absolute',
      width: 60,
      height: 2,
      backgroundColor: 'rgba(255,255,255,0.15)',
      top: '50%',
      marginTop: -16,
    },
    lineVertical: {
      position: 'absolute',
      width: 2,
      height: 50,
      backgroundColor: 'rgba(255,255,255,0.15)',
      left: '50%',
      marginLeft: -1,
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
        <View style={styles.nodeGraph}>
          <View style={styles.lineVertical} />
          <View style={[styles.lineHorizontal, { left: 30 }]} />
          <View style={[styles.lineHorizontal, { right: 30 }]} />

          <View style={styles.topNode}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🔗</Text>
            </View>
            <Text style={styles.nodeLabel}>学习资源</Text>
          </View>

          <View style={styles.leftNode}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🍅</Text>
            </View>
            <Text style={styles.nodeLabel}>番茄钟</Text>
          </View>

          <View style={styles.centerNode}>
            <Text style={styles.centerNodeText}>知识节点</Text>
          </View>

          <View style={styles.rightNode}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>⭐</Text>
            </View>
            <Text style={styles.nodeLabel}>成就奖励</Text>
          </View>

          <View style={styles.bottomNode}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🎯</Text>
            </View>
            <Text style={styles.nodeLabel}>学习目标</Text>
          </View>
        </View>

        <Text style={styles.title}>体力与成长</Text>
        <Text style={styles.text}>每次跳转学习会消耗体力，请珍惜</Text>
        <Text style={styles.highlightText}>通过趣味游戏可以恢复体力，继续前进</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.8}>
          <View style={styles.buttonRow}>
            <Text style={styles.buttonText}>开始冒险</Text>
            <Text style={styles.buttonArrow}>{'>'}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingPage3Screen;
