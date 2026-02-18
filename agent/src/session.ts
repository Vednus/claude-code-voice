import { query } from '@anthropic-ai/claude-agent-sdk'
import type { SDKMessage } from '@anthropic-ai/claude-agent-sdk'

export type SessionCallbacks = {
  onSessionStart: (sessionId: string, cwd: string) => void
  onTextDelta: (text: string) => void
  onTextDone: (fullText: string) => void
  onToolStart: (toolName: string, toolUseId: string, input: unknown) => void
  onToolDone: (toolName: string, toolUseId: string, output: string) => void
  onToolApproval: (toolName: string, toolUseId: string, input: unknown) => void
  onResult: (sessionId: string, costUsd: number, durationMs: number) => void
  onError: (message: string, fatal?: boolean) => void
}

type PendingApproval = {
  resolve: (approved: boolean) => void
}

export class ClaudeSession {
  private sessionId?: string
  private abortController?: AbortController
  private pendingApprovals = new Map<string, PendingApproval>()

  constructor(
    private cwd: string,
    private callbacks: SessionCallbacks,
  ) {}

  async runPrompt(text: string, resumeSessionId?: string) {
    this.abortController = new AbortController()

    try {
      const q = query({
        prompt: text,
        options: {
          cwd: this.cwd,
          abortController: this.abortController,
          systemPrompt: { type: 'preset', preset: 'claude_code' },
          tools: { type: 'preset', preset: 'claude_code' },
          settingSources: ['user', 'project'],
          permissionMode: 'acceptEdits',
          includePartialMessages: true,
          stderr: (msg: string) => console.error('[claude-stderr]', msg),
          ...(resumeSessionId ? { resume: resumeSessionId } : {}),
        },
      })

      for await (const msg of q) {
        this.handleMessage(msg)
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return
      console.error('Agent query error:', err)
      this.callbacks.onError(err.message || 'Unknown error', true)
    }
  }

  private handleMessage(msg: SDKMessage) {
    switch (msg.type) {
      case 'system': {
        if (msg.subtype === 'init') {
          this.sessionId = msg.session_id
          this.callbacks.onSessionStart(msg.session_id, msg.cwd)
        }
        break
      }

      case 'stream_event': {
        const event = msg.event
        if (event.type === 'content_block_delta') {
          const delta = event.delta as any
          if (delta.type === 'text_delta' && delta.text) {
            this.callbacks.onTextDelta(delta.text)
          }
        }
        break
      }

      case 'assistant': {
        // Extract full text from the assistant message content blocks
        const content = msg.message.content
        const fullText = content
          .filter((block: any) => block.type === 'text')
          .map((block: any) => block.text)
          .join('')

        if (fullText) {
          this.callbacks.onTextDone(fullText)
        }

        // Check for tool use blocks
        for (const block of content) {
          if ((block as any).type === 'tool_use') {
            const tool = block as any
            this.callbacks.onToolStart(tool.name, tool.id, tool.input)
          }
        }
        break
      }

      case 'result': {
        this.callbacks.onResult(
          msg.session_id,
          msg.total_cost_usd,
          msg.duration_ms,
        )
        break
      }
    }
  }

  resolveToolApproval(toolUseId: string, approved: boolean) {
    const pending = this.pendingApprovals.get(toolUseId)
    if (pending) {
      pending.resolve(approved)
      this.pendingApprovals.delete(toolUseId)
    }
  }

  cancel() {
    this.abortController?.abort()
  }

  get currentSessionId() {
    return this.sessionId
  }
}
