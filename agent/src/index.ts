import WebSocket from 'ws'
import { config } from './config.js'
import { MessageHandler } from './handler.js'

const RECONNECT_DELAYS = [3000, 6000, 12000, 30000]

let reconnectAttempt = 0
let handler: MessageHandler | null = null

function connect() {
  console.log(`Connecting to relay at ${config.relayUrl}...`)
  const ws = new WebSocket(config.relayUrl)

  ws.on('open', () => {
    console.log('Connected to relay')
    reconnectAttempt = 0

    // Register as agent
    ws.send(JSON.stringify({
      type: 'register',
      role: 'agent',
      roomCode: config.roomCode,
    }))

    console.log(`Room code: ${config.roomCode}`)
    console.log(`Working directory: ${config.cwd}`)

    handler = new MessageHandler(ws)
  })

  ws.on('message', raw => {
    let msg: any
    try {
      msg = JSON.parse(raw.toString())
    } catch {
      return
    }

    if (msg.type === 'paired') {
      console.log('App connected - ready for prompts')
      return
    }

    if (msg.type === 'peer_disconnected') {
      console.log('App disconnected')
      return
    }

    // Forward app messages to handler
    if (handler) {
      handler.handleMessage(msg)
    }
  })

  ws.on('close', () => {
    console.log('Disconnected from relay')
    handler = null
    scheduleReconnect()
  })

  ws.on('error', err => {
    console.error('WebSocket error:', err.message)
  })
}

function scheduleReconnect() {
  const delay = RECONNECT_DELAYS[Math.min(reconnectAttempt, RECONNECT_DELAYS.length - 1)]
  reconnectAttempt++
  console.log(`Reconnecting in ${delay / 1000}s...`)
  setTimeout(connect, delay)
}

connect()
