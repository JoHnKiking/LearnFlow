import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS, SPACING } from '../src/utils/constants';

const OnboardingScreen = () => {
  const handleStart = () => {
    router.replace('/story');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <View style={styles.planet}>
            <View style={styles.planetSurface} />
            <View style={styles.planetRing} />
          </View>
          <View style={styles.piSymbol}>
            <Text style={styles.piText}>Π</Text>
          </View>
        </View>

        <Text style={styles.title}>欢迎来到 LearnFlow</Text>
        <Text style={styles.subtitle}>你的个性化学习伙伴</Text>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>智能学习路径规划</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎮</Text>
            <Text style={styles.featureText}>趣味游戏恢复体力</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>学习数据可视化</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>开始探索</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.XLARGE,
  },
  illustrationContainer: {
    width: 160,
    height: 160,
    marginBottom: 40,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planet: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  planetSurface: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.PRIMARY,
  },
  planetRing: {
    position: 'absolute',
    top: 45,
    left: 0,
    width: 120,
    height: 30,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 60,
  },
  piSymbol: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  piText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD60A',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.SMALL,
  },
  subtitle: {
    fontSize: 16,
    color: '#8888AA',
    textAlign: 'center',
    marginBottom: 40,
  },
  featureList: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.SMALL,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: SPACING.MEDIUM,
  },
  featureText: {
    fontSize: 16,
    color: '#E8E8F0',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 5,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default OnboardingScreen;