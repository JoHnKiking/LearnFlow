import { Tabs } from 'expo-router';
import { COLORS } from '../../src/utils/constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.TEXT_SECONDARY,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.WHITE,
          borderTopColor: COLORS.BORDER,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
        }}
      />
      <Tabs.Screen
        name="generate"
        options={{
          title: '生成技能树',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '搜索',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
        }}
      />
      <Tabs.Screen
        name="monster"
        options={{
          title: '怪兽',
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: '笔记',
        }}
      />
    </Tabs>
  );
}