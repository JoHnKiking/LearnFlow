import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import MonsterIcon from '../src/components/MonsterIcon';

const ROUTES = {
  MONSTER_SELECTION: '/monster-selection',
};

const STORY_FRAMES = [
  {
    title: '欢迎来到元气星',
    text: '在这里，每只小怪兽都渴望成长',
    subtext: '但成长需要不断收集知识能量 Π',
  },
  {
    title: '探索知识地图',
    text: '解锁学习节点，跳转学习资源，完成冒险',
    subtext: '完成指定时长的学习任务，就能收集珍贵的 Π 能量',
  },
  {
    title: '体力与成长',
    text: '每次跳转学习会消耗体力，请珍惜',
    subtext: '通过趣味游戏可以恢复体力，继续前进',
  },
];

const useStoryAnimation = (totalFrames: number) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const slideAnimation = useState(new Animated.Value(0))[0];

  const switchFrame = useCallback((nextFrame: number) => {
    // 先淡出旧帧
    Animated.timing(slideAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // 不可见时切换内容，避免闪烁
      setCurrentFrame(nextFrame);
      // 新帧淡入
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }, [slideAnimation]);

  const goToNextFrame = useCallback(() => {
    if (currentFrame < totalFrames - 1) {
      console.log(`[Story] 切换到第 ${currentFrame + 2} 帧`);
      switchFrame(currentFrame + 1);
    } else {
      console.log('[Story] 故事结束，跳转至怪物选择');
      router.replace(ROUTES.MONSTER_SELECTION);
    }
  }, [currentFrame, totalFrames, switchFrame]);

  const skipToSelection = useCallback(() => {
    console.log('[Story] 跳过故事，跳转至怪物选择');
    router.replace(ROUTES.MONSTER_SELECTION);
  }, []);

  return {
    currentFrame,
    slideAnimation,
    goToNextFrame,
    skipToSelection,
  };
};

const StoryScreen = () => {
  const { colors } = useTheme();
  const { currentFrame, slideAnimation, goToNextFrame, skipToSelection } = useStoryAnimation(STORY_FRAMES.length);
  const currentStory = STORY_FRAMES[currentFrame];
  const isLastFrame = currentFrame === STORY_FRAMES.length - 1;

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
      fontFamily: 'Courier',
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
    monsterIconContainer: {
      position: 'absolute',
      bottom: -10,
      right: -20,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: '700',
      fontFamily: 'Courier',
      lineHeight: 30,
      textAlign: 'center',
      marginBottom: 12,
    },
    text: {
      color: colors.textPrimary,
      fontSize: 16,
      fontFamily: 'Courier',
      lineHeight: 26,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtext: {
      color: colors.primary,
      fontSize: 14,
      fontFamily: 'Courier',
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
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 24,
      elevation: 5,
    },
    nextButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      fontFamily: 'Courier',
    },
    planet: {
      width: 120,
      height: 120,
      position: 'absolute',
      top: 20,
      left: 30,
    },
    planetSurface: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.primary,
    },
    planetRing: {
      position: 'absolute',
      top: 50,
      left: 0,
      width: 120,
      height: 20,
      borderWidth: 4,
      borderColor: 'rgba(255,255,255,0.3)',
      borderRadius: 60,
    },
    monsterOverlay: {
      position: 'absolute',
      bottom: 10,
      right: 10,
    },
    smallMonster: {
      width: 48,
      height: 48,
    },
    smallMonsterHead: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.purple,
      position: 'relative',
    },
    smallMonsterEyes: {
      flexDirection: 'row',
      gap: 8,
      position: 'absolute',
      top: 12,
      left: 10,
    },
    smallPupil: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#FFFFFF',
    },
    smallSmile: {
      position: 'absolute',
      bottom: 12,
      left: 16,
      width: 16,
      height: 6,
      borderRadius: 4,
      backgroundColor: '#FFFFFF',
    },
    piSymbol: {
      position: 'absolute',
      top: 10,
      right: 20,
    },
    piText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFD60A',
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
      fontWeight: '700',
      color: '#FFFFFF',
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
      backgroundColor: 'rgba(123,117,216,0.4)',
      transform: [{ translateX: -1.5 }],
    },
    connectionLineBottom: {
      position: 'absolute',
      bottom: 20,
      left: '50%',
      width: 3,
      height: 40,
      backgroundColor: 'rgba(123,117,216,0.4)',
      transform: [{ translateX: -1.5 }],
    },
    connectionLineLeft: {
      position: 'absolute',
      left: 20,
      top: '50%',
      width: 40,
      height: 3,
      backgroundColor: 'rgba(123,117,216,0.4)',
      transform: [{ translateY: -1.5 }],
    },
    connectionLineRight: {
      position: 'absolute',
      right: 20,
      top: '50%',
      width: 40,
      height: 3,
      backgroundColor: 'rgba(123,117,216,0.4)',
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
      fontWeight: '700',
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
      fontWeight: '700',
      color: '#FFFFFF',
    },
    gameButtonNew: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.purple,
      borderRadius: 12,
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
      fontWeight: '700',
      color: '#FFFFFF',
    },
  }), [colors]);

  const WelcomeFrame = () => (
    <View style={styles.illustration}>
      <View style={styles.planet}>
        <View style={styles.planetSurface} />
        <View style={styles.planetRing} />
      </View>
      <View style={styles.monsterOverlay}>
        <View style={styles.smallMonster}>
          <View style={styles.smallMonsterHead}>
            <View style={styles.smallMonsterEyes}>
              <View style={styles.smallPupil} />
              <View style={styles.smallPupil} />
            </View>
            <View style={styles.smallSmile} />
          </View>
        </View>
      </View>
      <View style={styles.piSymbol}>
        <Text style={styles.piText}>Π</Text>
      </View>
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
        <Text style={styles.mindMapNodeEmoji}>📚</Text>
        <Text style={styles.mindMapNodeLabel}>学习资源</Text>
      </View>
      <View style={styles.mindMapNodeBottom}>
        <Text style={styles.mindMapNodeEmoji}>🎯</Text>
        <Text style={styles.mindMapNodeLabel}>学习目标</Text>
      </View>
      <View style={styles.mindMapNodeLeft}>
        <Text style={styles.mindMapNodeEmoji}>🧠</Text>
        <Text style={styles.mindMapNodeLabel}>技能树</Text>
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

        <TouchableOpacity style={styles.skipButton} onPress={skipToSelection}>
          <Text style={styles.skipText}>跳过</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.storyContainer}>
          <Animated.View
            style={[styles.storyContent, animatedStyle]}
          >
            <View style={styles.illustrationContainer}>
              <StoryIllustration frameIndex={currentFrame} />
              <View style={styles.monsterIconContainer}>
                <MonsterIcon type={currentFrame === 1 ? 'rebel' : currentFrame === 2 ? 'calm' : 'lively'} size={60} />
              </View>
            </View>

            <Text style={styles.title}>{currentStory.title}</Text>
            <Text style={styles.text}>{currentStory.text}</Text>
            <Text style={styles.subtext}>{currentStory.subtext}</Text>
          </Animated.View>
        </View>

        <View style={styles.progressContainer}>
          {STORY_FRAMES.map((_, index) => (
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
            {isLastFrame ? '开始冒险' : '继续'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StoryScreen;
