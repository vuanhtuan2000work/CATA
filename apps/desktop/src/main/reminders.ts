import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { app } from "electron";
import { Reminder } from "../shared/types";

const FILE = () => path.join(app.getPath("userData"), "reminders.json");

function load(): Reminder[] {
  try {
    const raw = JSON.parse(fs.readFileSync(FILE(), "utf8"));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function save(list: Reminder[]): void {
  fs.mkdirSync(path.dirname(FILE()), { recursive: true });
  fs.writeFileSync(FILE(), JSON.stringify(list, null, 2), "utf8");
}

export function listReminders(): Reminder[] {
  return load();
}

export function addReminder(message: string, at?: string): Reminder {
  const reminder: Reminder = {
    id: crypto.randomUUID(),
    message,
    at,
    createdAt: new Date().toISOString(),
  };
  const list = load();
  list.push(reminder);
  save(list);
  return reminder;
}

export function removeReminder(id: string): boolean {
  const list = load();
  const next = list.filter((r) => r.id !== id);
  if (next.length === list.length) return false;
  save(next);
  return true;
}

/**
 * Returns reminders that are due now and removes them from the store.
 */
export function takeDueReminders(now = Date.now()): Reminder[] {
  const list = load();
  const due: Reminder[] = [];
  const rest: Reminder[] = [];
  for (const r of list) {
    const at = r.at ? Date.parse(r.at) : 0;
    if (Number.isNaN(at) || at <= now) due.push(r);
    else rest.push(r);
  }
  if (due.length > 0) save(rest);
  return due;
}
