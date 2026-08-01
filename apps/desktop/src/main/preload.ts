import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("petBridge", {
  onEvent: (cb: (event: unknown) => void) => {
    ipcRenderer.on("pet-event", (_e, event) => cb(event));
  },
  onConfig: (cb: (config: unknown) => void) => {
    ipcRenderer.on("pet-config", (_e, config) => cb(config));
  },
  onCursor: (cb: (pos: unknown) => void) => {
    ipcRenderer.on("cursor-pos", (_e, pos) => cb(pos));
  },
  onOpenChat: (cb: () => void) => {
    ipcRenderer.on("open-chat", () => cb());
  },
  setInteractive: (interactive: boolean) => {
    ipcRenderer.send("set-interactive", interactive);
  },
  notifyChatClosed: () => {
    ipcRenderer.send("chat-closed");
  },
  scheduleReminder: (message: string, minutes: number) => {
    const at = new Date(Date.now() + Math.max(1, minutes) * 60_000).toISOString();
    ipcRenderer.send("add-reminder", { message, at });
  },
  getLocale: () => ipcRenderer.sendSync("get-locale") as string,
  addReminder: (message: string, at?: string) => {
    ipcRenderer.send("add-reminder", { message, at });
  },
  closeReminderPopup: () => {
    ipcRenderer.send("close-reminder-popup");
  },
});
