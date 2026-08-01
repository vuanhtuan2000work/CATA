import * as http from "node:http";
import { PetEvent } from "../shared/types";
import { addReminder, listReminders, removeReminder } from "./reminders";

export type EventSink = (event: PetEvent) => void;

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function json(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

export function startServer(port: number, onEvent: EventSink): http.Server {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
    try {
      if (req.method === "POST" && url.pathname === "/event") {
        const body = JSON.parse(await readBody(req));
        if (typeof body.message !== "string" || body.message.length === 0) {
          return json(res, 400, { error: "message is required" });
        }
        const event: PetEvent = {
          type: body.type ?? "custom",
          title: body.title,
          message: String(body.message).slice(0, 500),
          priority: body.priority === "high" ? "high" : "normal",
        };
        onEvent(event);
        return json(res, 200, { ok: true });
      }
      if (req.method === "POST" && url.pathname === "/reminder") {
        const body = JSON.parse(await readBody(req));
        if (typeof body.message !== "string" || body.message.length === 0) {
          return json(res, 400, { error: "message is required" });
        }
        const reminder = addReminder(String(body.message).slice(0, 500), body.at);
        return json(res, 200, { ok: true, reminder });
      }
      if (req.method === "GET" && url.pathname === "/reminders") {
        return json(res, 200, { reminders: listReminders() });
      }
      if (req.method === "DELETE" && url.pathname.startsWith("/reminder/")) {
        const id = url.pathname.slice("/reminder/".length);
        return json(res, removeReminder(id) ? 200 : 404, { ok: true });
      }
      if (req.method === "GET" && url.pathname === "/status") {
        return json(res, 200, { ok: true, reminders: listReminders().length });
      }
      return json(res, 404, { error: "not found" });
    } catch (err) {
      return json(res, 400, { error: String(err) });
    }
  });
  server.listen(port, "127.0.0.1");
  return server;
}
