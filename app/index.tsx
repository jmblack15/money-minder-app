import {
  ScrollView,
  Text,
  View
} from 'react-native';
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';

export default function App() {
  return (
    <SafeAreaView className='h-full'>
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        <View className='w-full justify-center items-center h-full px-4'>
          <Text className='text-4xl text-secondary font-black'>Money Minder</Text>

          <Text className="text-xl text-black-[200] font-bold text-center mt-8"> Your Personal Finance Assistant</Text>

          <Text className="text-sm font-pregular text-black-[100] mt-7 text-center">Are you looking for an efficient
            and easy way to manage your personal finances? Money Minder is the perfect solution for you! With Money
            Minder, you can effortlessly track your income, expenses, and savings all from the convenience of your
            mobile device.
          </Text>

          <CustomButton
            title='Continue With Email'
            handlePress={() => router.push('/signIn')}
            containerStyle='w-full mt-20'
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
