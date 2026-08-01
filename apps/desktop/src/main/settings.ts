import * as fs from "node:fs";
import * as path from "node:path";
import { app } from "electron";
import { DEFAULT_SETTINGS, PetSettings } from "../shared/types";

const FILE = () => path.join(app.getPath("userData"), "settings.json");

let cached: PetSettings | null = null;

export function loadSettings(): PetSettings {
  if (cached) return cached;
  try {
    const raw = JSON.parse(fs.readFileSync(FILE(), "utf8"));
    cached = { ...DEFAULT_SETTINGS, ...raw };
  } catch {
    cached = { ...DEFAULT_SETTINGS };
  }
  return cached!;
}

export function saveSettings(patch: Partial<PetSettings>): PetSettings {
  const next = { ...loadSettings(), ...patch };
  cached = next;
  fs.mkdirSync(path.dirname(FILE()), { recursive: true });
  fs.writeFileSync(FILE(), JSON.stringify(next, null, 2), "utf8");
  return next;
}
