import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CUTE_COLORS, SPACING, BORDER_RADIUS } from '../../src/utils/constants';

const MonsterScreen = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '这么晚了还不睡呀！';
    if (hour < 12) return '早上好！今天也要加油学习哦~';
    if (hour < 18) return '下午好！学习了吗？';
    return '晚上好！今天学了什么？';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>我的怪兽</Text>
      </View>
      
      <ScrollView style={styles.content}>
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
                <View style={[styles.progressFill, { width: '25%' }]} />
              </View>
              <Text style={styles.progressText}>25%</Text>
            </View>
          </View>
          
          <View style={styles.energySection}>
            <Text style={styles.sectionLabel}>⚡ 体力</Text>
            <View style={styles.energyContainer}>
              <View style={[styles.energyDot, { backgroundColor: CUTE_COLORS.PINK }]} />
              <View style={[styles.energyDot, { backgroundColor: CUTE_COLORS.PINK }]} />
              <View style={[styles.energyDot, { backgroundColor: CUTE_COLORS.PINK }]} />
              <View style={[styles.energyDot, { backgroundColor: CUTE_COLORS.PINK }]} />
              <View style={[styles.energyDot, { backgroundColor: CUTE_COLORS.PINK }]} />
              <View style={[styles.energyDot, { backgroundColor: CUTE_COLORS.PINK }]} />
              <View style={[styles.energyDot, { backgroundColor: CUTE_COLORS.PINK }]} />
              <View style={[styles.energyDot, { backgroundColor: CUTE_COLORS.LIGHT_GRAY }]} />
              <View style={[styles.energyDot, { backgroundColor: CUTE_COLORS.LIGHT_GRAY }]} />
              <View style={[styles.energyDot, { backgroundColor: CUTE_COLORS.LIGHT_GRAY }]} />
            </View>
            <Text style={styles.energyText}>7/10</Text>
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
          
          <View style={styles.button}>
            <Text style={styles.buttonText}>开始聊天</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CUTE_COLORS.WARM_WHITE,
  },
  header: {
    padding: SPACING.LARGE,
    borderBottomWidth: 3,
    borderBottomColor: CUTE_COLORS.LIGHT_PINK,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: CUTE_COLORS.DARK_GRAY,
  },
  content: {
    flex: 1,
    padding: SPACING.LARGE,
  },
  monsterCard: {
    backgroundColor: CUTE_COLORS.CREAM,
    borderRadius: BORDER_RADIUS.LARGE,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  monsterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
  },
  monsterEmojiContainer: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.XLARGE,
    backgroundColor: CUTE_COLORS.PINK,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.LARGE,
  },
  monsterEmoji: {
    fontSize: 60,
  },
  monsterDetails: {
    flex: 1,
  },
  monsterName: {
    fontSize: 28,
    fontWeight: '800',
    color: CUTE_COLORS.DARK_GRAY,
    marginBottom: SPACING.SMALL,
  },
  monsterLevel: {
    fontSize: 18,
    color: CUTE_COLORS.GRAY,
  },
  statsSection: {
    marginBottom: SPACING.LARGE,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: CUTE_COLORS.DARK_GRAY,
    marginBottom: SPACING.MEDIUM,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 20,
    backgroundColor: CUTE_COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LARGE,
    overflow: 'hidden',
    marginRight: SPACING.MEDIUM,
    borderWidth: 2,
    borderColor: CUTE_COLORS.LIGHT_PINK,
  },
  progressFill: {
    height: '100%',
    backgroundColor: CUTE_COLORS.PINK,
    borderRadius: BORDER_RADIUS.LARGE,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: CUTE_COLORS.PINK,
  },
  energySection: {
    alignItems: 'center',
  },
  energyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: SPACING.SMALL,
  },
  energyDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    margin: 4,
    borderWidth: 2,
    borderColor: CUTE_COLORS.LIGHT_PINK,
  },
  energyText: {
    fontSize: 18,
    fontWeight: '700',
    color: CUTE_COLORS.PINK,
  },
  greetingCard: {
    backgroundColor: CUTE_COLORS.LIGHT_BLUE,
    borderRadius: BORDER_RADIUS.LARGE,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  greetingText: {
    fontSize: 18,
    color: CUTE_COLORS.DARK_GRAY,
    lineHeight: 28,
    textAlign: 'center',
  },
  chatSection: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: CUTE_COLORS.DARK_GRAY,
    marginBottom: SPACING.MEDIUM,
  },
  chatBox: {
    height: 200,
    marginBottom: SPACING.MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CUTE_COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LARGE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyChat: {
    alignItems: 'center',
  },
  emptyChatText: {
    fontSize: 18,
    color: CUTE_COLORS.GRAY,
    marginBottom: SPACING.SMALL,
  },
  emptyChatHint: {
    fontSize: 14,
    color: CUTE_COLORS.LIGHT_PINK,
  },
  button: {
    backgroundColor: CUTE_COLORS.PINK,
    borderRadius: BORDER_RADIUS.MEDIUM,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: CUTE_COLORS.WHITE,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default MonsterScreen;
