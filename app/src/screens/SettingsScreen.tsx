import React from 'react'
import { View, Text, Switch, StyleSheet, Pressable, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSettingsStore } from '../stores/settingsStore'
import { useConnectionStore } from '../stores/connectionStore'
import { useChatStore } from '../stores/chatStore'
import { disconnect } from '../services/websocket'
import { colors, fontSize, spacing, borderRadius } from '../constants'

type Props = {
  navigation: any
}

export function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const { ttsEnabled, autoSendVoice, setTtsEnabled, setAutoSendVoice } = useSettingsStore()
  const { relayUrl, roomCode, status } = useConnectionStore()
  const { totalCostUsd, sessionId, clearMessages } = useChatStore()

  const handleDisconnect = () => {
    disconnect()
    navigation.replace('Connect')
  }

  const handleNewSession = () => {
    clearMessages()
    navigation.goBack()
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>{'\u2190'} Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Voice</Text>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Text-to-Speech</Text>
            <Text style={styles.rowDescription}>Read responses aloud</Text>
          </View>
          <Switch
            value={ttsEnabled}
            onValueChange={setTtsEnabled}
            trackColor={{ false: colors.bgTertiary, true: colors.accentDim }}
            thumbColor={ttsEnabled ? colors.accent : colors.textMuted}
          />
        </View>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Auto-send Voice</Text>
            <Text style={styles.rowDescription}>Send transcript on silence detection</Text>
          </View>
          <Switch
            value={autoSendVoice}
            onValueChange={setAutoSendVoice}
            trackColor={{ false: colors.bgTertiary, true: colors.accentDim }}
            thumbColor={autoSendVoice ? colors.accent : colors.textMuted}
          />
        </View>

        <Text style={styles.sectionTitle}>Connection</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Relay</Text>
          <Text style={styles.infoValue}>{relayUrl || 'Not set'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Room</Text>
          <Text style={styles.infoValue}>{roomCode || 'Not set'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={styles.infoValue}>{status}</Text>
        </View>

        <Text style={styles.sectionTitle}>Session</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Session ID</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {sessionId?.slice(0, 16) || 'None'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Cost</Text>
          <Text style={styles.infoValue}>${totalCostUsd.toFixed(4)}</Text>
        </View>

        <Pressable onPress={handleNewSession} style={styles.actionButton}>
          <Text style={styles.actionText}>New Session</Text>
        </Pressable>

        <Pressable onPress={handleDisconnect} style={styles.dangerButton}>
          <Text style={styles.dangerText}>Disconnect</Text>
        </Pressable>
      </ScrollView>
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
  backButton: {
    width: 80,
  },
  backText: {
    color: colors.accent,
    fontSize: fontSize.md,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  rowText: {
    flex: 1,
    marginRight: spacing.md,
  },
  rowLabel: {
    color: colors.text,
    fontSize: fontSize.md,
  },
  rowDescription: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  infoValue: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontFamily: 'Menlo',
    maxWidth: '60%',
  },
  actionButton: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    color: colors.accent,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  dangerText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
})
