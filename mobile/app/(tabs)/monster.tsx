import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator, Keyboard } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MonsterIcon from '../../src/components/MonsterIcon';
import MiniGames from '../../src/components/MiniGames';
import SubscriptionModal from '../../src/components/SubscriptionModal';
import { storage, STORAGE_KEYS } from '../../src/utils/storage';
import { MONSTER_CONFIG } from '../../src/utils/constants';
import { formatTimer } from '../../src/utils/helpers';
import { useFocusEffect, router } from 'expo-router';
import { noteService, rewardService, monsterService } from '../../src/services/api';
import { proService } from '../../src/services/api';
import { getCurrentUser } from '../../src/utils/auth';
import { SUBSCRIPTION_STORAGE_KEY } from '../../src/utils/pricing';

type ActiveTab = 'tasks' | 'notes' | 'chat';
type MonsterMessageItem = { id: number; userId: string; message: string; isUser: boolean; createdAt: string; energyCost?: number };

const staticStyles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 14 },
  header: { position: 'relative', paddingTop: 48, paddingBottom: 24, overflow: 'hidden' },
  pixelBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.95 },
  headerContent: { paddingHorizontal: 20, position: 'relative', zIndex: 1 },
  title: { fontWeight: '600', fontSize: 28, marginBottom: 4 },
  monsterCard: {
    borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden',
    borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 2,
  },
  monsterPixelPattern: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05 },
  monsterCardContent: { position: 'relative', zIndex: 1 },
  monsterTopRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  monsterActionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
  monsterIconContainer: {
    width: 108, height: 108, alignItems: 'center', justifyContent: 'center',
    borderRadius: 24, borderWidth: 2, flexShrink: 0,
  },
  monsterInfo: { flex: 1, justifyContent: 'center', gap: 8 },
  gameButton: {
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10,
    borderWidth: 2, flexDirection: 'row', alignItems: 'center', gap: 6,
    flexShrink: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 2,
  },
  gameButtonDisabled: { opacity: 0.5 },
  gameButtonContent: { flexDirection: 'column', gap: 2, alignItems: 'flex-start', flex: 1 },
  gameButtonText: { fontSize: 12, fontWeight: '600' },
  gameButtonSubText: { fontSize: 10 },
  infoButton: {
    width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, flexShrink: 0,
  },
  infoCard: { marginBottom: 16, padding: 16, borderRadius: 14, borderWidth: 2 },
  infoItem: { marginBottom: 12 },
  infoTitle: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  infoText: { fontSize: 11, lineHeight: 16 },
  monsterNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' },
  monsterName: { fontSize: 18, fontWeight: '600', flexShrink: 1 },
  monsterPersonality: { fontSize: 12, lineHeight: 18 },
  statsRow: { gap: 12 },
  statContainer: { gap: 6 },
  statHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statLabel: { fontSize: 12 },
  statValue: { fontSize: 12, fontWeight: '600' },
  statBar: { height: 8, borderRadius: 0, overflow: 'hidden' },
  statBarFill: { height: '100%', borderRadius: 0 },
  tabsContainer: { paddingHorizontal: 20, marginBottom: 16 },
  tabs: { flexDirection: 'row', gap: 8, padding: 4, borderRadius: 12, borderWidth: 1 },
  tab: {
    flex: 1, flexDirection: 'row', paddingVertical: 10, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1,
  },
  tabText: { fontSize: 13 },
  tabContent: { paddingHorizontal: 20, gap: 16 },
  taskCard: {
    borderRadius: 14, padding: 20, borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 4,
  },
  taskHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  taskTitle: { fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },
  addTaskContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  addTaskInput: {
    flex: 1, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, fontSize: 14,
  },
  addTaskButton: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  taskList: { gap: 8 },
  emptyTasks: { paddingVertical: 24, alignItems: 'center' },
  emptyTasksText: { fontSize: 13 },
  taskItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 4 },
  taskCheckbox: {
    flexShrink: 0, width: 20, height: 20, borderRadius: 6, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent',
  },
  taskCheckboxDone: { borderColor: 'transparent' },
  taskCheckboxInner: { width: 12, height: 12, backgroundColor: '#FFFFFF', borderRadius: 0 },
  taskName: { flex: 1, fontSize: 13, lineHeight: 18 },
  taskNameDone: { textDecorationLine: 'line-through' },
  deleteTaskButton: { flexShrink: 0, padding: 4 },
  timeOptionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  timeOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  timeOptionText: { fontSize: 12, fontWeight: '600' },
  pomodoroContainer: { alignItems: 'center', gap: 16 },
  pomodoroTimer: {
    width: 120, height: 120, borderRadius: 60, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  pomodoroTime: { fontSize: 28, fontWeight: '600' },
  pomodoroButtons: { width: '100%' },
  pomodoroButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  pomodoroButtonText: { fontSize: 14, fontWeight: '600' },
  noteCard: {
    borderRadius: 14, padding: 16, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 2,
  },
  noteHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  noteTitle: { fontSize: 14, fontWeight: '600' },
  noteInput: {
    width: '100%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10,
    borderWidth: 2, fontSize: 14, minHeight: 100,
  },
  saveNoteButton: { width: '100%', marginTop: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  saveNoteText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  notesHistory: { marginTop: 16 },
  historyTitle: { fontSize: 12, marginBottom: 12 },
  emptyNotes: {
    borderRadius: 14, padding: 24, alignItems: 'center',
    borderWidth: 1, borderStyle: 'dashed',
  },
  emptyNotesText: { fontSize: 13 },
  notesList: { gap: 12 },
  savedNote: { borderRadius: 14, padding: 16, borderWidth: 1 },
  savedNoteContent: { fontSize: 13, lineHeight: 20, marginBottom: 8 },
  savedNoteDate: { fontSize: 11 },
  chatCard: { borderRadius: 14, padding: 24, alignItems: 'center', borderWidth: 1 },
  chatMonsterIcon: { marginBottom: 16 },
  chatTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  chatDescription: { fontSize: 13, lineHeight: 20, textAlign: 'center' },
  // 聊天列表
  chatList: { flex: 1 },
  chatListContent: { padding: 16, flexGrow: 1 },
  chatEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  chatEmptyText: { fontSize: 16, fontWeight: '600', marginTop: 16 },
  chatEmptyHint: { fontSize: 13, marginTop: 8 },
  // 消息气泡
  messageBubble: { flexDirection: 'row', marginBottom: 12, maxWidth: '80%' },
  messageUser: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  messageMonster: { alignSelf: 'flex-start' },
  messageAvatar: { marginRight: 8, alignSelf: 'flex-end' },
  messageContent: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  messageContentUser: { borderBottomRightRadius: 4 },
  messageContentMonster: { borderBottomLeftRadius: 4, borderWidth: 1 },
  messageText: { fontSize: 14, lineHeight: 20 },
  energyCostText: { fontSize: 11, textAlign: 'right', marginTop: 2, paddingRight: 4 },
  // 输入栏
  chatInputBar: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 12,
    borderTopWidth: 1,
  },
  chatTextInput: {
    flex: 1, borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10,
    maxHeight: 100, fontSize: 14,
  },
  sendButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  sendButtonDisabled: { opacity: 0.5 },
  proBadge: { marginTop: 16, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  proText: { fontSize: 11, fontWeight: '600' },
  bottomPadding: { height: 100 },
  modalFullScreen: { flex: 1 },
  statBarContainer: { marginBottom: 4 },
  monsterNameContainer: { flex: 1 },
  monsterStats: { marginTop: 8 },
  statItem: { gap: 4 },
});

const MonsterManageScreen = () => {
  const { colors, isDark } = useTheme();

  const dynamicStyles = useMemo(() => ({
    container: { flex: 1, backgroundColor: colors.background },
    loadingText: { color: colors.textSecondary },
    title: { color: colors.textPrimary },
    monsterCard: { backgroundColor: colors.surface, borderColor: colors.hairline },
    monsterIconContainer: { backgroundColor: colors.borderLight, borderColor: colors.borderDark },
    gameButton: { backgroundColor: colors.borderLight, borderColor: colors.borderDark },
    infoButton: { backgroundColor: colors.borderLight, borderColor: colors.border },
    infoCard: { backgroundColor: colors.borderLight, borderColor: colors.borderDark },
    infoTitle: { color: colors.textPrimary },
    infoText: { color: colors.textSecondary },
    monsterName: { color: colors.textPrimary },
    monsterPersonality: { color: colors.textSecondary },
    statLabel: { color: colors.textSecondary },
    statBar: { backgroundColor: colors.border },
    tabs: { backgroundColor: colors.surface, borderColor: colors.borderLight },
    tab: { borderColor: colors.borderLight },
    taskCard: { backgroundColor: colors.surface, borderColor: colors.borderDark },
    taskTitle: { color: colors.textPrimary },
    addTaskInput: { backgroundColor: colors.inputBg, borderColor: colors.borderDark, color: colors.textPrimary },
    addTaskButton: { backgroundColor: colors.primary },
    taskCheckbox: { borderColor: colors.primary },
    taskCheckboxDone: { backgroundColor: colors.primary, borderColor: colors.primary },
    taskName: { color: colors.textPrimary },
    taskNameDone: { color: colors.primary },
    timeOptionText: { color: colors.textSecondary },
    pomodoroTimer: { borderColor: colors.primary, backgroundColor: colors.primary },
    pomodoroTime: { color: colors.onPrimary },
    pomodoroButton: { backgroundColor: colors.primary, borderColor: colors.primary },
    pomodoroButtonText: { color: colors.onPrimary },
    noteCard: { backgroundColor: colors.surface, borderColor: colors.hairline },
    noteTitle: { color: colors.textPrimary },
    noteInput: { backgroundColor: colors.inputBg, borderColor: colors.borderDark, color: colors.textPrimary },
    saveNoteButton: { backgroundColor: colors.primary, borderColor: colors.primary },
    historyTitle: { color: colors.textSecondary },
    emptyNotes: { backgroundColor: colors.borderLight, borderColor: colors.border },
    emptyNotesText: { color: colors.textTertiary },
    savedNote: { backgroundColor: colors.surface, borderColor: colors.borderLight },
    savedNoteContent: { color: colors.textPrimary },
    savedNoteDate: { color: colors.textSecondary },
    chatCard: { backgroundColor: colors.surface, borderColor: colors.borderDark },
    chatTitle: { color: colors.textPrimary },
    chatDescription: { color: colors.textSecondary },
    chatEmptyText: { color: colors.textPrimary },
    chatEmptyHint: { color: colors.textSecondary },
    messageContentMonster: { backgroundColor: colors.surfaceLight, borderColor: colors.borderLight },
    messageText: { color: colors.textPrimary },
    energyCostText: { color: colors.textTertiary },
    chatInputBar: { backgroundColor: colors.surface, borderTopColor: colors.borderLight },
    chatTextInput: { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary },
    sendButton: { backgroundColor: colors.primary },
    proBadge: { backgroundColor: colors.borderLight },
    proText: { color: colors.warning },
    pixelBackground: { backgroundColor: colors.backgroundDark },
    statBarContainer: { backgroundColor: 'rgba(255,255,255,0.06)' },
  }), [colors]);

  const [monsterData, setMonsterData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
  const [notes, setNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedTime, setSelectedTime] = useState(MONSTER_CONFIG.POMODORO.TIME_OPTIONS[0]);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showChatFullscreen, setShowChatFullscreen] = useState(false);
  const [dailyPlays, setDailyPlays] = useState(0);

  // 聊天相关
  const [chatMessages, setChatMessages] = useState<MonsterMessageItem[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showChatInput, setShowChatInput] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
      loadChatMessages();
    }, [])
  );

  useEffect(() => {
    loadData();
    loadChatMessages();
    checkProStatus();
  }, []);

  // 检查 Pro 状态（以数据库 is_pro 字段为准）
  const checkProStatus = async () => {
    try {
      const user = await getCurrentUser();
      if (user?.id) {
        const status = await proService.getStatus(user.id);
        setIsPro(status.isPro);
      }
    } catch {}
  };

  const pomodoroTimeLeft = selectedTime * 60;

  // Pro 激活时更新怪兽上限
  useEffect(() => {
    if (!isPro || !monsterData) return;
    const proStaminaMax = MONSTER_CONFIG.STAMINA.PRO_MAX;
    const proEnergyMax = MONSTER_CONFIG.ENERGY.PRO_MAX;
    if (monsterData.maxStamina === proStaminaMax && monsterData.maxPaiEnergy === proEnergyMax) return;

    const updated = {
      ...monsterData,
      stamina: Math.min(monsterData.stamina + (proStaminaMax - monsterData.maxStamina), proStaminaMax),
      maxStamina: proStaminaMax,
      paiEnergy: Math.min(monsterData.paiEnergy + (proEnergyMax - monsterData.maxPaiEnergy), proEnergyMax),
      maxPaiEnergy: proEnergyMax,
    };
    setMonsterData(updated);
    storage.setItem(STORAGE_KEYS.MONSTER, updated);
  }, [isPro]);

  const loadData = async () => {
    try {
      console.log('[Monster] 开始加载数据');
      const monster = await storage.getItem(STORAGE_KEYS.MONSTER);
      if (monster) {
        const resetData = await checkAndResetDaily(monster);
        setMonsterData(resetData);
      } else {
        console.log('[Monster] 无怪物数据，创建默认怪物');
        const proChecked = isPro; // 读取当前已加载的 pro 状态
        const staminaMax = proChecked ? MONSTER_CONFIG.STAMINA.PRO_MAX : MONSTER_CONFIG.STAMINA.BASE_MAX + MONSTER_CONFIG.STAMINA.CALM_BONUS;
        const energyMax = proChecked ? MONSTER_CONFIG.ENERGY.PRO_MAX : MONSTER_CONFIG.ENERGY.BASE_MAX;
        const newMonster = {
          name: '小怪兽',
          type: MONSTER_CONFIG.TYPES.CALM,
          level: 1,
          exp: 0,
          stamina: staminaMax,
          maxStamina: staminaMax,
          paiEnergy: energyMax,
          maxPaiEnergy: energyMax,
          knowledgePoints: 0,
          createdAt: new Date().toISOString(),
        };
        setMonsterData(newMonster);
        await storage.setItem(STORAGE_KEYS.MONSTER, newMonster);
      }

      // 从服务端加载笔记（按用户ID）
      try {
        const user = await getCurrentUser();
        if (user?.id) {
          const serverNotes = await noteService.getNotes(user.id);
          if (serverNotes && serverNotes.length > 0) {
            setSavedNotes(serverNotes.map((n: any) => ({
              id: n.id,
              content: n.content,
              date: n.createdAt || n.date,
            })));
          }
        }
      } catch {
        console.log('[Monster] 笔记从服务端加载失败');
      }

      const savedTasks = await storage.getItem<any[]>(STORAGE_KEYS.TASKS);
      if (savedTasks) setTasks(savedTasks);

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

    const newNote = { id: Date.now(), content: notes, date: new Date().toISOString() };
    setSavedNotes(prev => [newNote, ...prev]);
    setNotes('');

    try {
      const user = await getCurrentUser();
      if (user?.id) {
        await noteService.createNote({ userId: user.id, date: newNote.date, content: newNote.content });
        console.log('[Monster] 笔记已保存至服务端');
      }
    } catch (error) {
      console.warn('[Monster] 笔记保存至服务端失败:', error);
    }
  };

  const handlePlayGame = () => {
    if (!monsterData) return;
    const dailyGameLimit = isPro ? MONSTER_CONFIG.GAME.PRO_DAILY_LIMIT : MONSTER_CONFIG.GAME.DAILY_LIMIT;
    if (dailyPlays >= dailyGameLimit) {
      Alert.alert('提示', '今日体力补充已达上限，明天再来吧');
      return;
    }
    setShowGameModal(true);
  };

  const handleGameComplete = async (rewards: { stamina: number; energy: number }) => {
    const storedJson = await AsyncStorage.getItem(STORAGE_KEYS.MONSTER);
    if (!storedJson) return;
    const latestData = JSON.parse(storedJson);

    let staminaBonus = rewards.stamina;
    let energyBonus = rewards.energy;
    const user = await getCurrentUser();

    if (latestData.type === MONSTER_CONFIG.TYPES.REBEL) {
      staminaBonus *= 2;
      energyBonus *= 2;
    }

    try {
      if (user?.id) {
        await rewardService.createReward({ userId: user.id, type: 'stamina', source: 'game_win', amount: staminaBonus });
        await rewardService.createReward({ userId: user.id, type: 'energy', source: 'game_win', amount: energyBonus });
        console.log('[Monster] 奖励已同步至服务端');
      }
    } catch (error) {
      console.warn('[Monster] 奖励同步服务端失败，仅本地记录:', error);
    }

    const newStamina = Math.min(latestData.stamina + staminaBonus, latestData.maxStamina);
    const newPai = Math.min(latestData.paiEnergy + energyBonus, latestData.maxPaiEnergy);
    const updated = { ...latestData, stamina: newStamina, paiEnergy: newPai };

    setMonsterData(updated);
    await storage.setItem(STORAGE_KEYS.MONSTER, updated);

    const newPlays = dailyPlays + 1;
    setDailyPlays(newPlays);
    await storage.setItem('dailyGamePlays', newPlays);

    setShowGameModal(false);
    Alert.alert('游戏完成！', `获得 ${staminaBonus} 体力值和 ${energyBonus} 能量Π`);
  };

  const addTask = async () => {
    if (!newTaskText.trim()) return;
    const newTask = { id: Date.now(), text: newTaskText.trim(), completed: false, createdAt: new Date().toISOString() };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await storage.setItem(STORAGE_KEYS.TASKS, updatedTasks);
    setNewTaskText('');
  };

  const toggleTask = async (taskId: number) => {
    const updatedTasks = tasks.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task);
    setTasks(updatedTasks);
    await storage.setItem(STORAGE_KEYS.TASKS, updatedTasks);
  };

  const deleteTask = async (taskId: number) => {
    Alert.alert('确认删除', '确定要删除这个任务吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        onPress: async () => {
          const updatedTasks = tasks.filter(task => task.id !== taskId);
          setTasks(updatedTasks);
          await storage.setItem(STORAGE_KEYS.TASKS, updatedTasks);
        },
      },
    ]);
  };

  // 聊天功能
  const loadChatMessages = async () => {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return;
      const res = await monsterService.getMessages(user.id);
      if (res.success) {
        const serverMessages: MonsterMessageItem[] = (res.data.messages || []).map((msg: any) => {
          const isUser = typeof msg.isUser === 'boolean' ? msg.isUser : msg.is_user === true || msg.is_user === 1;
          return { ...msg, isUser, energyCost: msg.energyCost ?? undefined };
        });
        setChatMessages(prev => {
          const serverIds = new Set(serverMessages.map(m => m.id));
          const localOnly = prev.filter(m => !serverIds.has(m.id) && m.id > 0);
          return [...serverMessages, ...localOnly];
        });
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

    const tempUserMsg: MonsterMessageItem = {
      id: Date.now(), userId: user.id, message: text, isUser: true, createdAt: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await monsterService.chat({ userId: user.id, message: text });
      if (res.success && res.data) {
        const cost = Math.max(1, Math.round(res.data.message.length * 0.05 * 10) / 10);
        const monsterMsg: MonsterMessageItem = {
          id: Date.now() + 1, userId: user.id, message: res.data.message, isUser: false,
          createdAt: new Date().toISOString(), energyCost: cost,
        };
        setChatMessages(prev => [...prev, monsterMsg]);
        if (typeof res.data.remainingEnergy === 'number') {
          setMonsterData((prev: any) => {
            const updated = { ...prev, paiEnergy: res.data.remainingEnergy };
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

  const handleInputBarPress = () => {
    setShowChatInput(true);
  };

  if (!monsterData) {
    return (
      <SafeAreaView style={[staticStyles.safeArea, dynamicStyles.container]} edges={['top']}>
        <View style={staticStyles.loadingContainer}>
          <Text style={dynamicStyles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const staminaPercent = (monsterData.stamina / monsterData.maxStamina) * 100;
  const paiPercent = (monsterData.paiEnergy / monsterData.maxPaiEnergy) * 100;

  const renderTasksTab = () => (
    <View style={staticStyles.tabContent}>
      <View style={[staticStyles.taskCard, dynamicStyles.taskCard]}>
        <View style={staticStyles.taskHeader}>
          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
          <Text style={dynamicStyles.taskTitle}>Keys to Success</Text>
        </View>
        <View style={staticStyles.addTaskContainer}>
          <TextInput
            style={[staticStyles.addTaskInput, dynamicStyles.addTaskInput]}
            placeholder="添加新任务..."
            placeholderTextColor={colors.textTertiary}
            value={newTaskText}
            onChangeText={setNewTaskText}
            onSubmitEditing={addTask}
          />
          <TouchableOpacity
            style={[staticStyles.addTaskButton, dynamicStyles.addTaskButton, { opacity: newTaskText.trim() ? 1 : 0.5 }]}
            onPress={addTask}
            disabled={!newTaskText.trim()}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={staticStyles.taskList}>
          {tasks.length === 0 ? (
            <View style={staticStyles.emptyTasks}>
              <Text style={dynamicStyles.emptyTasksText}>还没有任务，快来添加一个吧！</Text>
            </View>
          ) : (
            tasks.map(task => (
              <View key={task.id} style={staticStyles.taskItem}>
                <TouchableOpacity
                  style={[staticStyles.taskCheckbox, task.completed && staticStyles.taskCheckboxDone, dynamicStyles.taskCheckbox]}
                  onPress={() => toggleTask(task.id)}
                >
                  {task.completed ? <View style={staticStyles.taskCheckboxInner} /> : null}
                </TouchableOpacity>
                <Text style={[dynamicStyles.taskName, task.completed && dynamicStyles.taskNameDone]}>{task.text}</Text>
                <TouchableOpacity style={staticStyles.deleteTaskButton} onPress={() => deleteTask(task.id)}>
                  <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </View>

      <View style={[staticStyles.taskCard, dynamicStyles.taskCard]}>
        <View style={staticStyles.taskHeader}>
          <Ionicons name="timer" size={20} color={colors.error} />
          <Text style={dynamicStyles.taskTitle}>番茄钟</Text>
        </View>
        <View style={staticStyles.timeOptionsContainer}>
          {MONSTER_CONFIG.POMODORO.TIME_OPTIONS.map(time => (
            <TouchableOpacity
              key={time}
              style={[staticStyles.timeOption, { backgroundColor: selectedTime === time ? colors.primary : colors.borderLight }]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={[dynamicStyles.timeOptionText, { color: selectedTime === time ? '#FFFFFF' : colors.textSecondary }]}>{time}分钟</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={staticStyles.pomodoroContainer}>
          <View style={[staticStyles.pomodoroTimer, dynamicStyles.pomodoroTimer]}>
            <Text style={dynamicStyles.pomodoroTime}>{formatTimer(pomodoroTimeLeft)}</Text>
          </View>
          <View style={staticStyles.pomodoroButtons}>
            <TouchableOpacity
              style={[staticStyles.pomodoroButton, dynamicStyles.pomodoroButton]}
              onPress={() => {
                router.push({ pathname: '/pomodoro', params: { duration: String(selectedTime) } });
              }}
            >
              <Ionicons name="timer" size={20} color={colors.onPrimary} />
              <Text style={dynamicStyles.pomodoroButtonText}>开始专注</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderNotesTab = () => (
    <View style={staticStyles.tabContent}>
      <View style={[staticStyles.noteCard, dynamicStyles.noteCard]}>
        <View style={staticStyles.noteHeader}>
          <Text style={dynamicStyles.noteTitle}> 学习笔记</Text>
          <Ionicons name="create-outline" size={16} color={colors.primary} />
        </View>
        <TextInput
          style={[staticStyles.noteInput, dynamicStyles.noteInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="记录今天的学习心得..."
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[staticStyles.saveNoteButton, dynamicStyles.saveNoteButton, { opacity: notes.trim() ? 1 : 0.5 }]}
          onPress={handleSaveNote}
          disabled={!notes.trim()}
          activeOpacity={0.7}
        >
          <Text style={staticStyles.saveNoteText}>保存笔记</Text>
        </TouchableOpacity>
      </View>

      <View style={staticStyles.notesHistory}>
        <Text style={dynamicStyles.historyTitle}>历史记录 ({savedNotes.length})</Text>
        {savedNotes.length === 0 ? (
          <View style={[staticStyles.emptyNotes, dynamicStyles.emptyNotes]}>
            <Text style={dynamicStyles.emptyNotesText}>还没有笔记记录</Text>
          </View>
        ) : (
          <View style={staticStyles.notesList}>
            {savedNotes.map((note) => (
              <View key={note.id} style={[staticStyles.savedNote, dynamicStyles.savedNote]}>
                <View style={{ flex: 1 }}>
                  <Text style={dynamicStyles.savedNoteContent}>{note.content}</Text>
                  <Text style={dynamicStyles.savedNoteDate}>{new Date(note.date).toLocaleString('zh-CN')}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSavedNotes(prev => prev.filter(n => n.id !== note.id))}
                  style={{ padding: 8 }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderChatTab = () => {
    // 非 Pro 用户：显示升级提示
    if (!isPro) {
      return (
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.hairline, backgroundColor: colors.surface }}>
            <TouchableOpacity
              onPress={() => setActiveTab('tasks')}
              style={{ width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderLight }}
            >
              <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 12 }}>
              <MonsterIcon type={monsterData.type} size={28} />
              <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>{monsterData.name}</Text>
            </View>
          </View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <MonsterIcon type={monsterData.type} size={80} />
            <Text style={[dynamicStyles.chatTitle, { marginTop: 16 }]}>对话功能即将开放</Text>
            <Text style={[dynamicStyles.chatDescription, { marginTop: 8 }]}>与 {monsterData.name} 聊天，获得学习建议和鼓励</Text>
            <TouchableOpacity style={[staticStyles.proBadge, dynamicStyles.proBadge, { marginTop: 20 }]} onPress={() => setShowProModal(true)}>
              <Text style={dynamicStyles.proText}>升级 Pro 解锁更多功能</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Pro 用户：完整聊天界面
    return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* 聊天头部 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.hairline, backgroundColor: colors.surface }}>
        <TouchableOpacity
          onPress={() => setActiveTab('tasks')}
          style={{ width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderLight }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 12 }}>
          <MonsterIcon type={monsterData.type} size={28} />
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>{monsterData.name}</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={chatMessages}
        keyExtractor={(item) => item.id.toString()}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        style={{ flex: 1 }}
        contentContainerStyle={[staticStyles.chatListContent, { flexGrow: 1 }]}
        ListEmptyComponent={
          <View style={staticStyles.chatEmpty}>
            <MonsterIcon type={monsterData.type} size={60} />
            <Text style={[staticStyles.chatEmptyText, dynamicStyles.chatEmptyText]}>
              和 {monsterData.name} 打个招呼吧～
            </Text>
            <Text style={[staticStyles.chatEmptyHint, dynamicStyles.chatEmptyHint]}>
              聊聊学习、吐槽烦恼、求安慰都行
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[
            staticStyles.messageBubble,
            item.isUser ? staticStyles.messageUser : staticStyles.messageMonster,
          ]}>
            {!item.isUser && (
              <View style={staticStyles.messageAvatar}>
                <MonsterIcon type={monsterData.type} size={28} />
              </View>
            )}
            <View style={[
              staticStyles.messageContent,
              item.isUser ? staticStyles.messageContentUser : staticStyles.messageContentMonster,
              item.isUser ? { backgroundColor: colors.primary } : dynamicStyles.messageContentMonster,
            ]}>
              <Text style={[
                staticStyles.messageText,
                { color: item.isUser ? '#FFFFFF' : colors.textPrimary },
              ]}>
                {item.message}
              </Text>
            </View>
          </View>
        )}
      />
      {/* 临时输入栏：点击后弹出浮动输入框 */}
      <TouchableOpacity
        style={[staticStyles.chatInputBar, dynamicStyles.chatInputBar]}
        onPress={() => handleInputBarPress()}
        activeOpacity={0.8}
      >
        <Text style={{ flex: 1, color: colors.textTertiary, fontSize: 14 }}>
          {chatInput || `和 ${monsterData.name} 说点什么...`}
        </Text>
        <View style={[staticStyles.sendButton, dynamicStyles.sendButton, !chatInput.trim() && staticStyles.sendButtonDisabled]}>
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* 浮动输入模态 */}
      <Modal visible={showChatInput} transparent animationType="fade" onRequestClose={() => { setShowChatInput(false); Keyboard.dismiss(); }}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} activeOpacity={1} onPress={() => { setShowChatInput(false); Keyboard.dismiss(); }}>
          <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
                <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, borderTopWidth: 1, borderColor: colors.hairline }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
                    <TextInput
                      style={[staticStyles.chatTextInput, dynamicStyles.chatTextInput, { flex: 1, maxHeight: 120 }]}
                      value={chatInput}
                      onChangeText={setChatInput}
                      placeholder={`和 ${monsterData.name} 说点什么...`}
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      maxLength={500}
                      autoFocus
                    />
                    <TouchableOpacity
                      style={[staticStyles.sendButton, dynamicStyles.sendButton, (!chatInput.trim() || isSending) && staticStyles.sendButtonDisabled, { marginBottom: 4 }]}
                      onPress={() => { sendMessage(); setShowChatInput(false); Keyboard.dismiss(); }}
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
              </KeyboardAvoidingView>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
    );
  };

  return (
    <SafeAreaView style={[staticStyles.safeArea, dynamicStyles.container]} edges={['top']}>
      {activeTab === 'chat' ? (
        renderChatTab()
      ) : (
      <ScrollView contentContainerStyle={staticStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={staticStyles.header}>
          <View style={dynamicStyles.pixelBackground} />
          <View style={staticStyles.headerContent}>
            <Text style={dynamicStyles.title}>我的怪兽</Text>
            <View style={[staticStyles.monsterCard, dynamicStyles.monsterCard]}>
              <View style={staticStyles.monsterPixelPattern} />
              <View style={staticStyles.monsterCardContent}>
                <View style={staticStyles.monsterTopRow}>
                  <View style={[staticStyles.monsterIconContainer, dynamicStyles.monsterIconContainer]}>
                    <MonsterIcon type={monsterData.type} size={80} />
                  </View>
                  <View style={staticStyles.monsterInfo}>
                    <Text style={[staticStyles.monsterName, dynamicStyles.monsterName]} numberOfLines={1}>{monsterData.name}</Text>
                    <Text style={[staticStyles.monsterPersonality, dynamicStyles.monsterPersonality]}>
                      {monsterData.type === MONSTER_CONFIG.TYPES.LIVELY ? '活力型怪兽 '
                        : monsterData.type === MONSTER_CONFIG.TYPES.CALM ? '沉稳型怪兽 '
                          : '叛逆型怪兽 💫'}
                    </Text>
                  </View>
                </View>

                <View style={staticStyles.monsterActionRow}>
                  <TouchableOpacity
                    style={[staticStyles.gameButton, dynamicStyles.gameButton, dailyPlays >= (isPro ? MONSTER_CONFIG.GAME.PRO_DAILY_LIMIT : MONSTER_CONFIG.GAME.DAILY_LIMIT) && staticStyles.gameButtonDisabled]}
                    onPress={handlePlayGame}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="game-controller-outline" size={20} color={dailyPlays >= MONSTER_CONFIG.GAME.DAILY_LIMIT ? colors.textTertiary : colors.orange} />
                    <View style={staticStyles.gameButtonContent}>
                      <Text style={[staticStyles.gameButtonText, { color: dailyPlays >= (isPro ? MONSTER_CONFIG.GAME.PRO_DAILY_LIMIT : MONSTER_CONFIG.GAME.DAILY_LIMIT) ? colors.textTertiary : colors.orange }]}>游戏</Text>
                      <Text style={[staticStyles.gameButtonSubText, dynamicStyles.infoText]}>
                        剩余: {(isPro ? MONSTER_CONFIG.GAME.PRO_DAILY_LIMIT : MONSTER_CONFIG.GAME.DAILY_LIMIT) - dailyPlays}次
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={[staticStyles.infoButton, dynamicStyles.infoButton]} onPress={() => setShowInfo(!showInfo)} activeOpacity={0.7}>
                    <Ionicons name="information" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {showInfo && (
                  <View style={[staticStyles.infoCard, dynamicStyles.infoCard]}>
                    <View style={staticStyles.infoItem}>
                      <Text style={[staticStyles.infoTitle, dynamicStyles.infoTitle]}>💪 体力值</Text>
                      <Text style={[staticStyles.infoText, dynamicStyles.infoText]}>
                        • 单次知识节点跳转消耗 10 体力{'\n'}
                        • 每日凌晨 5:00 自动恢复至上限{'\n'}
                        • 小游戏可额外补充体力
                      </Text>
                    </View>
                    <View style={staticStyles.infoItem}>
                      <Text style={[staticStyles.infoTitle, dynamicStyles.infoTitle]}>Π 能量</Text>
                      <Text style={[staticStyles.infoText, dynamicStyles.infoText]}>
                        • AI对话消耗 = 对话Token数 × 0.05{'\n'}
                        • 每日凌晨 5:00 自动恢复至上限{'\n'}
                        • 小游戏可额外补充能量
                      </Text>
                    </View>
                  </View>
                )}

                <View style={staticStyles.statsRow}>
                  <View style={staticStyles.statContainer}>
                    <View style={staticStyles.statHeader}>
                      <View style={staticStyles.statLabelRow}>
                        <Ionicons name="flash" size={14} color={colors.orange} />
                        <Text style={dynamicStyles.statLabel}>体力值</Text>
                      </View>
                      <Text style={[dynamicStyles.statValue, { color: colors.orange }]}>
                        {monsterData.stamina}/{monsterData.maxStamina}
                      </Text>
                    </View>
                    <View style={staticStyles.statBar}>
                      <View style={[staticStyles.statBarFill, { width: `${staminaPercent}%`, backgroundColor: colors.orange }]} />
                    </View>
                  </View>

                  <View style={staticStyles.statContainer}>
                    <View style={staticStyles.statHeader}>
                      <View style={staticStyles.statLabelRow}>
                        <Text style={{ color: colors.purple }}>Π</Text>
                        <Text style={dynamicStyles.statLabel}>能量</Text>
                      </View>
                      <Text style={[dynamicStyles.statValue, { color: colors.purple }]}>
                        {Number(monsterData.paiEnergy).toFixed(1)}/{monsterData.maxPaiEnergy}
                      </Text>
                    </View>
                    <View style={staticStyles.statBar}>
                      <View style={[staticStyles.statBarFill, { width: `${paiPercent}%`, backgroundColor: colors.purple }]} />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={staticStyles.tabsContainer}>
          <View style={[staticStyles.tabs, dynamicStyles.tabs]}>
            {[
              { id: 'tasks' as ActiveTab, label: '任务', icon: 'layers' },
              { id: 'notes' as ActiveTab, label: '笔记', icon: 'document-text' },
              { id: 'chat' as ActiveTab, label: '对话', icon: 'chatbubbles' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
                style={[
                  staticStyles.tab,
                  {
                    backgroundColor: activeTab === tab.id ? colors.borderDark : 'transparent',
                    borderColor: activeTab === tab.id ? colors.borderDark : 'transparent',
                  },
                ]}
              >
                <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.id ? colors.primary : colors.textSecondary} />
                <Text style={[staticStyles.tabText, dynamicStyles.infoText, { color: activeTab === tab.id ? colors.primary : colors.textSecondary, fontWeight: activeTab === tab.id ? '700' : '400' }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {activeTab === 'tasks' && renderTasksTab()}
        {activeTab === 'notes' && renderNotesTab()}
        <View style={staticStyles.bottomPadding} />
      </ScrollView>
      )}

      <Modal visible={showGameModal} animationType="slide" statusBarTranslucent onRequestClose={() => setShowGameModal(false)}>
        <View style={staticStyles.modalFullScreen}>
          <MiniGames onGameComplete={handleGameComplete} onClose={() => setShowGameModal(false)} />
        </View>
      </Modal>

      <Modal visible={showChatFullscreen} animationType="slide" statusBarTranslucent onRequestClose={() => setShowChatFullscreen(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.hairline }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MonsterIcon type={monsterData.type} size={28} />
              <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>{monsterData.name}</Text>
            </View>
            <TouchableOpacity
              style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderLight }}
              onPress={() => setShowChatFullscreen(false)}
            >
              <Ionicons name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <FlatList
              ref={flatListRef}
              data={chatMessages}
              keyExtractor={(item) => item.id.toString()}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
              ListEmptyComponent={
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
                  <MonsterIcon type={monsterData.type} size={80} />
                  <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 16 }}>和 {monsterData.name} 打个招呼吧～</Text>
                  <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 8 }}>聊聊学习、吐槽烦恼、求安慰都行</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={{ marginBottom: 12 }}>
                  <View style={[staticStyles.messageBubble, item.isUser ? staticStyles.messageUser : staticStyles.messageMonster]}>
                    {!item.isUser && (
                      <View style={staticStyles.messageAvatar}>
                        <MonsterIcon type={monsterData.type} size={28} />
                      </View>
                    )}
                    <View style={[staticStyles.messageContent, item.isUser ? staticStyles.messageContentUser : staticStyles.messageContentMonster, item.isUser ? { backgroundColor: colors.primary } : dynamicStyles.messageContentMonster]}>
                      <Text style={[staticStyles.messageText, { color: item.isUser ? colors.onPrimary : colors.textPrimary }]}>{item.message}</Text>
                    </View>
                  </View>
                  {!item.isUser && typeof item.energyCost === 'number' && (
                    <Text style={staticStyles.energyCostText}>-Π{item.energyCost}</Text>
                  )}
                </View>
              )}
            />
            <View style={[staticStyles.chatInputBar, dynamicStyles.chatInputBar]}>
              <TextInput
                style={[staticStyles.chatTextInput, dynamicStyles.chatTextInput]}
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
                style={[staticStyles.sendButton, dynamicStyles.sendButton, (!chatInput.trim() || isSending) && staticStyles.sendButtonDisabled]}
                onPress={sendMessage}
                disabled={!chatInput.trim() || isSending}
              >
                {isSending ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="send" size={18} color="#FFFFFF" />}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <SubscriptionModal visible={showProModal} onClose={() => setShowProModal(false)} />
    </SafeAreaView>
  );
};

export default MonsterManageScreen;
