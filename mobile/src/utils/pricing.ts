// ====== 付费模式 — 定价与权益 ======

export type PlanId = 'monthly' | 'yearly' | 'lifetime';

export interface PricingPlan {
  id: PlanId;
  label: string;
  price: number;
  originalPrice?: number;  // 划线原价
  renewPrice?: number;     // 续费价格（连续包月用）
  unit: string;            // '月' | '年' | '永久'
  badge?: string;
  isPopular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'monthly',
    label: '连续包月',
    price: 9.9,
    renewPrice: 16,
    unit: '月',
    badge: '首月特惠',
    isPopular: true,
  },
  {
    id: 'yearly',
    label: '年卡',
    price: 148,
    originalPrice: 192,
    unit: '年',
    badge: '省¥44',
  },
  {
    id: 'lifetime',
    label: '永久会员',
    price: 228,
    unit: '永久',
    badge: '超值',
  },
];

export interface ProFeature {
  icon: string;
  title: string;
  freeLimit: string;
  proBenefit: string;
}

export const PRO_FEATURES: ProFeature[] = [
  {
    icon: 'grid-outline',
    title: '官方模块',
    freeLimit: '1',
    proBenefit: '无限',
  },
  {
    icon: 'sparkles-outline',
    title: 'AI生成领域',
    freeLimit: '1次',
    proBenefit: '无限',
  },
  {
    icon: 'flash-outline',
    title: '每日基础体力',
    freeLimit: '100 点（沉稳+20=120）',
    proBenefit: '无限',
  },
  {
    icon: 'arrow-redo-outline',
    title: '每日可跳转次数',
    freeLimit: '10 次（沉稳12次）',
    proBenefit: '无限',
  },
  {
    icon: 'diamond-outline',
    title: '每日基础能量 Π',
    freeLimit: '50 点',
    proBenefit: '1000 点/天',
  },
  {
    icon: 'shirt-outline',
    title: '怪兽装扮',
    freeLimit: '无',
    proBenefit: '每月更新3套',
  },
  {
    icon: 'lock-closed-outline',
    title: '学习模块权限',
    freeLimit: '1个官方 + 无限自定义',
    proBenefit: '全量解锁 + 无限自定义',
  },
  {
    icon: 'ban-outline',
    title: '广告体验',
    freeLimit: '可能有广告',
    proBenefit: '全程免广告',
  },
];

export type PaymentMethod = 'alipay' | 'wechat';

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'alipay', label: '支付宝', icon: 'logo-alipay' },
  { id: 'wechat', label: '微信支付', icon: 'logo-wechat' },
];

// AsyncStorage key
export const SUBSCRIPTION_STORAGE_KEY = 'user_subscription';
