import { useState, useCallback, useRef } from 'react'
import * as Speech from 'expo-speech'

// STT will be added in Phase 3 with @jamsch/expo-speech-recognition
// For now, this hook handles TTS only

export function useSpeech() {
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = useCallback((text: string) => {
    // Strip markdown for TTS
    const cleaned = text
      .replace(/```[\s\S]*?```/g, 'code block omitted')
      .replace(/`[^`]+`/g, match => match.slice(1, -1))
      .replace(/[#*_~>\[\]]/g, '')
      .replace(/\n{2,}/g, '. ')
      .trim()

    if (!cleaned) return

    Speech.stop()
    setIsSpeaking(true)
    Speech.speak(cleaned, {
      language: 'en-US',
      rate: 1.0,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
    })
  }, [])

  const stopSpeaking = useCallback(() => {
    Speech.stop()
    setIsSpeaking(false)
  }, [])

  // STT placeholder — Phase 3 will implement with @jamsch/expo-speech-recognition
  const startListening = useCallback(() => {
    setIsListening(true)
    setInterimText('')
  }, [])

  const stopListening = useCallback(() => {
    setIsListening(false)
    const text = interimText
    setInterimText('')
    return text
  }, [interimText])

  return {
    isListening,
    interimText,
    isSpeaking,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
  }
}
