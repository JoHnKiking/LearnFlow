import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GameHelpModalProps {
  visible: boolean;
  onClose: () => void;
}

const GameHelpModal: React.FC<GameHelpModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color="#8888AA" />
          </TouchableOpacity>
          <Text style={styles.title}>游戏说明</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎮 游戏恢复体力</Text>
            <Text style={styles.sectionDesc}>
              每天可游玩3次小游戏恢复体力，完成游戏后可获得体力和能量奖励。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧩 数独</Text>
            <Text style={styles.sectionDesc}>
              在9×9的网格中填入数字1-9，使每行、每列、每个3×3宫格内的数字都不重复。完成一局即可获得奖励！
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📦 推箱子</Text>
            <Text style={styles.sectionDesc}>
              将所有箱子推到目标位置上即可过关。完成3关即可获得奖励！
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 游戏规则</Text>
            <View style={styles.rulesList}>
              <Text style={styles.ruleItem}>• 数独：完成一局即可获得奖励</Text>
              <Text style={styles.ruleItem}>• 推箱子：完成3关即可获得奖励</Text>
              <Text style={styles.ruleItem}>• 每天可游玩3次，凌晨5点重置次数</Text>
              <Text style={styles.ruleItem}>• 完成游戏后奖励会自动添加到你的账户</Text>
              <Text style={styles.ruleItem}>• 游戏过程中可随时退出，不会消耗次数</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(93,155,250,0.2)',
  },
  closeBtn: {
    padding: 8,
  },
  title: {
    color: '#E8E8F0',
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 44,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDesc: {
    color: '#8888AA',
    fontSize: 14,
    lineHeight: 1.6,
  },
  rulesList: {
    gap: 6,
  },
  ruleItem: {
    color: '#8888AA',
    fontSize: 14,
    lineHeight: 1.6,
  },
});

export default GameHelpModal;
