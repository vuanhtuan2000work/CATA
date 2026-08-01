import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { app } from "electron";
import { AppLocale, normalizeLocale } from "../shared/i18n";
import { loadSettings } from "./settings";

/** Cursor/VS Code: %APPDATA%/Cursor/User/locale.json → { "locale": "vi" } */
function readCursorLocale(): string | null {
  const candidates = [
    path.join(process.env.APPDATA ?? "", "Cursor", "User", "locale.json"),
    path.join(os.homedir(), "Library", "Application Support", "Cursor", "User", "locale.json"),
    path.join(os.homedir(), ".config", "Cursor", "User", "locale.json"),
  ];
  for (const file of candidates) {
    try {
      if (!file || !fs.existsSync(file)) continue;
      const raw = JSON.parse(fs.readFileSync(file, "utf8"));
      if (typeof raw.locale === "string" && raw.locale.length > 0) return raw.locale;
    } catch {
      // ignore
    }
  }
  return null;
}

/**
 * Resolve UI language:
 * 1) settings.locale if not "auto"
 * 2) Cursor locale.json
 * 3) Electron / OS locale
 * Default: English (never hardcode Vietnamese).
 */
export function resolveLocale(): AppLocale {
  const settings = loadSettings();
  if (settings.locale && settings.locale !== "auto") {
    return normalizeLocale(settings.locale);
  }
  const cursor = readCursorLocale();
  if (cursor) return normalizeLocale(cursor);
  try {
    return normalizeLocale(app.getLocale());
  } catch {
    return "en";
  }
}
