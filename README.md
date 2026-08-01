# CATA 🐱

<p align="center">
  <img src="apps/desktop/assets/icon.png" alt="CATA logo" width="180" />
</p>

<p align="center">
  <strong>A living desktop cat for AI Agents & IDEs (<a href="https://antigravity.google">Google Antigravity</a>, <a href="https://cursor.com">Cursor</a>, etc.)</strong><br/>
  Celebrates finished agent work · Follows your mouse · Reminds you what matters
</p>

<p align="center">
  <a href="https://github.com/vuanhtuan2000work/CATA/stargazers"><img src="https://img.shields.io/github/stars/vuanhtuan2000work/CATA?style=flat-square" alt="Stars" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-yellow.svg?style=flat-square" alt="MIT" /></a>
  <a href="#quick-start"><img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS-blue?style=flat-square" alt="Platform" /></a>
  <a href="#quick-start"><img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen?style=flat-square" alt="Node" /></a>
  <a href="#mcp-tools"><img src="https://img.shields.io/badge/MCP-cata__say%20·%20cata__remind-111111?style=flat-square" alt="MCP" /></a>
</p>

---

## Why?

Long AI coding sessions feel empty when the agent finishes in silence. CATA puts a small desktop cat companion on your screen that reacts to what you do and what your AI agents complete — without getting in the way.

| | |
|---|---|
| **Announce** | Agent stop, todo done, commit / push |
| **Chase** | Follows your cursor (toggle anytime) |
| **Remind** | Natural language chat input, quick time chips (`+5m`, `+15m`), or MCP `cata_remind` |
| **Stay out of the way** | Pass-through clickability — click any app on screen while chat is open |

Local-only on `127.0.0.1` — no cloud, no telemetry.

---

## Features

- **Transparent overlay** — always-on-top, frameless, drag / double-click / roam
- **Follow cursor** — sprint after the mouse; tray toggle
- **AI Agent & IDE hooks** — agent stop, `TodoWrite`, `git commit` / `git push`
- **Smart Natural Language Reminders** — auto-detects duration (`10m`, `30 phút`, `1h`) or exact time (`14:30`, `9h00`) in VI/EN directly from chat input
- **Quick Time Preset Chips** — 1-click preset buttons (`+5m`, `+15m`, `+30m`, `+1h`) for instant alarm scheduling
- **Zero-Overlap Position Engine** — popup automatically positions beside or above pet (with 16px gap) so it NEVER covers the pet or speech bubbles, even on screen boundaries
- **Smart Pause on Open** — pet automatically pauses movement when chat is open so it won't walk under the popup
- **Pass-through Clickability** — dynamic hit-testing allows clicking any other desktop application or window freely while chat is open
- **Double-Click Toggle & Auto-Close** — double-click pet to toggle open/close; click outside chat to auto-close
- **i18n** — Auto from system / IDE locale, or force en · vi · zh · ja · ko
- **MCP tools** — agents in Google Antigravity or Cursor can `cata_say`, `cata_remind`, `cata_status`
- **Git watcher** — celebrate commits outside IDEs too
- **Physics splat** — drop from high enough → puddle → pop back
- **Single tray icon** — one instance only

---

## Quick start

**Need:** Node.js **20+**.

```bash
git clone https://github.com/vuanhtuan2000work/CATA.git
cd CATA
npm install
npm run build
```

### Install MCP for Google Antigravity
```bash
npm run install:mcp:antigravity
```
Registers CATA in `~/.gemini/config/mcp_config.json`.

### Install MCP for Cursor
```bash
npm run install:mcp
npm run install:hooks   # ~/.cursor/hooks.json
```
Registers CATA in `~/.cursor/mcp.json` and configures Cursor hooks.

### Start CATA
```bash
npm start
```

<details>
<summary><strong>Packaged builds</strong></summary>

```bash
npm run dist        # Windows portable → apps/desktop/release/
npm run dist:mac    # .dmg + .zip (build on a Mac)
```

</details>

---

## How it works

```text
Google Antigravity / Cursor / MCP ──POST──► 127.0.0.1:7331 ──IPC──► Overlay pet
                                                   ▲
                                 Tray · Chat inbox · Git reflog watcher
```

1. Electron opens a **full-screen transparent overlay** (click-through by default).
2. A tiny **HTTP inbox** on localhost receives events from hooks and MCP.
3. The renderer runs a **PNG frame state machine** (`idle`, `walk`, `run`, `sleep`, `splat`, …) with speech bubbles.

---

## Chat inbox & Reminders

Double-click the pet (or use the tray menu):

- **Auto-Detect Reminders:** Type any task with time (`"Review PR sau 10m"`, `"Họp team lúc 14:30"`, `"Go to sleep in 30 mins"`) and CATA will parse and schedule the alarm automatically.
- **Quick Preset Chips:** Click `+5m`, `+15m`, `+30m`, or `+1h` chips before sending any note.
- **Pass-through Clicking:** Keep working! Click any background app while the chat box is open.
- **Double-Click Toggle:** Double-click the cat again or click anywhere outside to close.

---

## MCP tools

Supported in **Google Antigravity**, **Cursor**, and any standard MCP host:

| Tool | Alias | Purpose |
|------|-------|---------|
| `cata_say` | `pet_say` | Speech bubble now (`priority: high` → excited hops) |
| `cata_remind` | `pet_remind` | Schedule a reminder (`at` = ISO, or soon) |
| `cata_status` | `pet_status` | App running? Pending reminders? |

Example prompt for your AI agent in Antigravity or Cursor:
> *"When you're done building the feature, call `cata_say` to tell me the PR is ready."*

---

## Tray menu

Right-click the tray / menu-bar icon:

- Show / hide pet  
- Add reminder…  
- Chat inbox…  
- Watch a git repo…  
- Follow cursor · Mute · Language  
- Start with Windows / macOS  
- Quit  

**Language:** Auto (OS locale) or lock to en / vi / zh / ja / ko.

---

## Settings

| OS | Path |
|----|------|
| Windows | `%APPDATA%/cata/settings.json` |
| macOS | `~/Library/Application Support/cata/settings.json` |

```json
{
  "port": 7331,
  "scale": 1,
  "muted": false,
  "followCursor": true,
  "locale": "auto",
  "repos": ["D:\\github\\my-repo"]
}
```

Override the port with `CATA_PORT` (app, hooks, and MCP all honor it).

---

## HTTP API

| Endpoint | Method | Body |
|----------|--------|------|
| `/event` | POST | `{ type, title?, message, priority? }` |
| `/reminder` | POST | `{ message, at? }` |
| `/reminders` | GET | — |
| `/reminder/:id` | DELETE | — |
| `/status` | GET | — |

---

## Architecture

```text
CATA/
├── apps/desktop/     Electron overlay (main + renderer + frames)
├── packages/mcp/     MCP server → localhost API
├── hooks/            Cursor hook scripts + installer
└── scripts/          MCP installers for Antigravity & Cursor
```

**Stack:** Electron · TypeScript · MCP · Google Antigravity · Cursor Hooks · Node.js

---

## macOS notes

- Lives in the menu bar + overlay (hidden from Dock)
- Visible on all Spaces and fullscreen apps
- Unsigned builds: allow once in **System Settings → Privacy & Security**
- Build packages on a Mac: `npm run dist:mac`

---

## Roadmap

- [ ] Community skins / more breeds  
- [ ] Multi-monitor aware roaming  
- [ ] Optional CI reactions (`gh pr checks`)  
- [ ] Auto-update channel  

Issues and PRs welcome.

---

<details>
<summary><strong>Tiếng Việt</strong></summary>

**CATA** là chú mèo desktop trên overlay trong suốt: báo khi AI agent (Google Antigravity, Cursor, v.v.) hoàn thành công việc, đuổi theo con trỏ chuột, tự động nhận diện thời gian gõ trong chat để hẹn giờ nhắc việc, chat inbox local, và nhận thông báo qua giao thức MCP (`cata_say`, `cata_remind`).

### Hướng dẫn cài đặt nhanh:
```bash
npm install && npm run build
npm run install:mcp:antigravity   # Cắm MCP vào Google Antigravity
npm run install:mcp               # Cắm MCP vào Cursor
npm start
```

### Điểm nổi bật mới:
- **Tự động đọc giờ tự nhiên**: Gõ `"nhắc 10 phút review pr"`, `"họp team lúc 14:30"`, `"1 tiếng nữa đi ngủ"` tự động tạo báo thức.
- **Nút chọn nhanh (`+5m`, `+15m`, `+30m`, `+1h`)**: Chọn nhanh thời gian 1-click.
- **Vị trí hiển thị tách biệt 100%**: Khung chat tự động né chú mèo và bóng thoại (khoảng cách `16px`), dừng mèo di chuyển khi chat mở.
- **Click xuyên màn hình**: Vẫn click làm việc bình thường với các phần mềm khác khi khung chat đang mở.
- **Double click bật/tắt**: Double click mèo để mở/tắt khung chat nhanh.

</details>

---

## License

[MIT](./LICENSE) — use it, fork it, put a cat on every monitor.

<p align="center">
  <br/>
  <img src="apps/desktop/assets/icon.png" alt="" width="64" /><br/>
  <sub>If CATA makes your coding sessions a little happier, <a href="https://github.com/vuanhtuan2000work/CATA">star the repo</a> ⭐</sub>
</p>
