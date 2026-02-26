import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PIXEL_COLORS, SPACING, PIXEL_BORDERS } from '../../src/utils/constants';
import { PixelCard, PixelButton } from '../../src/components/ui';

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>我的怪兽</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <PixelCard variant="highlight" style={styles.monsterCard}>
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
                        ? PIXEL_COLORS.PIXEL_PINK 
                        : PIXEL_COLORS.PIXEL_GRAY 
                    }
                  ]} 
                />
              ))}
            </View>
            <Text style={styles.energyText}>{currentEnergy}/{maxEnergy}</Text>
          </View>
        </PixelCard>

        <PixelCard style={styles.greetingCard}>
          <Text style={styles.greetingText}>{getGreeting()}</Text>
        </PixelCard>

        <View style={styles.chatSection}>
          <Text style={styles.chatTitle}>💬 和怪兽聊天</Text>
          <PixelCard style={styles.chatBox}>
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>和我说说话吧~</Text>
              <Text style={styles.emptyChatHint}>让我陪你一起学习！</Text>
            </View>
          </PixelCard>
          
          <PixelButton 
            title="开始聊天" 
            onPress={() => {}} 
            variant="primary"
            fullWidth={true}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PIXEL_COLORS.BACKGROUND,
  },
  header: {
    padding: SPACING.LARGE,
    borderBottomWidth: PIXEL_BORDERS.MEDIUM,
    borderBottomColor: PIXEL_COLORS.PIXEL_GRAY,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: PIXEL_COLORS.TEXT_PRIMARY,
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    padding: SPACING.LARGE,
  },
  monsterCard: {
    marginBottom: SPACING.LARGE,
  },
  monsterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
  },
  monsterEmojiContainer: {
    width: 100,
    height: 100,
    backgroundColor: PIXEL_COLORS.PIXEL_PINK,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.LARGE,
    borderWidth: PIXEL_BORDERS.MEDIUM,
    borderColor: PIXEL_COLORS.PIXEL_ORANGE,
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
    color: PIXEL_COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
    letterSpacing: 1,
  },
  monsterLevel: {
    fontSize: 18,
    color: PIXEL_COLORS.PIXEL_CYAN,
    fontWeight: '700',
  },
  statsSection: {
    marginBottom: SPACING.LARGE,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: PIXEL_COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MEDIUM,
    letterSpacing: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 24,
    backgroundColor: PIXEL_COLORS.PIXEL_GRAY,
    overflow: 'hidden',
    marginRight: SPACING.MEDIUM,
    borderWidth: PIXEL_BORDERS.SMALL,
    borderColor: PIXEL_COLORS.PIXEL_LIGHT_GRAY,
  },
  progressFill: {
    height: '100%',
    backgroundColor: PIXEL_COLORS.PIXEL_GREEN,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: PIXEL_COLORS.PIXEL_GREEN,
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
    margin: 4,
    borderWidth: PIXEL_BORDERS.SMALL,
    borderColor: PIXEL_COLORS.PIXEL_PINK,
  },
  energyText: {
    fontSize: 18,
    fontWeight: '700',
    color: PIXEL_COLORS.PIXEL_PINK,
  },
  greetingCard: {
    marginBottom: SPACING.LARGE,
  },
  greetingText: {
    fontSize: 18,
    color: PIXEL_COLORS.TEXT_PRIMARY,
    lineHeight: 28,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  chatSection: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: PIXEL_COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MEDIUM,
    letterSpacing: 1,
  },
  chatBox: {
    height: 200,
    marginBottom: SPACING.MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChat: {
    alignItems: 'center',
  },
  emptyChatText: {
    fontSize: 18,
    color: PIXEL_COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SMALL,
  },
  emptyChatHint: {
    fontSize: 14,
    color: PIXEL_COLORS.PIXEL_CYAN,
  },
});

export default MonsterScreen;
