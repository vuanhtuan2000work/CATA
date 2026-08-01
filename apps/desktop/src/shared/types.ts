export type PetEventType =
  | "agent-done"
  | "todo"
  | "git"
  | "reminder"
  | "say"
  | "custom";

export interface PetEvent {
  type: PetEventType;
  title?: string;
  message: string;
  priority?: "normal" | "high";
}

export interface Reminder {
  id: string;
  message: string;
  /** ISO timestamp; if missing or in the past the reminder fires on the next scheduler tick */
  at?: string;
  createdAt: string;
}

export interface PetSettings {
  port: number;
  scale: number;
  muted: boolean;
  /** pet runs after the mouse cursor */
  followCursor: boolean;
  /**
   * UI language: "auto" follows Cursor locale.json then OS;
   * or force "en" | "vi" | "zh" | "ja" | "ko".
   */
  locale: "auto" | "en" | "vi" | "zh" | "ja" | "ko";
  /** absolute paths of git repos to watch */
  repos: string[];
}

export const DEFAULT_SETTINGS: PetSettings = {
  port: 7331,
  scale: 1,
  muted: false,
  followCursor: true,
  locale: "auto",
  repos: [],
};

export function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(value)}`);
}
