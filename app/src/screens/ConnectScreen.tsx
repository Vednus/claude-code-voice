import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useConnectionStore } from '../stores/connectionStore'
import { useWebSocket } from '../hooks/useWebSocket'
import { ConnectionBadge } from '../components/ConnectionBadge'
import { colors, fontSize, spacing, borderRadius } from '../constants'

type Props = {
  navigation: any
}

export function ConnectScreen({ navigation }: Props) {
  const { relayUrl, roomCode, setRelayUrl, setRoomCode, loadSaved, save, status } =
    useConnectionStore()
  const { connect, disconnect } = useWebSocket()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    loadSaved().then(() => setLoaded(true))
  }, [])

  useEffect(() => {
    if (status === 'paired') {
      navigation.replace('Chat')
    }
  }, [status])

  const handleConnect = async () => {
    await save()
    connect()
  }

  if (!loaded) return null

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Claude Voice</Text>
        <Text style={styles.subtitle}>Connect to your dev machine</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Relay URL</Text>
          <TextInput
            style={styles.input}
            value={relayUrl}
            onChangeText={setRelayUrl}
            placeholder="ws://localhost:3211"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <Text style={styles.label}>Room Code</Text>
          <TextInput
            style={styles.input}
            value={roomCode}
            onChangeText={setRoomCode}
            placeholder="e.g. abc123"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable
            onPress={handleConnect}
            style={[
              styles.button,
              (!relayUrl || !roomCode) && styles.buttonDisabled,
            ]}
            disabled={!relayUrl || !roomCode}
          >
            <Text style={styles.buttonText}>
              {status === 'connecting' ? 'Connecting...' : 'Connect'}
            </Text>
          </Pressable>

          {status !== 'disconnected' && (
            <View style={styles.statusRow}>
              <ConnectionBadge />
              <Pressable onPress={disconnect} style={styles.disconnectButton}>
                <Text style={styles.disconnectText}>Disconnect</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  form: {
    gap: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonDisabled: {
    backgroundColor: colors.bgTertiary,
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  disconnectButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  disconnectText: {
    color: colors.error,
    fontSize: fontSize.sm,
  },
})
