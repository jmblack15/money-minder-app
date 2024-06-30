import { Stack } from 'expo-router'
import { View, Text } from 'react-native'

const AuthLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name='signIn'
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='signUp'
        options={{ headerShown: false }}
      />
    </Stack>

  )
}

export default AuthLayout