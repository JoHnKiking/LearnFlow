import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ActiveTab = 'stats' | 'notes' | 'chat';

const MonsterManageScreen = () => {
  const [monsterData, setMonsterData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('stats');
  const [notes, setNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const monster = await AsyncStorage.getItem('monster');
        if (monster) {
          setMonsterData(JSON.parse(monster));
        } else {
          setMonsterData({
            name: '小怪兽',
            type: 'calm',
            level: 1,
            exp: 0,
            energy: 100,
            maxEnergy: 100,
            knowledgePoints: 0,
            createdAt: new Date().toISOString(),
          });
        }

        const saved = await AsyncStorage.getItem('learningNotes');
        if (saved) {
          setSavedNotes(JSON.parse(saved));
        }
      } catch (error) {
        console.error('加载数据失败:', error);
      }
    };

    loadData();
  }, []);

  const handleSaveNote = async () => {
    if (!notes.trim()) return;

    const newNote = {
      id: Date.now(),
      content: notes,
      date: new Date().toISOString(),
    };

    const updated = [newNote, ...savedNotes];
    setSavedNotes(updated);
    await AsyncStorage.setItem('learningNotes', JSON.stringify(updated));
    setNotes('');
  };

  if (!monsterData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const energyPercent = (monsterData.energy / monsterData.maxEnergy) * 100;
  const expPercent = (monsterData.exp || 0) % 100;

  const personalityTraits: Record<string, { name: string; traits: string[] }> = {
    lively: { name: '活泼开朗', traits: ['学习速度 +15%', '能量消耗 +10%', '经验获取 +20%'] },
    calm: { name: '沉稳思考', traits: ['专注力 +15%', '能量恢复 +10%', '深度学习 +20%'] },
    rebel: { name: '独立创新', traits: ['创新力 +15%', '探索奖励 +10%', '突破速度 +20%'] },
  };

  const personality = personalityTraits[monsterData.type] || personalityTraits.calm;

  const renderStatsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.knowledgeCard}>
        <View style={styles.knowledgeHeader}>
          <View style={styles.knowledgeLeft}>
            <View style={styles.knowledgeIcon}>
              <Text style={styles.knowledgeAtSymbol}>@</Text>
            </View>
            <View>
              <Text style={styles.knowledgeLabel}>知识能量</Text>
              <Text style={styles.knowledgePoints}>{monsterData.knowledgePoints || 0}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.useButton} activeOpacity={0.7}>
            <Text style={styles.useButtonText}>使用</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.knowledgeDescription}>
          完成学习任务可获得 @ 能量，用于升级和解锁新功能
        </Text>
      </View>

      <View style={styles.personalityCard}>
        <Text style={styles.personalityTitle}>性格特质 · {personality.name}</Text>
        <View style={styles.traitsList}>
          {personality.traits.map((trait, i) => (
            <View key={i} style={styles.traitItem}>
              <View style={styles.traitDot} />
              <Text style={styles.traitText}>{trait}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.creationCard}>
        <Text style={styles.creationText}>
          孵化于 {new Date(monsterData.createdAt).toLocaleDateString('zh-CN')}
        </Text>
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.pixelBackground} />
          
          <View style={styles.headerContent}>
            <Text style={styles.title}>我的怪兽</Text>

            <View style={styles.monsterCard}>
              <View style={styles.monsterPixelPattern} />
              
              <View style={styles.monsterCardContent}>
                <View style={styles.monsterTop}>
                  <View style={styles.monsterIconContainer}>
                    <MonsterIcon type={monsterData.type} size={80} />
                  </View>
                  
                  <View style={styles.monsterInfo}>
                    <View style={styles.monsterNameRow}>
                      <Text style={styles.monsterName}>{monsterData.name}</Text>
                      <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>Lv.{monsterData.level}</Text>
                      </View>
                    </View>
                    <Text style={styles.monsterPersonality}>
                      {monsterData.type === 'lively' ? '活泼型怪兽 ⚡' : 
                       monsterData.type === 'calm' ? '沉稳型怪兽 🌟' : '叛逆型怪兽 💫'}
                    </Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statContainer}>
                    <View style={styles.statHeader}>
                      <View style={styles.statLabelRow}>
                        <Ionicons name="flash" size={14} color="#FF7D00" />
                        <Text style={styles.statLabel}>体力</Text>
                      </View>
                      <Text style={[styles.statValue, { color: '#FF7D00' }]}>
                        {monsterData.energy}/{monsterData.maxEnergy}
                      </Text>
                    </View>
                    <View style={styles.statBar}>
                      <View
                        style={[
                          styles.statBarFill,
                          {
                            width: `${energyPercent}%`,
                            backgroundColor: '#FF7D00',
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.statContainer}>
                    <View style={styles.statHeader}>
                      <View style={styles.statLabelRow}>
                        <Ionicons name="star" size={14} color="#5D9BFA" />
                        <Text style={styles.statLabel}>经验值</Text>
                      </View>
                      <Text style={[styles.statValue, { color: '#5D9BFA' }]}>
                        {monsterData.exp || 0}/100
                      </Text>
                    </View>
                    <View style={styles.statBar}>
                      <View
                        style={[
                          styles.statBarFill,
                          {
                            width: `${expPercent}%`,
                            backgroundColor: '#5D9BFA',
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
              { id: 'stats' as ActiveTab, label: '📊 属性' },
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

        {activeTab === 'stats' && renderStatsTab()}
        {activeTab === 'notes' && renderNotesTab()}
        {activeTab === 'chat' && renderChatTab()}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const MonsterIcon = ({ type, size }: { type: 'lively' | 'calm' | 'rebel'; size: number }) => {
  const colors: Record<string, { primary: string; secondary: string }> = {
    lively: { primary: '#FF7D00', secondary: '#E66900' },
    calm: { primary: '#5D9BFA', secondary: '#4A7FD4' },
    rebel: { primary: '#7B5EA7', secondary: '#5A4280' },
  };

  const color = colors[type] || colors.calm;
  const scale = size / 100;

  return (
    <View style={[styles.monsterIcon, { width: size, height: size }]}>
      <View style={[styles.monsterHeadIcon, { width: 44 * scale, height: 36 * scale, backgroundColor: color.primary, left: 14 * scale, top: 20 * scale }]}>
        <View style={[styles.earIcon, { width: 8 * scale, height: 12 * scale, backgroundColor: color.secondary, left: -4 * scale, top: 4 * scale }]} />
        <View style={[styles.earIcon, { width: 8 * scale, height: 12 * scale, backgroundColor: color.secondary, right: -4 * scale, top: 4 * scale }]} />
        <View style={[styles.eyeIcon, { width: 12 * scale, height: 12 * scale, backgroundColor: '#FFFFFF', left: 4 * scale, top: 8 * scale }]}>
          <View style={[styles.pupilIcon, { width: 4 * scale, height: 6 * scale, backgroundColor: '#1A1A2E', left: 4 * scale, top: 2 * scale }]} />
        </View>
        <View style={[styles.eyeIcon, { width: 12 * scale, height: 12 * scale, backgroundColor: '#FFFFFF', right: 4 * scale, top: 8 * scale }]}>
          <View style={[styles.pupilIcon, { width: 4 * scale, height: 6 * scale, backgroundColor: '#1A1A2E', left: 4 * scale, top: 2 * scale }]} />
        </View>
        <View style={[styles.mouthIcon, { width: 20 * scale, height: 4 * scale, backgroundColor: '#1A1A2E', left: 12 * scale, top: 24 * scale }]} />
      </View>
      <View style={[styles.bodyIcon, { width: 36 * scale, height: 20 * scale, backgroundColor: color.primary, left: 18 * scale, top: 56 * scale }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
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
    color: '#8888AA',
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
    backgroundColor: '#0F1030',
    opacity: 0.95,
  },
  headerContent: {
    paddingHorizontal: 20,
    position: 'relative',
    zIndex: 1,
  },
  title: {
    color: '#E8E8F0',
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
  monsterTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  monsterIconContainer: {},
  monsterIcon: {
    position: 'relative',
  },
  monsterHeadIcon: {
    position: 'absolute',
  },
  earIcon: {
    position: 'absolute',
  },
  eyeIcon: {
    position: 'absolute',
  },
  pupilIcon: {
    position: 'absolute',
  },
  mouthIcon: {
    position: 'absolute',
  },
  bodyIcon: {
    position: 'absolute',
  },
  monsterInfo: {
    flex: 1,
  },
  monsterNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  monsterName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Courier',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(255,215,0,0.2)',
  },
  levelText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  monsterPersonality: {
    color: '#8888AA',
    fontSize: 13,
    fontFamily: 'Courier',
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
    color: '#8888AA',
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
    backgroundColor: '#0F1030',
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
  knowledgeCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#16213E',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  knowledgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  knowledgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  knowledgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD60A',
  },
  knowledgeAtSymbol: {
    fontSize: 20,
    fontWeight: '800',
  },
  knowledgeLabel: {
    color: '#8888AA',
    fontSize: 11,
    fontFamily: 'Courier',
  },
  knowledgePoints: {
    color: '#FFD60A',
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Courier',
  },
  useButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,215,0,0.15)',
  },
  useButtonText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Courier',
  },
  knowledgeDescription: {
    color: '#8888AA',
    fontSize: 11,
    fontFamily: 'Courier',
  },
  personalityCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#16213E',
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.2)',
  },
  personalityTitle: {
    color: '#E8E8F0',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Courier',
    marginBottom: 12,
  },
  traitsList: {
    gap: 8,
  },
  traitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(93,155,250,0.08)',
  },
  traitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5D9BFA',
  },
  traitText: {
    color: '#E8E8F0',
    fontSize: 13,
    fontFamily: 'Courier',
  },
  creationCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  creationText: {
    color: '#8888AA',
    fontSize: 11,
    fontFamily: 'Courier',
  },
  noteCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#16213E',
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
    color: '#E8E8F0',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  noteInput: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0F1030',
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.2)',
    color: '#E8E8F0',
    fontSize: 14,
    fontFamily: 'Courier',
    minHeight: 100,
  },
  saveNoteButton: {
    width: '100%',
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#5D9BFA',
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
    color: '#8888AA',
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
    color: '#555577',
    fontSize: 13,
    fontFamily: 'Courier',
  },
  notesList: {
    gap: 12,
  },
  savedNote: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#16213E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  savedNoteContent: {
    color: '#E8E8F0',
    fontSize: 13,
    fontFamily: 'Courier',
    lineHeight: 20,
    marginBottom: 8,
  },
  savedNoteDate: {
    color: '#8888AA',
    fontSize: 11,
    fontFamily: 'Courier',
  },
  chatCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#16213E',
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.2)',
  },
  chatMonsterIcon: {
    marginBottom: 16,
  },
  chatTitle: {
    color: '#E8E8F0',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Courier',
    marginBottom: 8,
  },
  chatDescription: {
    color: '#8888AA',
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
});

export default MonsterManageScreen;
