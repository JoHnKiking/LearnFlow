import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';

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
    Animated.sequence([
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentFrame(nextFrame);
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
      backgroundColor: 'rgba(93,155,250,0.8)',
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
      backgroundColor: '#5D9BFA',
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
      backgroundColor: '#7B5EA7',
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
      backgroundColor: '#5D9BFA',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      shadowColor: '#5D9BFA',
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
      backgroundColor: 'rgba(93,155,250,0.4)',
      transform: [{ translateX: -1.5 }],
    },
    connectionLineBottom: {
      position: 'absolute',
      bottom: 20,
      left: '50%',
      width: 3,
      height: 40,
      backgroundColor: 'rgba(93,155,250,0.4)',
      transform: [{ translateX: -1.5 }],
    },
    connectionLineLeft: {
      position: 'absolute',
      left: 20,
      top: '50%',
      width: 40,
      height: 3,
      backgroundColor: 'rgba(93,155,250,0.4)',
      transform: [{ translateY: -1.5 }],
    },
    connectionLineRight: {
      position: 'absolute',
      right: 20,
      top: '50%',
      width: 40,
      height: 3,
      backgroundColor: 'rgba(93,155,250,0.4)',
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
    pixelStarField: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    pixelStar: {
      position: 'absolute',
      backgroundColor: '#FFFFFF',
      borderRadius: 0,
    },
    pixelPlanetLarge: {
      position: 'absolute',
      top: 30,
      left: 20,
      width: 100,
      height: 100,
    },
    pixelPlanetSurface: {
      width: '100%',
      height: '100%',
      borderRadius: 50,
      backgroundColor: '#6B5B95',
      position: 'relative',
      borderWidth: 3,
      borderColor: '#8B7BB4',
    },
    pixelPlanetCrater: {
      position: 'absolute',
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#5B4B85',
    },
    pixelPlanetAtmosphere: {
      position: 'absolute',
      top: -5,
      left: -5,
      right: -5,
      bottom: -5,
      borderRadius: 55,
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    pixelRingOrbit: {
      position: 'absolute',
      top: '35%',
      left: '-20%',
      width: '140%',
      height: 16,
    },
    pixelRingSegment: {
      position: 'absolute',
      height: '100%',
      backgroundColor: 'rgba(255,255,255,0.4)',
      borderRadius: 8,
    },
    pixelSpaceship: {
      position: 'absolute',
      top: 50,
      right: 10,
      width: 40,
      height: 30,
    },
    pixelShipBody: {
      width: 28,
      height: 20,
      backgroundColor: '#8B8B8B',
      borderRadius: 4,
      position: 'absolute',
      top: 5,
      left: 6,
    },
    pixelShipWindow: {
      position: 'absolute',
      top: 9,
      left: 12,
      width: 10,
      height: 8,
      backgroundColor: '#4A8BF5',
      borderRadius: 2,
    },
    pixelShipWingLeft: {
      position: 'absolute',
      top: 12,
      left: 0,
      width: 10,
      height: 6,
      backgroundColor: '#6B6B6B',
      transform: [{ rotate: '-20deg' }],
    },
    pixelShipWingRight: {
      position: 'absolute',
      top: 12,
      right: 0,
      width: 10,
      height: 6,
      backgroundColor: '#6B6B6B',
      transform: [{ rotate: '20deg' }],
    },
    pixelShipFlame: {
      position: 'absolute',
      bottom: -10,
      left: '50%',
      transform: [{ translateX: -6 }],
      width: 12,
      height: 12,
    },
    pixelFlamePart: {
      position: 'absolute',
      backgroundColor: '#FF6B35',
      borderRadius: 2,
    },
    pixelEnergyOrb: {
      position: 'absolute',
      top: 100,
      left: 60,
      width: 36,
      height: 36,
    },
    pixelEnergyText: {
      position: 'absolute',
      top: 5,
      left: 8,
      fontSize: 22,
      fontWeight: 'bold',
      color: '#FFD60A',
      textShadowColor: '#FFD60A',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 5,
    },
    pixelEnergyGlow: {
      width: '100%',
      height: '100%',
      borderRadius: 18,
      backgroundColor: 'rgba(255,214,10,0.3)',
    },
    pixelMonsterCute: {
      position: 'absolute',
      bottom: 10,
      right: 30,
      width: 50,
      height: 50,
    },
    pixelMonsterBody: {
      width: 40,
      height: 40,
      backgroundColor: '#7B5EA7',
      borderRadius: 20,
      position: 'absolute',
      top: 5,
      left: 5,
    },
    pixelMonsterEyeLeft: {
      position: 'absolute',
      top: 12,
      left: 10,
      width: 10,
      height: 10,
      backgroundColor: '#FFFFFF',
      borderRadius: 5,
    },
    pixelMonsterEyeRight: {
      position: 'absolute',
      top: 12,
      right: 10,
      width: 10,
      height: 10,
      backgroundColor: '#FFFFFF',
      borderRadius: 5,
    },
    pixelMonsterMouth: {
      position: 'absolute',
      bottom: 12,
      left: 14,
      width: 12,
      height: 6,
      backgroundColor: '#FFFFFF',
      borderRadius: 3,
    },
    pixelMonsterEarLeft: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 8,
      height: 12,
      backgroundColor: '#9B7EC3',
      borderRadius: 4,
    },
    pixelMonsterEarRight: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 8,
      height: 12,
      backgroundColor: '#9B7EC3',
      borderRadius: 4,
    },
    pixelGridBg: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      opacity: 0.1,
    },
    pixelGridLine: {
      width: 20,
      height: 20,
      borderWidth: 1,
      borderColor: '#4A8BF5',
    },
    pixelCentralNode: {
      width: 70,
      height: 70,
      position: 'relative',
      zIndex: 10,
    },
    pixelNodeGlow: {
      position: 'absolute',
      top: -5,
      left: -5,
      right: -5,
      bottom: -5,
      borderRadius: 40,
      backgroundColor: 'rgba(74,139,245,0.3)',
    },
    pixelNodeText: {
      width: '100%',
      height: '100%',
      backgroundColor: '#4A8BF5',
      borderRadius: 35,
      textAlign: 'center',
      lineHeight: 70,
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      fontFamily: 'Courier',
    },
    pixelConnections: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '100%',
      height: '100%',
      transform: [{ translateX: -50 }, { translateY: -50 }],
    },
    pixelConnectionTop: {
      position: 'absolute',
      top: 0,
      left: '50%',
      width: 4,
      height: 50,
      backgroundColor: 'rgba(74,139,245,0.5)',
      transform: [{ translateX: -2 }],
    },
    pixelConnectionBottom: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      width: 4,
      height: 50,
      backgroundColor: 'rgba(74,139,245,0.5)',
      transform: [{ translateX: -2 }],
    },
    pixelConnectionLeft: {
      position: 'absolute',
      left: 0,
      top: '50%',
      width: 50,
      height: 4,
      backgroundColor: 'rgba(74,139,245,0.5)',
      transform: [{ translateY: -2 }],
    },
    pixelConnectionRight: {
      position: 'absolute',
      right: 0,
      top: '50%',
      width: 50,
      height: 4,
      backgroundColor: 'rgba(74,139,245,0.5)',
      transform: [{ translateY: -2 }],
    },
    pixelSatelliteNodeTop: {
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: [{ translateX: -22 }],
      alignItems: 'center',
    },
    pixelSatelliteNodeBottom: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: [{ translateX: -22 }],
      alignItems: 'center',
    },
    pixelSatelliteNodeLeft: {
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: [{ translateY: -22 }],
      alignItems: 'center',
    },
    pixelSatelliteNodeRight: {
      position: 'absolute',
      right: 0,
      top: '50%',
      transform: [{ translateY: -22 }],
      alignItems: 'center',
    },
    pixelNodeSmall: {
      width: 44,
      height: 44,
      backgroundColor: '#FAFCFF',
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#4A8BF5',
    },
    pixelNodeIcon: {
      fontSize: 20,
    },
    pixelNodeLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 4,
      fontFamily: 'Courier',
    },
    pixelDataFlow: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 100,
      height: 100,
      transform: [{ translateX: -50 }, { translateY: -50 }],
    },
    pixelDataParticle: {
      position: 'absolute',
      width: 6,
      height: 6,
      backgroundColor: '#FFD60A',
      borderRadius: 3,
    },
    pixelBatteryContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    pixelBatteryOutline: {
      width: 120,
      height: 60,
      backgroundColor: '#2A2A4A',
      borderRadius: 8,
      position: 'relative',
      padding: 6,
    },
    pixelBatteryTopCap: {
      position: 'absolute',
      top: -8,
      left: '50%',
      transform: [{ translateX: -8 }],
      width: 16,
      height: 8,
      backgroundColor: '#2A2A4A',
      borderRadius: 2,
    },
    pixelBatteryCells: {
      flexDirection: 'row',
      gap: 4,
      height: '100%',
    },
    pixelBatteryCell: {
      flex: 1,
      backgroundColor: '#3AE374',
      borderRadius: 4,
    },
    pixelBatteryEnergyFlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    pixelEnergyParticle: {
      position: 'absolute',
      width: 4,
      height: 4,
      backgroundColor: '#FFD60A',
      borderRadius: 2,
    },
    pixelBatteryLabel: {
      marginTop: 8,
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.textPrimary,
      fontFamily: 'Courier',
    },
    pixelGameConsole: {
      alignItems: 'center',
    },
    pixelConsoleScreen: {
      width: 80,
      height: 60,
      backgroundColor: '#1A1A2E',
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: '#3D3D5C',
    },
    pixelConsoleText: {
      fontSize: 32,
    },
    pixelConsoleButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    pixelButtonA: {
      width: 24,
      height: 24,
      backgroundColor: '#E94560',
      borderRadius: 12,
    },
    pixelButtonB: {
      width: 24,
      height: 24,
      backgroundColor: '#3AE374',
      borderRadius: 12,
    },
    pixelConsoleLabel: {
      marginTop: 8,
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Courier',
    },
    pixelZapEffect: {
      position: 'absolute',
      top: '30%',
      right: 10,
      width: 40,
      height: 60,
    },
    pixelZapLine: {
      position: 'absolute',
      backgroundColor: '#FFD60A',
    },
  }), [colors]);

  const WelcomeFrame = () => (
    <View style={styles.illustration}>
      <View style={styles.pixelStarField}>
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.pixelStar,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.pixelPlanetLarge}>
        <View style={styles.pixelPlanetSurface}>
          <View style={styles.pixelPlanetCrater} />
          <View style={styles.pixelPlanetCrater} />
          <View style={styles.pixelPlanetCrater} />
        </View>
        <View style={styles.pixelPlanetAtmosphere} />
        <View style={styles.pixelRingOrbit}>
          <View style={styles.pixelRingSegment} />
          <View style={styles.pixelRingSegment} />
          <View style={styles.pixelRingSegment} />
        </View>
      </View>
      <View style={styles.pixelSpaceship}>
        <View style={styles.pixelShipBody} />
        <View style={styles.pixelShipWindow} />
        <View style={styles.pixelShipWingLeft} />
        <View style={styles.pixelShipWingRight} />
        <View style={styles.pixelShipFlame}>
          <View style={styles.pixelFlamePart} />
          <View style={styles.pixelFlamePart} />
          <View style={styles.pixelFlamePart} />
        </View>
      </View>
      <View style={styles.pixelEnergyOrb}>
        <Text style={styles.pixelEnergyText}>Π</Text>
        <View style={styles.pixelEnergyGlow} />
      </View>
      <View style={styles.pixelMonsterCute}>
        <View style={styles.pixelMonsterBody} />
        <View style={styles.pixelMonsterEyeLeft} />
        <View style={styles.pixelMonsterEyeRight} />
        <View style={styles.pixelMonsterMouth} />
        <View style={styles.pixelMonsterEarLeft} />
        <View style={styles.pixelMonsterEarRight} />
      </View>
    </View>
  );

  const MindMapFrame = () => (
    <View style={styles.mindMapContainer}>
      <View style={styles.pixelGridBg}>
        {[...Array(9)].map((_, i) => (
          <View key={i} style={styles.pixelGridLine} />
        ))}
      </View>
      <View style={styles.pixelCentralNode}>
        <View style={styles.pixelNodeGlow} />
        <Text style={styles.pixelNodeText}>知识</Text>
      </View>
      <View style={styles.pixelConnections}>
        <View style={styles.pixelConnectionTop} />
        <View style={styles.pixelConnectionBottom} />
        <View style={styles.pixelConnectionLeft} />
        <View style={styles.pixelConnectionRight} />
      </View>
      <View style={styles.pixelSatelliteNodeTop}>
        <View style={styles.pixelNodeSmall}>
          <Text style={styles.pixelNodeIcon}>📚</Text>
        </View>
        <Text style={styles.pixelNodeLabel}>资源</Text>
      </View>
      <View style={styles.pixelSatelliteNodeBottom}>
        <View style={styles.pixelNodeSmall}>
          <Text style={styles.pixelNodeIcon}>🎯</Text>
        </View>
        <Text style={styles.pixelNodeLabel}>目标</Text>
      </View>
      <View style={styles.pixelSatelliteNodeLeft}>
        <View style={styles.pixelNodeSmall}>
          <Text style={styles.pixelNodeIcon}>🧠</Text>
        </View>
        <Text style={styles.pixelNodeLabel}>技能</Text>
      </View>
      <View style={styles.pixelSatelliteNodeRight}>
        <View style={styles.pixelNodeSmall}>
          <Text style={styles.pixelNodeIcon}>⭐</Text>
        </View>
        <Text style={styles.pixelNodeLabel}>成就</Text>
      </View>
      <View style={styles.pixelDataFlow}>
        <View style={styles.pixelDataParticle} />
        <View style={styles.pixelDataParticle} />
        <View style={styles.pixelDataParticle} />
      </View>
    </View>
  );

  const StaminaFrame = () => (
    <View style={styles.illustration}>
      <View style={styles.pixelBatteryContainer}>
        <View style={styles.pixelBatteryOutline}>
          <View style={styles.pixelBatteryTopCap} />
          <View style={styles.pixelBatteryCells}>
            <View style={styles.pixelBatteryCell} />
            <View style={styles.pixelBatteryCell} />
            <View style={styles.pixelBatteryCell} />
            <View style={styles.pixelBatteryCell} />
            <View style={styles.pixelBatteryCell} />
          </View>
          <View style={styles.pixelBatteryEnergyFlow}>
            <View style={styles.pixelEnergyParticle} />
            <View style={styles.pixelEnergyParticle} />
            <View style={styles.pixelEnergyParticle} />
          </View>
        </View>
        <Text style={styles.pixelBatteryLabel}>⚡ 体力</Text>
      </View>
      <View style={styles.pixelGameConsole}>
        <View style={styles.pixelConsoleScreen}>
          <Text style={styles.pixelConsoleText}>🎮</Text>
        </View>
        <View style={styles.pixelConsoleButtons}>
          <View style={styles.pixelButtonA} />
          <View style={styles.pixelButtonB} />
        </View>
        <Text style={styles.pixelConsoleLabel}>恢复体力</Text>
      </View>
      <View style={styles.pixelZapEffect}>
        <View style={styles.pixelZapLine} />
        <View style={styles.pixelZapLine} />
        <View style={styles.pixelZapLine} />
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
