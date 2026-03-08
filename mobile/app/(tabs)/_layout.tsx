import { Tabs } from 'expo-router';
import { COLORS } from '../../src/utils/constants';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.TEXT_TERTIARY,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(15, 20, 50, 0.95)',
          borderTopColor: COLORS.BORDER_DARK,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'generate') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'monster') {
            iconName = focused ? 'game-controller' : 'game-controller-outline';
          } else if (route.name === 'notes') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={focused ? 24 : 20} color={color} />;
        },
      })}
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
          title: '生成',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '搜索',
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
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
        }}
      />
    </Tabs>
  );
}