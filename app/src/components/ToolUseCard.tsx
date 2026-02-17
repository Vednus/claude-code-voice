import React, { memo, useState } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import type { ToolUse } from '../types'
import { colors, fontSize, spacing, borderRadius } from '../constants'

type Props = {
  tool: ToolUse
}

const toolIcons: Record<string, string> = {
  Read: 'Read',
  Write: 'Write',
  Edit: 'Edit',
  Bash: 'Bash',
  Glob: 'Glob',
  Grep: 'Grep',
  Task: 'Task',
  WebFetch: 'Web',
  WebSearch: 'Search',
}

export const ToolUseCard = memo(function ToolUseCard({ tool }: Props) {
  const [expanded, setExpanded] = useState(false)
  const label = toolIcons[tool.toolName] || tool.toolName
  const isRunning = tool.status === 'running'

  const inputSummary = summarizeInput(tool.toolName, tool.input)

  return (
    <Pressable onPress={() => setExpanded(!expanded)} style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.indicator, isRunning ? styles.running : styles.done]} />
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.summary} numberOfLines={expanded ? undefined : 1}>
          {inputSummary}
        </Text>
        <Text style={styles.chevron}>{expanded ? '\u25B2' : '\u25BC'}</Text>
      </View>

      {expanded && tool.output && (
        <View style={styles.outputContainer}>
          <Text style={styles.output} numberOfLines={20}>
            {tool.output.slice(0, 2000)}
          </Text>
        </View>
      )}
    </Pressable>
  )
})

function summarizeInput(toolName: string, input: unknown): string {
  if (!input || typeof input !== 'object') return ''
  const inp = input as any

  switch (toolName) {
    case 'Read':
      return inp.file_path || ''
    case 'Write':
      return inp.file_path || ''
    case 'Edit':
      return inp.file_path || ''
    case 'Bash':
      return inp.command?.slice(0, 80) || ''
    case 'Glob':
      return inp.pattern || ''
    case 'Grep':
      return inp.pattern || ''
    default:
      return JSON.stringify(input).slice(0, 60)
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
    backgroundColor: colors.toolBg,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.toolBorder,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.sm,
  },
  running: {
    backgroundColor: colors.warning,
  },
  done: {
    backgroundColor: colors.success,
  },
  label: {
    color: colors.accentLight,
    fontSize: fontSize.xs,
    fontWeight: '700',
    fontFamily: 'Menlo',
    marginRight: spacing.sm,
  },
  summary: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontFamily: 'Menlo',
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 8,
    marginLeft: spacing.sm,
  },
  outputContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.toolBorder,
    padding: spacing.md,
  },
  output: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontFamily: 'Menlo',
    lineHeight: 16,
  },
})
