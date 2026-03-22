import { Tabs } from 'expo-router';
import { COLORS } from '../../src/utils/constants';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: '#6B7280',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(15, 20, 50, 0.95)',
          borderTopColor: 'rgba(93, 155, 250, 0.2)',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          fontFamily: 'Courier',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'index') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'monster') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
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
          title: '地图',
        }}
      />
      <Tabs.Screen
        name="monster"
        options={{
          title: '怪兽',
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