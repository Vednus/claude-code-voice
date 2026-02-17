import type WebSocket from 'ws'
import type { AppToAgentMessage, AgentToAppMessage } from '../../shared/protocol.js'
import { ClaudeSession } from './session.js'
import { config } from './config.js'

export class MessageHandler {
  private session: ClaudeSession

  constructor(private ws: WebSocket) {
    this.session = new ClaudeSession(config.cwd, {
      onSessionStart: (sessionId, cwd) => {
        this.send({ type: 'session_start', sessionId, cwd })
      },
      onTextDelta: text => {
        this.send({ type: 'text_delta', text })
      },
      onTextDone: fullText => {
        this.send({ type: 'text_done', fullText })
      },
      onToolStart: (toolName, toolUseId, input) => {
        this.send({ type: 'tool_start', toolName, toolUseId, input })
      },
      onToolDone: (toolName, toolUseId, output) => {
        this.send({ type: 'tool_done', toolName, toolUseId, output })
      },
      onToolApproval: (toolName, toolUseId, input) => {
        this.send({ type: 'tool_approval', toolName, toolUseId, input })
      },
      onResult: (sessionId, costUsd, durationMs) => {
        this.send({ type: 'result', sessionId, costUsd, durationMs })
      },
      onError: (message, fatal) => {
        this.send({ type: 'error', message, fatal })
      },
    })
  }

  handleMessage(msg: AppToAgentMessage) {
    switch (msg.type) {
      case 'prompt':
        this.session.runPrompt(
          msg.text,
          msg.sessionId || this.session.currentSessionId || undefined,
        )
        break

      case 'cancel':
        this.session.cancel()
        break

      case 'approve_tool':
        this.session.resolveToolApproval(msg.toolUseId, msg.approved)
        break
    }
  }

  private send(msg: AgentToAppMessage) {
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send(JSON.stringify(msg))
    }
  }
}
