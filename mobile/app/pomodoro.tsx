import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, AppState, Alert, TextInput,
  AppStateStatus, Modal, Animated, Easing, Dimensions, Linking, BackHandler,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Brightness from 'expo-brightness';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useTheme } from '../src/contexts/ThemeContext';
import MonsterIcon from '../src/components/MonsterIcon';
import { getCurrentUser } from '../src/utils/auth';
import { monsterService } from '../src/services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PROGRESS_SIZE = SCREEN_WIDTH * 0.55;
const STROKE_WIDTH = 6;
const TICK_MS = 100;

const POMODORO_STATE_KEY = 'pomodoro_runtime';

const formatDisplay = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const PomodoroScreen = () => {
  const { nodeName, url, duration } = useLocalSearchParams<{
    nodeName?: string; url?: string; duration: string;
  }>();
  const { colors } = useTheme();

  const totalSeconds = parseInt(duration || '25', 10) * 60;

  console.log('[Pomodoro] 启动番茄钟', { nodeName, url, duration, totalSeconds });

  const [timerSeconds, setTimerSeconds] = useState(totalSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [actionConfirm, setActionConfirm] = useState<{
    type: 'pause' | 'resume' | 'reset' | 'stop';
  } | null>(null);
  const [showBrightness, setShowBrightness] = useState(false);
  const [brightness, setBrightness] = useState(0.5);
  const [rewards, setRewards] = useState({ stamina: 0, energy: 0 });

  // 怪兽对话状态
  const [showMonsterChat, setShowMonsterChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [energyInfo, setEnergyInfo] = useState<{ cost: number; remaining: number } | null>(null);
  const [monsterType, setMonsterType] = useState<'lively' | 'calm' | 'rebel'>('lively');

  // 加载怪兽类型
  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        if (!user?.id) return;
        // 用与 monster 页相同的 API 实例获取怪兽数据
        const res = await monsterService.getMonsterStatus(user.id);
        if (res?.success && res.data?.personality) {
          setMonsterType(res.data.personality);
        }
      } catch {}
    })();
  }, []);

  const completedRef = useRef(false);
  const exitedRef = useRef(false);
  const startRef = useRef(Date.now());
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedRef = useRef(0);
  const isPausedRef = useRef(false);
  const timerRef = useRef(totalSeconds);
  const appStateRef = useRef<AppStateStatus>('active');
  const initialBrightnessRef = useRef(0.5);

  const navigation = useNavigation();

  // 拦截硬件返回 & 手势返回
  useEffect(() => {
    const backAction = () => {
      if (completedRef.current) return false;
      setShowExitConfirm(true);
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (completedRef.current) return;
      e.preventDefault();
      setShowExitConfirm(true);
    });

    return () => {
      backHandler.remove();
      unsubscribe();
    };
  }, [navigation]);

  // 环形进度动画
  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  // KeepAwake + Brightness
  useEffect(() => {
    activateKeepAwakeAsync('pomodoro');
    Brightness.getBrightnessAsync().then(b => {
      initialBrightnessRef.current = b;
      setBrightness(b);
    });
    return () => {
      deactivateKeepAwake('pomodoro');
      Brightness.setBrightnessAsync(initialBrightnessRef.current);
    };
  }, []);

  const handleBrightnessChange = useCallback(async (val: number) => {
    setBrightness(val);
    await Brightness.setBrightnessAsync(val);
  }, []);

  // 持久化运行时状态（用于崩溃/杀进程恢复判断）
  const persistRuntime = useCallback(async () => {
    if (completedRef.current || exitedRef.current) return;
    await AsyncStorage.setItem(POMODORO_STATE_KEY, JSON.stringify({
      totalSeconds,
      startTime: startRef.current,
      pausedAt: pausedAtRef.current,
      totalPaused: totalPausedRef.current,
      nodeName,
      url,
      duration,
    }));
  }, [totalSeconds, nodeName, url, duration]);

  const clearRuntime = useCallback(async () => {
    await AsyncStorage.removeItem(POMODORO_STATE_KEY);
  }, []);

  // 计算已过秒数
  const getElapsed = useCallback(() => {
    const now = Date.now();
    let pausedMs = totalPausedRef.current;
    if (pausedAtRef.current) {
      pausedMs += now - pausedAtRef.current;
    }
    return Math.floor((now - startRef.current - pausedMs) / 1000);
  }, []);

  // 主计时循环
  useEffect(() => {
    const tick = () => {
      if (completedRef.current || exitedRef.current) return;
      if (isPausedRef.current) return;

      const elapsed = getElapsed();
      const remaining = Math.max(0, totalSeconds - elapsed);
      timerRef.current = remaining;
      setTimerSeconds(remaining);

      if (remaining <= 0) {
        completedRef.current = true;
        setIsCompleted(true);
        setIsPaused(false);
        clearRuntime();
        // 计算奖励
        const staminaReward = Math.ceil(parseInt(duration || '25', 10) / 5);
        const energyReward = Math.floor(parseInt(duration || '25', 10) / 10);
        console.log('[Pomodoro] 计时完成，发放奖励', { staminaReward, energyReward });
        setRewards({ stamina: staminaReward, energy: energyReward });
        // 发放奖励到怪兽
        AsyncStorage.getItem('monster').then(monster => {
          if (monster) {
            const m = JSON.parse(monster);
            m.stamina = Math.min(m.stamina + staminaReward, m.maxStamina);
            m.paiEnergy = Math.min(m.paiEnergy + energyReward, m.maxPaiEnergy);
            AsyncStorage.setItem('monster', JSON.stringify(m));
          }
        });
      }
    };

    const interval = setInterval(tick, TICK_MS);
    tick(); // 立即执行一次

    return () => clearInterval(interval);
  }, [totalSeconds, getElapsed, clearRuntime, duration]);

  // 进度动画同步
  useEffect(() => {
    if (completedRef.current) return;
    const progress = timerSeconds / totalSeconds;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: TICK_MS * 3,
      useNativeDriver: false,
    }).start();
  }, [timerSeconds, totalSeconds]);

  // AppState 监听
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;

      if (prev === 'active' && nextState !== 'active') {
        console.log('[Pomodoro] 切到后台，保存运行状态');
        persistRuntime();
      } else if (prev !== 'active' && nextState === 'active') {
        console.log('[Pomodoro] 回到前台，恢复计时');
        if (exitedRef.current || completedRef.current) return;

        if (isPausedRef.current) return;

        const elapsed = getElapsed();
        const remaining = Math.max(0, totalSeconds - elapsed);
        if (remaining <= 0) {
          completedRef.current = true;
          setIsCompleted(true);
          clearRuntime();
          const staminaReward = Math.ceil(parseInt(duration || '25', 10) / 5);
          const energyReward = Math.floor(parseInt(duration || '25', 10) / 10);
          setRewards({ stamina: staminaReward, energy: energyReward });
          AsyncStorage.getItem('monster').then(monster => {
            if (monster) {
              const m = JSON.parse(monster);
              m.stamina = Math.min(m.stamina + staminaReward, m.maxStamina);
              m.paiEnergy = Math.min(m.paiEnergy + energyReward, m.maxPaiEnergy);
              AsyncStorage.setItem('monster', JSON.stringify(m));
            }
          });
        } else {
          timerRef.current = remaining;
          setTimerSeconds(remaining);
        }
      }
    });

    return () => subscription.remove();
  }, [totalSeconds, getElapsed, persistRuntime, clearRuntime, duration]);

  // 页面挂载时校验：如果是杀进程重启，进度作废
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(POMODORO_STATE_KEY);
      if (stored) {
        console.log('[Pomodoro] 检测到上次异常退出，进度作废');
        // 存在运行时状态说明上次异常退出（杀进程/崩溃），本次进度作废
        await clearRuntime();
      }
      startRef.current = Date.now();
      totalPausedRef.current = 0;
      pausedAtRef.current = null;
    })();
  }, []);

  // ---- 操作处理 ----

  const handlePause = useCallback(() => {
    if (completedRef.current) return;
    if (!isPausedRef.current) {
      setActionConfirm({ type: 'pause' });
    } else {
      setActionConfirm({ type: 'resume' });
    }
  }, []);

  const confirmAction = useCallback(() => {
    if (!actionConfirm) return;
    const type = actionConfirm.type;
    console.log('[Pomodoro] 确认操作:', type);
    setActionConfirm(null);

    switch (type) {
      case 'pause':
        isPausedRef.current = true;
        pausedAtRef.current = Date.now();
        setIsPaused(true);
        break;
      case 'resume':
        if (pausedAtRef.current) {
          totalPausedRef.current += Date.now() - pausedAtRef.current;
          pausedAtRef.current = null;
        }
        isPausedRef.current = false;
        setIsPaused(false);
        break;
      case 'reset':
        totalPausedRef.current = 0;
        pausedAtRef.current = null;
        isPausedRef.current = false;
        startRef.current = Date.now();
        timerRef.current = totalSeconds;
        setTimerSeconds(totalSeconds);
        setIsPaused(false);
        setIsCompleted(false);
        completedRef.current = false;
        break;
      case 'stop':
        exitedRef.current = true;
        completedRef.current = true;
        clearRuntime();
        router.back();
        break;
    }
  }, [actionConfirm, totalSeconds, clearRuntime]);

  const handleReset = useCallback(() => {
    if (completedRef.current) return;
    setActionConfirm({ type: 'reset' });
  }, []);

  const handleStop = useCallback(() => {
    if (completedRef.current) return;
    setActionConfirm({ type: 'stop' });
  }, []);

  const confirmExit = useCallback(() => {
    console.log('[Pomodoro] 确认退出，计时终止，无奖励');
    setShowExitConfirm(false);
    exitedRef.current = true;
    completedRef.current = true;
    clearRuntime();
    router.back();
  }, [clearRuntime]);

  const handleCompletionBack = useCallback(() => {
    router.back();
  }, []);

  // ---- styles ----

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 20, paddingVertical: 12,
    },
    headerLeft: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    headerTitle: { fontSize: 15, fontWeight: '600', color: colors.textSecondary, fontFamily: 'Courier' },
    headerNode: { fontSize: 12, color: colors.textTertiary, fontFamily: 'Courier', marginTop: 2 },
    brightnessBtn: {
      width: 36, height: 36, borderRadius: 4, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.borderDark, borderWidth: 2, borderColor: colors.primary,
    },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    progressContainer: {
      width: PROGRESS_SIZE, height: PROGRESS_SIZE, alignItems: 'center', justifyContent: 'center',
    },
    progressBg: {
      position: 'absolute', width: PROGRESS_SIZE, height: PROGRESS_SIZE,
      borderRadius: 8, borderWidth: STROKE_WIDTH,
      borderColor: colors.primary,
    },
    timerBox: {
      backgroundColor: colors.card,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: colors.primary,
      zIndex: 10,
    },
    timerText: {
      fontSize: 40, fontWeight: '900', 
      color: '#4F46E5',
      fontFamily: 'Courier',
      letterSpacing: 2,
    },
    timerSub: {
      fontSize: 14, color: colors.textSecondary, fontFamily: 'Courier', marginTop: 8,
    },
    pausedHint: {
      fontSize: 13, color: colors.warning, fontFamily: 'Courier', marginTop: 4, opacity: 0.8,
    },
    controls: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 20, paddingVertical: 32, paddingHorizontal: 20,
    },
    ctrlBtn: {
      width: 64, height: 64, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 0,
    },
    ctrlBtnCenter: {
      width: 76, height: 76, borderRadius: 8,
    },
    ctrlLabel: {
      fontSize: 11, color: colors.textTertiary, fontFamily: 'Courier', marginTop: 6, textAlign: 'center',
    },
    ctrlWrapper: { alignItems: 'center' },
    // 亮度滑块
    brightnessContainer: {
      position: 'absolute', bottom: 100, left: 40, right: 40,
      backgroundColor: colors.surface, borderRadius: 8, padding: 16,
      borderWidth: 3, borderColor: colors.primary,
    },
    brightnessRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
    },
    brightnessTrack: {
      flex: 1, height: 8, backgroundColor: colors.borderDark, borderRadius: 0,
    },
    brightnessFill: {
      height: '100%', borderRadius: 0, backgroundColor: colors.primary,
    },
    brightnessHandle: {
      position: 'absolute', top: -8, width: 24, height: 24, borderRadius: 0,
      backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.textPrimary,
      left: '50%', marginLeft: -12,
    },
    // 完成覆盖层
    completionOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.background,
      alignItems: 'center', justifyContent: 'center',
      padding: 40,
      zIndex: 10,
    },
    completeIcon: { fontSize: 64, marginBottom: 20 },
    completeTitle: {
      fontSize: 32, fontWeight: '800', color: colors.warning, fontFamily: 'Courier',
      marginBottom: 8,
    },
    completeSub: {
      fontSize: 16, color: colors.textSecondary, fontFamily: 'Courier',
      marginBottom: 32, textAlign: 'center',
    },
    rewardsContainer: {
      flexDirection: 'row', gap: 32, marginBottom: 40,
    },
    rewardItem: { alignItems: 'center' },
    rewardValue: {
      fontSize: 28, fontWeight: '800', color: colors.warning, fontFamily: 'Courier',
    },
    rewardLabel: {
      fontSize: 14, color: colors.textSecondary, fontFamily: 'Courier', marginTop: 4,
    },
    backBtn: {
      paddingHorizontal: 32, paddingVertical: 14, backgroundColor: colors.primary,
      borderRadius: 8, borderWidth: 3, borderColor: colors.textPrimary,
    },
    backBtnText: {
      color: colors.textInverse, fontSize: 16, fontWeight: '700', fontFamily: 'Courier',
    },
    gotoBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      paddingHorizontal: 32, paddingVertical: 12, backgroundColor: colors.primary,
      borderRadius: 8, marginBottom: 12, borderWidth: 3, borderColor: colors.textPrimary,
    },
    gotoBtnText: {
      color: colors.textInverse, fontSize: 15, fontWeight: '600', fontFamily: 'Courier',
    },
    navLinkBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
      paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8,
      backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.primary,
      marginTop: 12,
    },
    navLinkText: {
      fontSize: 14, color: colors.primary, fontWeight: '600', fontFamily: 'Courier',
    },
    // 确认弹窗
    confirmOverlay: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 40,
    },
    confirmCard: {
      width: '100%', maxWidth: 320, backgroundColor: colors.surface, borderRadius: 8,
      padding: 24, borderWidth: 3, borderColor: colors.primary,
      alignItems: 'center',
    },
    confirmTitle: {
      fontSize: 18, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Courier',
      marginBottom: 8,
    },
    confirmMsg: {
      fontSize: 14, color: colors.textSecondary, fontFamily: 'Courier',
      textAlign: 'center', marginBottom: 24, lineHeight: 20,
    },
    confirmMsgNote: {
      fontSize: 13, color: colors.textTertiary, fontFamily: 'Courier',
      textAlign: 'center', marginBottom: 24, lineHeight: 18,
    },
    confirmRow: {
      flexDirection: 'row', gap: 12, width: '100%',
    },
    confirmCancel: {
      flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center',
      backgroundColor: colors.borderDark, borderWidth: 2, borderColor: colors.textSecondary,
    },
    confirmCancelText: {
      fontSize: 15, color: colors.textSecondary, fontWeight: '600', fontFamily: 'Courier',
    },
    confirmDanger: {
      flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center',
      backgroundColor: colors.error, borderWidth: 2, borderColor: colors.textPrimary,
    },
    confirmDangerText: {
      fontSize: 15, color: colors.textInverse, fontWeight: '600', fontFamily: 'Courier',
    },
    confirmPrimary: {
      flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center',
      backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.textPrimary,
    },
    confirmPrimaryText: {
      fontSize: 15, color: colors.textInverse, fontWeight: '600', fontFamily: 'Courier',
    },
    // 怪兽对话弹窗样式
    chatOverlay: { flex: 1, justifyContent: 'flex-end' },
    chatCard: {
      borderTopLeftRadius: 20, borderTopRightRadius: 20,
      paddingBottom: 20, overflow: 'hidden',
    },
    chatHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      padding: 16, borderBottomWidth: 1,
    },
    chatTitle: { fontSize: 16, fontWeight: '700', fontFamily: 'Courier' },
    chatBubble: {
      maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, marginBottom: 8,
    },
    energyBar: {
      marginHorizontal: 16, padding: 10, borderRadius: 10, alignItems: 'center', marginBottom: 8,
    },
    chatInputRow: {
      flexDirection: 'row', alignItems: 'flex-end', gap: 8,
      paddingHorizontal: 16, paddingTop: 8, borderTopWidth: 1,
    },
    chatTextInput: {
      flex: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
      fontSize: 13, fontFamily: 'Courier', maxHeight: 80,
    },
    chatSendBtn: {
      width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    },
  }), [colors]);

  // ---- 完成覆盖层 ----
  const renderCompletion = () => (
    <View style={styles.completionOverlay}>
      <Animated.Text style={[styles.completeIcon, { transform: [{ scale: pulseAnim }] }]}>
        🎉
      </Animated.Text>
      <Text style={styles.completeTitle}>专注完成！</Text>
      <Text style={styles.completeSub}>
        小怪兽为你感到骄傲，你完整完成了 {duration} 分钟的专注学习
      </Text>
      <View style={styles.rewardsContainer}>
        <View style={styles.rewardItem}>
          <Text style={styles.rewardValue}>+{rewards.stamina}</Text>
          <Text style={styles.rewardLabel}>💪 体力</Text>
        </View>
        <View style={styles.rewardItem}>
          <Text style={styles.rewardValue}>+{rewards.energy}</Text>
          <Text style={styles.rewardLabel}>⚡ 能量Π</Text>
        </View>
      </View>
      {url ? (
        <TouchableOpacity
          style={styles.gotoBtn}
          onPress={async () => {
            console.log('[Pomodoro] 跳转学习网页', url);
            const supported = await Linking.canOpenURL(url);
            if (supported) {
              Linking.openURL(url).catch(err => {
                console.error('[Pomodoro] Linking error:', err);
                Alert.alert('错误', '无法打开链接，请检查网络连接');
              });
            } else {
              Alert.alert('错误', '设备不支持打开此链接');
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="open-outline" size={18} color="#FFFFFF" />
          <Text style={styles.gotoBtnText}>去学习网页</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity style={styles.backBtn} onPress={handleCompletionBack} activeOpacity={0.7}>
        <Text style={styles.backBtnText}>返回节点列表 ✨</Text>
      </TouchableOpacity>
    </View>
  );

  // ---- 操作确认弹窗 ----
  const renderActionModal = () => {
    if (!actionConfirm) return null;
    const { type } = actionConfirm;

    let title = '';
    let msg = '';
    let confirmStyle = styles.confirmPrimary;
    let confirmTextStyle = styles.confirmPrimaryText;

    switch (type) {
      case 'pause':
        title = '暂停计时';
        msg = '暂停后计时将停止，你可以随时继续';
        break;
      case 'resume':
        title = '继续计时';
        msg = '专注计时将继续进行';
        break;
      case 'reset':
        title = '重置计时';
        msg = '当前进度将全部清零，无法恢复';
        confirmStyle = styles.confirmDanger;
        confirmTextStyle = styles.confirmDangerText;
        break;
      case 'stop':
        title = '结束计时';
        msg = '此次专注将终止，本次无法获得任何奖励';
        confirmStyle = styles.confirmDanger;
        confirmTextStyle = styles.confirmDangerText;
        break;
    }

    return (
      <Modal visible transparent onRequestClose={() => setActionConfirm(null)} animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>{title}</Text>
            <Text style={styles.confirmMsg}>{msg}</Text>
            <View style={styles.confirmRow}>
              <TouchableOpacity style={styles.confirmCancel} onPress={() => setActionConfirm(null)} activeOpacity={0.7}>
                <Text style={styles.confirmCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={confirmStyle} onPress={confirmAction} activeOpacity={0.7}>
                <Text style={confirmTextStyle}>确认</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // ---- 退出强提醒弹窗 ----
  const renderExitModal = () => (
    <Modal visible={showExitConfirm} transparent onRequestClose={() => setShowExitConfirm(false)} animationType="fade">
      <View style={styles.confirmOverlay}>
        <View style={styles.confirmCard}>
          <Text style={styles.confirmTitle}>是否退出</Text>
          <Text style={styles.confirmMsgNote}>注：退出体力不再返还</Text>
          <View style={styles.confirmRow}>
            <TouchableOpacity style={styles.confirmCancel} onPress={() => setShowExitConfirm(false)} activeOpacity={0.7}>
              <Text style={styles.confirmCancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmDanger} onPress={confirmExit} activeOpacity={0.7}>
              <Text style={styles.confirmDangerText}>确认退出</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // 怪兽对话 —— 发送消息
  const handleSendChat = async () => {
    const text = chatInput.trim();
    if (!text || isSending) return;
    const user = await getCurrentUser();
    if (!user?.id) { Alert.alert('提示', '请先登录'); return; }

    setChatInput('');
    setIsSending(true);
    setChatMessages(prev => [...prev, { text, isUser: true }]);

    try {
      const res = await monsterService.chat({ userId: user.id, message: text });
      if (res.success && res.data) {
        setChatMessages(prev => [...prev, { text: res.data.message, isUser: false }]);
        if (res.data.energyCost !== undefined) {
          setEnergyInfo({ cost: res.data.energyCost, remaining: res.data.remainingEnergy ?? 0 });
        }
      }
    } catch {
      Alert.alert('发送失败', '网络似乎不太好～');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View>
            <Text style={styles.headerTitle}>{isCompleted ? '专注完成' : '正在专注'}</Text>
            {nodeName ? <Text style={styles.headerNode}>{nodeName}</Text> : null}
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.borderLight, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colors.borderDark }}
            onPress={async () => {
              setShowMonsterChat(true);
              setChatInput('');
              setEnergyInfo(null);
              // 加载历史消息
              try {
                const user = await getCurrentUser();
                if (user?.id) {
                  const res = await monsterService.getMessages(user.id);
                  if (res.success && res.data?.messages) {
                    setChatMessages(res.data.messages.map((m: any) => ({ text: m.message, isUser: m.isUser })));
                  }
                }
              } catch {}
            }}
            activeOpacity={0.7}
          >
            <MonsterIcon type={monsterType} size={32} />
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '600', fontFamily: 'Courier' }}>怪兽答疑</Text>
          </TouchableOpacity>
          <TouchableOpacity
          style={styles.brightnessBtn}
          onPress={() => setShowBrightness(!showBrightness)}
          activeOpacity={0.7}
        >
          <Ionicons name="sunny" size={18} color={showBrightness ? colors.warning : colors.textSecondary} />
        </TouchableOpacity>
      </View>
      </View>

      {/* 计时区域 */}
      <View style={styles.center}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBg} />
          <View style={styles.timerBox}>
            <Text style={styles.timerText}>{formatDisplay(timerSeconds)}</Text>
          </View>
          {isPaused && <Text style={styles.pausedHint}>⏸ 已暂停</Text>}
        </View>
        {url ? (
          <TouchableOpacity
            style={styles.navLinkBtn}
            onPress={async () => {
              console.log('[Pomodoro] 在计时中跳转学习网页', url);
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                Linking.openURL(url).catch(err => {
                  console.error('[Pomodoro] Linking error:', err);
                  Alert.alert('错误', '无法打开链接，请检查网络连接');
                });
              } else {
                Alert.alert('错误', '设备不支持打开此链接');
              }
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="open-outline" size={16} color={colors.primary} />
            <Text style={styles.navLinkText}>去学习网页</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* 操作按钮 */}
      <View style={styles.controls}>
        <View style={styles.ctrlWrapper}>
          <TouchableOpacity style={styles.ctrlBtn} onPress={handleReset} activeOpacity={0.7}>
            <Ionicons name="refresh" size={24} color={colors.warning} />
          </TouchableOpacity>
          <Text style={styles.ctrlLabel}>重置</Text>
        </View>

        <View style={styles.ctrlWrapper}>
          <TouchableOpacity
            style={[styles.ctrlBtn, styles.ctrlBtnCenter, {
              backgroundColor: isPaused ? 'rgba(58,227,116,0.15)' : 'rgba(255,215,0,0.15)',
              borderColor: isPaused ? colors.success : colors.warning,
            }]}
            onPress={handlePause}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPaused ? 'play' : 'pause'}
              size={32}
              color={isPaused ? colors.success : colors.warning}
            />
          </TouchableOpacity>
          <Text style={styles.ctrlLabel}>{isPaused ? '继续' : '暂停'}</Text>
        </View>

        <View style={styles.ctrlWrapper}>
          <TouchableOpacity style={styles.ctrlBtn} onPress={handleStop} activeOpacity={0.7}>
            <Ionicons name="stop" size={24} color={colors.error} />
          </TouchableOpacity>
          <Text style={styles.ctrlLabel}>结束</Text>
        </View>
      </View>

      {/* 亮度调节 */}
      {showBrightness && (
        <View style={styles.brightnessContainer}>
          <View style={styles.brightnessRow}>
            <Ionicons name="sunny" size={16} color={colors.textTertiary} />
            <TouchableOpacity
              style={styles.brightnessTrack}
              activeOpacity={1}
              onPress={(e) => {
                const { locationX } = e.nativeEvent;
                handleBrightnessChange(Math.max(0.05, Math.min(1, locationX / 200)));
              }}
            >
              <View style={[styles.brightnessFill, { width: `${brightness * 100}%` }]}>
                <View style={[styles.brightnessHandle, { left: '100%' }]} />
              </View>
            </TouchableOpacity>
            <Ionicons name="sunny" size={18} color={colors.warning} />
          </View>
        </View>
      )}

      {/* 完成覆盖层 */}
      {isCompleted && renderCompletion()}

      {/* 操作确认弹窗 */}
      {renderActionModal()}

      {/* 退出强提醒弹窗 */}
      {renderExitModal()}

      {/* 怪兽对话弹窗 */}
      <Modal visible={showMonsterChat} transparent animationType="slide" onRequestClose={() => setShowMonsterChat(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={[styles.chatOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowMonsterChat(false)} activeOpacity={1} />
            <View style={[styles.chatCard, { backgroundColor: colors.card, flex: 0.8 }]}>
              <View style={[styles.chatHeader, { borderColor: colors.borderDark }]}>
                <Text style={[styles.chatTitle, { color: colors.textPrimary }]}>和小怪兽聊聊</Text>
                <TouchableOpacity onPress={() => setShowMonsterChat(false)}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }} contentContainerStyle={{ paddingBottom: 12 }}>
                {chatMessages.length === 0 && (
                  <Text style={{ color: colors.textTertiary, textAlign: 'center', marginTop: 20, fontFamily: 'Courier' }}>
                    聊聊学习、吐槽烦恼、求安慰都行～
                  </Text>
                )}
                {chatMessages.map((msg, i) => (
                  <View key={i} style={[styles.chatBubble, {
                    alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
                    backgroundColor: msg.isUser ? (colors.primary + '20') : colors.borderLight,
                  }]}>
                    <Text style={{ color: msg.isUser ? colors.primary : colors.textPrimary, fontSize: 13, fontFamily: 'Courier', lineHeight: 18 }}>{msg.text}</Text>
                  </View>
                ))}
              </ScrollView>
              {energyInfo && (
                <View style={[styles.energyBar, { backgroundColor: colors.borderLight }]}>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: 'Courier' }}>
                    ⚡ 消耗 Π {energyInfo.cost} · 剩余 Π {energyInfo.remaining}
                  </Text>
                </View>
              )}
              <View style={[styles.chatInputRow, { borderColor: colors.borderDark }]}>
                <TextInput
                  style={[styles.chatTextInput, { color: colors.textPrimary, backgroundColor: colors.borderLight }]}
                  placeholder="说点什么..."
                  placeholderTextColor={colors.textTertiary}
                  value={chatInput}
                  onChangeText={setChatInput}
                  multiline
                />
                <TouchableOpacity onPress={handleSendChat} disabled={isSending} style={[styles.chatSendBtn, { backgroundColor: colors.primary }]}>
                  <Ionicons name="send" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default PomodoroScreen;