import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/utils/constants';
import { getCurrentUser } from '../../src/utils/auth';

const HomeScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [notifCount] = useState(3);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('加载用户数据失败:', error);
      }
    };

    loadUserData();
  }, []);

  const userData = {
    name: user?.username || 'LearnFlow用户',
    level: 5,
    xp: 2450,
    xpToNextLevel: 5000,
    streak: 7,
    completedSkills: 12,
    totalSkills: 24,
    studyHours: 48,
  };

  const xpPercent = Math.round((userData.xp / userData.xpToNextLevel) * 100);

  const quickActions = [
    { icon: 'git-branch' as const, label: '技能树', path: '/skill-tree', color: COLORS.PRIMARY, bg: 'rgba(93,155,250,0.15)' },
    { icon: 'book' as const, label: '继续学习', path: '/notes', color: COLORS.SUCCESS, bg: 'rgba(58,227,116,0.15)' },
    { icon: 'game-controller' as const, label: '怪兽', path: '/monster', color: COLORS.ORANGE, bg: 'rgba(255,125,0,0.15)' },
    { icon: 'trending-up' as const, label: '进度', path: '/profile', color: COLORS.PURPLE, bg: 'rgba(123,94,167,0.15)' },
  ];

  const skillTrees = [
    { id: 1, title: 'React Native开发', description: '跨平台移动应用开发', icon: '📱', category: '前端', categoryColor: COLORS.PRIMARY, completedNodes: 12, totalNodes: 20, progress: 60 },
    { id: 2, title: 'Node.js后端开发', description: '服务端API开发', icon: '🖥️', category: '后端', categoryColor: COLORS.SUCCESS, completedNodes: 6, totalNodes: 20, progress: 30 },
  ];

  const achievements = [
    { id: 1, title: '初次学习', icon: '🎉', color: COLORS.PRIMARY },
    { id: 2, title: '连续学习', icon: '🔥', color: COLORS.ORANGE },
    { id: 3, title: '技能大师', icon: '🎯', color: COLORS.SUCCESS },
  ];

  const handleQuickAction = (path: string) => {
    if (path === '/skill-tree') {
      router.push('/skill-tree');
    } else if (path === '/notes') {
      router.push('/notes');
    } else if (path === '/monster') {
      router.push('/monster');
    } else if (path === '/profile') {
      router.push('/profile');
    }
  };

  const handleSkillTreePress = (id: number) => {
    router.push(`/skill-tree`);
  };

  const handleViewAllSkills = () => {
    router.push('/skill-tree');
  };

  const handleDailyChallenge = () => {
    router.push('/monster');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerGradient} />
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>早上好 👋</Text>
                <Text style={styles.userName}>{userData.name}</Text>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity style={styles.notificationButton}>
                  <Ionicons name="notifications" size={18} color={COLORS.PRIMARY} />
                  {notifCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationCount}>{notifCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarEmoji}>🧑</Text>
                </View>
              </View>
            </View>

            <View style={styles.levelCard}>
              <View style={styles.levelCardGradient} />
              <View style={styles.levelCardContent}>
                <View style={styles.levelHeader}>
                  <View style={styles.levelInfo}>
                    <View style={styles.levelIcon}>
                      <Text style={styles.levelIconEmoji}>⚡</Text>
                    </View>
                    <View>
                      <Text style={styles.levelLabel}>等级</Text>
                      <Text style={styles.levelText}>Lv.{userData.level}</Text>
                    </View>
                  </View>
                  <View style={styles.xpInfo}>
                    <Text style={styles.xpValue}>{userData.xp.toLocaleString()} XP</Text>
                    <Text style={styles.xpTotal}>/ {userData.xpToNextLevel.toLocaleString()} XP</Text>
                  </View>
                </View>

                <View style={styles.xpSection}>
                  <View style={styles.xpHeader}>
                    <Text style={styles.xpLabel}>学习探索者</Text>
                    <Text style={styles.xpPercent}>{xpPercent}%</Text>
                  </View>
                  <View style={styles.xpBar}>
                    <View style={[styles.xpProgress, { width: `${xpPercent}%` }]} />
                  </View>
                </View>

                <View style={styles.streakRow}>
                  <Ionicons name="flame" size={14} color={COLORS.ORANGE} />
                  <Text style={styles.streakText}>连续 {userData.streak} 天学习中</Text>
                  <Text style={styles.streakEmoji}>🔥</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: '技能数', value: userData.completedSkills, total: userData.totalSkills, icon: '🎯', color: COLORS.PRIMARY },
            { label: '学习时长', value: `${userData.studyHours}h`, icon: '⏱️', color: COLORS.SUCCESS },
            { label: '连续天数', value: `${userData.streak}天`, icon: '🔥', color: COLORS.ORANGE },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <View style={styles.statValueContainer}>
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                  {'total' in stat && (
                    <Text style={styles.statTotal}>/ {stat.total}</Text>
                  )}
                </Text>
              </View>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>快速入口</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={[styles.quickActionButton, { backgroundColor: action.bg, borderColor: `${action.color}25` }]}
                onPress={() => handleQuickAction(action.path)}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Ionicons name={action.icon} size={18} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.learningPathsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>学习路径</Text>
            <TouchableOpacity onPress={handleViewAllSkills}>
              <View style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>查看全部</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.PRIMARY} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.learningPathsList}>
            {skillTrees.map((tree) => (
              <TouchableOpacity
                key={tree.id}
                style={styles.learningPathCard}
                onPress={() => handleSkillTreePress(tree.id)}
                activeOpacity={0.7}
              >
                <View style={styles.learningPathHeader}>
                  <View style={styles.learningPathLeft}>
                    <Text style={styles.learningPathIcon}>{tree.icon}</Text>
                    <View>
                      <Text style={styles.learningPathTitle}>{tree.title}</Text>
                      <Text style={styles.learningPathDescription}>{tree.description}</Text>
                    </View>
                  </View>
                  <View style={[styles.categoryBadge, { backgroundColor: `${tree.categoryColor}20` }]}>
                    <Text style={[styles.categoryText, { color: tree.categoryColor }]}>{tree.category}</Text>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressText}>{tree.completedNodes}/{tree.totalNodes} 个节点</Text>
                    <Text style={[styles.progressPercent, { color: tree.categoryColor }]}>{tree.progress}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${tree.progress}%`, backgroundColor: tree.categoryColor }
                      ]}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.achievementsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>最近成就</Text>
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <View style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>全部</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.PRIMARY} />
              </View>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={[styles.achievementCard, { borderColor: `${achievement.color}30` }]}>
                <View style={[styles.achievementIcon, { backgroundColor: `${achievement.color}20` }]}>
                  <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                </View>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.moreAchievementsButton}
              onPress={() => router.push('/profile')}
            >
              <Ionicons name="add" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.moreAchievementsText}>更多</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.dailyChallengeSection}>
          <TouchableOpacity
            style={styles.dailyChallengeButton}
            onPress={handleDailyChallenge}
            activeOpacity={0.7}
          >
            <Text style={styles.dailyChallengeIcon}>⚔️</Text>
            <View style={styles.dailyChallengeInfo}>
              <Text style={styles.dailyChallengeTitle}>每日挑战</Text>
              <Text style={styles.dailyChallengeDescription}>击败今日知识怪物，获得 +350 XP</Text>
            </View>
            <View style={styles.dailyChallengeArrow}>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
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
    flexGrow: 1,
  },
  header: {
    position: 'relative',
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.BACKGROUND_DARK,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greeting: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
  },
  userName: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '800',
    fontSize: 22,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: 'rgba(93,155,250,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.ERROR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCount: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarEmoji: {
    fontSize: 18,
  },
  levelCard: {
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.25)',
  },
  levelCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.BACKGROUND_DARK,
  },
  levelCardContent: {
    padding: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  levelIconEmoji: {
    fontSize: 22,
  },
  levelLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  levelText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: '800',
  },
  xpInfo: {
    alignItems: 'flex-end',
  },
  xpValue: {
    color: COLORS.PRIMARY,
    fontWeight: '700',
    fontSize: 16,
  },
  xpTotal: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
  },
  xpSection: {},
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  xpLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
  },
  xpPercent: {
    color: COLORS.PRIMARY,
    fontSize: 11,
  },
  xpBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  xpProgress: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.PRIMARY,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  streakText: {
    color: COLORS.ORANGE,
    fontSize: 13,
    fontWeight: '600',
  },
  streakEmoji: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
  },
  statsRow: {
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statTotal: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '400',
  },
  statLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 11,
    fontWeight: '500',
  },
  learningPathsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    color: COLORS.PRIMARY,
    fontSize: 13,
  },
  learningPathsList: {
    gap: 12,
  },
  learningPathCard: {
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    padding: 16,
  },
  learningPathHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  learningPathLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  learningPathIcon: {
    fontSize: 28,
  },
  learningPathTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 2,
  },
  learningPathDescription: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressSection: {},
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  achievementsScroll: {
    flexGrow: 0,
  },
  achievementCard: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    padding: 12,
    marginRight: 12,
    minWidth: 80,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementEmoji: {
    fontSize: 20,
  },
  achievementTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  moreAchievementsButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(93,155,250,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.3)',
    borderStyle: 'dashed',
    padding: 12,
    minWidth: 80,
  },
  moreAchievementsText: {
    color: COLORS.PRIMARY,
    fontSize: 10,
    fontWeight: '600',
  },
  dailyChallengeSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  dailyChallengeButton: {
    width: '100%',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: COLORS.ORANGE,
  },
  dailyChallengeIcon: {
    fontSize: 36,
  },
  dailyChallengeInfo: {
    flex: 1,
  },
  dailyChallengeTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  dailyChallengeDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  dailyChallengeArrow: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPadding: {
    height: 100,
  },
});

export default HomeScreen;
