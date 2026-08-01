import { chirp, playAlarm } from "./audio.js";
import {
  assertNever,
  BASE_HEIGHT,
  CHASE_START_DISTANCE,
  CHASE_STOP_DISTANCE,
  frameDuration,
  frameSrc,
  framesForState,
  GRAVITY,
  JUMP_VY,
  RUN_SPEED,
  SPLAT_DURATION_MS,
  SPLAT_IMPACT_SPEED,
  WALK_SPEED,
  type PetState,
} from "./constants.js";
import { boxForState, scaledBaseHeight } from "./sizing.js";
import { createSpeechBubble } from "./speech.js";
import { greetingKeys, t, type AppLocale } from "../shared/i18n.js";

type PetConfig = PetBridgeConfig;
type PetEvent = PetBridgeEvent;

const petEl = document.getElementById("pet") as HTMLImageElement;
const bubbleEl = document.getElementById("bubble") as HTMLDivElement;
const chatEl = document.getElementById("chat") as HTMLDivElement;
const chatLog = document.getElementById("chat-log") as HTMLDivElement;
const chatInput = document.getElementById("chat-input") as HTMLInputElement;
const chatSend = document.getElementById("chat-send") as HTMLButtonElement;
const chatHint = document.getElementById("chat-hint") as HTMLDivElement;
const chatClose = document.getElementById("chat-close") as HTMLButtonElement;

let config: PetConfig = {
  scale: 1,
  muted: false,
  followCursor: false,
  locale: "en",
};
let locale: AppLocale = "en";
let chatOpen = false;
let cursorPos: { x: number; y: number } | null = null;
let SIZE = BASE_HEIGHT;
let displayW = BASE_HEIGHT;
let displayH = BASE_HEIGHT;

let x = 200;
let y = 0;
let facing: 1 | -1 = 1;
let state: PetState = { kind: "idle", until: performance.now() + 2000 };
let frameIndex = 0;
let frameTimer = 0;
let lastTime = performance.now();
let interactive = false;
let dragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

const speech = createSpeechBubble(bubbleEl, () => config.muted);

function groundY(): number {
  return window.innerHeight - displayH;
}

function applyFrameSize(): void {
  const nw = petEl.naturalWidth || 1;
  const nh = petEl.naturalHeight || 1;
  const cx = x + displayW / 2;
  const box = boxForState(state, SIZE, nw, nh);
  displayW = box.w;
  displayH = box.h;
  petEl.style.objectFit = "contain";
  petEl.style.objectPosition = "bottom center";
  petEl.style.width = `${displayW}px`;
  petEl.style.height = `${displayH}px`;
  x = Math.max(0, Math.min(window.innerWidth - displayW, cx - displayW / 2));
  if (state.kind !== "drag" && state.kind !== "jump" && state.kind !== "fall" && state.kind !== "alert") {
    y = groundY();
  }
}

function clampX(value: number): number {
  return Math.max(0, Math.min(window.innerWidth - displayW, value));
}

function bounceDir(dir: 1 | -1): 1 | -1 {
  if (x <= 0) return 1;
  if (x >= window.innerWidth - displayW) return -1;
  return dir;
}

function pickIdleTransition(now: number): PetState {
  const roll = Math.random();
  if (roll < 0.35) {
    return { kind: "walk", until: now + 2000 + Math.random() * 4000, dir: Math.random() < 0.5 ? 1 : -1 };
  }
  if (roll < 0.5) {
    return { kind: "run", until: now + 900 + Math.random() * 1800, dir: Math.random() < 0.5 ? 1 : -1 };
  }
  if (roll < 0.6) return { kind: "jump", vy: JUMP_VY, dir: facing };
  if (roll < 0.72) return { kind: "sleep", until: now + 8000 + Math.random() * 12000 };
  return { kind: "idle", until: now + 2000 + Math.random() * 4000 };
}

function cursorDistanceX(): number {
  if (!cursorPos) return 0;
  return cursorPos.x - (x + displayW / 2);
}

function shouldChase(): boolean {
  return config.followCursor && cursorPos !== null && Math.abs(cursorDistanceX()) > CHASE_START_DISTANCE;
}

function updateSpeechState(now: number): void {
  speech.expire(now);
  const blocked = state.kind === "drag" || state.kind === "splat" || state.kind === "alert";
  if (!speech.isShowing() && speech.queueLength() > 0 && !blocked) {
    const next = speech.peek();
    if (next?.priority === "high" && state.kind !== "talk") {
      state = { kind: "alert", until: now + 1800, hops: 2, vy: JUMP_VY * 0.6 };
    } else {
      state = { kind: "talk", until: now + 400 };
    }
    speech.tryShow(now);
  }
  if (
    speech.isShowing() &&
    state.kind !== "talk" &&
    state.kind !== "alert" &&
    state.kind !== "drag" &&
    state.kind !== "splat"
  ) {
    state = { kind: "talk", until: now + 1000 };
  }
}

function stepPhysics(now: number, dt: number): void {
  if (shouldChase() && (state.kind === "idle" || state.kind === "walk" || state.kind === "run" || state.kind === "sleep")) {
    state = { kind: "chase" };
  }

  switch (state.kind) {
    case "idle":
      if (now > state.until) state = pickIdleTransition(now);
      break;
    case "walk": {
      facing = state.dir;
      x += WALK_SPEED * state.dir * dt;
      x = clampX(x);
      state = { ...state, dir: bounceDir(state.dir) };
      if (now > state.until) state = { kind: "idle", until: now + 1500 + Math.random() * 3000 };
      break;
    }
    case "run": {
      facing = state.dir;
      x += RUN_SPEED * state.dir * dt;
      x = clampX(x);
      state = { ...state, dir: bounceDir(state.dir) };
      if (now > state.until) state = { kind: "idle", until: now + 1500 + Math.random() * 3000 };
      break;
    }
    case "jump": {
      state.vy += GRAVITY * dt;
      y += state.vy * dt;
      x = clampX(x + WALK_SPEED * 1.4 * state.dir * dt);
      if (y >= groundY()) {
        y = groundY();
        state = { kind: "idle", until: now + 1200 + Math.random() * 2500 };
      }
      break;
    }
    case "fall": {
      state.vy += GRAVITY * dt;
      y += state.vy * dt;
      if (y >= groundY()) {
        const impact = state.vy;
        y = groundY();
        if (impact >= SPLAT_IMPACT_SPEED) {
          state = { kind: "splat", until: now + SPLAT_DURATION_MS, impact };
          chirp(220, config.muted);
        } else {
          state = { kind: "idle", until: now + 1000 };
        }
        applyFrameSize();
      }
      break;
    }
    case "splat":
      if (now > state.until) {
        state = { kind: "jump", vy: JUMP_VY * 0.85, dir: facing };
        applyFrameSize();
        chirp(540, config.muted);
      }
      break;
    case "drag":
      break;
    case "chase": {
      const dx = cursorDistanceX();
      if (!config.followCursor || !cursorPos || Math.abs(dx) < CHASE_STOP_DISTANCE) {
        state = { kind: "idle", until: now + 1500 + Math.random() * 2000 };
        break;
      }
      facing = dx > 0 ? 1 : -1;
      const speed = Math.abs(dx) > 500 ? RUN_SPEED : WALK_SPEED * 1.8;
      x = clampX(x + speed * facing * dt);
      break;
    }
    case "sleep":
      if (now > state.until || speech.queueLength() > 0) {
        state = { kind: "idle", until: now + 800 };
      }
      break;
    case "talk":
      if (now > state.until && !speech.isShowing()) {
        state = { kind: "idle", until: now + 1000 + Math.random() * 2000 };
      }
      break;
    case "alert": {
      state.vy += GRAVITY * dt;
      y += state.vy * dt;
      if (y >= groundY()) {
        y = groundY();
        if (state.hops > 0) {
          state = { ...state, hops: state.hops - 1, vy: JUMP_VY * 0.6 };
        } else if (now > state.until) {
          state = { kind: "talk", until: now + 600 };
        }
      }
      break;
    }
    default:
      assertNever(state);
  }
}

function renderFrame(dt: number): void {
  frameTimer += dt;
  const frameSet = framesForState(state);
  if (frameTimer > frameDuration(state.kind)) {
    frameTimer = 0;
    frameIndex = (frameIndex + 1) % frameSet.length;
  }
  const frame = frameSet[frameIndex % frameSet.length];
  const fileName = `${frame}.png`;
  if (!petEl.src.endsWith(fileName)) petEl.src = frameSrc(frame);

  const pivotX = displayW / 2;
  petEl.style.transform = `translate(${x}px, ${y}px) translateX(${pivotX}px) scaleX(${facing}) translateX(${-pivotX}px)`;
  speech.position(x, y, displayW);
}

function tick(now: number): void {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  updateSpeechState(now);
  stepPhysics(now, dt);
  renderFrame(dt);
  positionChat();
  requestAnimationFrame(tick);
}

function isOverPet(mx: number, my: number): boolean {
  return mx >= x && mx <= x + displayW && my >= y && my <= y + displayH;
}

window.addEventListener("mousemove", (e) => {
  if (dragging) {
    x = e.clientX - dragOffsetX;
    y = e.clientY - dragOffsetY;
    return;
  }
  const over =
    chatOpen ||
    isOverPet(e.clientX, e.clientY) ||
    isOverChat(e.clientX, e.clientY) ||
    speech.containsPoint(e.clientX, e.clientY);
  if (over !== interactive) {
    interactive = over;
    window.petBridge.setInteractive(over);
  }
});

petEl.addEventListener("mousedown", (e) => {
  dragging = true;
  dragOffsetX = e.clientX - x;
  dragOffsetY = e.clientY - y;
  state = { kind: "drag" };
  petEl.style.cursor = "grabbing";
});

window.addEventListener("mouseup", () => {
  if (!dragging) return;
  dragging = false;
  petEl.style.cursor = "grab";
  state = y < groundY() - 2 ? { kind: "fall", vy: 0 } : { kind: "idle", until: performance.now() + 1500 };
});

function randomGreeting(): string {
  const keys = greetingKeys();
  const key = keys[Math.floor(Math.random() * keys.length)]!;
  return t(locale, key);
}

function appendChat(role: "you" | "pet", text: string): void {
  const row = document.createElement("div");
  row.className = `line ${role}`;
  row.textContent = text;
  chatLog.appendChild(row);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function positionChat(): void {
  if (!chatOpen) return;
  const width = 280;
  let cx = x + displayW + 8;
  let cy = Math.max(4, y - 40);
  if (cx + width > window.innerWidth - 4) cx = x - width - 8;
  cx = Math.max(4, Math.min(window.innerWidth - width - 4, cx));
  cy = Math.max(4, Math.min(window.innerHeight - 220, cy));
  chatEl.style.left = `${cx}px`;
  chatEl.style.top = `${cy}px`;
}

function isOverChat(mx: number, my: number): boolean {
  if (!chatOpen) return false;
  const r = chatEl.getBoundingClientRect();
  return mx >= r.left && mx <= r.right && my >= r.top && my <= r.bottom;
}

function openChat(): void {
  if (chatOpen) return;
  chatOpen = true;
  chatEl.classList.add("open");
  chatHint.textContent = t(locale, "chatHint");
  chatInput.placeholder = t(locale, "chatPlaceholder");
  chatSend.textContent = t(locale, "chatSend");
  appendChat("pet", t(locale, "chatWelcome"));
  positionChat();
  interactive = true;
  window.petBridge.setInteractive(true);
  setTimeout(() => chatInput.focus(), 50);
}

function closeChat(): void {
  if (!chatOpen) return;
  chatOpen = false;
  chatEl.classList.remove("open");
  chatLog.innerHTML = "";
  chatInput.value = "";
  interactive = false;
  window.petBridge.setInteractive(false);
  window.petBridge.notifyChatClosed();
}

function parseReminder(text: string): { minutes: number; message: string; atISO?: string } | null {
  const lower = text.toLowerCase().trim();

  // Keywords indicating reminder / alarm intent
  const isReminderIntent =
    /^(?:remind|nhắc|nhac|hẹn|hen|báo|bao|alarm|timer|thông báo|thong bao)/i.test(lower) ||
    /(?:remind|nhắc|nhac|hẹn|hen|báo|bao|alarm|timer)\s+(?:tôi|me|cho tôi|dùm|giùm)/i.test(lower) ||
    /(?:nữa|nuoc|sau)\s+(?:nhắc|hẹn|báo)/i.test(lower);

  if (!isReminderIntent) return null;

  // 1. Check for specific time format like "14:30", "14h30", "9h00", "9:00"
  const clockMatch = lower.match(/(?:vào\s+lúc|lúc|at)?\s*(\d{1,2})[h:](\d{2})/i);
  if (clockMatch) {
    const hours = Number(clockMatch[1]);
    const mins = Number(clockMatch[2]);
    if (hours >= 0 && hours < 24 && mins >= 0 && mins < 60) {
      const target = new Date();
      target.setHours(hours, mins, 0, 0);
      if (target.getTime() <= Date.now()) {
        target.setDate(target.getDate() + 1);
      }
      const diffMinutes = Math.max(1, Math.round((target.getTime() - Date.now()) / 60000));
      let message = text
        .replace(/(?:remind|nhắc|nhac|hẹn|hen|báo|bao|alarm|timer|thông báo|thong bao)\s*(?:tôi|me|cho tôi|dùm|giùm)?/gi, "")
        .replace(/(?:vào\s+lúc|lúc|at)?\s*\d{1,2}[h:]\d{2}/gi, "")
        .trim();
      if (!message) message = "Alarm / Reminder";
      return { minutes: diffMinutes, message, atISO: target.toISOString() };
    }
  }

  // 2. Check for duration format (minutes / hours / seconds)
  const minMatch = lower.match(/(\d+)\s*(?:m|min|mins|minute|minutes|p|phút|phut)/i);
  const hrMatch = lower.match(/(\d+)\s*(?:h|hr|hrs|hour|hours|tiếng|tieng|giờ|gio)/i);
  const secMatch = lower.match(/(\d+)\s*(?:s|sec|secs|second|seconds|g|giây|giay)/i);

  let minutes = 5;
  if (minMatch) {
    minutes = Math.max(1, Number(minMatch[1]));
  } else if (hrMatch) {
    minutes = Math.max(1, Number(hrMatch[1]) * 60);
  } else if (secMatch) {
    minutes = Math.max(1, Math.round(Number(secMatch[1]) / 60));
  }

  let cleanMessage = text
    .replace(/(?:remind|nhắc|nhac|hẹn|hen|báo|bao|alarm|timer|thông báo|thong bao)\s*(?:tôi|me|cho tôi|dùm|giùm)?/gi, "")
    .replace(/(?:in|sau|trong)?\s*\d+\s*(?:m|min|mins|minute|minutes|p|phút|phut|h|hr|hrs|hour|hours|tiếng|tieng|giờ|gio|s|sec|secs|second|seconds|g|giây|giay)?\s*(?:nữa|nuoc|nua)?/gi, "")
    .replace(/^(?:to|để|de|về|ve)\s+/gi, "")
    .trim();

  if (!cleanMessage || cleanMessage.length < 2) {
    cleanMessage = "Alarm / Reminder";
  }

  const atISO = new Date(Date.now() + minutes * 60_000).toISOString();
  return { minutes, message: cleanMessage, atISO };
}

function handleChatSend(): void {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";
  appendChat("you", text);

  const reminder = parseReminder(text);
  if (reminder) {
    void window.petBridge.addReminder(reminder.message, reminder.atISO);
    const reply = t(locale, "chatReminderSet", {
      minutes: String(reminder.minutes),
      message: reminder.message,
    });
    appendChat("pet", reply);
    speech.enqueue({ message: reply, priority: "normal" });
    chirp(880, config.muted);
    return;
  }

  const reply = t(locale, "chatAck", { text: text.slice(0, 80) });
  appendChat("pet", reply);
  speech.enqueue({ message: text.slice(0, 120), priority: "normal" });
  chirp(660, config.muted);
}

petEl.addEventListener("dblclick", () => {
  chirp(740, config.muted);
  if (chatOpen) {
    speech.enqueue({ message: randomGreeting(), priority: "normal" });
  } else {
    openChat();
  }
});

chatClose.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  closeChat();
});

chatSend.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  handleChatSend();
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleChatSend();
  if (e.key === "Escape") closeChat();
});

window.petBridge.onOpenChat(() => openChat());

window.petBridge.onEvent((event: PetEvent) => {
  const isReminder = event.type === "reminder";
  speech.enqueue({
    title: event.title,
    message: event.message,
    priority: event.priority ?? "normal",
    quiet: isReminder,
  });
  if (isReminder) {
    playAlarm(config.muted);
  }
  if (chatOpen) {
    appendChat("pet", event.title ? `${event.title}: ${event.message}` : event.message);
  }
});

window.petBridge.onConfig((cfg) => {
  config = cfg;
  locale = (cfg.locale as AppLocale) || "en";
  SIZE = scaledBaseHeight(config.scale);
  applyFrameSize();
  if (y > groundY()) y = groundY();
  if (chatOpen) {
    chatHint.textContent = t(locale, "chatHint");
    chatInput.placeholder = t(locale, "chatPlaceholder");
    chatSend.textContent = t(locale, "chatSend");
  }
});

window.petBridge.onCursor((pos) => {
  cursorPos = pos;
});

window.addEventListener("resize", () => {
  x = Math.min(x, window.innerWidth - displayW);
  if (state.kind !== "drag" && state.kind !== "jump" && state.kind !== "alert") {
    y = groundY();
  }
});

petEl.addEventListener("load", () => applyFrameSize());
y = groundY();
petEl.src = frameSrc("idle1");
requestAnimationFrame(tick);

export {};
