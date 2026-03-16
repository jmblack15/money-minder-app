import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Colors } from '@/constants/colors';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={[tabStyles.iconWrapper, focused && tabStyles.iconWrapperActive]}>
      <Text style={tabStyles.emoji}>{emoji}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabStyles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: tabStyles.label,
        tabBarBackground: () => <View style={tabStyles.tabBarBg} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Inicio" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Movimientos',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💸" label="Movimientos" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Presupuestos',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🎯" label="Presupuestos" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Metas',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⭐" label="Metas" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="Reportes" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Cuentas',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏦" label="Cuentas" focused={focused} />,
        }}
      />
      {/* Hide the old explore tab */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 70,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabBarBg: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: `${Colors.primary}20`,
  },
  emoji: { fontSize: 18 },
});
