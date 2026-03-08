import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/utils/constants';
import { getCurrentUser } from '../../src/utils/auth';

type Tab = 'overview' | 'achievements' | 'settings';

const ProfileScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

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
    title: '学习探索者',
    level: 5,
    xp: 2450,
    xpToNextLevel: 5000,
    streak: 7,
    completedSkills: 12,
    studyHours: 48,
    achievements: [
      { id: 1, title: '初次学习', description: '完成第一个技能', icon: '🎉', color: COLORS.PRIMARY, unlocked: true, date: '2024-01-15' },
      { id: 2, title: '连续学习', description: '连续7天学习', icon: '🔥', color: COLORS.ORANGE, unlocked: true, date: '2024-01-21' },
      { id: 3, title: '技能大师', description: '完成10个技能', icon: '🎯', color: COLORS.SUCCESS, unlocked: true, date: '2024-01-25' },
      { id: 4, title: '知识渊博', description: '学习超过50小时', icon: '📚', color: COLORS.PURPLE, unlocked: false },
    ],
  };

  const xpPercent = Math.round((userData.xp / userData.xpToNextLevel) * 100);

  const settings = [
    { icon: 'notifications' as const, label: '学习提醒', value: notifications, toggle: () => setNotifications(!notifications) },
    { icon: 'moon' as const, label: '深色模式', value: darkMode, toggle: () => setDarkMode(!darkMode) },
    { icon: 'globe' as const, label: '语言', text: '简体中文' },
    { icon: 'shield' as const, label: '隐私设置' },
  ];

  const handleLogout = () => {
    Alert.alert('确认退出', '您确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      { 
        text: '确定', 
        onPress: () => {
          router.replace('/login');
        }
      }
    ]);
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>本周学习统计</Text>
          <View style={styles.trendContainer}>
            <Ionicons name="trending-up" size={14} color={COLORS.SUCCESS} />
            <Text style={styles.trendText}>+24%</Text>
          </View>
        </View>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.placeholderText}>图表区域</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>学习总结</Text>
        {[
          { label: '最长连续天数', value: '12天', icon: '🔥' },
          { label: '总获得 XP', value: '8,450', icon: '⚡' },
          { label: '完成技能节点', value: '24个', icon: '✅' },
          { label: '平均每日学习', value: '52分钟', icon: '⏱️' },
        ].map((item, index) => (
          <View key={item.label} style={[styles.summaryItem, index < 3 && styles.summaryItemBorder]}>
            <View style={styles.summaryItemLeft}>
              <Text style={styles.summaryIcon}>{item.icon}</Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </View>
            <Text style={styles.summaryValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.tabContent}>
      <View style={styles.achievementsGrid}>
        {userData.achievements.map((achievement) => (
          <View
            key={achievement.id}
            style={[
              styles.achievementCard,
              {
                backgroundColor: achievement.unlocked ? COLORS.BACKGROUND_LIGHT : 'rgba(255,255,255,0.02)',
                borderColor: achievement.unlocked ? `${achievement.color}30` : 'rgba(255,255,255,0.04)',
                opacity: achievement.unlocked ? 1 : 0.4,
              }
            ]}
          >
            <View
              style={[
                styles.achievementIcon,
                {
                  backgroundColor: achievement.unlocked ? `${achievement.color}18` : 'rgba(255,255,255,0.04)',
                }
              ]}
            >
              <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
            </View>
            <Text style={[styles.achievementTitle, { color: achievement.unlocked ? COLORS.TEXT_PRIMARY : COLORS.TEXT_TERTIARY }]}>
              {achievement.title}
            </Text>
            <Text style={styles.achievementDescription}>{achievement.description}</Text>
            {achievement.unlocked && achievement.date && (
              <View style={[styles.achievementBadge, { backgroundColor: `${achievement.color}15` }]}>
                <Text style={[styles.achievementBadgeText, { color: achievement.color }]}>已解锁</Text>
              </View>
            )}
            {!achievement.unlocked && (
              <View style={styles.achievementLockedBadge}>
                <Text style={styles.achievementLockedText}>未解锁</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.tabContent}>
      <View style={styles.settingsGroup}>
        {settings.map((s, i) => (
          <View key={s.label} style={[styles.settingItem, i < settings.length - 1 && styles.settingItemBorder]}>
            <View style={styles.settingIconContainer}>
              <Ionicons name={s.icon} size={16} color={COLORS.PRIMARY} />
            </View>
            <Text style={styles.settingLabel}>{s.label}</Text>
            {s.value !== undefined && s.toggle ? (
              <Switch
                value={s.value}
                onValueChange={s.toggle}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.PRIMARY }}
                thumbColor="#fff"
              />
            ) : (
              <View style={styles.settingRight}>
                {s.text && <Text style={styles.settingText}>{s.text}</Text>}
                <Ionicons name="chevron-forward" size={16} color={COLORS.TEXT_TERTIARY} />
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.settingsGroup}>
        {[
          { label: '关于 LearnFlow', icon: 'star' as const },
          { label: '使用帮助', icon: 'settings' as const },
        ].map((item, i) => (
          <View key={item.label} style={[styles.settingItem, i === 0 && styles.settingItemBorder]}>
            <View style={[styles.settingIconContainer, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
              <Ionicons name={item.icon} size={16} color={COLORS.TEXT_SECONDARY} />
            </View>
            <Text style={styles.settingLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.TEXT_TERTIARY} />
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={18} color={COLORS.ERROR} />
        <Text style={styles.logoutText}>退出登录</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerGradient} />
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle}>个人中心</Text>
              <TouchableOpacity style={styles.settingsButton}>
                <Ionicons name="settings" size={18} color={COLORS.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>

            <View style={styles.profileCard}>
              <View style={styles.profileCardGradient} />
              <View style={styles.profileCardContent}>
                <View style={styles.profileInfo}>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarEmoji}>🧑</Text>
                    </View>
                    <View style={styles.streakBadge}>
                      <Text style={styles.streakEmoji}>🔥</Text>
                    </View>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{userData.name}</Text>
                    <Text style={styles.userTitle}>{userData.title}</Text>
                    <View style={styles.userMeta}>
                      <Text style={styles.streakText}>🔥 {userData.streak}天连续</Text>
                      <Text style={styles.metaSeparator}>·</Text>
                      <Text style={styles.levelText}>Lv.{userData.level}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.xpSection}>
                  <View style={styles.xpHeader}>
                    <Text style={styles.xpText}>{userData.xp.toLocaleString()} / {userData.xpToNextLevel.toLocaleString()} XP</Text>
                    <Text style={styles.xpPercent}>{xpPercent}%</Text>
                  </View>
                  <View style={styles.xpBar}>
                    <View style={[styles.xpProgress, { width: `${xpPercent}%` }]} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: '技能', value: userData.completedSkills, icon: '🎯', color: COLORS.PRIMARY },
            { label: '小时', value: userData.studyHours, icon: '⏱️', color: COLORS.SUCCESS },
            { label: '等级', value: userData.level, icon: '⚡', color: COLORS.ORANGE },
            { label: '成就', value: userData.achievements.filter(a => a.unlocked).length, icon: '🏆', color: COLORS.PURPLE },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            {(['overview', 'achievements', 'settings'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
                  {tab === 'overview' ? '📊 概览' : tab === 'achievements' ? '🏆 成就' : '⚙️ 设置'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'achievements' && renderAchievements()}
        {activeTab === 'settings' && renderSettings()}

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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '800',
    fontSize: 20,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.2)',
  },
  profileCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.BACKGROUND_DARK,
  },
  profileCardContent: {
    padding: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  streakBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 8,
    backgroundColor: COLORS.ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.ORANGE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  streakEmoji: {
    fontSize: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 2,
  },
  userTitle: {
    color: COLORS.PRIMARY,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakText: {
    color: COLORS.ORANGE,
    fontSize: 12,
  },
  metaSeparator: {
    color: COLORS.TEXT_TERTIARY,
  },
  levelText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
  },
  xpSection: {},
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  xpText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
  },
  xpPercent: {
    color: COLORS.PRIMARY,
    fontSize: 12,
    fontWeight: '600',
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
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  statsRow: {
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    padding: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  statValue: {
    fontWeight: '800',
    fontSize: 16,
    marginTop: 2,
  },
  statLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 10,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND_DARK,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(93,155,250,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.3)',
  },
  tabButtonText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '400',
  },
  tabButtonTextActive: {
    color: COLORS.PRIMARY,
    fontWeight: '700',
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  chartCard: {
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    padding: 16,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 14,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    color: COLORS.SUCCESS,
    fontSize: 12,
  },
  chartPlaceholder: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
  },
  summaryCard: {
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    padding: 16,
  },
  summaryTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  summaryItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  summaryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryIcon: {
    fontSize: 16,
  },
  summaryLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
  },
  summaryValue: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 13,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: '47%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  achievementEmoji: {
    fontSize: 28,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementDescription: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  achievementBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  achievementBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  achievementLockedBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  achievementLockedText: {
    color: COLORS.TEXT_TERTIARY,
    fontSize: 10,
  },
  settingsGroup: {
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    overflow: 'hidden',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: 'rgba(93,155,250,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    flex: 1,
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
  },
  logoutButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(233,69,96,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(233,69,96,0.25)',
    marginTop: 12,
  },
  logoutText: {
    color: COLORS.ERROR,
    fontWeight: '700',
    fontSize: 15,
  },
  bottomPadding: {
    height: 100,
  },
});

export default ProfileScreen;
