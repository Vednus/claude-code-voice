import 'dotenv/config'
import { randomBytes } from 'crypto'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env')

function ensureRoomCode(): string {
  const existing = process.env.ROOM_CODE
  if (existing) return existing

  const code = randomBytes(3).toString('hex') // 6-char hex
  console.log(`Generated room code: ${code}`)

  // Append to .env file
  const line = `ROOM_CODE=${code}\n`
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8')
    if (!content.includes('ROOM_CODE=')) {
      writeFileSync(envPath, content + line)
    }
  } else {
    writeFileSync(envPath, line)
  }

  process.env.ROOM_CODE = code
  return code
}

export const config = {
  relayUrl: process.env.RELAY_URL || 'ws://localhost:3211',
  roomCode: ensureRoomCode(),
  cwd: process.env.CWD || process.cwd(),
}
