import { WebSocketServer, WebSocket } from 'ws'

const PORT = parseInt(process.env.PORT || '3211', 10)

type Room = {
  agent?: WebSocket
  app?: WebSocket
}

const rooms = new Map<string, Room>()

function peer(room: Room, role: 'agent' | 'app'): WebSocket | undefined {
  return role === 'agent' ? room.app : room.agent
}

function send(ws: WebSocket, data: unknown) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data))
  }
}

function removeFromRoom(ws: WebSocket) {
  for (const [code, room] of rooms) {
    let role: 'agent' | 'app' | null = null
    if (room.agent === ws) role = 'agent'
    else if (room.app === ws) role = 'app'
    if (!role) continue

    room[role] = undefined
    const other = peer(room, role)
    if (other) {
      send(other, { type: 'peer_disconnected' })
    }
    if (!room.agent && !room.app) {
      rooms.delete(code)
    }
    return
  }
}

const wss = new WebSocketServer({ port: PORT })

wss.on('connection', ws => {
  let registered = false

  ws.on('message', raw => {
    let msg: any
    try {
      msg = JSON.parse(raw.toString())
    } catch {
      return
    }

    // Registration
    if (msg.type === 'register' && !registered) {
      const { role, roomCode } = msg
      if (!role || !roomCode) return

      registered = true
      const room = rooms.get(roomCode) || {}
      room[role as 'agent' | 'app'] = ws
      rooms.set(roomCode, room)

      console.log(`[${roomCode}] ${role} joined`)

      // Check if both sides are connected
      if (room.agent && room.app) {
        send(room.agent, { type: 'paired' })
        send(room.app, { type: 'paired' })
        console.log(`[${roomCode}] paired`)
      }
      return
    }

    // Forward all other messages to peer
    if (registered) {
      for (const [, room] of rooms) {
        if (room.agent === ws && room.app) {
          send(room.app, msg)
          return
        }
        if (room.app === ws && room.agent) {
          send(room.agent, msg)
          return
        }
      }
    }
  })

  ws.on('close', () => {
    removeFromRoom(ws)
  })

  ws.on('error', () => {
    removeFromRoom(ws)
  })
})

console.log(`Relay server listening on ws://localhost:${PORT}`)
