import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView,
  Dimensions, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import {
  PRICING_PLANS, PRO_FEATURES,
  type PlanId,
} from '../utils/pricing';
import { proService } from '../services/api';
import { getCurrentUser } from '../utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUBSCRIPTION_STORAGE_KEY } from '../utils/pricing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onProActivated?: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ visible, onClose, onProActivated }) => {
  const { colors, isDark } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('monthly');
  const [showActivate, setShowActivate] = useState(false);
  const [activateCode, setActivateCode] = useState('');
  const [activating, setActivating] = useState(false);

  const selectedPlanData = PRICING_PLANS.find(p => p.id === selectedPlan)!;

  const handleSubscribe = () => {
    setShowActivate(true);
  };

  const handleActivate = async () => {
    const code = activateCode.trim().toUpperCase();
    if (!code) {
      Alert.alert('提示', '请输入激活码');
      return;
    }

    setActivating(true);
    try {
      const user = await getCurrentUser();
      if (!user?.id) {
        Alert.alert('提示', '请先登录');
        return;
      }

      const result = await proService.activate(code, user.id);
      
      // 存入本地缓存
      await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify({
        isPro: true,
        planId: result.planId,
        expiresAt: result.expiresAt,
        activatedAt: new Date().toISOString(),
      }));

      Alert.alert('激活成功', `恭喜！Pro 会员已激活${result.expiresAt ? '' : '（永久）'}`, [
        {
          text: '太好了',
          onPress: () => {
            setShowActivate(false);
            setActivateCode('');
            onClose();
            onProActivated?.();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('激活失败', error?.message || '激活码无效，请检查后重试');
    } finally {
      setActivating(false);
    }
  };

  const cardWidth = useMemo(() => {
    const padding = 32;
    const gaps = 20;
    return Math.floor((SCREEN_WIDTH - padding - gaps) / 3);
  }, []);

  const s = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.92)',
      justifyContent: 'flex-end',
    },
    container: {
      width: '100%',
      flex: 1,
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    handleBar: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? '#334155' : '#D1D5DB',
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 8,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 20,
      alignItems: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: '700' as const,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    proBadgeInline: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.proBg,
      borderWidth: 1,
      borderColor: colors.proBorder,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginTop: 12,
      gap: 6,
    },
    proBadgeText: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.pro,
    },
    // 定价卡片
    plansContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 20,
      paddingHorizontal: 16,
    },
    planCard: {
      width: cardWidth,
      borderRadius: 14,
      padding: 14,
      alignItems: 'center',
      borderWidth: 1.5,
      height: 150,
      justifyContent: 'center',
    },
    planSelected: { borderColor: colors.pro, backgroundColor: colors.proBg },
    planUnselected: { borderColor: colors.hairline, backgroundColor: colors.surface },
    planBadge: {
      position: 'absolute',
      top: -1,
      right: -1,
      backgroundColor: colors.pro,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderTopRightRadius: 14,
      borderBottomLeftRadius: 10,
    },
    planBadgeText: {
      fontSize: 9,
      fontWeight: '700' as const,
      color: '#FFFFFF',
    },
    planLabel: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.textSecondary,
      marginBottom: 6,
    },
    planPriceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 2,
    },
    planPriceSymbol: {
      fontSize: 16,
      fontWeight: '700' as const,
      color: colors.pro,
    },
    planPrice: {
      fontSize: 28,
      fontWeight: '800' as const,
      color: colors.textPrimary,
    },
    planOriginalPrice: {
      fontSize: 12,
      color: colors.stone,
      textDecorationLine: 'line-through',
      marginLeft: 4,
    },
    planUnit: {
      fontSize: 11,
      color: colors.muted,
      marginTop: 2,
    },
    // 激活码输入区域
    activateSection: {
      paddingHorizontal: 24,
      paddingVertical: 20,
      alignItems: 'center',
    },
    activateHint: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 20,
    },
    activateHintBold: {
      fontWeight: '600',
      color: colors.primary,
    },
    codeInputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      width: '100%',
      marginBottom: 20,
    },
    codeInput: {
      flex: 1,
      height: 50,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.proBorder,
      backgroundColor: colors.proBg,
      paddingHorizontal: 16,
      fontSize: 18,
      fontWeight: '700',
      color: colors.pro,
      textAlign: 'center',
      letterSpacing: 3,
    },
    // 对比表
    compareHeader: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderColor: colors.hairline,
      backgroundColor: colors.background,
    },
    compareHeaderCell: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    compareRow: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 12,
      alignItems: 'center',
    },
    compareCell: { flex: 1, textAlign: 'center' },
    // 底部
    bottomArea: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 32,
      gap: 10,
    },
    subscribeBtn: {
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    subscribeBtnText: {
      fontSize: 16,
      fontWeight: '700' as const,
      color: '#FFFFFF',
    },
    restoreBtn: {
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.hairline,
    },
    restoreBtnText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    closeBtn: {
      position: 'absolute',
      top: 16,
      right: 16,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    // 支付页头部
    activateHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 20,
      gap: 12,
    },
    backBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activateTitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: colors.textPrimary,
    },
    // 价格摘要
    summaryCard: {
      marginHorizontal: 24,
      marginVertical: 16,
      borderRadius: 14,
      padding: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.hairline,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: { fontSize: 14, color: colors.textSecondary },
    summaryValue: { fontSize: 18, fontWeight: '700' as const, color: colors.textPrimary },
    summaryContact: {
      fontSize: 13,
      color: colors.primary,
      textAlign: 'center',
      marginTop: 12,
      lineHeight: 20,
    },
  }), [colors, isDark, cardWidth]);

  // ---- 激活码输入弹窗 ----
  if (showActivate) {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={s.overlay}>
        <View style={s.container}>
          <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
            <View style={s.activateHeader}>
              <TouchableOpacity style={s.backBtn} onPress={() => setShowActivate(false)}>
                <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={s.activateTitle}>激活 Pro 会员</Text>
            </View>

            <View style={s.summaryCard}>
              <View style={[s.summaryRow, { marginBottom: 10 }]}>
                <Text style={s.summaryLabel}>已选套餐</Text>
                <Text style={s.summaryValue}>{selectedPlanData.label} · ¥{selectedPlanData.price}</Text>
              </View>
              <Text style={s.summaryContact}>
                请通过以下方式联系获取激活码：{'\n'}
                QQ：971117427 / 微信：lw971117427 {'\n'}
                QQ：2067567633 / 微信：wzy936490679
              </Text>
            </View>

            <View style={s.activateSection}>

              <View style={s.codeInputWrap}>
                <TextInput
                  style={s.codeInput}
                  value={activateCode}
                  onChangeText={setActivateCode}
                  placeholder="输入激活码"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="characters"
                  maxLength={16}
                />
              </View>

              <TouchableOpacity
                style={[s.subscribeBtn, { backgroundColor: colors.pro, width: '100%' }, (!activateCode.trim() || activating) && { opacity: 0.4 }]}
                onPress={handleActivate}
                disabled={!activateCode.trim() || activating}
                activeOpacity={0.85}
              >
                <Ionicons name="key" size={18} color="#FFF" />
                <Text style={s.subscribeBtnText}>
                  {activating ? '激活中...' : '激活 Pro'}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
        </View>
      </Modal>
    );
  }

  // ---- 主弹窗：套餐选择 ----
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.container}>
          <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
          <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={s.handleBar} />

          <View style={s.header}>
            <Text style={s.title}>解锁 LearnFlow Pro</Text>
            <Text style={s.subtitle}>释放全部学习潜力</Text>
            <View style={s.proBadgeInline}>
              <Ionicons name="star" size={14} color={colors.pro} />
              <Text style={s.proBadgeText}>Pro 会员专属权益</Text>
            </View>
          </View>

          {/* 定价方案 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.plansContainer}>
            {PRICING_PLANS.map(plan => {
              const isSelected = selectedPlan === plan.id;
              return (
                <TouchableOpacity
                  key={plan.id}
                  style={[s.planCard, isSelected ? s.planSelected : s.planUnselected]}
                  onPress={() => setSelectedPlan(plan.id)}
                  activeOpacity={0.85}
                >
                  {(plan.badge || plan.isPopular) && (
                    <View style={s.planBadge}>
                      <Text style={s.planBadgeText}>{plan.badge || '推荐'}</Text>
                    </View>
                  )}
                  <Text style={s.planLabel}>{plan.label}</Text>
                  {plan.renewPrice ? (
                    <>
                      <View style={s.planPriceRow}>
                        <Text style={s.planPriceSymbol}>¥</Text>
                        <Text style={s.planPrice}>{plan.price}</Text>
                      </View>
                      <Text style={[s.planUnit, { fontSize: 10 }]}> 续 ¥{plan.renewPrice}/月</Text>
                    </>
                  ) : (
                    <>
                      <View style={s.planPriceRow}>
                        <Text style={s.planPriceSymbol}>¥</Text>
                        <Text style={s.planPrice}>{plan.price}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
                        {plan.originalPrice && (
                          <Text style={s.planOriginalPrice}>¥{plan.originalPrice}</Text>
                        )}
                        <Text style={s.planUnit}>/ {plan.unit}</Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 权益对比 */}
          <View style={s.compareHeader}>
            <Text style={[s.compareHeaderCell, { flex: 1.2 }]}>功能</Text>
            <Text style={s.compareHeaderCell}>免费版</Text>
            <View style={[s.compareHeaderCell, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }]}>
              <Ionicons name="star" size={13} color={colors.pro} />
              <Text style={{ color: colors.pro, fontSize: 13, fontWeight: '600' as const }}>Pro 版</Text>
            </View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {PRO_FEATURES.map((feat, i) => (
              <View key={i} style={[s.compareRow, i < PRO_FEATURES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.hairline }]}>
                <View style={[s.compareCell, { flex: 1.2, flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                  <Ionicons name={feat.icon as any} size={14} color={colors.pro} />
                  <Text style={{ fontSize: 13, color: colors.textPrimary }}>{feat.title}</Text>
                </View>
                <Text style={[s.compareCell, { color: colors.stone, fontSize: 12 }]}>{feat.freeLimit}</Text>
                <Text style={[s.compareCell, { color: colors.pro, fontSize: 12, fontWeight: '600' as const }]}>{feat.proBenefit}</Text>
              </View>
            ))}
          </ScrollView>

          {/* 底部操作 */}
          <View style={s.bottomArea}>
            <TouchableOpacity
              style={[s.subscribeBtn, { backgroundColor: colors.pro }]}
              onPress={handleSubscribe}
              activeOpacity={0.85}
            >
              <Ionicons name="key" size={18} color="#FFF" />
              <Text style={s.subscribeBtnText}>
                输入激活码 · ¥{selectedPlanData.price}/{selectedPlanData.unit}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.restoreBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={s.restoreBtnText}>暂不升级，先用免费版</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

export default SubscriptionModal;
