import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../src/utils/constants';

const MonsterScreen = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '这么晚了还不睡呀！';
    if (hour < 12) return '早上好！今天也要加油学习哦~';
    if (hour < 18) return '下午好！学习了吗？';
    return '晚上好！今天学了什么？';
  };

  const currentEnergy = 7;
  const maxEnergy = 10;
  const expProgress = 25;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>我的怪兽</Text>
        </View>
        
        <View style={styles.monsterCard}>
          <View style={styles.monsterInfo}>
            <View style={styles.monsterEmojiContainer}>
              <Text style={styles.monsterEmoji}>🐲</Text>
            </View>
            <View style={styles.monsterDetails}>
              <Text style={styles.monsterName}>小怪兽</Text>
              <Text style={styles.monsterLevel}>Lv.1</Text>
            </View>
          </View>
          
          <View style={styles.statsSection}>
            <Text style={styles.sectionLabel}>✨ 经验值</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${expProgress}%` }]} />
              </View>
              <Text style={styles.progressText}>{expProgress}%</Text>
            </View>
          </View>
          
          <View style={styles.energySection}>
            <Text style={styles.sectionLabel}>⚡ 体力</Text>
            <View style={styles.energyContainer}>
              {Array.from({ length: maxEnergy }).map((_, index) => (
                <View 
                  key={index}
                  style={[
                    styles.energyDot, 
                    { 
                      backgroundColor: index < currentEnergy 
                        ? COLORS.PINK 
                        : COLORS.TEXT_TERTIARY 
                    }
                  ]} 
                />
              ))}
            </View>
            <Text style={styles.energyText}>{currentEnergy}/{maxEnergy}</Text>
          </View>
        </View>

        <View style={styles.greetingCard}>
          <Text style={styles.greetingText}>{getGreeting()}</Text>
        </View>

        <View style={styles.chatSection}>
          <Text style={styles.chatTitle}>💬 和怪兽聊天</Text>
          <View style={styles.chatBox}>
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>和我说说话吧~</Text>
              <Text style={styles.emptyChatHint}>让我陪你一起学习！</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Text style={styles.chatButtonText}>开始聊天</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
  },
  monsterCard: {
    borderRadius: 24,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    padding: 20,
    marginBottom: 20,
  },
  monsterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  monsterEmojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.PINK,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: COLORS.ORANGE,
  },
  monsterEmoji: {
    fontSize: 48,
  },
  monsterDetails: {
    flex: 1,
  },
  monsterName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  monsterLevel: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontWeight: '700',
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 20,
    backgroundColor: COLORS.TEXT_TERTIARY,
    overflow: 'hidden',
    marginRight: 12,
    borderRadius: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.SUCCESS,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.SUCCESS,
  },
  energySection: {
    alignItems: 'center',
  },
  energyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8,
  },
  energyDot: {
    width: 20,
    height: 20,
    margin: 4,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.PINK,
  },
  energyText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.PINK,
  },
  greetingCard: {
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    padding: 16,
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 24,
    textAlign: 'center',
  },
  chatSection: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  chatBox: {
    height: 180,
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChat: {
    alignItems: 'center',
  },
  emptyChatText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  emptyChatHint: {
    fontSize: 13,
    color: COLORS.PRIMARY,
  },
  chatButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 100,
  },
});

export default MonsterScreen;
