import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function IndexPage() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <LoadingSpinner fullScreen />;

  return <Redirect href={isAuthenticated ? '/(app)' : '/(auth)/login'} />;
}
