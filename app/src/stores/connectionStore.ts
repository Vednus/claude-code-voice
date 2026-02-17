import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'paired'

type ConnectionState = {
  relayUrl: string
  roomCode: string
  status: ConnectionStatus
  setRelayUrl: (url: string) => void
  setRoomCode: (code: string) => void
  setStatus: (status: ConnectionStatus) => void
  loadSaved: () => Promise<void>
  save: () => Promise<void>
}

const STORAGE_KEY = 'claude-voice-connection'

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  relayUrl: '',
  roomCode: '',
  status: 'disconnected',

  setRelayUrl: url => set({ relayUrl: url }),
  setRoomCode: code => set({ roomCode: code }),
  setStatus: status => set({ status }),

  loadSaved: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (raw) {
        const { relayUrl, roomCode } = JSON.parse(raw)
        set({ relayUrl: relayUrl || '', roomCode: roomCode || '' })
      }
    } catch {}
  },

  save: async () => {
    const { relayUrl, roomCode } = get()
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ relayUrl, roomCode }))
  },
}))
