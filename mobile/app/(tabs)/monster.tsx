import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator, Keyboard } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MonsterIcon from '../../src/components/MonsterIcon';
import MiniGames from '../../src/components/MiniGames';
import { storage, STORAGE_KEYS } from '../../src/utils/storage';
import { MONSTER_CONFIG } from '../../src/utils/constants';
import { formatTimer } from '../../src/utils/helpers';
import { useFocusEffect, router } from 'expo-router';
// ============================================================
// 服务端持久化接口（第1步已在 api.ts / skill.ts 中定义）
// 本地优先 + 异步服务端同步，失败不阻断主流程
// ============================================================
import { noteService, rewardService, monsterService } from '../../src/services/api';
import { getCurrentUser } from '../../src/utils/auth';
import type { MonsterMessageItem } from '../../src/types/skill';

type ActiveTab = 'tasks' | 'notes' | 'chat';

const MonsterManageScreen = () => {
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
  planet1: {
    position: 'absolute',
    top: 10,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    opacity: 0.2,
  },
  planet2: {
    position: 'absolute',
    top: 40,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.15,
  },
  planetRing: {
    position: 'absolute',
    top: 60,
    right: -10,
    width: 120,
    height: 40,
    borderWidth: 3,
    borderRadius: 60,
    transform: [{ rotate: '-20deg' }],
    opacity: 0.2,
  },
  star1: {
    position: 'absolute',
    top: 30,
    left: 40,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  star2: {
    position: 'absolute',
    top: 50,
    right: 80,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  star3: {
    position: 'absolute',
    top: 70,
    left: 120,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  headerContent: {
    position: 'relative',
    zIndex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 28,
    fontFamily: 'Courier',
    marginBottom: 4,
  },
  monsterCard: {
    borderRadius: 16,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderDark,
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
    gap: 12,
    marginBottom: 12,
  },
  monsterActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  monsterIconContainer: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.borderDark,
    flexShrink: 0,
  },
  monsterInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  rightButtons: {
    width: 76,
    gap: 6,
    alignItems: 'stretch',
  },
  gameButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.borderDark,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
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
    color: colors.orange,
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
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
    flexShrink: 0,
  },
  infoCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.borderDark,
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
  monsterNameContainer: {
    flex: 1,
    gap: 2,
  },
  monsterName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Courier',
    flexShrink: 1,
  },
  monsterPersonality: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Courier',
    lineHeight: 18,
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
    color: colors.textPrimary,
  },
  statBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  statBarContainer: {
    width: '100%',
    marginVertical: 4,
  },
  monsterStats: {
    marginTop: 12,
    gap: 10,
  },
  statItem: {
    gap: 4,
  },
  tabsContainer: {
    paddingHorizontal: 24,
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
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Courier',
  },
  tabContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  taskCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderDark,
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
    borderColor: colors.borderDark,
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
    backgroundColor: colors.borderLight,
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
    color: '#FFFFFF',
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
    borderColor: colors.borderDark,
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
    borderColor: colors.borderDark,
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
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
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
    borderColor: colors.borderLight,
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
    borderColor: colors.borderDark,
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
  // 聊天列表
  chatList: {
    flex: 1,
  },
  chatListContent: {
    padding: 16,
    flexGrow: 1,
  },
  chatEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  chatEmptyText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Courier',
    marginTop: 16,
  },
  chatEmptyHint: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Courier',
    marginTop: 8,
  },
  // 消息气泡
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '80%',
  },
  messageUser: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  messageMonster: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageContent: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageContentUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  messageContentMonster: {
    backgroundColor: colors.surfaceLight,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Courier',
    lineHeight: 20,
  },
  // 怪兽回复下方的能量消耗提示
  energyCostText: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: 2,
    paddingRight: 4,
  },
  // 输入栏
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 100,
    fontSize: 14,
    fontFamily: 'Courier',
    color: colors.textPrimary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  proBadge: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.borderLight,
  },
  proText: {
    color: colors.warning,
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

  const [monsterData, setMonsterData] = useState<any>({
    name: '小怪兽',
    type: MONSTER_CONFIG.TYPES.CALM,
    level: 1,
    exp: 0,
    stamina: MONSTER_CONFIG.STAMINA.BASE_MAX + MONSTER_CONFIG.STAMINA.CALM_BONUS,
    maxStamina: MONSTER_CONFIG.STAMINA.BASE_MAX + MONSTER_CONFIG.STAMINA.CALM_BONUS,
    paiEnergy: MONSTER_CONFIG.ENERGY.BASE_MAX,
    maxPaiEnergy: MONSTER_CONFIG.ENERGY.BASE_MAX,
    knowledgePoints: 0,
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
  const [notes, setNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedTime, setSelectedTime] = useState<typeof MONSTER_CONFIG.POMODORO.TIME_OPTIONS[number]>(MONSTER_CONFIG.POMODORO.TIME_OPTIONS[0]);
  const [showGameModal, setShowGameModal] = useState(false);
  const [dailyPlays, setDailyPlays] = useState(0);
  // 聊天状态
  const [chatMessages, setChatMessages] = useState<MonsterMessageItem[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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

      // 从服务端加载笔记（按用户隔离，避免历史用户数据残留）
      try {
        const user = await getCurrentUser();
        if (user?.id) {
          const serverNotes = await noteService.getNotes(user.id);
          if (serverNotes && serverNotes.length > 0) {
            setSavedNotes(serverNotes);
          } else {
            // 服务端无数据时回退到本地，但本地数据可能是旧用户的，清空
            setSavedNotes([]);
            await storage.removeItem(STORAGE_KEYS.NOTES);
          }
        }
      } catch {
        // 网络不通时回退到本地缓存
        const local = await storage.getItem<any[]>(STORAGE_KEYS.NOTES);
        if (local) setSavedNotes(local);
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
    const newPai = latestData.paiEnergy + energyBonus; // 能量无上限，不设封顶

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

  const staminaPercent = monsterData ? (monsterData.stamina / monsterData.maxStamina) * 100 : 0;
  const paiPercent = monsterData ? (monsterData.paiEnergy / monsterData.maxPaiEnergy) * 100 : 0;

  const renderTasksTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
          <Text style={styles.taskTitle}>我的任务</Text>
        </View>

        <View style={styles.addTaskContainer}>
          <TextInput
            style={styles.addTaskInput}
            placeholder="添加新任务..."
            placeholderTextColor={colors.textTertiary}
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
                    <Ionicons name="checkbox" size={24} color={colors.primary} />
                  ) : (
                    <Ionicons name="square-outline" size={24} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
                <Text
                  style={[
                    styles.taskName,
                    {
                      textDecorationLine: task.completed ? 'line-through' : 'none',
                      color: task.completed ? colors.textTertiary : colors.textPrimary,
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
          <Ionicons name="timer" size={20} color={colors.error} />
          <Text style={styles.taskTitle}>番茄钟</Text>
        </View>

        <View style={styles.timeOptionsContainer}>
          {MONSTER_CONFIG.POMODORO.TIME_OPTIONS.map(time => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeOption,
                { backgroundColor: selectedTime === time ? colors.primary : colors.borderLight, },
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
              style={styles.pomodoroButton}
              onPress={() => {
                console.log('[Monster] 番茄钟开始专注, duration:', selectedTime);
                router.push({ pathname: '/pomodoro', params: { duration: String(selectedTime) } });
              }}
            >
              <Ionicons name="timer" size={20} color="#FFFFFF" />
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
          <Ionicons name="create-outline" size={16} color={colors.primary} />
        </View>
        <TextInput
          style={styles.noteInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="记录今天的学习心得..."
          placeholderTextColor={colors.textTertiary}
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

  // ============================================================
  // 聊天功能
  // ============================================================
  const loadChatMessages = async () => {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return;
      const res = await monsterService.getMessages(user.id);
      if (res.success) {
        setChatMessages(res.data.messages);
      }
    } catch (error) {
      console.log('[Monster] 加载聊天记录失败:', error);
    }
  };

  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text || isSending) return;

    const user = await getCurrentUser();
    if (!user?.id) {
      Alert.alert('提示', '请先登录后再与小怪兽聊天');
      return;
    }

    setChatInput('');
    setIsSending(true);

    // 先显示用户消息（乐观更新）
    const tempUserMsg: MonsterMessageItem = {
      id: Date.now(),
      userId: user.id,
      message: text,
      isUser: true,
      createdAt: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await monsterService.chat({ userId: user.id, message: text });
      console.log('[Monster] 对话响应:', JSON.stringify({ success: res.success, hasData: !!res.data, energyCost: res.data?.energyCost, remaining: res.data?.remainingEnergy }));
      if (res.success && res.data) {
        // 能量消耗 = 怪兽回复字数 × 0.05（与服务端一致）
        const cost = typeof res.data.energyCost === 'number' ? res.data.energyCost : Math.ceil(res.data.message.length * 0.05);
        console.log('[Monster] 本次消耗 Π:', cost, '消息字数:', res.data.message.length);
        const monsterMsg: MonsterMessageItem = {
          id: Date.now() + 1,
          userId: user.id,
          message: res.data.message,
          isUser: false,
          createdAt: new Date().toISOString(),
          energyCost: cost,
        };
        setChatMessages(prev => [...prev, monsterMsg]);
        // 同步更新本地怪兽能量为服务端返回的剩余值
        if (typeof res.data.remainingEnergy === 'number') {
          setMonsterData((prev: any) => {
            const updated = { ...prev, paiEnergy: res.data.remainingEnergy };
            // 同步写回 AsyncStorage，防止 loadData 覆盖
            storage.setItem(STORAGE_KEYS.MONSTER, updated).catch(() => {});
            return updated;
          });
        }
      }
    } catch (error) {
      console.error('[Monster] 发送消息失败:', error);
      Alert.alert('发送失败', '网络似乎不太好，请稍后重试～');
    } finally {
      setIsSending(false);
    }
  };

  // 首次挂载时加载数据（useEffect 比 useFocusEffect 更可靠保证初始渲染）
  useEffect(() => {
    loadData();
    loadChatMessages();
  }, []);

  // 后续每次聚焦时刷新
  useFocusEffect(
    useCallback(() => {
      loadData();
      loadChatMessages();
    }, [])
  );

  const renderChatTab = () => (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={chatMessages}
        keyExtractor={(item) => item.id.toString()}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        style={styles.chatList}
        contentContainerStyle={styles.chatListContent}
        ListEmptyComponent={
          <View style={styles.chatEmpty}>
            <MonsterIcon type={monsterData.type} size={60} />
            <Text style={styles.chatEmptyText}>
              和 {monsterData.name} 打个招呼吧～
            </Text>
            <Text style={styles.chatEmptyHint}>
              聊聊学习、吐槽烦恼、求安慰都行
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View>
          <View style={[
            styles.messageBubble,
            item.isUser ? styles.messageUser : styles.messageMonster,
          ]}>
            {!item.isUser && (
              <View style={styles.messageAvatar}>
                <MonsterIcon type={monsterData.type} size={28} />
              </View>
            )}
            <View style={[
              styles.messageContent,
              item.isUser ? styles.messageContentUser : styles.messageContentMonster,
            ]}>
              <Text style={[
                styles.messageText,
                { color: item.isUser ? '#FFFFFF' : colors.textPrimary },
              ]}>
                {item.message}
              </Text>
            </View>
          </View>
          {/* 怪兽回复消耗的 Π 能量 */}
          {!item.isUser && typeof item.energyCost === 'number' && (
            <Text style={styles.energyCostText}>
              -Π{item.energyCost}
            </Text>
          )}
          </View>
        )}
      />
      <View style={styles.chatInputBar}>
        <TextInput
          style={styles.chatTextInput}
          value={chatInput}
          onChangeText={setChatInput}
          placeholder={`和 ${monsterData.name} 说点什么...`}
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          editable={!isSending}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!chatInput.trim() || isSending) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!chatInput.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="send" size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // 提取 header + tab bar，聊天模式下不包 ScrollView（避免 FlatList 嵌套警告）
  const renderHeaderAndTabs = () => (
    <>
      <View style={styles.header}>
        <View style={styles.headerDecorations} pointerEvents="none">
          <View style={[styles.planet1, { borderColor: colors.primary }]} />
          <View style={[styles.planet2, { backgroundColor: colors.warning + '30' }]} />
          <View style={[styles.planetRing, { borderColor: colors.primary + '40' }]} />
          <View style={[styles.star1, { backgroundColor: colors.primary }]} />
          <View style={[styles.star2, { backgroundColor: colors.warning }]} />
          <View style={[styles.star3, { backgroundColor: colors.success }]} />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>我的怪兽</Text>
          <View style={styles.monsterCard}>
            <View style={styles.monsterPixelPattern} />
            <View style={styles.monsterCardContent}>
              <View style={styles.monsterTopRow}>
                <View style={styles.monsterIconContainer}>
                  <MonsterIcon type={monsterData.type} size={56} />
                </View>
                <View style={styles.monsterNameContainer}>
                  <Text style={styles.monsterName} numberOfLines={1}>{monsterData.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <Text style={{ color: MONSTER_CONFIG.COLORS[monsterData.type as keyof typeof MONSTER_CONFIG.COLORS].primary, fontSize: 15, fontWeight: '900', fontFamily: 'Courier' }}>
                      Π {monsterData.paiEnergy}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Text style={{ color: MONSTER_CONFIG.COLORS[monsterData.type as keyof typeof MONSTER_CONFIG.COLORS].primary, fontSize: 11, fontFamily: 'Courier', fontWeight: '700' }}>
                      {monsterData.type === MONSTER_CONFIG.TYPES.LIVELY ? '活力型怪兽'
                        : monsterData.type === MONSTER_CONFIG.TYPES.CALM ? '沉稳型怪兽'
                        : '叛逆型怪兽'}
                    </Text>
                    <TouchableOpacity onPress={() => setShowInfo(!showInfo)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="information-circle" size={14} color={colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                </View>
                {/* 游戏入口按钮 */}
                <TouchableOpacity onPress={handlePlayGame} style={styles.gameButton}>
                  <Ionicons name="game-controller" size={16} color={colors.warning} />
                  <Text style={styles.gameButtonText}>游戏</Text>
                </TouchableOpacity>
              </View>
              {/* 机制说明 —— 点击 ℹ️ 展开/收起，放卡片外避免挤压布局 */}
              {showInfo && (
                <View style={[styles.infoCard, { marginTop: 8, marginBottom: 0 }]}>
                  <Text style={styles.infoText}>
                    {monsterData.type === MONSTER_CONFIG.TYPES.LIVELY
                      ? '⚡ 单次学习任务时长 -5分钟\n💡 元气满满，适合碎片化学习'
                      : monsterData.type === MONSTER_CONFIG.TYPES.CALM
                      ? '💪 每日体力额外 +20点\n💡 冷静沉着，擅长深度思考'
                      : '🔥 小游戏体力、能量双倍\n💡 个性独立，敢于探索挑战'}
                  </Text>
                </View>
              )}
              <View style={styles.monsterStats}>
                <View style={styles.statItem}>
                  <View style={styles.statLabelRow}>
                    <Ionicons name="flash" size={12} color={colors.warning} />
                    <Text style={styles.statLabel}>体力</Text>
                  </View>
                  <View style={styles.statBarContainer}>
                    <View style={[styles.statBar, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                      <View style={[styles.statBarFill, { width: `${staminaPercent}%`, backgroundColor: colors.warning }]} />
                    </View>
                  </View>
                  <Text style={styles.statValue}>
                    {monsterData.stamina}/{monsterData.maxStamina}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
      {renderTabs()}
    </>
  );

  // 仅 tab 栏 —— 对话模式下置顶使用
  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <View style={styles.tabs}>
        {[
          { id: 'tasks' as ActiveTab, label: '任务', icon: 'layers' },
          { id: 'chat' as ActiveTab, label: '对话', icon: 'chatbubbles' },
          { id: 'notes' as ActiveTab, label: '笔记', icon: 'document-text' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
            style={[
              styles.tab,
              {
                backgroundColor: activeTab === tab.id ? colors.borderDark : 'transparent',
                borderColor: activeTab === tab.id ? colors.borderDark : 'transparent',
              },
            ]}
          >
            <Ionicons
              name={tab.icon as any} size={16}
              color={activeTab === tab.id ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab.id ? colors.primary : colors.textSecondary,
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
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {activeTab === 'chat' ? (
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {renderTabs()}
          {renderChatTab()}
        </KeyboardAvoidingView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {renderHeaderAndTabs()}
          {activeTab === 'tasks' && renderTasksTab()}
          {activeTab === 'notes' && renderNotesTab()}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}

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
