import { useConnectionStore } from '../stores/connectionStore'
import { useChatStore } from '../stores/chatStore'
import type { ServerMessage } from '../types'

const RECONNECT_DELAYS = [3000, 6000, 12000, 30000]

let ws: WebSocket | null = null
let reconnectAttempt = 0
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

export function connect(relayUrl: string, roomCode: string) {
  disconnect()

  const { setStatus } = useConnectionStore.getState()
  setStatus('connecting')

  ws = new WebSocket(relayUrl)

  ws.onopen = () => {
    reconnectAttempt = 0
    setStatus('connected')

    ws?.send(JSON.stringify({
      type: 'register',
      role: 'app',
      roomCode,
    }))
  }

  ws.onmessage = event => {
    let msg: ServerMessage
    try {
      msg = JSON.parse(event.data as string)
    } catch {
      return
    }
    handleMessage(msg)
  }

  ws.onclose = () => {
    setStatus('disconnected')
    ws = null
    scheduleReconnect(relayUrl, roomCode)
  }

  ws.onerror = () => {
    // onclose will fire after this
  }
}

export function disconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (ws) {
    ws.onclose = null
    ws.close()
    ws = null
  }
  useConnectionStore.getState().setStatus('disconnected')
}

export function sendPrompt(text: string) {
  const { sessionId } = useChatStore.getState()
  send({
    type: 'prompt',
    text,
    ...(sessionId ? { sessionId } : {}),
  })
}

export function sendCancel() {
  send({ type: 'cancel' })
}

export function sendToolApproval(toolUseId: string, approved: boolean) {
  send({ type: 'approve_tool', toolUseId, approved })
}

function send(data: unknown) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data))
  }
}

function scheduleReconnect(relayUrl: string, roomCode: string) {
  const delay = RECONNECT_DELAYS[Math.min(reconnectAttempt, RECONNECT_DELAYS.length - 1)]
  reconnectAttempt++
  reconnectTimer = setTimeout(() => connect(relayUrl, roomCode), delay)
}

function handleMessage(msg: ServerMessage) {
  const connStore = useConnectionStore.getState()
  const chatStore = useChatStore.getState()

  switch (msg.type) {
    case 'paired':
      connStore.setStatus('paired')
      break

    case 'peer_disconnected':
      connStore.setStatus('connected')
      break

    case 'session_start':
      chatStore.setSessionId(msg.sessionId)
      chatStore.setCwd(msg.cwd)
      break

    case 'text_delta':
      chatStore.startAssistantMessage()
      chatStore.appendDelta(msg.text)
      break

    case 'text_done':
      chatStore.finishAssistantMessage(msg.fullText)
      break

    case 'tool_start':
      chatStore.addToolStart(msg.toolName, msg.toolUseId, msg.input)
      break

    case 'tool_done':
      chatStore.updateToolDone(msg.toolUseId, msg.output)
      break

    case 'tool_approval':
      // For now, auto-approve. Phase 4 adds UI for this.
      sendToolApproval(msg.toolUseId, true)
      break

    case 'result':
      chatStore.setProcessing(false)
      chatStore.addCost(msg.costUsd)
      break

    case 'error':
      chatStore.addError(msg.message)
      break
  }
}
