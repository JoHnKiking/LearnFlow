import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MonsterIcon from '../../src/components/MonsterIcon';
import MiniGames from '../../src/components/MiniGames';
import { storage, STORAGE_KEYS } from '../../src/utils/storage';
import { MONSTER_CONFIG } from '../../src/utils/constants';
import { formatTimer } from '../../src/utils/helpers';
import { useFocusEffect, router } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
// ============================================================
// 服务端持久化接口（第1步已在 api.ts / skill.ts 中定义）
// 本地优先 + 异步服务端同步，失败不阻断主流程
// ============================================================
import { noteService, rewardService } from '../../src/services/api';
import { getCurrentUser } from '../../src/utils/auth';

type ActiveTab = 'tasks' | 'notes' | 'chat';

const MonsterManageScreen = () => {
  const [monsterData, setMonsterData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
  const [notes, setNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedTime, setSelectedTime] = useState<typeof MONSTER_CONFIG.POMODORO.TIME_OPTIONS[number]>(MONSTER_CONFIG.POMODORO.TIME_OPTIONS[0]);
  const [showGameModal, setShowGameModal] = useState(false);
  const [dailyPlays, setDailyPlays] = useState(0);
  const { colors } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontFamily: 'Courier',
  },
  header: {
    position: 'relative',
    paddingTop: 48,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  pixelBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.backgroundDark,
    opacity: 0.95,
  },
  headerContent: {
    paddingHorizontal: 20,
    position: 'relative',
    zIndex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 24,
    fontFamily: 'Courier',
    marginBottom: 24,
  },
  monsterCard: {
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.25)',
  },
  monsterPixelPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
  },
  monsterCardContent: {
    position: 'relative',
    zIndex: 1,
  },
  monsterTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  monsterActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  monsterIconContainer: {
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.2)',
    flexShrink: 0,
  },
  monsterInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  rightButtons: {
    width: 92,
    gap: 8,
    alignItems: 'stretch',
  },
  gameButton: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,125,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,125,0,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 52,
  },
  gameButtonDisabled: {
    backgroundColor: 'rgba(85,85,119,0.15)',
    borderColor: 'rgba(85,85,119,0.3)',
  },
  gameButtonContent: {
    flexDirection: 'column',
    gap: 2,
    alignItems: 'flex-start',
    flex: 1,
  },
  gameButtonText: {
    color: '#FF7D00',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Courier',
  },
  gameButtonSubText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontFamily: 'Courier',
  },
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexShrink: 0,
  },
  infoCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.2)',
  },
  infoItem: {
    marginBottom: 12,
  },
  infoTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Courier',
    marginBottom: 6,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: 'Courier',
    lineHeight: 16,
  },
  monsterNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  monsterName: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Courier',
    flexShrink: 1,
  },
  monsterPersonality: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Courier',
    lineHeight: 20,
  },
  statsRow: {
    gap: 12,
  },
  statContainer: {
    gap: 6,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Courier',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  statBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    padding: 4,
    borderRadius: 16,
    backgroundColor: colors.backgroundDark,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Courier',
  },
  tabContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  taskCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.2)',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  taskTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  addTaskContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  addTaskInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.backgroundDark,
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.2)',
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Courier',
  },
  addTaskButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskList: {
    gap: 8,
  },
  emptyTasks: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyTasksText: {
    color: colors.textTertiary,
    fontSize: 13,
    fontFamily: 'Courier',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(93,155,250,0.08)',
  },
  taskCheckbox: {
    flexShrink: 0,
  },
  taskName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: 'Courier',
  },
  deleteTaskButton: {
    flexShrink: 0,
    padding: 4,
  },
  timeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  timeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeOptionText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Courier',
  },
  pomodoroContainer: {
    alignItems: 'center',
    gap: 16,
  },
  pomodoroTimer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pomodoroTime: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Courier',
  },
  pomodoroButtons: {
    width: '100%',
  },
  pomodoroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  pomodoroButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  noteCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.2)',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  noteTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  noteInput: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.backgroundDark,
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.2)',
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Courier',
    minHeight: 100,
  },
  saveNoteButton: {
    width: '100%',
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  saveNoteText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Courier',
    textAlign: 'center',
  },
  notesHistory: {
    marginTop: 16,
  },
  historyTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Courier',
    marginBottom: 12,
  },
  emptyNotes: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyNotesText: {
    color: colors.textTertiary,
    fontSize: 13,
    fontFamily: 'Courier',
  },
  notesList: {
    gap: 12,
  },
  savedNote: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  savedNoteContent: {
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: 'Courier',
    lineHeight: 20,
    marginBottom: 8,
  },
  savedNoteDate: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: 'Courier',
  },
  chatCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.2)',
  },
  chatMonsterIcon: {
    marginBottom: 16,
  },
  chatTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Courier',
    marginBottom: 8,
  },
  chatDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Courier',
    lineHeight: 20,
    textAlign: 'center',
  },
  proBadge: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,215,0,0.15)',
  },
  proText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Courier',
  },
  bottomPadding: {
    height: 100,
  },
  modalFullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
}), [colors]);


  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const pomodoroTimeLeft = selectedTime * 60;

  const loadData = async () => {
    try {
      console.log('[Monster] 开始加载数据');
      const monster = await storage.getItem(STORAGE_KEYS.MONSTER);
      if (monster) {
        const resetData = await checkAndResetDaily(monster);
        setMonsterData(resetData);
      } else {
        console.log('[Monster] 无怪物数据，创建默认怪物');
        const newMonster = {
          name: '小怪兽',
          type: MONSTER_CONFIG.TYPES.CALM,
          level: 1,
          exp: 0,
          stamina: MONSTER_CONFIG.STAMINA.BASE_MAX + MONSTER_CONFIG.STAMINA.CALM_BONUS,
          maxStamina: MONSTER_CONFIG.STAMINA.BASE_MAX + MONSTER_CONFIG.STAMINA.CALM_BONUS,
          paiEnergy: MONSTER_CONFIG.ENERGY.BASE_MAX,
          maxPaiEnergy: MONSTER_CONFIG.ENERGY.BASE_MAX,
          knowledgePoints: 0,
          createdAt: new Date().toISOString(),
        };
        setMonsterData(newMonster);
        await storage.setItem(STORAGE_KEYS.MONSTER, newMonster);
      }

      const saved = await storage.getItem<any[]>(STORAGE_KEYS.NOTES);
      if (saved) {
        setSavedNotes(saved);
      }

      const savedTasks = await storage.getItem<any[]>(STORAGE_KEYS.TASKS);
      if (savedTasks) {
        setTasks(savedTasks);
      }

      // 加载游戏游玩数据
      const plays = await storage.getItem<number>('dailyGamePlays');
      const lastDate = await storage.getItem<string>('lastPlayDate');
      const today = new Date().toDateString();
      
      if (lastDate === today && plays !== null) {
        setDailyPlays(plays);
      } else {
        setDailyPlays(0);
        await storage.setItem('dailyGamePlays', 0);
        await storage.setItem('lastPlayDate', today);
      }

    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const checkAndResetDaily = async (data: any) => {
    try {
      const lastResetStr = await storage.getItem<string>(STORAGE_KEYS.LAST_RESET);
      const lastReset = lastResetStr ? new Date(lastResetStr) : null;
      const now = new Date();
      const today5AM = new Date(now);
      today5AM.setHours(MONSTER_CONFIG.DAILY_RESET.HOUR, MONSTER_CONFIG.DAILY_RESET.MINUTE, 0, 0);

      const maxStamina = data.type === MONSTER_CONFIG.TYPES.CALM 
        ? MONSTER_CONFIG.STAMINA.BASE_MAX + MONSTER_CONFIG.STAMINA.CALM_BONUS 
        : MONSTER_CONFIG.STAMINA.BASE_MAX;

      if (!lastReset || lastReset < today5AM) {
        const resetData = {
          ...data,
          stamina: maxStamina,
          maxStamina,
          paiEnergy: MONSTER_CONFIG.ENERGY.BASE_MAX,
          maxPaiEnergy: MONSTER_CONFIG.ENERGY.BASE_MAX,
        };
        await storage.setItem(STORAGE_KEYS.MONSTER, resetData);
        await storage.setItem(STORAGE_KEYS.LAST_RESET, now.toISOString());
        return resetData;
      }

      return { ...data, maxStamina };
    } catch (error) {
      console.error('重置检查失败:', error);
      return data;
    }
  };

  const handleSaveNote = async () => {
    if (!notes.trim()) return;

    const newNote = {
      id: Date.now(),
      content: notes,
      date: new Date().toISOString(),
    };

    // --- 本地存储（主流程，即时响应）---
    const updated = [newNote, ...savedNotes];
    setSavedNotes(updated);
    await storage.setItem(STORAGE_KEYS.NOTES, updated);
    console.log('[Monster] 笔记已保存，总数:', updated.length);
    setNotes('');

    // --- 服务端异步同步（静默失败，不阻断 UI）---
    try {
      const user = await getCurrentUser();
      if (user?.id) {
        await noteService.createNote({
          userId: user.id,
          date: newNote.date,
          content: newNote.content,
        });
        console.log('[Monster] 笔记已同步至服务端');
      }
    } catch (error) {
      console.warn('[Monster] 笔记同步服务端失败，仅本地存储:', error);
    }
  };

  const handlePlayGame = () => {
    if (!monsterData) return;

    // 读取每日游戏次数上限（免费版 3 次，PRO 版见 MONSTER_CONFIG.GAME.PRO_DAILY_LIMIT）
    const dailyGameLimit = MONSTER_CONFIG.GAME.DAILY_LIMIT;
    if (dailyPlays >= dailyGameLimit) {
      console.log('[Monster] 游戏次数已达上限:', dailyPlays);
      Alert.alert('提示', '今日体力补充已达上限，明天再来吧');
      return;
    }

    console.log('[Monster] 打开游戏弹窗，今日已玩:', dailyPlays);
    setShowGameModal(true);
  };

  const handleGameComplete = async (rewards: { stamina: number; energy: number }) => {
    const storedJson = await AsyncStorage.getItem(STORAGE_KEYS.MONSTER);
    if (!storedJson) return;
    const latestData = JSON.parse(storedJson);

    let staminaBonus = rewards.stamina;
    let energyBonus = rewards.energy;

    // 获取当前登录用户（服务端同步需要 userId）
    const user = await getCurrentUser();

    if (latestData.type === MONSTER_CONFIG.TYPES.REBEL) {
      staminaBonus *= 2;
      energyBonus *= 2;
      console.log('[Monster] 叛逆小怪双倍奖励 - 体力:', staminaBonus, '能量:', energyBonus);
    }

    // --- 服务端奖励持久化（静默失败，不阻断主流程）---
    try {
      if (user?.id) {
        // 记录体力奖励（叛逆双倍已在上面前置计算）
        await rewardService.createReward({
          userId: user.id,
          type: 'stamina',
          source: 'game_win',
          amount: staminaBonus,
        });
        // 记录能量奖励
        await rewardService.createReward({
          userId: user.id,
          type: 'energy',
          source: 'game_win',
          amount: energyBonus,
        });
        console.log('[Monster] 奖励已同步至服务端');
      }
    } catch (error) {
      console.warn('[Monster] 奖励同步服务端失败，仅本地记录:', error);
    }

    // --- 本地存储（主流程不变）---

    const newStamina = Math.min(latestData.stamina + staminaBonus, latestData.maxStamina);
    const newPai = Math.min(latestData.paiEnergy + energyBonus, latestData.maxPaiEnergy);

    const updated = {
      ...latestData,
      stamina: newStamina,
      paiEnergy: newPai,
    };

    setMonsterData(updated);
    await storage.setItem(STORAGE_KEYS.MONSTER, updated);

    const newPlays = dailyPlays + 1;
    setDailyPlays(newPlays);
    await storage.setItem('dailyGamePlays', newPlays);

    console.log('[Monster] 游戏完成 - 体力:', newStamina, '能量:', newPai, '今日已玩:', newPlays);
    setShowGameModal(false);
    Alert.alert('游戏完成！', `获得 ${staminaBonus} 体力值和 ${energyBonus} 能量Π`);
  };

  const addTask = async () => {
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await storage.setItem(STORAGE_KEYS.TASKS, updatedTasks);
    setNewTaskText('');
  };

  const toggleTask = async (taskId: number) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);
    await storage.setItem(STORAGE_KEYS.TASKS, updatedTasks);
  };

  const deleteTask = async (taskId: number) => {
    Alert.alert('确认删除', '确定要删除这个任务吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除', onPress: async () => {
          const updatedTasks = tasks.filter(task => task.id !== taskId);
          setTasks(updatedTasks);
          await storage.setItem(STORAGE_KEYS.TASKS, updatedTasks);
        },
      },
    ]);
  };

  if (!monsterData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const staminaPercent = (monsterData.stamina / monsterData.maxStamina) * 100;
  const paiPercent = (monsterData.paiEnergy / monsterData.maxPaiEnergy) * 100;

  const renderTasksTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <Ionicons name="checkmark-circle" size={20} color="#5D9BFA" />
          <Text style={styles.taskTitle}>我的任务</Text>
        </View>

        <View style={styles.addTaskContainer}>
          <TextInput
            style={styles.addTaskInput}
            placeholder="添加新任务..."
            placeholderTextColor="#555577"
            value={newTaskText}
            onChangeText={setNewTaskText}
            onSubmitEditing={addTask}
          />
          <TouchableOpacity
            style={[styles.addTaskButton, { opacity: newTaskText.trim() ? 1 : 0.5 }]}
            onPress={addTask}
            disabled={!newTaskText.trim()}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.taskList}>
          {tasks.length === 0 ? (
            <View style={styles.emptyTasks}>
              <Text style={styles.emptyTasksText}>还没有任务，快来添加一个吧！</Text>
            </View>
          ) : (
            tasks.map(task => (
              <View key={task.id} style={styles.taskItem}>
                <TouchableOpacity
                  style={styles.taskCheckbox}
                  onPress={() => toggleTask(task.id)}
                >
                  {task.completed ? (
                    <Ionicons name="checkbox" size={24} color="#5D9BFA" />
                  ) : (
                    <Ionicons name="square-outline" size={24} color="#8888AA" />
                  )}
                </TouchableOpacity>
                <Text
                  style={[
                    styles.taskName,
                    {
                      textDecorationLine: task.completed ? 'line-through' : 'none',
                      color: task.completed ? '#555577' : '#E8E8F0',
                    },
                  ]}
                >
                  {task.text}
                </Text>
                <TouchableOpacity
                  style={styles.deleteTaskButton}
                  onPress={() => deleteTask(task.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </View>

      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <Ionicons name="trophy" size={20} color="#FFD700" />
          <Text style={styles.taskTitle}>番茄钟</Text>
        </View>

        <View style={styles.timeOptionsContainer}>
          {MONSTER_CONFIG.POMODORO.TIME_OPTIONS.map(time => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeOption,
                { backgroundColor: selectedTime === time ? '#5D9BFA' : 'rgba(93,155,250,0.15)' },
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text
                style={[
                  styles.timeOptionText,
                  { color: selectedTime === time ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {time}分钟
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.pomodoroContainer}>
          <View style={styles.pomodoroTimer}>
            <Text style={styles.pomodoroTime}>{formatTimer(pomodoroTimeLeft)}</Text>
          </View>
          <View style={styles.pomodoroButtons}>
            <TouchableOpacity
              style={[styles.pomodoroButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                console.log('[Monster] 番茄钟开始专注, duration:', selectedTime);
                router.push({ pathname: '/pomodoro', params: { duration: String(selectedTime) } });
              }}
            >
              <Ionicons name="play" size={20} color="#FFFFFF" />
              <Text style={styles.pomodoroButtonText}>开始专注</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderNotesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.noteCard}>
        <View style={styles.noteHeader}>
          <Text style={styles.noteTitle}>📝 学习笔记</Text>
          <Ionicons name="create-outline" size={16} color="#5D9BFA" />
        </View>
        <TextInput
          style={styles.noteInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="记录今天的学习心得..."
          placeholderTextColor="#555577"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[styles.saveNoteButton, { opacity: notes.trim() ? 1 : 0.5 }]}
          onPress={handleSaveNote}
          disabled={!notes.trim()}
          activeOpacity={0.7}
        >
          <Text style={styles.saveNoteText}>保存笔记</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.notesHistory}>
        <Text style={styles.historyTitle}>历史记录 ({savedNotes.length})</Text>
        {savedNotes.length === 0 ? (
          <View style={styles.emptyNotes}>
            <Text style={styles.emptyNotesText}>还没有笔记记录</Text>
          </View>
        ) : (
          <View style={styles.notesList}>
            {savedNotes.map((note) => (
              <View key={note.id} style={styles.savedNote}>
                <Text style={styles.savedNoteContent}>{note.content}</Text>
                <Text style={styles.savedNoteDate}>
                  {new Date(note.date).toLocaleString('zh-CN')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderChatTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.chatCard}>
        <View style={styles.chatMonsterIcon}>
          <MonsterIcon type={monsterData.type} size={80} />
        </View>
        <Text style={styles.chatTitle}>对话功能即将开放</Text>
        <Text style={styles.chatDescription}>
          与 {monsterData.name} 聊天，获得学习建议和鼓励
        </Text>
        <View style={styles.proBadge}>
          <Text style={styles.proText}>🚀 PRO 功能</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.pixelBackground} />

          <View style={styles.headerContent}>
            <Text style={styles.title}>我的怪兽</Text>

            <View style={styles.monsterCard}>
              <View style={styles.monsterPixelPattern} />

              <View style={styles.monsterCardContent}>
                <View style={styles.monsterTopRow}>
                  <View style={styles.monsterIconContainer}>
                    <MonsterIcon type={monsterData.type} size={80} />
                  </View>

                  <View style={styles.monsterInfo}>
                    <Text style={styles.monsterName} numberOfLines={1}>{monsterData.name}</Text>
                    <Text style={styles.monsterPersonality}>
                      {monsterData.type === MONSTER_CONFIG.TYPES.LIVELY ? '活力型怪兽 ⚡'
                        : monsterData.type === MONSTER_CONFIG.TYPES.CALM ? '沉稳型怪兽 🌟'
                          : '叛逆型怪兽 💫'}
                    </Text>
                  </View>
                </View>

                <View style={styles.monsterActionRow}>
                  <TouchableOpacity
                    style={[styles.gameButton, dailyPlays >= MONSTER_CONFIG.GAME.DAILY_LIMIT && styles.gameButtonDisabled]}
                    onPress={handlePlayGame}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="game-controller-outline" size={20} color={dailyPlays >= MONSTER_CONFIG.GAME.DAILY_LIMIT ? '#555577' : '#FF7D00'} />
                    <View style={styles.gameButtonContent}>
                      <Text style={[styles.gameButtonText, { color: dailyPlays >= MONSTER_CONFIG.GAME.DAILY_LIMIT ? '#555577' : '#FF7D00' }]}>游戏</Text>
                      <Text style={styles.gameButtonSubText}>
                        剩余: {MONSTER_CONFIG.GAME.DAILY_LIMIT - dailyPlays}次
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.infoButton}
                    onPress={() => setShowInfo(!showInfo)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="information" size={18} color="#8888AA" />
                  </TouchableOpacity>
                </View>

                {showInfo && (
                  <View style={styles.infoCard}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoTitle}>💪 体力值</Text>
                      <Text style={styles.infoText}>
                        • 单次知识节点跳转消耗 10 体力{'\n'}
                        • 每日凌晨 5:00 自动恢复至上限{'\n'}
                        • 小游戏可额外补充体力
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoTitle}>Π 能量</Text>
                      <Text style={styles.infoText}>
                        • AI对话消耗 = 对话Token数 × 0.05{'\n'}
                        • 每日凌晨 5:00 自动恢复至上限{'\n'}
                        • 小游戏可额外补充能量
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.statsRow}>
                  <View style={styles.statContainer}>
                    <View style={styles.statHeader}>
                      <View style={styles.statLabelRow}>
                        <Ionicons name="flash" size={14} color="#FF7D00" />
                        <Text style={styles.statLabel}>体力值</Text>
                      </View>
                      <Text style={[styles.statValue, { color: '#FF7D00' }]}>
                        {monsterData.stamina}/{monsterData.maxStamina}
                      </Text>
                    </View>
                    <View style={styles.statBar}>
                      <View
                        style={[
                          styles.statBarFill,
                          {
                            width: `${staminaPercent}%`,
                            backgroundColor: colors.orange,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.statContainer}>
                    <View style={styles.statHeader}>
                      <View style={styles.statLabelRow}>
                        <Text style={[styles.statLabel, { color: '#7B5EA7' }]}>Π</Text>
                        <Text style={styles.statLabel}>能量</Text>
                      </View>
                      <Text style={[styles.statValue, { color: '#7B5EA7' }]}>
                        {monsterData.paiEnergy}/{monsterData.maxPaiEnergy}
                      </Text>
                    </View>
                    <View style={styles.statBar}>
                      <View
                        style={[
                          styles.statBarFill,
                          {
                            width: `${paiPercent}%`,
                            backgroundColor: colors.purple,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            {[
              { id: 'tasks' as ActiveTab, label: '📋 任务' },
              { id: 'notes' as ActiveTab, label: '📝 笔记' },
              { id: 'chat' as ActiveTab, label: '💬 对话' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
                style={[
                  styles.tab,
                  {
                    backgroundColor: activeTab === tab.id ? 'rgba(93,155,250,0.2)' : 'transparent',
                    borderColor: activeTab === tab.id ? 'rgba(93,155,250,0.3)' : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: activeTab === tab.id ? '#5D9BFA' : '#8888AA',
                      fontWeight: activeTab === tab.id ? '700' : '400',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {activeTab === 'tasks' && renderTasksTab()}
        {activeTab === 'notes' && renderNotesTab()}
        {activeTab === 'chat' && renderChatTab()}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* 游戏弹窗 */}
      <Modal
        visible={showGameModal}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowGameModal(false)}
      >
        <View style={styles.modalFullScreen}>
          <MiniGames
            onGameComplete={handleGameComplete}
            onClose={() => setShowGameModal(false)}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );


};

export default MonsterManageScreen;
