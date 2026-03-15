import { Redirect, Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/colors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: {
  name: string;
  title: string;
  icon: IoniconName;
  activeIcon: IoniconName;
}[] = [
  { name: 'index', title: 'Inicio', icon: 'home-outline', activeIcon: 'home' },
  { name: 'transactions/index', title: 'Movimientos', icon: 'swap-horizontal-outline', activeIcon: 'swap-horizontal' },
  { name: 'budgets/index', title: 'Presupuesto', icon: 'pie-chart-outline', activeIcon: 'pie-chart' },
  { name: 'savings/index', title: 'Metas', icon: 'trophy-outline', activeIcon: 'trophy' },
  { name: 'reports/index', title: 'Reportes', icon: 'bar-chart-outline', activeIcon: 'bar-chart' },
];

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? tab.activeIcon : tab.icon}
                size={22}
                color={color}
              />
            ),
          }}
        />
      ))}
      {/* Hidden screens */}
      <Tabs.Screen
        name="transactions/new"
        options={{ href: null, tabBarStyle: { display: 'none' } }}
      />
      <Tabs.Screen
        name="transactions/[id]"
        options={{ href: null, tabBarStyle: { display: 'none' } }}
      />
      <Tabs.Screen
        name="budgets/new"
        options={{ href: null, tabBarStyle: { display: 'none' } }}
      />
      <Tabs.Screen
        name="savings/new"
        options={{ href: null, tabBarStyle: { display: 'none' } }}
      />
      <Tabs.Screen
        name="accounts/index"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="accounts/new"
        options={{ href: null, tabBarStyle: { display: 'none' } }}
      />
    </Tabs>
  );
}
