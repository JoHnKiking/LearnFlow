import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

/**
 * 帮助与反馈弹窗组件属性
 */
interface HelpModalProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
}

/**
 * 反馈问题示例数据
 */
const feedbackExamples = [
  { id: 1, title: '体力异常扣除', description: '进入游戏时体力未正确扣除，或游戏结束后奖励未正确添加' },
  { id: 2, title: '学习资源不存在', description: '跳转后的学习资源页面无法打开或内容为空' },
  { id: 3, title: '游戏无法正常进行', description: '推箱子/数独游戏无法正常开始、关卡无法切换或无法提交' },
  { id: 4, title: '怪兽数据异常', description: '怪兽等级、经验、体力值等数据显示异常或无法保存' },
  { id: 5, title: '任务系统问题', description: '任务无法添加、完成或删除，进度无法保存' },
  { id: 6, title: '专注计时问题', description: '专注计时器无法启动、暂停或计时不准确' },
];

/**
 * 帮助与反馈弹窗组件
 * 包含使用说明、问题反馈示例和联系信息
 */
const HelpModal = ({ visible, onClose }: HelpModalProps) => {
  const { colors } = useTheme();
  /** 当前选中的问题示例 */
  const [selectedExample, setSelectedExample] = useState<number | null>(null);
  /** 输入的反馈内容 */
  const [feedbackText, setFeedbackText] = useState('');

  /**
   * 提交反馈处理
   */
  const handleSubmitFeedback = () => {
    // 验证反馈内容不为空
    if (!feedbackText.trim()) {
      Alert.alert('提示', '请输入问题描述');
      return;
    }

    // 显示提交成功提示（模拟）
    Alert.alert(
      '✅ 提交成功',
      '感谢您的反馈，我们会尽快处理！',
      [{ text: '确定', onPress: () => {
        setFeedbackText('');
        setSelectedExample(null);
      }}]
    );
  };

  const styles = useMemo(() => StyleSheet.create({
    modalContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalVisible: { opacity: 1 },
    modalHidden: { opacity: 0, pointerEvents: 'none' },
    modalContent: {
      width: '90%',
      maxHeight: '85%',
      backgroundColor: colors.background,
      borderRadius: 24,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      paddingTop: 32,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderDark,
    },
    closeBtn: { padding: 8 },
    title: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: '700',
      fontFamily: 'Courier',
    },
    placeholder: { width: 44 },
    content: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 40,
    },
    section: { marginBottom: 32 },
    sectionTitle: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 14,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: colors.borderDark,
      marginBottom: 16,
    },
    sectionDesc: {
      color: colors.textSecondary,
      fontSize: 13,
      marginBottom: 16,
      lineHeight: 20,
    },
    helpItem: {
      backgroundColor: colors.borderLight,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
    },
    helpTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 6,
    },
    helpText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 20,
    },
    examplesList: { marginBottom: 20 },
    exampleItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 14,
      backgroundColor: colors.borderLight,
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    exampleItemSelected: {
      backgroundColor: colors.borderDark,
      borderColor: colors.borderDark,
    },
    exampleRadio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.textTertiary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
      marginRight: 12,
    },
    exampleRadioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    exampleContent: { flex: 1 },
    exampleTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
    },
    exampleDesc: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
    feedbackInputContainer: { marginBottom: 20 },
    feedbackLabel: {
      color: colors.textSecondary,
      fontSize: 13,
      marginBottom: 10,
    },
    feedbackInput: {
      backgroundColor: colors.borderLight,
      borderRadius: 12,
      padding: 14,
      color: colors.textPrimary,
      fontSize: 14,
      minHeight: 100,
      textAlignVertical: 'top',
      lineHeight: 22,
    },
    submitBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
    },
    submitBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
    },
    contactText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 20,
      marginBottom: 14,
    },
    contactCard: {
      backgroundColor: colors.borderLight,
      borderRadius: 12,
      padding: 14,
    },
    contactItem: {
      color: colors.textPrimary,
      fontSize: 13,
      lineHeight: 20,
      marginBottom: 8,
    },
    contactItemLast: { marginBottom: 0 },
  }), [colors]);

  return (
    <View style={[styles.modalContainer, visible ? styles.modalVisible : styles.modalHidden]}>
      <View style={styles.modalContent}>
        {/* 头部 */}
        <View style={styles.header}>
          <View style={styles.placeholder} />
          <Text style={styles.title}>帮助与反馈</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* 滚动内容区域 */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 问题反馈 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 问题类型</Text>
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionDesc}>请选择您遇到的问题类型，或直接描述问题：</Text>
            
            {/* 问题示例列表 */}
            <View style={styles.examplesList}>
              {feedbackExamples.map((example) => (
                <TouchableOpacity
                  key={example.id}
                  style={[
                    styles.exampleItem,
                    selectedExample === example.id && styles.exampleItemSelected
                  ]}
                  onPress={() => {
                    setSelectedExample(selectedExample === example.id ? null : example.id);
                    if (selectedExample !== example.id) {
                      setFeedbackText(example.description);
                    }
                  }}
                >
                  <View style={styles.exampleRadio}>
                    {selectedExample === example.id && (
                      <View style={styles.exampleRadioInner} />
                    )}
                  </View>
                  <View style={styles.exampleContent}>
                    <Text style={styles.exampleTitle}>{example.title}</Text>
                    <Text style={styles.exampleDesc}>{example.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* 反馈输入框 */}
            <View style={styles.feedbackInputContainer}>
              <Text style={styles.feedbackLabel}>问题描述</Text>
              <TextInput
                style={styles.feedbackInput}
                placeholder="请详细描述您遇到的问题..."
                placeholderTextColor={colors.textTertiary}
                value={feedbackText}
                onChangeText={setFeedbackText}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* 提交按钮 */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitFeedback}>
              <Text style={styles.submitBtnText}>提交反馈</Text>
            </TouchableOpacity>
          </View>

          {/* 联系我们 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📞 联系我们</Text>
            <View style={styles.sectionDivider} />
            <Text style={styles.contactText}>
              如果您在使用过程中有任何问题或建议，欢迎随时联系我们：
            </Text>
            <View style={styles.contactCard}>
              <Text style={styles.contactItem}>📧 邮箱：support@learnflow.com</Text>
              <Text style={[styles.contactItem, styles.contactItemLast]}>💬 客服：工作日 9:00-18:00</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default HelpModal;
