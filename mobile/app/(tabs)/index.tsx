import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { PixelButton, PixelCard } from '../../src/components/ui';
import { PIXEL_COLORS, SPACING } from '../../src/utils/constants';

const HomeScreen = () => {
  const handleGenerateSkillTree = () => {
    router.push('/(tabs)/generate');
  };

  const handleSearchSkillTree = () => {
    router.push('/(tabs)/search');
  };

  const handleViewProfile = () => {
    router.push('/(tabs)/profile');
  };

  const handleViewMonster = () => {
    router.push('/(tabs)/monster');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>LearnFlow</Text>
          <Text style={styles.subtitle}>知识星球探索</Text>
        </View>

        <View style={styles.statsContainer}>
          <PixelCard style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>技能树</Text>
          </PixelCard>
          <PixelCard style={styles.statCard}>
            <Text style={styles.statNumber}>45%</Text>
            <Text style={styles.statLabel}>平均进度</Text>
          </PixelCard>
          <PixelCard style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>学习小时</Text>
          </PixelCard>
        </View>

        <PixelCard style={styles.monsterPreview}>
          <View style={styles.monsterPreviewContent}>
            <Text style={styles.monsterEmoji}>🐲</Text>
            <View style={styles.monsterPreviewInfo}>
              <Text style={styles.monsterPreviewName}>小怪兽</Text>
              <Text style={styles.monsterPreviewLevel}>Lv.1 · 7/10 体力</Text>
            </View>
            <PixelButton 
              title="查看" 
              onPress={handleViewMonster} 
              variant="secondary"
              size="small"
            />
          </View>
        </PixelCard>

        <View style={styles.actionsContainer}>
          <PixelButton 
            title="生成技能树" 
            onPress={handleGenerateSkillTree}
            variant="primary"
            fullWidth={true}
          />
          <PixelButton 
            title="搜索技能树" 
            onPress={handleSearchSkillTree}
            variant="success"
            fullWidth={true}
          />
          <PixelButton 
            title="查看我的技能树" 
            onPress={handleViewProfile}
            variant="warning"
            fullWidth={true}
          />
        </View>

        <PixelCard style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>最近技能树</Text>
          <View style={styles.recentList}>
            <View style={styles.recentItem}>
              <Text style={styles.recentTitle}>React Native开发</Text>
              <Text style={styles.recentProgress}>进度: 60%</Text>
            </View>
            <View style={styles.recentItem}>
              <Text style={styles.recentTitle}>Node.js后端开发</Text>
              <Text style={styles.recentProgress}>进度: 30%</Text>
            </View>
            <View style={styles.recentItem}>
              <Text style={styles.recentTitle}>TypeScript进阶</Text>
              <Text style={styles.recentProgress}>进度: 45%</Text>
            </View>
          </View>
        </PixelCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PIXEL_COLORS.BACKGROUND,
  },
  scrollContent: {
    padding: SPACING.LARGE,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.XLARGE,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: PIXEL_COLORS.PIXEL_CYAN,
    marginBottom: SPACING.SMALL,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 16,
    color: PIXEL_COLORS.TEXT_SECONDARY,
    letterSpacing: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.LARGE,
  },
  statCard: {
    flex: 1,
    marginHorizontal: SPACING.SMALL,
    alignItems: 'center',
    padding: SPACING.MEDIUM,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: PIXEL_COLORS.PIXEL_GREEN,
    letterSpacing: 1,
  },
  statLabel: {
    fontSize: 12,
    color: PIXEL_COLORS.TEXT_SECONDARY,
    marginTop: 4,
    letterSpacing: 1,
  },
  monsterPreview: {
    marginBottom: SPACING.LARGE,
  },
  monsterPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monsterEmoji: {
    fontSize: 48,
    marginRight: SPACING.MEDIUM,
  },
  monsterPreviewInfo: {
    flex: 1,
  },
  monsterPreviewName: {
    fontSize: 20,
    fontWeight: '800',
    color: PIXEL_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
    letterSpacing: 1,
  },
  monsterPreviewLevel: {
    fontSize: 14,
    color: PIXEL_COLORS.PIXEL_PINK,
    fontWeight: '600',
  },
  actionsContainer: {
    gap: SPACING.MEDIUM,
    marginBottom: SPACING.LARGE,
  },
  recentContainer: {},
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: PIXEL_COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MEDIUM,
    letterSpacing: 2,
  },
  recentList: {
    gap: SPACING.MEDIUM,
  },
  recentItem: {
    padding: SPACING.MEDIUM,
    backgroundColor: PIXEL_COLORS.BACKGROUND,
    borderWidth: 2,
    borderColor: PIXEL_COLORS.PIXEL_GRAY,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PIXEL_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  recentProgress: {
    fontSize: 14,
    color: PIXEL_COLORS.PIXEL_CYAN,
    fontWeight: '600',
  },
});

export default HomeScreen;
