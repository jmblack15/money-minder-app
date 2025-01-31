import CustomButton from '@/components/CustomButton'
import FormField from '@/components/FormField'
import { useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link } from 'expo-router'

const SignIn = () => {

  const [isSubmitting, setIsSubmiting] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const submit = () => {

  }

  return (
    <SafeAreaView className='h-full'>
      <ScrollView>
        <View className='"w-full flex justify-center min-h-[80vh] px-4 my-6'>

          <Text className='text-secondary-200 font-bold text-center mt-8 text-2xl'>Money minder</Text>

          <Text className='text-black font-bold  mt-8 text-2xl'>Sign In</Text>

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

          <CustomButton
            title='Sign In'
            handlePress={submit}
            containerStyle='mt-7'
            isLoading={isSubmitting}
          />

          <View className='justify-center pt-5 flex-row gap-2'>
            <Text className='text-lg text-black-100'>Don't have account?</Text>
            <Link href='/signUp' className='text-lg font-psemibold text-secondary'>Sign up</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn