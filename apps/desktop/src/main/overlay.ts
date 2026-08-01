import * as path from "node:path";
import { BrowserWindow, screen } from "electron";
import { PetEvent, PetSettings } from "../shared/types";
import { resolveLocale } from "./locale";

let overlay: BrowserWindow | null = null;

export function getOverlay(): BrowserWindow | null {
  return overlay;
}

export function sendConfig(settings: PetSettings): void {
  overlay?.webContents.send("pet-config", {
    scale: settings.scale,
    muted: settings.muted,
    followCursor: settings.followCursor,
    locale: resolveLocale(),
  });
}

export function sendEvent(event: PetEvent): void {
  console.log(`[pet-event] ${event.type}: ${event.message}`);
  if (overlay && !overlay.isDestroyed()) {
    overlay.webContents.send("pet-event", event);
  }
}

export function createOverlay(onReady: () => void): BrowserWindow {
  const { workArea } = screen.getPrimaryDisplay();
  overlay = new BrowserWindow({
    x: workArea.x,
    y: workArea.y,
    width: workArea.width,
    height: workArea.height,
    transparent: true,
    frame: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  overlay.setAlwaysOnTop(true, "screen-saver");
  overlay.setIgnoreMouseEvents(true, { forward: true });
  overlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlay.setMenu(null);
  overlay.loadFile(path.join(__dirname, "..", "renderer", "index.html"));
  overlay.webContents.on("did-finish-load", onReady);
  return overlay;
}

export function setOverlayInteractive(interactive: boolean): void {
  if (!overlay || overlay.isDestroyed()) return;
  if (interactive) {
    overlay.setIgnoreMouseEvents(false);
  } else {
    overlay.setIgnoreMouseEvents(true, { forward: true });
  }
}

export function setPetVisible(visible: boolean): void {
  if (visible) overlay?.show();
  else overlay?.hide();
}

export function startCursorTracker(shouldTrack: () => boolean): void {
  setInterval(() => {
    if (!shouldTrack()) return;
    if (!overlay || overlay.isDestroyed() || !overlay.isVisible()) return;
    const point = screen.getCursorScreenPoint();
    const bounds = overlay.getBounds();
    overlay.webContents.send("cursor-pos", {
      x: point.x - bounds.x,
      y: point.y - bounds.y,
    });
  }, 100);
}
