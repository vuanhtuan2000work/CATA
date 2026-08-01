import { app, ipcMain } from "electron";
import { t } from "../shared/i18n";
import { loadSettings } from "./settings";
import { takeDueReminders } from "./reminders";
import { startServer } from "./server";
import { startGitWatcher } from "./gitWatcher";
import { resolveLocale } from "./locale";
import {
  createOverlay,
  getOverlay,
  sendConfig,
  sendEvent,
  setOverlayInteractive,
  startCursorTracker,
} from "./overlay";
import { createTray, destroyTray } from "./tray";
import { createReminderPopup, setupReminderIpc } from "./reminderWindow";

app.setName("cata");

function startReminderScheduler(): void {
  setInterval(() => {
    const locale = resolveLocale();
    for (const reminder of takeDueReminders()) {
      sendEvent({
        type: "reminder",
        title: t(locale, "reminderTitle"),
        message: reminder.message,
        priority: "high",
      });
    }
  }, 30_000);
}

function openChatInbox(): void {
  const overlay = getOverlay();
  if (!overlay || overlay.isDestroyed()) return;
  overlay.setIgnoreMouseEvents(false);
  overlay.focus();
  overlay.webContents.send("open-chat");
}

const trayActions = {
  openReminderPopup: createReminderPopup,
  openChatInbox,
};

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  // Second launch: exit immediately so we never create another tray icon.
  app.exit(0);
} else {
  app.on("second-instance", () => {
    const overlay = getOverlay();
    if (overlay && !overlay.isDestroyed()) {
      if (!overlay.isVisible()) overlay.show();
      overlay.focus();
    }
  });

  app.whenReady().then(() => {
    if (process.platform === "darwin") {
      app.dock?.hide();
    }

    const settings = loadSettings();
    createOverlay(() => sendConfig(loadSettings()));
    createTray(trayActions);
    setupReminderIpc();
    ipcMain.on("get-locale", (e) => {
      e.returnValue = resolveLocale();
    });
    ipcMain.on("set-interactive", (_e, interactive: boolean) => {
      setOverlayInteractive(interactive);
    });
    ipcMain.on("chat-closed", () => {
      setOverlayInteractive(false);
    });
    startCursorTracker(() => loadSettings().followCursor);
    startReminderScheduler();
    startServer(settings.port, sendEvent);
    startGitWatcher(settings.repos, sendEvent);

    setTimeout(() => {
      sendEvent({
        type: "say",
        message: t(resolveLocale(), "welcome"),
      });
    }, 2500);
  });

  app.on("before-quit", () => {
    destroyTray();
  });

  app.on("window-all-closed", () => {
    // Keep running in the tray.
  });
}
