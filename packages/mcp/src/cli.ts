#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const PORT = Number(process.env.CURSOR_PET_PORT ?? 7331);
const BASE = `http://127.0.0.1:${PORT}`;

async function petFetch(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    signal: AbortSignal.timeout(2000),
  });
  return res.json();
}

function textResult(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

const server = new McpServer({ name: "cursor-pet", version: "0.1.0" });

server.registerTool(
  "pet_say",
  {
    description:
      "Make the desktop pet show a speech-bubble message to the user right now. " +
      "Use it to announce finished work or anything the user should notice.",
    inputSchema: {
      message: z.string().max(500).describe("The message the pet will say"),
      title: z.string().max(100).optional().describe("Optional short title"),
      priority: z
        .enum(["normal", "high"])
        .optional()
        .describe("high makes the pet jump excitedly to get attention"),
    },
  },
  async ({ message, title, priority }) => {
    try {
      await petFetch("/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "say", message, title, priority }),
      });
      return textResult("The pet delivered the message.");
    } catch {
      return textResult("The pet app is not running (start it with `npm start` in cursor-pet).");
    }
  }
);

server.registerTool(
  "pet_remind",
  {
    description:
      "Schedule a reminder that the desktop pet will announce to the user. " +
      "If `at` is omitted the reminder fires within ~30 seconds.",
    inputSchema: {
      message: z.string().max(500).describe("What to remind the user about"),
      at: z
        .string()
        .optional()
        .describe("ISO 8601 timestamp for when to remind (e.g. 2026-07-20T17:00:00+07:00)"),
    },
  },
  async ({ message, at }) => {
    try {
      const result = (await petFetch("/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, at }),
      })) as { reminder?: { id: string } };
      return textResult(`Reminder scheduled (id: ${result.reminder?.id ?? "unknown"}).`);
    } catch {
      return textResult("The pet app is not running (start it with `npm start` in cursor-pet).");
    }
  }
);

server.registerTool(
  "pet_status",
  {
    description: "Check whether the desktop pet is running and how many reminders are pending.",
    inputSchema: {},
  },
  async () => {
    try {
      const status = (await petFetch("/status")) as { reminders: number };
      const reminders = (await petFetch("/reminders")) as {
        reminders: { id: string; message: string; at?: string }[];
      };
      const lines = reminders.reminders.map(
        (r) => `- [${r.id}] ${r.message}${r.at ? ` (at ${r.at})` : " (soon)"}`
      );
      return textResult(
        `Pet is running. Pending reminders: ${status.reminders}` +
          (lines.length ? `\n${lines.join("\n")}` : "")
      );
    } catch {
      return textResult("The pet app is not running (start it with `npm start` in cursor-pet).");
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
