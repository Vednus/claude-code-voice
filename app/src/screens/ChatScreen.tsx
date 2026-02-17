import React, { useRef, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useChatStore } from '../stores/chatStore'
import { useConnectionStore } from '../stores/connectionStore'
import { useWebSocket } from '../hooks/useWebSocket'
import { useSpeech } from '../hooks/useSpeech'
import { useSettingsStore } from '../stores/settingsStore'
import { MessageBubble } from '../components/MessageBubble'
import { InputBar } from '../components/InputBar'
import { ConnectionBadge } from '../components/ConnectionBadge'
import type { ChatMessage } from '../types'
import { colors, fontSize, spacing } from '../constants'

type Props = {
  navigation: any
}

export function ChatScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const { messages, isProcessing, totalCostUsd, cwd } = useChatStore()
  const status = useConnectionStore(s => s.status)
  const { send, cancel } = useWebSocket()
  const { speak } = useSpeech()
  const ttsEnabled = useSettingsStore(s => s.ttsEnabled)
  const listRef = useRef<FlatList>(null)
  const prevMessageCount = useRef(messages.length)

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    }
    prevMessageCount.current = messages.length
  }, [messages.length])

  // TTS on assistant response complete
  useEffect(() => {
    if (!ttsEnabled) return
    const last = messages[messages.length - 1]
    if (last?.role === 'assistant' && !last.isStreaming && last.text) {
      speak(last.text)
    }
  }, [messages, ttsEnabled])

  // Navigate away if disconnected
  useEffect(() => {
    if (status === 'disconnected') {
      navigation.replace('Connect')
    }
  }, [status])

  const renderItem = ({ item }: { item: ChatMessage }) => (
    <MessageBubble message={item} onSpeak={speak} />
  )

  const isPaired = status === 'paired'

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Claude</Text>
          {cwd && (
            <Text style={styles.headerCwd} numberOfLines={1}>
              {cwd.split('/').slice(-2).join('/')}
            </Text>
          )}
        </View>
        <View style={styles.headerRight}>
          {totalCostUsd > 0 && (
            <Text style={styles.costText}>${totalCostUsd.toFixed(4)}</Text>
          )}
          <ConnectionBadge />
          <Pressable onPress={() => navigation.navigate('Settings')} style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>{'\u2699'}</Text>
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          keyboardDismissMode="interactive"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isPaired ? 'Send a message to get started' : 'Waiting for agent...'}
              </Text>
            </View>
          }
        />

        <View style={{ paddingBottom: insets.bottom }}>
          <InputBar
            onSend={send}
            onCancel={cancel}
            isProcessing={isProcessing}
            disabled={!isPaired}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexShrink: 1,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  headerCwd: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontFamily: 'Menlo',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  costText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontFamily: 'Menlo',
  },
  settingsButton: {
    padding: spacing.xs,
  },
  settingsIcon: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  chatArea: {
    flex: 1,
  },
  messageList: {
    paddingVertical: spacing.md,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
})
