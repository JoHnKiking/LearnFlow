import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/utils';
import { useSkillTree } from '../../src/hooks/useSkillTree';
import { showErrorAlert } from '../../src/utils';

const GenerateSkillTreeScreen = () => {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const { generateSkillTree } = useSkillTree();

  const handleGenerateSkillTree = async () => {
    if (!domain.trim()) {
      Alert.alert('错误', '请输入要生成技能树的领域');
      return;
    }

    setLoading(true);
    try {
      const skillTree = await generateSkillTree(domain);
      if (skillTree) {
        router.push({
          pathname: '/skill-tree',
          params: { domain }
        });
      }
    } catch (error) {
      showErrorAlert('生成技能树失败', error as string);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGenerate = (quickDomain: string) => {
    setDomain(quickDomain);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>生成技能树</Text>
          <Text style={styles.subtitle}>输入您想学习的领域，我们将为您生成完整的学习路径</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>学习领域</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputPlaceholder}>{domain || '例如：React Native开发、Node.js后端、机器学习...'}</Text>
              {/* 这里可以替换为实际的Input组件 */}
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.generateButton, loading && styles.generateButtonDisabled]}
            onPress={handleGenerateSkillTree}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.generateButtonText}>
              {loading ? '生成中...' : '生成技能树'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickCard}>
          <Text style={styles.sectionTitle}>热门领域</Text>
          <View style={styles.quickButtons}>
            {['React Native', 'Node.js', 'TypeScript', '机器学习'].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.quickButton}
                onPress={() => handleQuickGenerate(`${item}开发`)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickButtonText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.sectionTitle}>使用提示</Text>
          {[
            '• 尽量使用具体的领域名称，如"前端开发"而不是"编程"',
            '• 可以包含技术栈，如"React + TypeScript + Node.js"',
            '• 支持中文和英文领域名称',
          ].map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
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
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  formCard: {
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    padding: 16,
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  inputPlaceholder: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
  },
  generateButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  quickCard: {
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 12,
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(93,155,250,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.25)',
  },
  quickButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '500',
  },
  tipsCard: {
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    padding: 16,
  },
  tipItem: {
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 100,
  },
});

export default GenerateSkillTreeScreen;
