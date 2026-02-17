// Wire protocol types (mirrored from shared/protocol.ts for mobile app)

export type RegisterMessage = {
  type: 'register'
  role: 'agent' | 'app'
  roomCode: string
}

export type PairedMessage = { type: 'paired' }
export type PeerDisconnectedMessage = { type: 'peer_disconnected' }

export type PromptMessage = {
  type: 'prompt'
  text: string
  sessionId?: string
  cwd?: string
}

export type CancelMessage = { type: 'cancel' }

export type ApproveToolMessage = {
  type: 'approve_tool'
  toolUseId: string
  approved: boolean
}

export type SessionStartMessage = {
  type: 'session_start'
  sessionId: string
  cwd: string
}

export type TextDeltaMessage = { type: 'text_delta'; text: string }
export type TextDoneMessage = { type: 'text_done'; fullText: string }

export type ToolStartMessage = {
  type: 'tool_start'
  toolName: string
  toolUseId: string
  input: unknown
}

export type ToolDoneMessage = {
  type: 'tool_done'
  toolName: string
  toolUseId: string
  output: string
}

export type ToolApprovalMessage = {
  type: 'tool_approval'
  toolName: string
  toolUseId: string
  input: unknown
}

export type ResultMessage = {
  type: 'result'
  sessionId: string
  costUsd: number
  durationMs: number
}

export type ErrorMessage = {
  type: 'error'
  message: string
  fatal?: boolean
}

export type AgentMessage =
  | SessionStartMessage
  | TextDeltaMessage
  | TextDoneMessage
  | ToolStartMessage
  | ToolDoneMessage
  | ToolApprovalMessage
  | ResultMessage
  | ErrorMessage

export type ServerMessage = PairedMessage | PeerDisconnectedMessage | AgentMessage

// ── Chat types ──────────────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant'

export type ToolUse = {
  toolName: string
  toolUseId: string
  input: unknown
  output?: string
  status: 'running' | 'done'
}

export type ChatMessage = {
  id: string
  role: ChatRole
  text: string
  timestamp: number
  tools?: ToolUse[]
  isStreaming?: boolean
}
