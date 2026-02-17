import React, { useState, useRef } from 'react'
import { View, TextInput, Pressable, Text, StyleSheet, Keyboard } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors, fontSize, spacing, borderRadius } from '../constants'

type Props = {
  onSend: (text: string) => void
  onCancel: () => void
  isProcessing: boolean
  disabled: boolean
}

export function InputBar({ onSend, onCancel, isProcessing, disabled }: Props) {
  const [text, setText] = useState('')
  const inputRef = useRef<TextInput>(null)

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handleCancel = () => {
    onCancel()
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder={disabled ? 'Connect to relay first...' : 'Ask Claude...'}
        placeholderTextColor={colors.textMuted}
        multiline
        maxLength={10000}
        editable={!disabled}
        onSubmitEditing={handleSend}
        blurOnSubmit={false}
      />

      {isProcessing ? (
        <Pressable onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Stop</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={handleSend}
          style={[styles.sendButton, (!text.trim() || disabled) && styles.sendDisabled]}
          disabled={!text.trim() || disabled}
        >
          <Text style={styles.sendIcon}>{'\u25B6'}</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    maxHeight: 120,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    backgroundColor: colors.bgTertiary,
    opacity: 0.5,
  },
  sendIcon: {
    color: '#fff',
    fontSize: 14,
  },
  cancelButton: {
    height: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
})
