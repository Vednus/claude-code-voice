# Claude Voice

Talk to Claude Code from your phone using voice or text. Three components work together: a cloud relay, a bridge agent on your dev machine, and an Expo mobile app.

```
Phone (App)              Cloud (Relay)              Dev Machine (Agent)
┌──────────────┐        ┌──────────────┐        ┌───────────────────────┐
│ Voice (STT)  │──WS──→│              │←──WS── │ Claude Agent SDK      │
│ Chat UI      │        │  WebSocket   │        │ File ops, bash, etc.  │
│ Voice (TTS)  │←──WS──│  Relay       │──WS──→│ query() wrapper       │
└──────────────┘        └──────────────┘        └───────────────────────┘
   from anywhere           forwards JSON           connects outbound
```

Both the phone and the dev machine connect **outbound** to the relay. No VPN, no port forwarding, works from anywhere. The relay pairs them by room code and forwards messages.

The agent uses the Claude Agent SDK — it gets all Claude Code tools (file read/write/edit, bash, grep, glob, web search) for free.

## Quick Start

### 1. Deploy the relay

The relay needs to be publicly accessible so both the agent and app can reach it. See [Deploying the Relay](#deploying-the-relay) below for full instructions. The quickest path is Railway:

1. Push this repo to GitHub
2. Create a Railway project → **Deploy from GitHub Repo**
3. Enable **public networking** — leave the port as the auto-detected value (do **not** override it)
4. Copy your public domain (e.g. `my-relay-production.up.railway.app`)

For local development, you can run the relay directly:

```bash
cd relay && npm install && npm run dev
```

### 2. Start the agent

```bash
cd agent && npm install
```

Create a `.env` file:

```
RELAY_URL=wss://your-relay-domain.up.railway.app
ANTHROPIC_API_KEY=sk-ant-...
CWD=/path/to/your/project
```

Use `wss://` for deployed relays, `ws://` for local.

```bash
npm run dev
```

On first run it generates a 6-character room code and saves it to `.env`. Note this code — you'll enter it in the app.

### 3. Build and run the app

Install dependencies:

```bash
cd app && npm install
```

**Text only (Expo Go):**

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone. Voice features won't work in Expo Go.

**With voice (iOS device):**

Requires Xcode. Connect your iPhone via USB, then:

```bash
npx expo prebuild --clean
npx expo run:ios --device
```

**With voice (Android device):**

Requires Android Studio with the Android SDK.

```bash
npx expo prebuild --clean
npx expo run:android --device
```

### 4. Connect

Open the app and enter your relay URL and room code on the connect screen. These are saved automatically so you only need to enter them once. Once paired, start chatting.

## Project Structure

```
claude-voice/
├── shared/protocol.ts        # Wire protocol types
├── relay/src/index.ts         # WebSocket relay (~100 lines)
├── agent/src/
│   ├── config.ts              # Env config + room code generation
│   ├── session.ts             # Claude Agent SDK wrapper
│   ├── handler.ts             # Message routing (relay ↔ Claude)
│   └── index.ts               # Connect to relay, auto-reconnect
└── app/
    ├── App.tsx                # Navigation setup
    └── src/
        ├── stores/            # Zustand (connection, chat, settings)
        ├── services/          # WebSocket client
        ├── hooks/             # useWebSocket, useSpeech
        ├── screens/           # Connect, Chat, Settings
        └── components/        # MessageBubble, ToolUseCard, InputBar, etc.
```

## Wire Protocol

All messages are JSON over WebSocket. The relay forwards transparently.

**Registration:**
- `{ type: "register", role: "agent"|"app", roomCode: "abc123" }` — join a room
- `{ type: "paired" }` — both sides connected
- `{ type: "peer_disconnected" }` — other side left

**App → Agent:**
- `{ type: "prompt", text: "..." }` — send a prompt
- `{ type: "cancel" }` — abort current query

**Agent → App:**
- `{ type: "text_delta", text: "..." }` — streaming text chunk
- `{ type: "text_done", fullText: "..." }` — complete response
- `{ type: "tool_start", toolName, toolUseId, input }` — tool running
- `{ type: "tool_done", toolName, toolUseId, output }` — tool finished
- `{ type: "result", sessionId, costUsd, durationMs }` — query complete
- `{ type: "error", message, fatal? }` — error

## Features

- **Streaming chat** — see responses as they generate, with markdown rendering
- **Tool visibility** — collapsible cards showing what Claude is reading/editing/running
- **Session continuity** — follow-up messages maintain context via sessionId
- **Voice input** — speech-to-text (requires dev build with native modules)
- **Voice output** — optional TTS that reads responses aloud (toggle in settings)
- **Cost tracking** — cumulative API cost shown in the header
- **Auto-reconnect** — exponential backoff (3s → 6s → 12s → 30s cap)
- **Dark theme** — easy on the eyes for outdoor use

## Deploying the Relay

The relay is a stateless WebSocket server. Deploy anywhere that supports WebSockets.

### Railway

1. Push this repo to GitHub
2. Create a new Railway project → **Deploy from GitHub Repo**
3. Railway auto-detects the Dockerfile via `railway.json` at the repo root — no need to set a root directory
4. Enable **public networking** to get a public domain
5. **Important:** leave the port as the auto-detected value. Railway injects a `PORT` env var and the relay reads it automatically. Do not override the port to a custom value like 3211 — this will cause a 502.

### Fly.io

```bash
cd relay
fly launch
fly deploy
```

### Other platforms

Use the Dockerfile at `relay/Dockerfile` directly with any container platform. The Dockerfile build context must be the repo root (not the relay directory).

### After deploying

Update the agent's `RELAY_URL` to `wss://your-deployed-url` (note `wss://`, not `ws://`). The app's relay URL is entered at runtime on the connect screen.

## Configuration

### Agent `.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `RELAY_URL` | Yes | WebSocket URL of the relay |
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `ROOM_CODE` | No | Auto-generated on first run |
| `CWD` | No | Working directory for Claude (defaults to cwd) |

### Agent Permissions

The agent runs with `permissionMode: 'acceptEdits'` — it auto-approves file reads and edits but will prompt for bash commands via the app. It loads your project's `CLAUDE.md` for context.
