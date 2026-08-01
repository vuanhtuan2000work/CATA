interface PetBridgeEvent {
  type: "agent-done" | "todo" | "git" | "reminder" | "say" | "custom";
  title?: string;
  message: string;
  priority?: "normal" | "high";
}

interface PetBridgeConfig {
  scale: number;
  muted: boolean;
  followCursor: boolean;
  locale: "en" | "vi" | "zh" | "ja" | "ko";
}

interface Window {
  petBridge: {
    onEvent(cb: (event: PetBridgeEvent) => void): void;
    onConfig(cb: (config: PetBridgeConfig) => void): void;
    onCursor(cb: (pos: { x: number; y: number }) => void): void;
    onOpenChat(cb: () => void): void;
    setInteractive(interactive: boolean): void;
    notifyChatClosed(): void;
    scheduleReminder(message: string, minutes: number): void;
    getLocale(): string;
    addReminder(message: string, at?: string): void;
    closeReminderPopup(): void;
  };
}
