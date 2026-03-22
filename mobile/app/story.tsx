import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/utils/constants';

const storyFrames = [
  {
    title: '你是一只上进的小怪兽',
    text: '在知识星球，每只小怪兽都渴望成长...',
    subtext: '但成长需要不断收集知识能量 @',
  },
  {
    title: '探索知识地图',
    text: '每个节点都是一次冒险',
    subtext: '完成学习任务，收集珍贵的 @ 能量',
  },
  {
    title: '体力与成长',
    text: '每次跳转学习都会消耗体力',
    subtext: '通过趣味小游戏恢复体力，继续前进',
  },
  {
    title: '你的冒险即将开始',
    text: '选择你的怪兽伙伴',
    subtext: '一起踏上知识探索之旅！',
  },
];

const StoryScreen = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [slideAnim] = useState(new Animated.Value(0));

  const handleNext = () => {
    if (currentFrame < storyFrames.length - 1) {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentFrame(currentFrame + 1);
      });
    } else {
      router.replace('/monster-selection');
    }
  };

  const handleSkip = () => {
    router.replace('/monster-selection');
  };

  const currentStory = storyFrames[currentFrame];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.pixelBackground} />

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>跳过</Text>
          <Ionicons name="chevron-forward" size={16} color="#8888AA" />
        </TouchableOpacity>

        <View style={styles.storyContainer}>
          <Animated.View
            style={[
              styles.storyContent,
              {
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -50],
                    }),
                  },
                ],
                opacity: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
              },
            ]}
          >
            <View style={styles.illustrationContainer}>
              <StoryIllustration frame={currentFrame} />
            </View>

            <Text style={styles.title}>{currentStory.title}</Text>
            <Text style={styles.text}>{currentStory.text}</Text>
            <Text style={styles.subtext}>{currentStory.subtext}</Text>
          </Animated.View>
        </View>

        <View style={styles.progressContainer}>
          {storyFrames.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                {
                  backgroundColor: i === currentFrame ? '#5D9BFA' : 'rgba(255,255,255,0.2)',
                  transform: [{ scale: i === currentFrame ? 1.5 : 1 }],
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentFrame < storyFrames.length - 1 ? '继续' : '选择怪兽'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const StoryIllustration = ({ frame }: { frame: number }) => {
  const illustrations = [
    <Frame0 key={0} />,
    <Frame1 key={1} />,
    <Frame2 key={2} />,
    <Frame3 key={3} />,
  ];

  return illustrations[frame];
};

const Frame0 = () => (
  <View style={styles.illustration}>
    <View style={styles.monster}>
      <View style={styles.monsterHead}>
        <View style={styles.monsterEyes}>
          <View style={styles.eye}>
            <View style={styles.pupil} />
          </View>
          <View style={styles.eye}>
            <View style={styles.pupil} />
          </View>
        </View>
        <View style={styles.mouth} />
      </View>
    </View>
    <View style={styles.atSymbol}>
      <View style={styles.atDot} />
    </View>
  </View>
);

const Frame1 = () => (
  <View style={styles.illustration}>
    <View style={styles.mapContainer}>
      <View style={[styles.mapNode, { top: 10, left: 10, backgroundColor: '#5D9BFA' }]} />
      <View style={[styles.mapNode, { top: 10, right: 10, backgroundColor: '#3AE374' }]} />
      <View style={[styles.mapNode, { top: 60, left: '50%', marginLeft: -10, backgroundColor: '#FF7D00' }]} />
      <View style={[styles.mapNode, { bottom: 10, left: 10, backgroundColor: '#7B5EA7' }]} />
      <View style={[styles.mapNode, { bottom: 10, right: 10, backgroundColor: '#FFD60A' }]} />
    </View>
  </View>
);

const Frame2 = () => (
  <View style={styles.illustration}>
    <View style={styles.tiredMonster}>
      <View style={styles.tiredEyes}>
        <View style={styles.tiredEye} />
        <View style={styles.tiredEye} />
      </View>
    </View>
    <View style={styles.gameController}>
      <View style={styles.controllerBody}>
        <View style={styles.controllerButtons}>
          <View style={styles.controllerButton} />
          <View style={styles.controllerButton} />
        </View>
      </View>
    </View>
  </View>
);

const Frame3 = () => (
  <View style={styles.illustration}>
    <View style={styles.happyMonster}>
      <View style={styles.monsterHead}>
        <View style={styles.monsterEyes}>
          <View style={styles.eye}>
            <View style={styles.pupil} />
          </View>
          <View style={styles.eye}>
            <View style={styles.pupil} />
          </View>
        </View>
        <View style={styles.bigSmile} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 10,
  },
  skipText: {
    color: '#8888AA',
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
  },
  illustrationContainer: {
    marginBottom: 48,
  },
  illustration: {
    width: 180,
    height: 180,
    position: 'relative',
  },
  monster: {
    width: 72,
    height: 64,
    position: 'absolute',
    top: 50,
    left: 54,
  },
  monsterHead: {
    width: 72,
    height: 64,
    position: 'relative',
  },
  monsterEyes: {
    flexDirection: 'row',
    gap: 12,
    position: 'absolute',
    top: 20,
    left: 14,
  },
  eye: {
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  pupil: {
    width: 8,
    height: 10,
    backgroundColor: '#1A1A2E',
    position: 'absolute',
    top: 4,
    left: 4,
  },
  mouth: {
    width: 28,
    height: 6,
    backgroundColor: '#1A1A2E',
    position: 'absolute',
    top: 44,
    left: 22,
  },
  bigSmile: {
    width: 32,
    height: 12,
    backgroundColor: '#1A1A2E',
    position: 'absolute',
    top: 40,
    left: 20,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  atSymbol: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  atDot: {
    width: 8,
    height: 8,
    backgroundColor: '#FFD60A',
  },
  mapContainer: {
    width: 180,
    height: 180,
    position: 'relative',
  },
  mapNode: {
    width: 20,
    height: 20,
    position: 'absolute',
  },
  tiredMonster: {
    width: 72,
    height: 64,
    position: 'absolute',
    top: 50,
    left: 20,
    opacity: 0.6,
  },
  tiredEyes: {
    flexDirection: 'row',
    gap: 12,
    position: 'absolute',
    top: 28,
    left: 14,
  },
  tiredEye: {
    width: 12,
    height: 4,
    backgroundColor: '#1A1A2E',
  },
  gameController: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  controllerBody: {
    width: 40,
    height: 24,
    backgroundColor: '#FF7D00',
  },
  controllerButtons: {
    flexDirection: 'row',
    gap: 10,
    position: 'absolute',
    top: 8,
    left: 6,
  },
  controllerButton: {
    width: 4,
    height: 4,
    backgroundColor: '#1A1A2E',
  },
  happyMonster: {
    width: 72,
    height: 64,
    position: 'absolute',
    top: 50,
    left: 54,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Courier',
    lineHeight: 30,
    textAlign: 'center',
    marginBottom: 12,
  },
  text: {
    color: '#E8E8F0',
    fontSize: 16,
    fontFamily: 'Courier',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    color: '#5D9BFA',
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
    shadowColor: COLORS.PRIMARY,
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
});

export default StoryScreen;
