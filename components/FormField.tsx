import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import icons from '@/constants/icons'

interface FormFielProps {
  title: string,
  value: string,
  placeHolder?: string
  handleTextChange: ((text: string) => void),
  otherStyles?: string,
  keyBoardType?: string
}

const FormField = ({ title, value, placeHolder, handleTextChange, otherStyles, keyBoardType }: FormFielProps) => {

  const [isShowPassword, setIsShowPassword] = useState(false)

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className='text-base text-black-100 font-pmedium'>{title}</Text>

      <View className='w-full h-16 px-4 rounded-2xl border-2 border-black-200 focus:border-secondary flex flex-row items-center'>
        <TextInput
          className='flex-1 text-black-100 font-psemibold text-base'
          value={value}
          placeholder={placeHolder}
          placeholderTextColor='#7b7b8b'
          onChangeText={handleTextChange}
          secureTextEntry={title === 'Password' && !isShowPassword}
        />

        {title === 'Password' || title === 'Confirm Password' ? (
          <TouchableOpacity onPress={() => setIsShowPassword(!isShowPassword)}>
            <Image
              source={!isShowPassword ? icons.eye : icons.eyeHide}
              className='w-8 h-8'
              resizeMode='contain'
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  )
}

export default FormField