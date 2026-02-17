import { create } from 'zustand'
import type { ChatMessage, ToolUse } from '../types'

type ChatState = {
  messages: ChatMessage[]
  sessionId: string | null
  isProcessing: boolean
  totalCostUsd: number
  cwd: string | null

  addUserMessage: (text: string) => void
  startAssistantMessage: () => void
  appendDelta: (text: string) => void
  finishAssistantMessage: (fullText: string) => void
  addToolStart: (toolName: string, toolUseId: string, input: unknown) => void
  updateToolDone: (toolUseId: string, output: string) => void
  setSessionId: (id: string) => void
  setCwd: (cwd: string) => void
  setProcessing: (v: boolean) => void
  addCost: (cost: number) => void
  addError: (message: string) => void
  clearMessages: () => void
}

let msgCounter = 0
const nextId = () => `msg-${Date.now()}-${++msgCounter}`

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  sessionId: null,
  isProcessing: false,
  totalCostUsd: 0,
  cwd: null,

  addUserMessage: text => {
    set(state => ({
      messages: [
        ...state.messages,
        { id: nextId(), role: 'user', text, timestamp: Date.now() },
      ],
      isProcessing: true,
    }))
  },

  startAssistantMessage: () => {
    set(state => {
      // Only add if last message isn't already a streaming assistant message
      const last = state.messages[state.messages.length - 1]
      if (last?.role === 'assistant' && last.isStreaming) return state
      return {
        messages: [
          ...state.messages,
          { id: nextId(), role: 'assistant', text: '', timestamp: Date.now(), isStreaming: true },
        ],
      }
    })
  },

  appendDelta: text => {
    set(state => {
      const msgs = [...state.messages]
      const last = msgs[msgs.length - 1]
      if (last?.role === 'assistant' && last.isStreaming) {
        msgs[msgs.length - 1] = { ...last, text: last.text + text }
      } else {
        // Start a new streaming message
        msgs.push({
          id: nextId(),
          role: 'assistant',
          text,
          timestamp: Date.now(),
          isStreaming: true,
        })
      }
      return { messages: msgs }
    })
  },

  finishAssistantMessage: fullText => {
    set(state => {
      const msgs = [...state.messages]
      const last = msgs[msgs.length - 1]
      if (last?.role === 'assistant' && last.isStreaming) {
        msgs[msgs.length - 1] = { ...last, text: fullText, isStreaming: false }
      }
      return { messages: msgs }
    })
  },

  addToolStart: (toolName, toolUseId, input) => {
    set(state => {
      const msgs = [...state.messages]
      const last = msgs[msgs.length - 1]
      if (last?.role === 'assistant') {
        const tools: ToolUse[] = [...(last.tools || []), { toolName, toolUseId, input, status: 'running' }]
        msgs[msgs.length - 1] = { ...last, tools }
      }
      return { messages: msgs }
    })
  },

  updateToolDone: (toolUseId, output) => {
    set(state => {
      const msgs = [...state.messages]
      const last = msgs[msgs.length - 1]
      if (last?.role === 'assistant' && last.tools) {
        const tools = last.tools.map(t =>
          t.toolUseId === toolUseId ? { ...t, output, status: 'done' as const } : t
        )
        msgs[msgs.length - 1] = { ...last, tools }
      }
      return { messages: msgs }
    })
  },

  setSessionId: id => set({ sessionId: id }),
  setCwd: cwd => set({ cwd }),
  setProcessing: v => set({ isProcessing: v }),
  addCost: cost => set(state => ({ totalCostUsd: state.totalCostUsd + cost })),

  addError: message => {
    set(state => ({
      messages: [
        ...state.messages,
        { id: nextId(), role: 'assistant', text: `Error: ${message}`, timestamp: Date.now() },
      ],
      isProcessing: false,
    }))
  },

  clearMessages: () => set({ messages: [], sessionId: null, totalCostUsd: 0 }),
}))
