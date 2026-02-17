import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

type SettingsState = {
  ttsEnabled: boolean
  autoSendVoice: boolean
  setTtsEnabled: (v: boolean) => void
  setAutoSendVoice: (v: boolean) => void
  loadSaved: () => Promise<void>
}

const STORAGE_KEY = 'claude-voice-settings'

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ttsEnabled: false,
  autoSendVoice: true,

  setTtsEnabled: v => {
    set({ ttsEnabled: v })
    save(get())
  },

  setAutoSendVoice: v => {
    set({ autoSendVoice: v })
    save(get())
  },

  loadSaved: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (raw) {
        const { ttsEnabled, autoSendVoice } = JSON.parse(raw)
        set({
          ttsEnabled: ttsEnabled ?? false,
          autoSendVoice: autoSendVoice ?? true,
        })
      }
    } catch {}
  },
}))

function save(state: SettingsState) {
  AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ttsEnabled: state.ttsEnabled, autoSendVoice: state.autoSendVoice })
  )
}
