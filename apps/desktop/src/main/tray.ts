import * as path from "node:path";
import { app, dialog, Menu, nativeImage, Tray } from "electron";
import { t } from "../shared/i18n";
import { loadSettings, saveSettings } from "./settings";
import { resolveLocale } from "./locale";
import { sendConfig, sendEvent, setPetVisible } from "./overlay";
import { watchRepo } from "./gitWatcher";

let tray: Tray | null = null;
let petVisible = true;

export type TrayActions = {
  openReminderPopup: () => void;
  openChatInbox: () => void;
};

export function destroyTray(): void {
  if (!tray) return;
  try {
    tray.destroy();
  } catch {
    // already destroyed
  }
  tray = null;
}

export function createTray(actions: TrayActions): Tray {
  // Always one tray icon — replace any previous instance in this process.
  destroyTray();

  const iconPath = path.join(__dirname, "..", "..", "assets", "icon.png");
  let icon = nativeImage.createFromPath(iconPath);
  if (process.platform === "darwin" && !icon.isEmpty()) {
    icon = icon.resize({ width: 18, height: 18 });
  }
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  tray.setToolTip("Cursor Pet");
  tray.setContextMenu(buildMenu(actions));
  tray.on("double-click", () => actions.openChatInbox());
  return tray;
}

export function refreshTrayMenu(actions: TrayActions): void {
  tray?.setContextMenu(buildMenu(actions));
}

function buildMenu(actions: TrayActions): Menu {
  const settings = loadSettings();
  const locale = resolveLocale();
  const loginSettings = app.getLoginItemSettings();
  const osName = process.platform === "darwin" ? "macOS" : "Windows";

  const languageSubmenu = Menu.buildFromTemplate([
    {
      label: t(locale, "trayLanguageAuto"),
      type: "radio",
      checked: settings.locale === "auto",
      click: () => {
        saveSettings({ locale: "auto" });
        sendConfig(loadSettings());
        tray?.setContextMenu(buildMenu(actions));
      },
    },
    ...(["en", "vi", "zh", "ja", "ko"] as const).map((code) => ({
      label: code,
      type: "radio" as const,
      checked: settings.locale === code,
      click: () => {
        saveSettings({ locale: code });
        sendConfig(loadSettings());
        tray?.setContextMenu(buildMenu(actions));
      },
    })),
  ]);

  return Menu.buildFromTemplate([
    {
      label: petVisible ? t(locale, "trayHide") : t(locale, "trayShow"),
      click: () => {
        petVisible = !petVisible;
        setPetVisible(petVisible);
        tray?.setContextMenu(buildMenu(actions));
      },
    },
    {
      label: t(locale, "trayAddReminder"),
      click: () => actions.openReminderPopup(),
    },
    {
      label: t(locale, "trayChat"),
      click: () => actions.openChatInbox(),
    },
    {
      label: t(locale, "trayWatchGit"),
      click: async () => {
        const result = await dialog.showOpenDialog({
          title: t(locale, "trayWatchGit"),
          properties: ["openDirectory"],
        });
        const repo = result.filePaths[0];
        if (!repo) return;
        if (watchRepo(repo, sendEvent)) {
          const current = loadSettings().repos;
          if (!current.includes(repo)) saveSettings({ repos: [...current, repo] });
          sendEvent({ type: "say", message: t(locale, "watchingRepo", { repo }) });
        } else {
          sendEvent({
            type: "say",
            message: t(locale, "notGitRepo", { repo }),
            priority: "high",
          });
        }
      },
    },
    { type: "separator" },
    {
      label: t(locale, "trayFollowCursor"),
      type: "checkbox",
      checked: settings.followCursor,
      click: (item) => {
        saveSettings({ followCursor: item.checked });
        sendConfig(loadSettings());
      },
    },
    {
      label: t(locale, "trayMute"),
      type: "checkbox",
      checked: settings.muted,
      click: (item) => {
        saveSettings({ muted: item.checked });
        sendConfig(loadSettings());
      },
    },
    {
      label: t(locale, "trayLanguage"),
      submenu: languageSubmenu,
    },
    {
      label: t(locale, "trayLaunchOs", { os: osName }),
      type: "checkbox",
      checked: loginSettings.openAtLogin,
      click: (item) => {
        app.setLoginItemSettings({ openAtLogin: item.checked });
      },
    },
    { type: "separator" },
    { label: t(locale, "trayQuit"), click: () => app.quit() },
  ]);
}
