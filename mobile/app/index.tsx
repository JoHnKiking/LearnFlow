import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Loading } from '../src/components/ui';
import { COLORS, SPACING } from '../src/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../src/utils/storage';
import { getCurrentUser } from '../src/utils/auth';

const IndexScreen = () => {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const currentUser = await getCurrentUser();

        if (!currentUser?.id) {
          router.replace('/login');
          return;
        }

        const [monster, selectedModules] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.MONSTER),
          AsyncStorage.getItem('selectedModules'),
        ]);

        if (monster && selectedModules) {
          router.replace('/(tabs)');
          return;
        }

        if (monster) {
          router.replace('/module-selection');
          return;
        }

        router.replace('/monster-selection');
      } catch (error) {
        console.error('初始化应用失败:', error);
        router.replace('/login');
      }
    };

    initializeApp();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>LearnFlow</Text>
        <Text style={styles.subtitle}>技能学习路径管理</Text>
        <Loading visible={true} message="加载中..." />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LARGE,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XLARGE,
  },
});

export default IndexScreen;