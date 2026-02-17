import React from 'react'
import { Pressable, Text, StyleSheet, Animated } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors, spacing, borderRadius } from '../constants'

type Props = {
  isListening: boolean
  onPress: () => void
  disabled: boolean
}

export function VoiceButton({ isListening, onPress, disabled }: Props) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onPress()
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.button,
        isListening && styles.listening,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.icon}>{isListening ? '\u23F9' : '\uD83C\uDFA4'}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  listening: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  disabled: {
    opacity: 0.4,
  },
  icon: {
    fontSize: 18,
  },
})
