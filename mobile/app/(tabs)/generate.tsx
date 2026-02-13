import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Input, Loading } from '../../src/components/ui';
import { useSkillTree } from '../../src/hooks/useSkillTree';
import { COLORS, SPACING, showErrorAlert } from '../../src/utils';

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading visible={true} message="生成技能树中..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>生成技能树</Text>
          <Text style={styles.subtitle}>输入您想学习的领域，我们将为您生成完整的学习路径</Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            placeholder="例如：React Native开发、Node.js后端、机器学习..."
            value={domain}
            onChangeText={setDomain}
            label="学习领域"
          />
          
          <Button 
            title="生成技能树" 
            onPress={handleGenerateSkillTree}
            variant="primary"
            size="large"
          />
        </View>

        <View style={styles.quickContainer}>
          <Text style={styles.sectionTitle}>热门领域</Text>
          <View style={styles.quickButtons}>
            <Button 
              title="React Native" 
              onPress={() => handleQuickGenerate('React Native开发')}
              variant="outline"
              size="small"
              fullWidth={false}
            />
            <Button 
              title="Node.js" 
              onPress={() => handleQuickGenerate('Node.js后端开发')}
              variant="outline"
              size="small"
              fullWidth={false}
            />
            <Button 
              title="TypeScript" 
              onPress={() => handleQuickGenerate('TypeScript进阶')}
              variant="outline"
              size="small"
              fullWidth={false}
            />
            <Button 
              title="机器学习" 
              onPress={() => handleQuickGenerate('机器学习基础')}
              variant="outline"
              size="small"
              fullWidth={false}
            />
          </View>
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>使用提示</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipText}>• 尽量使用具体的领域名称，如"前端开发"而不是"编程"</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipText}>• 可以包含技术栈，如"React + TypeScript + Node.js"</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipText}>• 支持中文和英文领域名称</Text>
          </View>
        </View>
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
    padding: SPACING.LARGE,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.XLARGE,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LARGE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: SPACING.XLARGE,
  },
  quickContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LARGE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: SPACING.XLARGE,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MEDIUM,
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SMALL,
  },
  tipsContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LARGE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipItem: {
    marginBottom: SPACING.SMALL,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
});

export default GenerateSkillTreeScreen;