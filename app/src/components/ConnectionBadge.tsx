import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useConnectionStore, type ConnectionStatus } from '../stores/connectionStore'
import { colors, fontSize, spacing, borderRadius } from '../constants'

const statusConfig: Record<ConnectionStatus, { label: string; color: string }> = {
  disconnected: { label: 'Disconnected', color: colors.error },
  connecting: { label: 'Connecting...', color: colors.warning },
  connected: { label: 'Waiting for agent', color: colors.warning },
  paired: { label: 'Connected', color: colors.success },
}

export function ConnectionBadge() {
  const status = useConnectionStore(s => s.status)
  const { label, color } = statusConfig[status]

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.full,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
})
