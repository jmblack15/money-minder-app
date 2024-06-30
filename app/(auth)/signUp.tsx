import CustomButton from '@/components/CustomButton'
import FormField from '@/components/FormField'
import { useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link } from 'expo-router'

const SignUp = () => {

  const [isSubmitting, setIsSubmiting] = useState(false)
  const [form, setForm] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const submit = () => {

  }

  return (
    <SafeAreaView className='h-full'>
      <ScrollView>
        <View className='"w-full flex justify-center h-full px-4'>

          <Text className='text-secondary-200 font-bold text-center mt-6 text-2xl'>Money minder</Text>

          <Text className='text-black font-bold  mt-3 text-2xl'>Sign Up</Text>

          <FormField
            title='User Name'
            value={form.userName}
            handleTextChange={(e) => setForm({
              ...form,
              userName: e
            })}
            otherStyles='mt-7'
            keyBoardType='email-address'
          />

          <FormField
            title='Email'
            value={form.email}
            handleTextChange={(e) => setForm({
              ...form,
              email: e
            })}
            otherStyles='mt-7'
            keyBoardType='email-address'
          />

          <FormField
            title='Password'
            value={form.password}
            handleTextChange={(e) => setForm({
              ...form,
              password: e
            })}
            otherStyles='mt-7'
          />

          <FormField
            title='Confirm Password'
            value={form.confirmPassword}
            handleTextChange={(e) => setForm({
              ...form,
              confirmPassword: e
            })}
            otherStyles='mt-7'
          />

          <CustomButton
            title='Sign Up'
            handlePress={submit}
            containerStyle='mt-7'
            isLoading={isSubmitting}
          />

          <View className='justify-center pt-5 flex-row gap-2'>
            <Text className='text-lg text-black-100'>I already have an account</Text>
            <Link href='/signIn' className='text-lg font-psemibold text-secondary'>Sign In</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUp