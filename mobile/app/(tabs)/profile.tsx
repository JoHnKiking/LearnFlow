import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getCurrentUser, clearAuthData } from '../../src/utils/auth';
import { userService } from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HelpModal from '../../src/components/HelpModal';

const ProfileScreen = () => {
  const { isDark, colors, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarType, setAvatarType] = useState<'male' | 'female' | 'monster'>('male');
  const [pendingAvatarType, setPendingAvatarType] = useState<'male' | 'female' | 'monster'>('male');
  const [daysSinceJoin, setDaysSinceJoin] = useState(0);
  const [domainCount, setDomainCount] = useState(0);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('[Profile] 开始加载用户数据');
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setIsLoggedIn(!!currentUser);
        // 加载头像类型
        const savedAvatar = await AsyncStorage.getItem('userAvatar');
        if (savedAvatar) setAvatarType(savedAvatar as 'male' | 'female' | 'monster');
        // 计算注册天数
        if (currentUser?.createdAt) {
          const created = new Date(currentUser.createdAt);
          const now = new Date();
          setDaysSinceJoin(Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
        }
        console.log('[Profile] 用户登录状态:', !!currentUser);
      } catch (error) {
        console.error('[Profile] 加载用户数据失败:', error);
        setIsLoggedIn(false);
      }
    };

    loadUserData();
  }, []);

  // 每次聚焦时重新计算领域数量（删除/添加后实时反映）
  useFocusEffect(useCallback(() => {
    const countDomains = async () => {
      const selected = await AsyncStorage.getItem('selectedModules');
      if (selected) {
        const list = JSON.parse(selected) as string[];
        setDomainCount(list.length);
      } else {
        setDomainCount(3); // 默认3个预设
      }
    };
    countDomains();
  }, []));

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

  const settings: Array<{ icon: 'notifications' | 'moon' | 'shield'; label: string; value?: boolean; toggle?: () => void; text?: string }> = [
    { icon: 'notifications' as const, label: '学习提醒', value: notifications, toggle: () => setNotifications(!notifications) },
    { icon: 'moon' as const, label: isDark ? '深色模式' : '浅色模式', value: isDark, toggle: toggleTheme },
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

  const handleAvatarSelect = (type: 'male' | 'female' | 'monster') => {
    // 先预览选中，不立即保存
    setPendingAvatarType(type);
  };

  const handleAvatarConfirm = async () => {
    setAvatarType(pendingAvatarType);
    await AsyncStorage.setItem('userAvatar', pendingAvatarType);
    setShowAvatarModal(false);
    // 同步到服务端（通过统一 API 服务）
    try {
      await userService.updateProfile({ avatar: pendingAvatarType });
    } catch (e) { /* 静默失败，优先本地存储 */ }
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
              <Ionicons name={s.icon} size={16} color={colors.textSecondary} />
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
          { label: 'LearnFlow指南', icon: 'book' as const, onPress: () => setShowGuideModal(true) },
          { label: '使用反馈', icon: 'chatbox-ellipses' as const, onPress: () => setShowHelpModal(true) },
        ].map((item, i) => (
          <TouchableOpacity 
            key={item.label} 
            style={[styles.settingItem, i === 0 && styles.settingItemBorder]}
            onPress={item.onPress}
            activeOpacity={0.7}
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  profilePlanet1: {
    position: 'absolute',
    top: -10,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    opacity: 0.15,
  },
  profilePlanet2: {
    position: 'absolute',
    top: 30,
    left: -30,
    width: 90,
    height: 90,
    borderRadius: 45,
    opacity: 0.1,
  },
  profileRing: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: 100,
    height: 35,
    borderWidth: 3,
    borderRadius: 50,
    transform: [{ rotate: '25deg' }],
    opacity: 0.15,
  },
  profileStar1: {
    position: 'absolute',
    top: 15,
    left: 30,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  profileStar2: {
    position: 'absolute',
    top: 60,
    right: 70,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  profileStar3: {
    position: 'absolute',
    top: 85,
    left: 90,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  headerContent: {
    position: 'relative',
    zIndex: 1,
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
    fontSize: 28,
    fontFamily: 'Courier',
    marginBottom: 4,
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
    borderWidth: 1,
    borderColor: colors.borderLight,
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
  avatarEditBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.background,
  },
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
    backgroundColor: colors.borderLight,
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
  // 头像选择弹窗
  modalOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
    alignItems: 'center', justifyContent: 'center',
  },
  modalCard: {
    width: '80%', borderRadius: 20, padding: 24, alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18, fontWeight: '700', fontFamily: 'Courier', marginBottom: 20,
  },
  avatarOptions: {
    flexDirection: 'row', gap: 12, marginBottom: 20,
  },
  avatarOption: {
    width: 80, height: 90, borderRadius: 16, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  avatarOptionEmoji: { fontSize: 32 },
  avatarOptionLabel: { fontSize: 12, fontWeight: '600', fontFamily: 'Courier' },
  modalCloseBtn: {
    paddingHorizontal: 32, paddingVertical: 10, borderRadius: 12,
  },
  modalCancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
  },
  modalConfirmBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
  },
  bottomPadding: {
    height: 100,
  },
}), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerDecorations} pointerEvents="none">
            <View style={[styles.profilePlanet1, { borderColor: colors.primary }]} />
            <View style={[styles.profilePlanet2, { backgroundColor: colors.success + '25' }]} />
            <View style={[styles.profileRing, { borderColor: colors.primary + '35' }]} />
            <View style={[styles.profileStar1, { backgroundColor: colors.primary }]} />
            <View style={[styles.profileStar2, { backgroundColor: colors.warning }]} />
            <View style={[styles.profileStar3, { backgroundColor: colors.success }]} />
          </View>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle}>个人中心</Text>
            </View>

            <View style={[styles.profileCard, isDark && styles.profileCardDark]}>
              <View style={styles.profileCardContent}>
                {isLoggedIn ? (
                  <>
                    <View style={styles.profileInfo}>
                      <TouchableOpacity style={styles.avatarContainer} onPress={() => setShowAvatarModal(true)} activeOpacity={0.7}>
                        <View style={[styles.avatar, isDark && styles.avatarDark]}>
                          {avatarType === 'male' && <Text style={styles.avatarEmoji}>🧑</Text>}
                          {avatarType === 'female' && <Text style={styles.avatarEmoji}>👩</Text>}
                          {avatarType === 'monster' && <Text style={styles.avatarEmoji}>👾</Text>}
                        </View>
                        {/* 编辑角标 —— 暗示头像可点击更换 */}
                        <View style={styles.avatarEditBadge}>
                          <Ionicons name="pencil" size={12} color="#FFFFFF" />
                        </View>
                      </TouchableOpacity>
                      <View style={styles.userInfo}>
                        <View style={styles.nameRow}>
                          <Text style={styles.userName}>{userData.name}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 16, marginTop: 6 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="calendar" size={13} color={colors.textSecondary} />
                            <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: 'Courier' }}>加入 {daysSinceJoin} 天</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="grid" size={13} color={colors.textSecondary} />
                            <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: 'Courier' }}>{domainCount} 个领域</Text>
                          </View>
                        </View>
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

      {/* LearnFlow 指南弹窗 —— 样式与 HelpModal 保持一致 */}
      {showGuideModal && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: '90%', maxHeight: '80%', backgroundColor: colors.background, borderRadius: 24, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 32, borderBottomWidth: 1, borderBottomColor: colors.borderDark }}>
              <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700', fontFamily: 'Courier' }}>📖 LearnFlow 指南</Text>
              <TouchableOpacity onPress={() => setShowGuideModal(false)} style={{ padding: 8 }}>
                <Ionicons name="close" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20, paddingVertical: 16, maxHeight: 400 }} contentContainerStyle={{ paddingBottom: 24 }}>
              {[
                '💪 体力系统：学习消耗体力，完成游戏可恢复。',
                '⚡ Π 能量：通过专注学习收集，无上限。对话消耗能量 = 怪兽回复字数 × 0.05。',
                '🎮 小游戏：每日可玩3次，恢复体力。叛逆型怪兽双倍奖励。',
                '📚 学习地图：选择领域→技能树→点击节点→跳转学习。',
                '⏰ 番茄钟：专注计时页面可点怪兽图标对话答疑。',
                '🦊 小怪兽：活力型学习减时，沉稳型多体力，叛逆型双倍。',
                '📝 自定义模块：创建专属领域，向左滑动可删除。',
                '🕐 每日凌晨5点重置游戏次数和每日数据。',
              ].map((tip, i) => (
                <Text key={i} style={{ color: colors.textSecondary, fontSize: 13, fontFamily: 'Courier', lineHeight: 26, marginBottom: 14 }}>{tip}</Text>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* 头像选择弹窗 */}
      {showAvatarModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>选择头像</Text>
            <View style={styles.avatarOptions}>
              {[
                { type: 'male' as const, emoji: '🧑', label: '男生' },
                { type: 'female' as const, emoji: '👩', label: '女生' },
                { type: 'monster' as const, emoji: '👾', label: '小怪兽' },
              ].map(opt => (
                <TouchableOpacity
                  key={opt.type}
                  style={[
                    styles.avatarOption,
                    { backgroundColor: pendingAvatarType === opt.type ? (colors.primary + '20') : colors.borderLight, borderColor: pendingAvatarType === opt.type ? colors.primary : 'transparent' },
                  ]}
                  onPress={() => handleAvatarSelect(opt.type)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.avatarOptionEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.avatarOptionLabel, { color: pendingAvatarType === opt.type ? colors.primary : colors.textSecondary }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity style={[styles.modalCancelBtn, { backgroundColor: colors.borderLight }]} onPress={() => { setPendingAvatarType(avatarType); setShowAvatarModal(false); }}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirmBtn, { backgroundColor: colors.primary }]} onPress={handleAvatarConfirm}>
                <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>确认修改</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );


};

export default ProfileScreen;
