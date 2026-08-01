# cata-mcp 🐱

[![npm version](https://img.shields.io/npm/v/cata-mcp.svg?style=flat-square)](https://www.npmjs.com/package/cata-mcp)
[![license](https://img.shields.io/badge/license-MIT-yellow.svg?style=flat-square)](./LICENSE)
[![MCP](https://img.shields.io/badge/MCP-cata__say%20·%20cata__remind-111111?style=flat-square)](https://github.com/vuanhtuan2000work/CATA)

**Model Context Protocol (MCP) server for [CATA](https://github.com/vuanhtuan2000work/CATA) desktop cat overlay.**

Enables AI Agents in **Google Antigravity**, **Codex**, **Cursor**, **Claude Desktop**, **Windsurf**, and any MCP client to trigger speech bubbles, sound alerts, and reminders directly on your desktop!

---

## Quick Configuration for AI Clients

Add `cata-mcp` to your MCP configuration file:

### 1. Google Antigravity (`~/.gemini/config/mcp_config.json`)
```json
{
  "mcpServers": {
    "cata": {
      "command": "npx",
      "args": ["-y", "cata-mcp"]
    }
  }
}
```

### 2. Codex / Claude Desktop / General MCP Hosts
```json
{
  "mcpServers": {
    "cata": {
      "command": "npx",
      "args": ["-y", "cata-mcp"]
    }
  }
}
```

### 3. Cursor (`~/.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "cata": {
      "command": "npx",
      "args": ["-y", "cata-mcp"]
    }
  }
}
```

---

## Exposed MCP Tools

| Tool Name | Alias | Description |
|-----------|-------|-------------|
| `cata_say` | `pet_say` | Triggers a speech-bubble message on the desktop cat immediately (`priority: high` makes the pet jump excitedly) |
| `cata_remind` | `pet_remind` | Schedules an alarm reminder (`at` = ISO 8601 timestamp or duration) |
| `cata_status` | `pet_status` | Checks CATA desktop app status & active reminders |

---

## Example Prompts for AI Agents

> *"When you finish writing code or submitting the PR, call `cata_say` to notify me on my desktop."*

> *"Schedule a reminder using `cata_remind` for 15 minutes from now to review the deployment."*

---

## Requirements

Requires the [CATA Desktop App](https://github.com/vuanhtuan2000work/CATA) running locally on port `7331` (default).

```bash
git clone https://github.com/vuanhtuan2000work/CATA.git
cd CATA
npm install && npm run build
npm start
```

---

<details>
<summary><strong>Tiếng Việt</strong></summary>

**`cata-mcp`** là MCP server cung cấp các công cụ cho AI Agent (Google Antigravity, Codex, Cursor, Claude Desktop...) tương tác trực tiếp với chú mèo desktop CATA qua giao thức Model Context Protocol.

### Các công cụ hỗ trợ:
- `cata_say`: Bật bong bóng thoại và âm thanh thông báo trên màn hình desktop.
- `cata_remind`: Đặt lịch hẹn giờ báo thức nhắc việc.
- `cata_status`: Kiểm tra trạng thái ứng dụng CATA.

</details>

---

## License

[MIT](https://github.com/vuanhtuan2000work/CATA/blob/main/LICENSE) — Part of the [CATA Project](https://github.com/vuanhtuan2000work/CATA).
