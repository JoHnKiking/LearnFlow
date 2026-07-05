import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MonsterIcon from '../src/components/MonsterIcon';
import { useTheme } from '../src/contexts/ThemeContext';

const STORY_FRAMES = [
  {
    title: '欢迎来到元气星',
    text: '你可以认领小怪兽陪伴你的学习',
    subtext: '在这里，他们生存的重要资源是Π能量和体力',
  },
  {
    title: '一键生成学习路径',
    text: '解锁学习节点，跳转学习资源，完成冒险',
    subtext: '完成不同时长的学习，会获得不同数量的 Π 能量',
  },
  {
    title: '体力与成长',
    text: '每次跳转学习会消耗体力，请珍惜',
    subtext: '通过趣味游戏可以恢复体力，继续前进',
  },
];

// 入口模式：仅第1帧 → 登录页
const ENTRY_FRAMES = [STORY_FRAMES[0]];
// 新手模式：第2、3帧 → 怪兽选择
const TUTORIAL_FRAMES = [STORY_FRAMES[1], STORY_FRAMES[2]];

const useStoryAnimation = (frames: typeof STORY_FRAMES, isTutorial: boolean) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const slideAnimation = useState(new Animated.Value(0))[0];

  const switchFrame = useCallback((nextFrame: number) => {
    Animated.timing(slideAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentFrame(nextFrame);
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }, [slideAnimation]);

  const totalFrames = frames.length;

  const goToNextFrame = useCallback(() => {
    if (currentFrame < totalFrames - 1) {
      switchFrame(currentFrame + 1);
    } else {
      if (isTutorial) {
        router.replace('/monster-selection');
      } else {
        router.replace('/login');
      }
    }
  }, [currentFrame, totalFrames, switchFrame, isTutorial]);

  const skipToNext = useCallback(() => {
    if (isTutorial) {
      router.replace('/monster-selection');
    } else {
      router.replace('/login');
    }
  }, [isTutorial]);

  return {
    currentFrame,
    slideAnimation,
    goToNextFrame,
    skipToNext,
    switchFrame,
  };
};

const StoryScreen = () => {
  const { colors } = useTheme();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isTutorial = mode === 'tutorial';
  const frames = isTutorial ? TUTORIAL_FRAMES : ENTRY_FRAMES;

  const { currentFrame, slideAnimation, goToNextFrame, skipToNext, switchFrame } = useStoryAnimation(frames, isTutorial);
  const currentStory = frames[currentFrame];
  const isLastFrame = currentFrame === frames.length - 1;

  const animatedStyle = {
    transform: [
      {
        translateX: slideAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -50],
        }),
      },
    ],
    opacity: slideAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 48,
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
      backgroundColor: 'transparent',
    },
    skipButton: {
      position: 'absolute',
      top: 48,
      right: 24,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      zIndex: 10,
    },
    skipText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    backButton: {
      position: 'absolute',
      top: 48,
      left: 24,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      zIndex: 10,
    },
    storyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 96,
    },
    storyContent: {
      alignItems: 'center',
      width: '100%',
    },
    illustrationContainer: {
      marginBottom: 48,
    },
    illustration: {
      width: 180,
      height: 180,
      position: 'relative',
    },
    title: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: '600',
      lineHeight: 30,
      textAlign: 'center',
      marginBottom: 12,
    },
    text: {
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 26,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtext: {
      color: colors.accentGreen,
      fontSize: 14,
      lineHeight: 22,
      textAlign: 'center',
    },
    progressContainer: {
      position: 'absolute',
      bottom: 128,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    progressDot: {
      width: 8,
      height: 8,
    },
    nextButton: {
      position: 'absolute',
      bottom: 32,
      left: 24,
      right: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
      backgroundColor: colors.primary,
      borderRadius: 9999,
      overflow: 'hidden',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 5,
    },
    nextButtonText: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    // ---- 欢迎页：三怪兽 + 像素泥土 ----
    welcomeScene: {
      width: 300,
      height: 240,
      alignItems: 'center',
      justifyContent: 'flex-end',
      position: 'relative',
      paddingBottom: 8,
    },
    welcomeBgCircle: {
      position: 'absolute',
      width: 280,
      height: 280,
      borderRadius: 140,
      backgroundColor: colors.decorCircle,
      opacity: 0.12,
      top: -30,
    },
    welcomeBgCircle2: {
      position: 'absolute',
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.decorCircle,
      opacity: 0.06,
      bottom: 40,
      right: 5,
    },
    monsterStage: {
      alignItems: 'center',
      zIndex: 2,
    },
    // 像素泥土
    pixelGround: {
      width: 260,
      marginTop: 4,
    },
    soilRow: {
      flexDirection: 'row',
      gap: 3,
      marginBottom: 3,
    },
    soilPixel: {
      width: 14,
      height: 10,
      borderRadius: 9999,
    },
    // 怪兽排列 — 在泥土上方
    monsterRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 2,
    },
    monsterSlot: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    welcomeSubText: {
      fontSize: 13,
      color: colors.textTertiary,
      marginTop: 10,
      zIndex: 2,
    },
    mindMapContainer: {
      width: 200,
      height: 200,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    mindMapCenter: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
    },
    mindMapCenterText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.onPrimary,
      textAlign: 'center',
      lineHeight: 14,
    },
    mindMapConnections: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    connectionLineTop: {
      position: 'absolute',
      top: 20,
      left: '50%',
      width: 3,
      height: 40,
      backgroundColor: 'rgba(122,176,160,0.20)',
      transform: [{ translateX: -1.5 }],
    },
    connectionLineBottom: {
      position: 'absolute',
      bottom: 20,
      left: '50%',
      width: 3,
      height: 40,
      backgroundColor: 'rgba(122,176,160,0.20)',
      transform: [{ translateX: -1.5 }],
    },
    connectionLineLeft: {
      position: 'absolute',
      left: 20,
      top: '50%',
      width: 40,
      height: 3,
      backgroundColor: 'rgba(122,176,160,0.20)',
      transform: [{ translateY: -1.5 }],
    },
    connectionLineRight: {
      position: 'absolute',
      right: 20,
      top: '50%',
      width: 40,
      height: 3,
      backgroundColor: 'rgba(122,176,160,0.20)',
      transform: [{ translateY: -1.5 }],
    },
    mindMapNodeTop: {
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: [{ translateX: -28 }],
      alignItems: 'center',
    },
    mindMapNodeBottom: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: [{ translateX: -28 }],
      alignItems: 'center',
    },
    mindMapNodeLeft: {
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: [{ translateY: -28 }],
      alignItems: 'center',
    },
    mindMapNodeRight: {
      position: 'absolute',
      right: 0,
      top: '50%',
      transform: [{ translateY: -28 }],
      alignItems: 'center',
    },
    mindMapNodeEmoji: {
      fontSize: 28,
      marginBottom: 4,
    },
    mindMapNodeLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    staminaContainer: {
      width: '100%',
      alignItems: 'center',
    },
    staminaLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    staminaBarBg: {
      width: '80%',
      height: 24,
      backgroundColor: colors.border,
      borderRadius: 12,
      overflow: 'hidden',
    },
    staminaBarFill: {
      height: '100%',
      backgroundColor: colors.success,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    staminaValue: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.onPrimary,
    },
    gameButtonNew: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 9999,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginTop: 20,
    },
    gameButtonIcon: {
      fontSize: 20,
      marginRight: 8,
    },
    gameButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.onPrimary,
    },
  }), [colors]);

  const WelcomeFrame = () => (
    <View style={styles.welcomeScene}>
      {/* 装饰背景 */}
      <View style={styles.welcomeBgCircle} />
      <View style={styles.welcomeBgCircle2} />

      <View style={styles.monsterStage}>
        {/* 怪兽们 — 站在泥土上方 */}
        <View style={styles.monsterRow}>
          {/* 沉稳小怪 */}
          <View style={styles.monsterSlot}>
            <MonsterIcon type="calm" size={64} />
          </View>
          {/* 活力小怪 */}
          <View style={styles.monsterSlot}>
            <MonsterIcon type="lively" size={68} />
          </View>
          {/* 叛逆小怪 */}
          <View style={styles.monsterSlot}>
            <MonsterIcon type="rebel" size={64} />
          </View>
        </View>

        {/* 像素泥土地面 — 怪兽脚下 */}
        <View style={styles.pixelGround}>
          <View style={[styles.soilRow, { justifyContent: 'flex-start', paddingLeft: 8 }]}>
            {[...Array(14)].map((_, i) => (
              <View key={`t-${i}`} style={[styles.soilPixel, { backgroundColor: i % 2 === 0 ? colors.primary : colors.accentGreen }]} />
            ))}
          </View>
          <View style={styles.soilRow}>
            {[...Array(16)].map((_, i) => (
              <View key={`m-${i}`} style={[styles.soilPixel, { backgroundColor: i % 3 === 0 ? colors.primary : (i % 3 === 1 ? colors.success : colors.brandPurple) }]} />
            ))}
          </View>
          <View style={[styles.soilRow, { justifyContent: 'flex-end', paddingRight: 6 }]}>
            {[...Array(13)].map((_, i) => (
              <View key={`b-${i}`} style={[styles.soilPixel, { backgroundColor: i % 2 === 0 ? colors.primary : colors.warning }]} />
            ))}
          </View>
        </View>
      </View>

      {/* 底部文字 */}
      <Text style={styles.welcomeSubText}>三只小伙伴等你一起学习</Text>
    </View>
  );

  const MindMapFrame = () => (
    <View style={styles.mindMapContainer}>
      <View style={styles.mindMapCenter}>
        <Text style={styles.mindMapCenterText}>知识节点</Text>
      </View>

      <View style={styles.mindMapConnections}>
        <View style={styles.connectionLineTop} />
        <View style={styles.connectionLineBottom} />
        <View style={styles.connectionLineLeft} />
        <View style={styles.connectionLineRight} />
      </View>

      <View style={styles.mindMapNodeTop}>
        <Text style={styles.mindMapNodeEmoji}>🔗</Text>
        <Text style={styles.mindMapNodeLabel}>学习资源</Text>
      </View>
      <View style={styles.mindMapNodeBottom}>
        <Text style={styles.mindMapNodeEmoji}>🎯</Text>
        <Text style={styles.mindMapNodeLabel}>学习目标</Text>
      </View>
      <View style={styles.mindMapNodeLeft}>
        <Text style={styles.mindMapNodeEmoji}>🍅</Text>
        <Text style={styles.mindMapNodeLabel}>番茄钟</Text>
      </View>
      <View style={styles.mindMapNodeRight}>
        <Text style={styles.mindMapNodeEmoji}>⭐</Text>
        <Text style={styles.mindMapNodeLabel}>成就奖励</Text>
      </View>
    </View>
  );

  const StaminaFrame = () => (
    <View style={styles.illustration}>
      <View style={styles.staminaContainer}>
        <Text style={styles.staminaLabel}>体力值</Text>
        <View style={styles.staminaBarBg}>
          <View style={styles.staminaBarFill}>
            <Text style={styles.staminaValue}>100 / 100</Text>
          </View>
        </View>
      </View>
      <View style={styles.gameButtonNew}>
        <Text style={styles.gameButtonIcon}>🎮</Text>
        <Text style={styles.gameButtonText}>玩小游戏恢复体力</Text>
      </View>
    </View>
  );

  const StoryIllustration = ({ frameIndex }: { frameIndex: number }) => {
    const illustrations = [
      <WelcomeFrame key={0} />,
      <MindMapFrame key={1} />,
      <StaminaFrame key={2} />,
    ];
    return illustrations[frameIndex];
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.pixelBackground} />

        <TouchableOpacity style={styles.skipButton} onPress={skipToNext}>
          <Text style={styles.skipText}>跳过</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* 第2页起显示返回按钮 */}
        {currentFrame > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => switchFrame(currentFrame - 1)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        )}

        <View style={styles.storyContainer}>
          <Animated.View
            style={[styles.storyContent, animatedStyle]}
          >
            <View style={styles.illustrationContainer}>
              <StoryIllustration frameIndex={currentFrame} />
            </View>

            <Text style={styles.title}>{currentStory.title}</Text>
            <Text style={styles.text}>{currentStory.text}</Text>
            <Text style={styles.subtext}>{currentStory.subtext}</Text>
          </Animated.View>
        </View>

        <View style={styles.progressContainer}>
          {frames.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: index === currentFrame ? colors.primary : colors.border,
                  transform: [{ scale: index === currentFrame ? 1.5 : 1 }],
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={goToNextFrame}>
          <Text style={styles.nextButtonText}>
            {isLastFrame ? (isTutorial ? '开始冒险' : '开始') : '继续'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StoryScreen;
