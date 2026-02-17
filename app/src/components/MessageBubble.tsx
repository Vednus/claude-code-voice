import React, { memo } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import Markdown from 'react-native-markdown-display'
import * as Clipboard from 'expo-clipboard'
import * as Haptics from 'expo-haptics'
import type { ChatMessage } from '../types'
import { ToolUseCard } from './ToolUseCard'
import { colors, fontSize, spacing, borderRadius } from '../constants'

type Props = {
  message: ChatMessage
  onSpeak?: (text: string) => void
}

export const MessageBubble = memo(function MessageBubble({ message, onSpeak }: Props) {
  const isUser = message.role === 'user'

  const handleLongPress = async () => {
    await Clipboard.setStringAsync(message.text)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <Pressable
        onLongPress={handleLongPress}
        style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}
      >
        {isUser ? (
          <Text style={styles.userText}>{message.text}</Text>
        ) : (
          <Markdown style={markdownStyles}>{message.text || ' '}</Markdown>
        )}

        {message.tools?.map(tool => (
          <ToolUseCard key={tool.toolUseId} tool={tool} />
        ))}

        {message.isStreaming && (
          <View style={styles.cursor}>
            <Text style={styles.cursorText}>|</Text>
          </View>
        )}
      </Pressable>
    </View>
  )
})

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    alignItems: 'flex-start',
  },
  rowUser: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    backgroundColor: colors.userBubble,
    borderBottomRightRadius: borderRadius.sm,
  },
  assistantBubble: {
    backgroundColor: colors.assistantBubble,
    borderBottomLeftRadius: borderRadius.sm,
  },
  userText: {
    color: '#fff',
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  cursor: {
    marginTop: 2,
  },
  cursorText: {
    color: colors.accent,
    fontSize: fontSize.md,
    opacity: 0.7,
  },
})

const markdownStyles = StyleSheet.create({
  body: {
    color: colors.text,
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  heading1: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  heading2: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  code_inline: {
    backgroundColor: colors.bgTertiary,
    color: colors.accentLight,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    fontSize: fontSize.sm,
    fontFamily: 'Menlo',
  },
  fence: {
    backgroundColor: colors.bgTertiary,
    color: colors.text,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    fontSize: fontSize.sm,
    fontFamily: 'Menlo',
    marginVertical: spacing.sm,
  },
  link: {
    color: colors.accentLight,
    textDecorationLine: 'underline',
  },
  strong: {
    color: colors.text,
    fontWeight: '700',
  },
  em: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  bullet_list_icon: {
    color: colors.textSecondary,
  },
  ordered_list_icon: {
    color: colors.textSecondary,
  },
  blockquote: {
    backgroundColor: colors.bgTertiary,
    borderLeftColor: colors.accent,
    borderLeftWidth: 3,
    paddingLeft: spacing.md,
    marginVertical: spacing.sm,
  },
}) as any
