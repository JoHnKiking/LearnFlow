import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../src/components/ui';
import { COLORS, SPACING } from '../../src/utils/constants';

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>LearnFlow</Text>
          <Text style={styles.subtitle}>技能学习路径管理</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>技能树</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>45%</Text>
            <Text style={styles.statLabel}>平均进度</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>学习小时</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Button 
            title="生成技能树" 
            onPress={handleGenerateSkillTree}
          />
          <Button 
            title="搜索技能树" 
            onPress={handleSearchSkillTree}
          />
          <Button 
            title="查看我的技能树" 
            onPress={handleViewProfile}
          />
        </View>

        <View style={styles.recentContainer}>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContent: {
    padding: SPACING.LARGE,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.XLARGE,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.XLARGE,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: SPACING.MEDIUM,
    alignItems: 'center',
    marginHorizontal: SPACING.SMALL,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  actionsContainer: {
    gap: SPACING.MEDIUM,
    marginBottom: SPACING.XLARGE,
  },

  recentContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LARGE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MEDIUM,
  },
  recentList: {
    gap: SPACING.MEDIUM,
  },
  recentItem: {
    padding: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  recentProgress: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default HomeScreen;