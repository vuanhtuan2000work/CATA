import * as path from "node:path";
import { BrowserWindow, ipcMain } from "electron";
import { t } from "../shared/i18n";
import { addReminder } from "./reminders";
import { sendEvent } from "./overlay";
import { resolveLocale } from "./locale";

let reminderPopup: BrowserWindow | null = null;

export function createReminderPopup(): void {
  if (reminderPopup && !reminderPopup.isDestroyed()) {
    reminderPopup.focus();
    return;
  }
  reminderPopup = new BrowserWindow({
    width: 380,
    height: 240,
    resizable: false,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    title: "Cursor Pet",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  reminderPopup.setMenu(null);
  reminderPopup.loadFile(path.join(__dirname, "..", "renderer", "reminder.html"));
  reminderPopup.on("closed", () => {
    reminderPopup = null;
  });
}

export function setupReminderIpc(): void {
  ipcMain.on("add-reminder", (_e, payload: { message: string; at?: string }) => {
    if (payload?.message) {
      addReminder(payload.message.slice(0, 500), payload.at);
      sendEvent({
        type: "say",
        message: t(resolveLocale(), "reminderSaved"),
        priority: "normal",
      });
    }
    if (reminderPopup && !reminderPopup.isDestroyed()) {
      reminderPopup.close();
    }
  });
  ipcMain.on("close-reminder-popup", () => reminderPopup?.close());
}
