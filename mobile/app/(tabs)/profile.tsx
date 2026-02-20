import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../src/components/ui';
import { COLORS, SPACING } from '../../src/utils/constants';
import { getCurrentUser } from '../../src/utils/auth';

const ProfileScreen = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('加载用户数据失败:', error);
      }
    };

    loadUserData();
  }, []);

  const handleViewSkillTrees = () => {
    Alert.alert('功能开发中', '查看我的技能树功能即将推出');
  };

  const handleLearningRecords = () => {
    Alert.alert('功能开发中', '学习记录功能即将推出');
  };

  const handleSettings = () => {
    Alert.alert('功能开发中', '设置功能即将推出');
  };

  const handleLogout = () => {
    Alert.alert('确认退出', '您确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      { 
        text: '确定', 
        onPress: () => {
          // 这里处理退出登录逻辑
          router.replace('/login');
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username ? user.username.charAt(0).toUpperCase() : 'L'}
            </Text>
          </View>
          <Text style={styles.username}>
            {user?.username || 'LearnFlow用户'}
          </Text>
          <Text style={styles.userInfo}>
            手机号: {user?.phone ? `${user.phone.slice(0,3)}****${user.phone.slice(-4)}` : '未设置'}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>技能树</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>42%</Text>
            <Text style={styles.statLabel}>平均进度</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>18</Text>
            <Text style={styles.statLabel}>学习小时</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Button 
            title="我的技能树" 
            onPress={handleViewSkillTrees}
            variant="outline"
          />
          <Button 
            title="学习记录" 
            onPress={handleLearningRecords}
            variant="outline"
          />
          <Button 
            title="设置" 
            onPress={handleSettings}
            variant="outline"
          />
        </View>

        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>最近学习</Text>
          <View style={styles.recentItem}>
            <Text style={styles.recentTitle}>React Native开发</Text>
            <Text style={styles.recentProgress}>进度: 60%</Text>
            <Text style={styles.recentTime}>上次学习: 2小时前</Text>
          </View>
          <View style={styles.recentItem}>
            <Text style={styles.recentTitle}>Node.js后端开发</Text>
            <Text style={styles.recentProgress}>进度: 30%</Text>
            <Text style={styles.recentTime}>上次学习: 1天前</Text>
          </View>
        </View>

        <View style={styles.logoutContainer}>
          <Button 
            title="退出登录" 
            onPress={handleLogout}
            variant="secondary"
          />
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  userInfo: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.XLARGE,
  },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: SPACING.MEDIUM,
    alignItems: 'center',
    marginHorizontal: SPACING.SMALL,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  actionsContainer: {
    gap: SPACING.MEDIUM,
    marginBottom: SPACING.XLARGE,
  },
  recentContainer: {
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
  recentItem: {
    padding: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    marginBottom: SPACING.MEDIUM,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  recentProgress: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 2,
  },
  recentTime: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  logoutContainer: {
    marginTop: SPACING.MEDIUM,
  },
});

export default ProfileScreen;