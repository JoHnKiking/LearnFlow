import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import {
  PRICING_PLANS, PRO_FEATURES, PAYMENT_METHODS,
  type PlanId, type PaymentMethod,
} from '../utils/pricing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ visible, onClose }) => {
  const { colors, isDark } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('monthly');
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPay, setSelectedPay] = useState<PaymentMethod>('alipay');

  const selectedPlanData = PRICING_PLANS.find(p => p.id === selectedPlan)!;

  const handleSelectPlan = (id: PlanId) => {
    setSelectedPlan(id);
  };

  const handleSubscribe = () => {
    setShowPayment(true);
  };

  const handlePay = () => {
    // TODO: 接入真实支付 SDK
    // 当前仅做演示提示
    setShowPayment(false);
    onClose();
  };

  const cardWidth = useMemo(() => {
    const padding = 32; // 16 * 2
    const gaps = 20; // 10 * 2
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
    // ---- 定价卡片 ----
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
    planSelected: {
      borderColor: colors.pro,
      backgroundColor: colors.proBg,
    },
    planUnselected: {
      borderColor: colors.hairline,
      backgroundColor: colors.surface,
    },
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
      color: selectedPlanData ? colors.pro : colors.textPrimary,
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
    // ---- 权益对比 ----
    featureItem: {
      flexDirection: 'row',
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: colors.hairline,
      alignItems: 'center',
    },
    featureIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.proBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    featureBody: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.textPrimary,
      marginBottom: 2,
    },
    featureDesc: {
      fontSize: 12,
      color: colors.textTertiary,
    },
    freeTag: {
      fontSize: 12,
      color: colors.stone,
      textAlign: 'right',
    },
    proTag: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: colors.pro,
      textAlign: 'right',
    },
    // ---- 底部按钮 ----
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

    // ---- 支付方式选择（第二屏） ----
    paymentHeader: {
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
    paymentTitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: colors.textPrimary,
    },
    payMethodItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: colors.hairline,
      gap: 14,
    },
    payRadio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    payRadioSelected: {
      borderColor: colors.pro,
    },
    payRadioUnselected: {
      borderColor: colors.stone,
    },
    payRadioDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.pro,
    },
    payMethodInfo: {
      flex: 1,
    },
    payMethodLabel: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: colors.textPrimary,
    },
    payMethodHint: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 2,
    },
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
    summaryLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.textPrimary,
    },
    // 对比表
    compareHeader: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 10,
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
    compareCell: {
      flex: 1,
      textAlign: 'center',
    },
  }), [colors, isDark, selectedPlanData]);

  if (showPayment) {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={s.overlay}>
        <View style={s.container}>
          <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
            {/* 支付页头部 */}
            <View style={s.paymentHeader}>
              <TouchableOpacity style={s.backBtn} onPress={() => setShowPayment(false)}>
                <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={s.paymentTitle}>确认支付</Text>
            </View>

            {/* 已选方案摘要 */}
            <View style={s.summaryCard}>
              <View style={[s.summaryRow, { marginBottom: 10 }]}>
                <Text style={s.summaryLabel}>{selectedPlanData.label}</Text>
                <Text style={s.summaryValue}>¥{selectedPlanData.price}</Text>
              </View>
            </View>

            {/* 支付方式 */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {PAYMENT_METHODS.map(method => (
                <TouchableOpacity
                  key={method.id}
                  style={s.payMethodItem}
                  onPress={() => setSelectedPay(method.id)}
                  activeOpacity={0.7}
                >
                  <View style={[s.payRadio, selectedPay === method.id ? s.payRadioSelected : s.payRadioUnselected]}>
                    {selectedPay === method.id && <View style={s.payRadioDot} />}
                  </View>
                  <View style={s.payMethodInfo}>
                    <Text style={s.payMethodLabel}>{method.label}</Text>
                    <Text style={s.payMethodHint}>
                      {method.id === 'alipay' && '推荐使用支付宝快捷支付'}
                      {method.id === 'wechat' && '使用微信扫码支付'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 确认支付 */}
            <View style={s.bottomArea}>
              <TouchableOpacity
                style={[s.subscribeBtn, { backgroundColor: colors.pro }]}
                onPress={handlePay}
                activeOpacity={0.85}
              >
                <Ionicons name="shield-checkmark" size={20} color="#FFF" />
                <Text style={s.subscribeBtnText}>确认支付 ¥{selectedPlanData.price}</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.container}>
          <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
          <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={s.handleBar} />

          {/* 头部 */}
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
                  style={[
                    s.planCard,
                    isSelected ? s.planSelected : s.planUnselected,
                  ]}
                  onPress={() => handleSelectPlan(plan.id)}
                  activeOpacity={0.85}
                >
                  {(plan.badge || plan.isPopular) && (
                    <View style={s.planBadge}>
                      <Text style={s.planBadgeText}>{plan.badge || '推荐'}</Text>
                    </View>
                  )}
                  <Text style={s.planLabel}>{plan.label}</Text>
                  {/* 连续包月：显示首月 + 续月两个价格 */}
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

          {/* 权益对比 — 左右列表 */}
          <View style={[s.compareHeader, { borderBottomWidth: 1, borderColor: colors.hairline, backgroundColor: colors.background }]}>
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
              <Ionicons name="diamond" size={18} color="#FFF" />
              <Text style={s.subscribeBtnText}>
                立即开通 · ¥{selectedPlanData.price}/{selectedPlanData.unit}
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
