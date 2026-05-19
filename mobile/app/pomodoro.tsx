import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, AppState,
  AppStateStatus, Modal, Animated, Easing, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Brightness from 'expo-brightness';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useTheme } from '../src/contexts/ThemeContext';

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
    nodeName: string; url: string; duration: string;
  }>();
  const { colors } = useTheme();

  const totalSeconds = parseInt(duration || '25', 10) * 60;

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

  const completedRef = useRef(false);
  const exitedRef = useRef(false);
  const startRef = useRef(Date.now());
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedRef = useRef(0);
  const isPausedRef = useRef(false);
  const timerRef = useRef(totalSeconds);
  const appStateRef = useRef<AppStateStatus>('active');
  const initialBrightnessRef = useRef(0.5);

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
        // 切到后台：如果当前未暂停，记录切出时间
        if (!isPausedRef.current) {
          pausedAtRef.current = Date.now();
        }
        persistRuntime();
      } else if (prev !== 'active' && nextState === 'active') {
        // 回到前台
        if (exitedRef.current || completedRef.current) return;
        // 恢复计时
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
          // 清除暂停标记，继续计时
          if (pausedAtRef.current) {
            totalPausedRef.current += Date.now() - pausedAtRef.current;
            pausedAtRef.current = null;
          }
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
        completedRef.current = false;
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

  const handleExit = useCallback(() => {
    if (completedRef.current) {
      router.back();
      return;
    }
    setShowExitConfirm(true);
  }, []);

  const confirmExit = useCallback(() => {
    setShowExitConfirm(false);
    exitedRef.current = true;
    completedRef.current = false;
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
    brightnessBtn: {
      width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.borderDark,
    },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    progressContainer: {
      width: PROGRESS_SIZE, height: PROGRESS_SIZE, alignItems: 'center', justifyContent: 'center',
    },
    progressBg: {
      position: 'absolute', width: PROGRESS_SIZE, height: PROGRESS_SIZE,
      borderRadius: PROGRESS_SIZE / 2, borderWidth: STROKE_WIDTH,
      borderColor: colors.borderDark,
    },
    timerText: {
      fontSize: 56, fontWeight: '800', color: colors.textPrimary, fontFamily: 'Courier',
      letterSpacing: 4,
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
      width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderDark,
    },
    ctrlBtnCenter: {
      width: 76, height: 76, borderRadius: 38,
    },
    ctrlLabel: {
      fontSize: 11, color: colors.textTertiary, fontFamily: 'Courier', marginTop: 6, textAlign: 'center',
    },
    ctrlWrapper: { alignItems: 'center' },
    // 亮度滑块
    brightnessContainer: {
      position: 'absolute', bottom: 100, left: 40, right: 40,
      backgroundColor: colors.card, borderRadius: 16, padding: 16,
      borderWidth: 1, borderColor: colors.borderDark,
    },
    brightnessRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
    },
    brightnessTrack: {
      flex: 1, height: 6, backgroundColor: colors.borderDark, borderRadius: 3,
    },
    brightnessFill: {
      height: '100%', borderRadius: 3, backgroundColor: colors.primary,
    },
    brightnessHandle: {
      position: 'absolute', top: -8, width: 22, height: 22, borderRadius: 11,
      backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.textPrimary,
      left: '50%', marginLeft: -11, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
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
      borderRadius: 16,
    },
    backBtnText: {
      color: colors.textPrimary, fontSize: 16, fontWeight: '700', fontFamily: 'Courier',
    },
    // 确认弹窗
    confirmOverlay: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 40,
    },
    confirmCard: {
      width: '100%', maxWidth: 320, backgroundColor: colors.card, borderRadius: 20,
      padding: 24, borderWidth: 1, borderColor: colors.borderDark,
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
    confirmMsgWarn: {
      fontSize: 13, color: colors.error, fontFamily: 'Courier',
      textAlign: 'center', marginBottom: 20, lineHeight: 18,
    },
    confirmRow: {
      flexDirection: 'row', gap: 12, width: '100%',
    },
    confirmCancel: {
      flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
      backgroundColor: colors.borderDark,
    },
    confirmCancelText: {
      fontSize: 15, color: colors.textSecondary, fontWeight: '600', fontFamily: 'Courier',
    },
    confirmDanger: {
      flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
      backgroundColor: 'rgba(233,69,96,0.2)',
    },
    confirmDangerText: {
      fontSize: 15, color: colors.error, fontWeight: '600', fontFamily: 'Courier',
    },
    confirmPrimary: {
      flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
      backgroundColor: 'rgba(93,155,250,0.2)',
    },
    confirmPrimaryText: {
      fontSize: 15, color: colors.primary, fontWeight: '600', fontFamily: 'Courier',
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
          <Ionicons name="warning" size={40} color={colors.error} style={{ marginBottom: 12 }} />
          <Text style={styles.confirmTitle}>确定要退出吗？</Text>
          <Text style={styles.confirmMsg}>
            退出后计时将立即终止，本次专注进度清零，无法获得任何奖励
          </Text>
          <Text style={styles.confirmMsgWarn}>
            ⚠️ 此操作不可撤销
          </Text>
          <View style={styles.confirmRow}>
            <TouchableOpacity style={styles.confirmCancel} onPress={() => setShowExitConfirm(false)} activeOpacity={0.7}>
              <Text style={styles.confirmCancelText}>继续专注</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmDanger} onPress={confirmExit} activeOpacity={0.7}>
              <Text style={styles.confirmDangerText}>确认退出</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerLeft} onPress={handleExit} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.textSecondary} />
          <Text style={styles.headerTitle}>{isCompleted ? '专注完成' : '正在专注'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.brightnessBtn}
          onPress={() => setShowBrightness(!showBrightness)}
          activeOpacity={0.7}
        >
          <Ionicons name="sunny" size={18} color={showBrightness ? colors.warning : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* 计时区域 */}
      <View style={styles.center}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBg} />
          <Text style={styles.timerText}>{formatDisplay(timerSeconds)}</Text>
          <Text style={styles.timerSub}>「{nodeName}」</Text>
          {isPaused && <Text style={styles.pausedHint}>⏸ 已暂停</Text>}
        </View>
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
    </SafeAreaView>
  );
};

export default PomodoroScreen;