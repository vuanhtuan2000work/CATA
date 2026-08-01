import { normalizeLocale, t, type AppLocale } from "../shared/i18n.js";

const locale = normalizeLocale(window.petBridge.getLocale()) as AppLocale;

document.title = t(locale, "remTitle");
(document.getElementById("heading") as HTMLElement).textContent = t(locale, "remHeading");
(document.getElementById("msg-label") as HTMLElement).textContent = t(locale, "remMsgLabel");
(document.getElementById("at-label") as HTMLElement).textContent = t(locale, "remAtLabel");
(document.getElementById("cancel") as HTMLButtonElement).textContent = t(locale, "remCancel");
(document.getElementById("save") as HTMLButtonElement).textContent = t(locale, "remSave");

const msgEl = document.getElementById("msg") as HTMLTextAreaElement;
const atEl = document.getElementById("at") as HTMLInputElement;
msgEl.placeholder = t(locale, "remMsgPlaceholder");

document.getElementById("save")!.addEventListener("click", () => {
  const message = msgEl.value.trim();
  if (!message) {
    msgEl.focus();
    return;
  }
  const at = atEl.value ? new Date(atEl.value).toISOString() : undefined;
  window.petBridge.addReminder(message, at);
});

document.getElementById("cancel")!.addEventListener("click", () => {
  window.petBridge.closeReminderPopup();
});

msgEl.focus();

export {};
