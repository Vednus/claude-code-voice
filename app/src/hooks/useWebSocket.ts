import { useEffect, useCallback } from 'react'
import { useConnectionStore } from '../stores/connectionStore'
import { useChatStore } from '../stores/chatStore'
import { connect, disconnect, sendPrompt, sendCancel } from '../services/websocket'

export function useWebSocket() {
  const { relayUrl, roomCode, status } = useConnectionStore()
  const { isProcessing } = useChatStore()

  const connectToRelay = useCallback(() => {
    if (relayUrl && roomCode) {
      connect(relayUrl, roomCode)
    }
  }, [relayUrl, roomCode])

  const disconnectFromRelay = useCallback(() => {
    disconnect()
  }, [])

  const send = useCallback((text: string) => {
    useChatStore.getState().addUserMessage(text)
    sendPrompt(text)
  }, [])

  const cancel = useCallback(() => {
    sendCancel()
    useChatStore.getState().setProcessing(false)
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  return {
    status,
    isProcessing,
    connect: connectToRelay,
    disconnect: disconnectFromRelay,
    send,
    cancel,
  }
}
