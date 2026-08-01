import { chirp } from "./audio.js";

export interface QueuedMessage {
  title?: string;
  message: string;
  priority: "normal" | "high";
  /** Skip the soft bubble chirp (e.g. reminder already plays an alarm). */
  quiet?: boolean;
}

export interface SpeechBubble {
  enqueue(msg: QueuedMessage): void;
  expire(now: number): void;
  tryShow(now: number): boolean;
  isShowing(): boolean;
  queueLength(): number;
  peek(): QueuedMessage | undefined;
  position(petX: number, petY: number, displayW: number): void;
  containsPoint(mx: number, my: number): boolean;
}

export function createSpeechBubble(
  root: HTMLElement,
  isMuted: () => boolean
): SpeechBubble {
  const titleEl = root.querySelector(".title") as HTMLElement;
  const textEl = root.querySelector(".text") as HTMLElement;
  const badgeEl = root.querySelector(".badge") as HTMLElement;
  const queue: QueuedMessage[] = [];
  let until = 0;
  let showing = false;

  function updateBadge(): void {
    if (queue.length > 0 && showing) {
      badgeEl.style.display = "block";
      badgeEl.textContent = `+${queue.length}`;
    } else {
      badgeEl.style.display = "none";
    }
  }

  function hide(): void {
    root.classList.remove("visible");
    showing = false;
    updateBadge();
  }

  root.addEventListener("click", () => {
    until = 0;
  });

  return {
    enqueue(msg) {
      queue.push(msg);
      updateBadge();
    },
    expire(now) {
      if (showing && now > until) hide();
    },
    tryShow(now) {
      if (showing || queue.length === 0) return false;
      const msg = queue.shift()!;
      titleEl.textContent = msg.title ?? "";
      titleEl.style.display = msg.title ? "block" : "none";
      textEl.textContent = msg.message;
      root.classList.add("visible");
      showing = true;
      until = now + Math.min(12000, 3500 + msg.message.length * 45);
      updateBadge();
      if (!msg.quiet) {
        chirp(msg.priority === "high" ? 880 : 620, isMuted());
      }
      return true;
    },
    isShowing: () => showing,
    queueLength: () => queue.length,
    peek: () => queue[0],
    position(petX, petY, displayW) {
      if (!showing) return;
      const rect = root.getBoundingClientRect();
      let bx = petX + displayW * 0.1;
      let by = petY - rect.height - 14;
      bx = Math.max(4, Math.min(window.innerWidth - rect.width - 4, bx));
      by = Math.max(4, by);
      root.style.transform = `translate(${bx}px, ${by}px)`;
    },
    containsPoint(mx, my) {
      if (!showing) return false;
      const r = root.getBoundingClientRect();
      return mx >= r.left && mx <= r.right && my >= r.top && my <= r.bottom;
    },
  };
}
