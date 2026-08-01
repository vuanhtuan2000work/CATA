#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const PORT = Number(process.env.CATA_PORT ?? process.env.CURSOR_PET_PORT ?? 7331);
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

const server = new McpServer({ name: "cata", version: "0.1.0" });

const sayHandler = async ({ message, title, priority }: { message: string; title?: string; priority?: "normal" | "high" }) => {
  try {
    await petFetch("/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "say", message, title, priority }),
    });
    return textResult("The pet delivered the message.");
  } catch {
    return textResult("The CATA app is not running (start it with `npm start`).");
  }
};

const remindHandler = async ({ message, at }: { message: string; at?: string }) => {
  try {
    const result = (await petFetch("/reminder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, at }),
    })) as { reminder?: { id: string } };
    return textResult(`Reminder scheduled (id: ${result.reminder?.id ?? "unknown"}).`);
  } catch {
    return textResult("The CATA app is not running (start it with `npm start`).");
  }
};

const statusHandler = async () => {
  try {
    const status = (await petFetch("/status")) as { reminders: number };
    const reminders = (await petFetch("/reminders")) as {
      reminders: { id: string; message: string; at?: string }[];
    };
    const lines = reminders.reminders.map(
      (r) => `- [${r.id}] ${r.message}${r.at ? ` (at ${r.at})` : " (soon)"}`
    );
    return textResult(
      `CATA pet is running. Pending reminders: ${status.reminders}` +
        (lines.length ? `\n${lines.join("\n")}` : "")
    );
  } catch {
    return textResult("The CATA app is not running (start it with `npm start`).");
  }
};

const saySchema = {
  description: "Make the CATA desktop pet show a speech-bubble message right now.",
  inputSchema: {
    message: z.string().max(500).describe("The message the pet will say"),
    title: z.string().max(100).optional().describe("Optional short title"),
    priority: z.enum(["normal", "high"]).optional().describe("high makes the pet jump excitedly"),
  },
};

const remindSchema = {
  description: "Schedule a reminder for the CATA desktop pet to announce to the user.",
  inputSchema: {
    message: z.string().max(500).describe("What to remind the user about"),
    at: z.string().optional().describe("ISO 8601 timestamp for when to remind"),
  },
};

const statusSchema = {
  description: "Check whether the CATA desktop pet is running and how many reminders are pending.",
  inputSchema: {},
};

server.registerTool("cata_say", saySchema, sayHandler);
server.registerTool("pet_say", saySchema, sayHandler);
server.registerTool("cata_remind", remindSchema, remindHandler);
server.registerTool("pet_remind", remindSchema, remindHandler);
server.registerTool("cata_status", statusSchema, statusHandler);
server.registerTool("pet_status", statusSchema, statusHandler);

const transport = new StdioServerTransport();
await server.connect(transport);
