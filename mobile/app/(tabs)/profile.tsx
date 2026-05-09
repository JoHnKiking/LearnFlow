import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/utils/constants';
import { getCurrentUser } from '../../src/utils/auth';
import HelpModal from '../../src/components/HelpModal';

const ProfileScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setIsLoggedIn(!!currentUser);
      } catch (error) {
        console.error('加载用户数据失败:', error);
        setIsLoggedIn(false);
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

  const handleLogin = () => {
    router.push('/login');
  };

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
          { label: '关于 LearnFlow', icon: 'star' as const, onPress: null },
          { label: '使用帮助', icon: 'settings' as const, onPress: () => setShowHelpModal(true) },
        ].map((item, i) => (
          <TouchableOpacity 
            key={item.label} 
            style={[styles.settingItem, i === 0 && styles.settingItemBorder]}
            onPress={item.onPress}
            disabled={!item.onPress}
            activeOpacity={item.onPress ? 0.7 : 1}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
              <Ionicons name={item.icon} size={16} color={COLORS.TEXT_SECONDARY} />
            </View>
            <Text style={styles.settingLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.TEXT_TERTIARY} />
          </TouchableOpacity>
        ))}
      </View>

      {isLoggedIn ? (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={18} color={COLORS.ERROR} />
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Ionicons name="log-in" size={18} color={COLORS.PRIMARY} />
          <Text style={styles.loginText}>登录账号</Text>
        </TouchableOpacity>
      )}
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
                {isLoggedIn ? (
                  <>
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
                  </>
                ) : (
                  <View style={styles.loginPrompt}>
                    <Text style={styles.loginPromptTitle}>欢迎使用 LearnFlow</Text>
                    <Text style={styles.loginPromptDesc}>登录账号以同步您的学习数据</Text>
                    <TouchableOpacity style={styles.loginPromptButton} onPress={handleLogin}>
                      <Ionicons name="log-in" size={16} color="#fff" />
                      <Text style={styles.loginPromptButtonText}>立即登录</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {isLoggedIn && (
          <View style={styles.statsRow}>
            {[
              { label: '技能', value: userData.completedSkills, icon: '🎯', color: COLORS.PRIMARY },
              { label: '小时', value: userData.studyHours, icon: '⏱️', color: COLORS.SUCCESS },
              { label: '等级', value: userData.level, icon: '⚡', color: COLORS.ORANGE },
            ].map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={styles.tabButtonActive}
            >
              <Text style={styles.tabButtonTextActive}>⚙️ 设置</Text>
            </TouchableOpacity>
          </View>
        </View>

        {renderSettings()}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <HelpModal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
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
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
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
  loginButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(93,155,250,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.25)',
    marginTop: 12,
  },
  loginText: {
    color: COLORS.PRIMARY,
    fontWeight: '700',
    fontSize: 14,
  },
  loginPrompt: {
    alignItems: 'center',
    padding: 20,
  },
  loginPromptTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  loginPromptDesc: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    marginBottom: 16,
  },
  loginPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY,
  },
  loginPromptButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
