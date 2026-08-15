import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Switch, Image, Modal, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getCurrentUser, clearAuthData } from '../../src/utils/auth';
import { authService } from '../../src/services/api';
import { API_BASE_URL } from '../../src/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HelpModal from '../../src/components/HelpModal';
import SubscriptionModal from '../../src/components/SubscriptionModal';
import { useProStatus } from '../../src/hooks/useProStatus';
import { PRIVACY_POLICY_CONTENT, TERMS_OF_SERVICE_CONTENT } from '../../src/constants/legal';

// 预设头像类型 → emoji 映射（与头像选择弹窗选项一致）
const AVATAR_EMOJIS: Record<'male' | 'female' | 'monster', string> = {
  male: '🧑',
  female: '👩',
  monster: '👾',
};

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
  const [activeDomainCount, setActiveDomainCount] = useState(0);
  const [showProModal, setShowProModal] = useState(false);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);
  const { isPro, planId, expiresAt, refresh: refreshPro } = useProStatus();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // 根据 API_BASE_URL 构造完整头像地址
  const getFullAvatarUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    // url 是 /api/uploads/... 或 /uploads/...
    // API_BASE_URL 如 http://119.91.133.45/api → 去掉末尾 /api 得到 host
    const base = API_BASE_URL.replace(/\/api\/?$/, '');
    return base + url;
  };

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限不足', '请在设置中允许访问相册');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled) return;
      const uri = result.assets?.[0]?.uri || (result as any).uri;
      if (!uri) return;

      const currentUser = await getCurrentUser();
      if (!currentUser?.id) {
        Alert.alert('提示', '请先登录');
        return;
      }
      const res = await authService.uploadAvatar(uri);
      setAvatarUrl(res.avatarUrl);
      currentUser.avatarUrl = res.avatarUrl;
      setUser({ ...currentUser });
      Alert.alert('成功', '头像已更新');
    } catch (error: any) {
      Alert.alert('上传失败', error.message || '请稍后重试');
    }
  };

  // 选择预设头像类型（弹窗内点击某个选项）
  const handleAvatarSelect = (type: 'male' | 'female' | 'monster') => {
    setPendingAvatarType(type);
  };

  // 确认修改预设头像
  const handleAvatarConfirm = () => {
    setAvatarType(pendingAvatarType);
    setShowAvatarModal(false);
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('[Profile] 开始加载用户数据');
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setIsLoggedIn(!!currentUser);
        if (currentUser?.avatarUrl) setAvatarUrl(currentUser.avatarUrl);
        console.log('[Profile] 用户登录状态:', !!currentUser);
      } catch (error) {
        console.error('[Profile] 加载用户数据失败:', error);
        setIsLoggedIn(false);
      }
    };

    loadUserData();
  }, []);

  const formatExpiryText = (): string => {
    if (!expiresAt) return '永久有效';
    const d = new Date(expiresAt);
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) + ' 到期';
  };

  const userData = {
    name: user?.username || 'LearnFlow用户',
    title: '学习探索者',
  };

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
      {/* 设置卡片组：学习提醒、深浅模式 */}
      <View style={styles.settingsGroup}>
        {settings.slice(0, 2).map((s, i) => (
          <View key={s.label} style={[styles.settingItem, i < 1 && styles.settingItemBorder]}>
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
        {/* ===== Pro 状态行已停用（2026-08-15）：付费功能关闭，隐藏会员/充值入口。原代码保留供恢复付费时复用 =====
        <View style={[styles.settingItem, styles.settingItemBorder]}>
          <TouchableOpacity
            onPress={() => setShowProModal(true)}
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: colors.proBg, borderWidth: 1.5, borderColor: colors.proBorder }]}>
              <Ionicons name="diamond" size={16} color={colors.pro} />
            </View>
            {isPro ? (
              <>
                <Text style={[styles.settingLabel, { color: colors.pro, fontWeight: '700' as const, flex: 1 }]}>PRO 会员</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginRight: 4 }}>{formatExpiryText()}</Text>
              </>
            ) : (
              <>
                <Text style={[styles.settingLabel, { color: colors.pro, fontWeight: '700' as const }]}>了解充值</Text>
                <View style={styles.settingRight}>
                  <Ionicons name="chevron-forward" size={16} color={colors.pro} />
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>
        */}
        {/* 隐私设置 */}
        <View style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <Ionicons name="shield" size={16} color={colors.textSecondary} />
          </View>
          <Text style={styles.settingLabel}>隐私设置</Text>
          <View style={styles.settingRight}>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </View>
        </View>
      </View>

      <View style={styles.settingsGroup}>
        {[
          { label: 'Learnflow指南', icon: 'star' as const, onPress: () => setShowGuideModal(true) },
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

      {/* 服务条款与隐私政策 */}
      <View style={styles.settingsGroup}>
        {[
          { label: '服务条款', icon: 'document-text' as const, onPress: () => setLegalModal('terms') },
          { label: '隐私政策', icon: 'shield-checkmark' as const, onPress: () => setLegalModal('privacy') },
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

        {/* 备案号入口（ICP 备案信息，点击跳转工信部官网） */}
        <TouchableOpacity
          style={[styles.settingItem, styles.settingItemBorder]}
          onPress={() => Linking.openURL('https://beian.miit.gov.cn/')}
          activeOpacity={0.7}
        >
          <View style={[styles.settingIconContainer, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
            <Ionicons name="shield-checkmark" size={16} color={colors.textSecondary} />
          </View>
          <Text style={styles.settingLabel}>备案号</Text>
          <View style={styles.settingRight}>
            <Text style={styles.settingText}>沪ICP备2026038623号</Text>
            <Ionicons name="open-outline" size={14} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>
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
    backgroundColor: colors.background,
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
    fontWeight: '600',
    fontSize: 28,
    marginBottom: 4,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  profileCardDark: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'rgba(108,91,123,0.5)',
    shadowOpacity: 1,
    elevation: 4,
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
    width: 64, height: 64, borderRadius: 16,
    backgroundColor: colors.borderLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.hairline,
  },
  avatarDark: {
    backgroundColor: colors.borderDark,
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 2,
  },
  avatarEmoji: { fontSize: 32 },
  avatarEditBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 22, height: 22, borderRadius: 6,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.background,
  },
  levelBadge: {
    position: 'absolute', bottom: -4, right: -4,
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.background,
  },
  levelBadgeDark: {
    borderColor: colors.background,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  levelBadgeText: { color: colors.onPrimary, fontSize: 10, fontWeight: '600',  },
  userInfo: { flex: 1, paddingTop: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  userName: { color: colors.textPrimary, fontSize: 22, fontWeight: '600',  },
  titleBadge: { backgroundColor: colors.borderLight, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 2 },
  titleBadgeDark: {
    backgroundColor: 'rgba(120,100,220,0.2)', borderWidth: 0.5, borderColor: 'rgba(160,140,240,0.15)',
  },
  titleBadgeText: { color: colors.primary, fontSize: 11, fontWeight: '500',  },
  userMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakText: { color: colors.textSecondary, fontSize: 12,  },
  metaSeparator: { color: colors.textTertiary, fontSize: 12, marginHorizontal: 4 },
  levelText: { color: colors.textSecondary, fontSize: 12,  },
  xpSection: {},
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  xpText: { color: colors.textSecondary, fontSize: 12,  },
  xpPercent: { color: colors.primary, fontSize: 12, fontWeight: '600',  },
  xpBar: { height: 8, backgroundColor: colors.border, borderRadius: 0, overflow: 'hidden' },
  xpBarDark: { backgroundColor: 'rgba(255,255,255,0.06)' },
  xpProgress: { height: '100%', backgroundColor: colors.primary, borderRadius: 0 },
  statsRow: {
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 12,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  statValue: {
    fontWeight: '600',
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
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.primary + '15',
    borderWidth: 1,
    borderColor: colors.primary + '30',
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabButtonText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '400',
  },
  tabButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  settingsGroup: {
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
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
    borderRadius: 8,
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
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary + '12',
    borderWidth: 1,
    borderColor: colors.primary + '25',
    marginTop: 12,
  },
  loginText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  loginPrompt: {
    alignItems: 'center',
    padding: 20,
  },
  loginPromptTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
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
    borderRadius: 14,
    backgroundColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  loginPromptButtonText: {
    color: colors.onPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  logoutButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.error + '12',
    borderWidth: 1,
    borderColor: colors.error + '25',
    marginTop: 12,
  },
  logoutText: {
    color: colors.error,
    fontWeight: '600',
    fontSize: 15,
  },
  // ---- Pro 升级板块 ----
  proSection: {
    marginHorizontal: 24,
    marginTop: 4,
    marginBottom: 20,
  },
  proCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.proBorder,
    backgroundColor: colors.proBg,
    overflow: 'hidden',
    position: 'relative',
  },
  proCardGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.12,
  },
  proCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  proCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  proCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.pro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proCardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  proCardBadge: {
    backgroundColor: colors.pro,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  proCardBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.onPrimary,
  },
  proFeatureList: {
    gap: 10,
    marginBottom: 16,
  },
  proFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  proFeatureCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.pro + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proFeatureText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  proUpgradeBtn: {
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  proUpgradeBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.onPrimary,
  },
  // 头像选择弹窗
  modalOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
    alignItems: 'center', justifyContent: 'center',
  },
  modalCard: {
    width: '80%', borderRadius: 16, padding: 24, alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  modalTitle: {
    fontSize: 18, fontWeight: '600',  marginBottom: 20,
  },
  avatarOptions: {
    flexDirection: 'row', gap: 12, marginBottom: 20,
  },
  avatarOption: {
    width: 80, height: 90, borderRadius: 14, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', gap: 6, borderColor: colors.hairline,
  },
  avatarOptionEmoji: { fontSize: 32 },
  avatarOptionLabel: { fontSize: 12, fontWeight: '600',  },
  modalCloseBtn: {
    paddingHorizontal: 32, paddingVertical: 10, borderRadius: 12,
  },
  modalCancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center',
  },
  modalConfirmBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center',
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
            </View>

            <View style={[styles.profileCard, isDark && styles.profileCardDark]}>
              <View style={styles.profileCardContent}>
                {isLoggedIn ? (
                  <>
                    <View style={styles.profileInfo}>
                      <TouchableOpacity
                        style={styles.avatarContainer}
                        onPress={() => {
                          Alert.alert('更换头像', '请选择头像设置方式', [
                            { text: '从相册上传', onPress: handlePickAvatar },
                            { text: '选择预设头像', onPress: () => setShowAvatarModal(true) },
                            { text: '取消', style: 'cancel' },
                          ]);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.avatar, isDark && styles.avatarDark]}>
                          {avatarUrl || user?.avatarUrl ? (
                            <Image
                              source={{ uri: getFullAvatarUrl(avatarUrl || user.avatarUrl) }}
                              style={{ width: '100%', height: '100%', borderRadius: 50 }}
                            />
                          ) : (
                            <Text style={styles.avatarEmoji}>{AVATAR_EMOJIS[avatarType]}</Text>
                          )}
                          <View style={[styles.avatarEditBadge, { backgroundColor: colors.primary }]}>
                            <Ionicons name="camera" size={12} color="#FFFFFF" />
                          </View>
                        </View>
                      </TouchableOpacity>
                      <View style={styles.userInfo}>
                        <View style={styles.nameRow}>
                          <Text style={styles.userName}>{userData.name}</Text>
                          {/* PRO 会员徽章已停用（2026-08-15）。原代码保留供恢复付费时复用
                          {isPro && (
                            <View style={{ backgroundColor: colors.proBg, borderWidth: 1, borderColor: colors.proBorder, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                              <Text style={{ color: colors.pro, fontSize: 10, fontWeight: '700' }}>PRO</Text>
                            </View>
                          )}
                          */}
                        </View>
                        <View style={{ flexDirection: 'row', gap: 16, marginTop: 6 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="calendar" size={13} color={colors.textSecondary} />
                            <Text style={{ color: colors.textSecondary, fontSize: 12,  }}>加入 {daysSinceJoin} 天</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="grid" size={13} color={colors.textSecondary} />
                            <Text style={{ color: colors.textSecondary, fontSize: 12,  }}>{domainCount} 个领域</Text>
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
          <View style={{ width: '90%', maxHeight: '80%', backgroundColor: colors.background, borderRadius: 4, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 32, borderBottomWidth: 1, borderBottomColor: colors.borderDark }}>
              <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '600',  }}>📖 Learnflow指南</Text>
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
                '🖐️ 首页模块：长按模块卡片可删除，轻点进入学习。',
                '🕐 每日凌晨5点重置游戏次数和每日数据。',
              ].map((tip, i) => (
                <Text key={i} style={{ color: colors.textSecondary, fontSize: 13,  lineHeight: 26, marginBottom: 14 }}>{tip}</Text>
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
                <Text style={{ color: colors.onPrimary, fontWeight: '600' }}>确认修改</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Pro 付费弹窗 */}
      <SubscriptionModal visible={showProModal} onClose={() => setShowProModal(false)} onProActivated={refreshPro} />

      {/* 法律文件弹窗 */}
      <Modal visible={legalModal !== null} animationType="slide" transparent onRequestClose={() => setLegalModal(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Pressable style={{ flex: 1.5 }} onPress={() => setLegalModal(null)} />
          <View style={{ flex: 8.5, backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.hairline }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
                {legalModal === 'privacy' ? '隐私政策' : '服务条款'}
              </Text>
              <TouchableOpacity style={{ padding: 4 }} onPress={() => setLegalModal(null)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {legalModal === 'privacy' ? <PRIVACY_POLICY_CONTENT /> : <TERMS_OF_SERVICE_CONTENT />}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );


};

export default ProfileScreen;
