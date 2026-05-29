import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getCurrentUser, clearAuthData } from '../../src/utils/auth';
import HelpModal from '../../src/components/HelpModal';

const ProfileScreen = () => {
  const { isDark, colors, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('[Profile] 开始加载用户数据');
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setIsLoggedIn(!!currentUser);
        console.log('[Profile] 用户登录状态:', !!currentUser);
      } catch (error) {
        console.error('[Profile] 加载用户数据失败:', error);
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
    { icon: 'moon' as const, label: isDark ? '深色模式' : '浅色模式', value: isDark, toggle: toggleTheme },
    { icon: 'globe' as const, label: '语言', text: '简体中文' },
    { icon: 'shield' as const, label: '隐私设置' },
  ];

  const handleLogout = () => {
    console.log('[Profile] 用户点击退出登录');
    Alert.alert('确认退出', '您确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: async () => {
          // 清除内存中的认证信息（token + 用户数据）
          // 业务数据（怪兽、笔记、进度等）保留不清除，重新登录后仍可访问
          await clearAuthData();
          // 重置组件状态，防止登录态残留
          setUser(null);
          setIsLoggedIn(false);
          console.log('[Profile] 退出登录完成，已清除认证数据');
          router.replace('/login');
        }
      }
    ]);
  };

  const handleLogin = () => {
    router.replace('/login');
  };

  const renderSettings = () => (
    <View style={styles.tabContent}>
      <View style={styles.settingsGroup}>
        {settings.map((s, i) => (
          <View key={s.label} style={[styles.settingItem, i < settings.length - 1 && styles.settingItemBorder]}>
            <View style={styles.settingIconContainer}>
              <Ionicons name={s.icon} size={16} color={colors.primary} />
            </View>
            <Text style={styles.settingLabel}>{s.label}</Text>
            {s.value !== undefined && s.toggle ? (
              <Switch
                value={s.value}
                onValueChange={s.toggle}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.primary }}
                thumbColor="#fff"
              />
            ) : (
              <View style={styles.settingRight}>
                {s.text && <Text style={styles.settingText}>{s.text}</Text>}
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.settingsGroup}>
        {[
          { label: '关于 LearnFlow', icon: 'star' as const, onPress: undefined },
          { label: '使用帮助', icon: 'help-circle' as const, onPress: () => setShowHelpModal(true) },
        ].map((item, i) => (
          <TouchableOpacity 
            key={item.label} 
            style={[styles.settingItem, i === 0 && styles.settingItemBorder]}
            onPress={item.onPress}
            disabled={!item.onPress}
            activeOpacity={item.onPress ? 0.7 : 1}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
              <Ionicons name={item.icon} size={16} color={colors.textSecondary} />
            </View>
            <Text style={styles.settingLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>

      {isLoggedIn ? (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={18} color={colors.error} />
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Ionicons name="log-in" size={18} color={colors.primary} />
          <Text style={styles.loginText}>登录账号</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const styles = useMemo(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.backgroundDark,
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
    color: colors.textPrimary,
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
    borderRadius: 20,
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  profileCardDark: {
    backgroundColor: 'rgba(100,100,160,0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowOpacity: 0,
    elevation: 0,
  },
  profileCardContent: {
    padding: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 20,
  },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: '#EAE8F6', alignItems: 'center', justifyContent: 'center',
  },
  avatarDark: {
    backgroundColor: '#6B65C0',
    shadowColor: '#7B75D8', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
  },
  avatarEmoji: { fontSize: 32 },
  levelBadge: {
    position: 'absolute', bottom: -4, right: -4,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  levelBadgeDark: {
    borderColor: '#0D0D1A',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  levelBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', fontFamily: 'Courier' },
  userInfo: { flex: 1, paddingTop: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  userName: { color: colors.textPrimary, fontSize: 22, fontWeight: '700', fontFamily: 'Courier' },
  titleBadge: { backgroundColor: '#EAE8F6', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  titleBadgeDark: {
    backgroundColor: 'rgba(120,100,220,0.2)', borderWidth: 0.5, borderColor: 'rgba(160,140,240,0.15)',
  },
  titleBadgeText: { color: colors.primary, fontSize: 11, fontWeight: '500', fontFamily: 'Courier' },
  userMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakText: { color: colors.textSecondary, fontSize: 12, fontFamily: 'Courier' },
  metaSeparator: { color: colors.textTertiary, fontSize: 12, marginHorizontal: 4 },
  levelText: { color: colors.textSecondary, fontSize: 12, fontFamily: 'Courier' },
  xpSection: {},
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  xpText: { color: colors.textSecondary, fontSize: 12, fontFamily: 'Courier' },
  xpPercent: { color: colors.primary, fontSize: 12, fontWeight: '600', fontFamily: 'Courier' },
  xpBar: { height: 8, backgroundColor: '#EAE8F6', borderRadius: 4, overflow: 'hidden' },
  xpBarDark: { backgroundColor: 'rgba(255,255,255,0.06)' },
  xpProgress: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  statsRow: {
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    color: colors.textSecondary,
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
    backgroundColor: colors.backgroundDark,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(123,117,216,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(123,117,216,0.3)',
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabButtonText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '400',
  },
  tabButtonTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  settingsGroup: {
    borderRadius: 16,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    backgroundColor: 'rgba(123,117,216,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingText: {
    color: colors.textSecondary,
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
    backgroundColor: 'rgba(123,117,216,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(123,117,216,0.25)',
    marginTop: 12,
  },
  loginText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  loginPrompt: {
    alignItems: 'center',
    padding: 20,
  },
  loginPromptTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  loginPromptDesc: {
    color: colors.textSecondary,
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
    backgroundColor: colors.primary,
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
    color: colors.error,
    fontWeight: '700',
    fontSize: 15,
  },
  bottomPadding: {
    height: 100,
  },
}), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerGradient} />
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle}>个人中心</Text>
              <TouchableOpacity style={styles.settingsButton}>
                <Ionicons name="settings" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.profileCard, isDark && styles.profileCardDark]}>
              <View style={styles.profileCardContent}>
                {isLoggedIn ? (
                  <>
                    <View style={styles.profileInfo}>
                      <View style={styles.avatarContainer}>
                        <View style={[styles.avatar, isDark && styles.avatarDark]}>
                          <Text style={styles.avatarEmoji}>🧑</Text>
                        </View>
                        <View style={[styles.levelBadge, isDark && styles.levelBadgeDark]}>
                          <Text style={styles.levelBadgeText}>{userData.level}</Text>
                        </View>
                      </View>
                      <View style={styles.userInfo}>
                        <View style={styles.nameRow}>
                          <Text style={styles.userName}>{userData.name}</Text>
                          <View style={[styles.titleBadge, isDark && styles.titleBadgeDark]}>
                            <Text style={styles.titleBadgeText}>{userData.title}</Text>
                          </View>
                        </View>
                        <View style={styles.userMeta}>
                          <Ionicons name="flame" size={14} color={colors.warning} />
                          <Text style={styles.streakText}> {userData.streak}天连续</Text>
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
                      <View style={[styles.xpBar, isDark && styles.xpBarDark]}>
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
              { label: '技能', value: userData.completedSkills, icon: 'diamond', color: colors.primary },
              { label: '小时', value: userData.studyHours, icon: 'flame', color: colors.warning },
              { label: '等级', value: userData.level, icon: 'ribbon', color: colors.success },
            ].map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
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

export default ProfileScreen;
