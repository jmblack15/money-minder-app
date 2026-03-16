import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack, router, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();
  const segments = useSegments();

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)/' as never);
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthGuard>
          <StatusBar style="light" backgroundColor={Colors.background} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="transaction/new"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="transaction/[id]"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>
        </AuthGuard>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
