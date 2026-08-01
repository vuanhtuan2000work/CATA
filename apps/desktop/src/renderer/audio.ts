let audioCtx: AudioContext | null = null;

function ctx(): AudioContext {
  audioCtx = audioCtx ?? new AudioContext();
  return audioCtx;
}

/** Soft UI chirp (clicks, greetings, normal bubbles). */
export function chirp(freq: number, muted: boolean): void {
  if (muted) return;
  try {
    const ac = ctx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ac.currentTime + 0.12);
    gain.gain.setValueAtTime(0.08, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);
    osc.connect(gain).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + 0.25);
  } catch {
    // Audio may be unavailable; stay silent.
  }
}

/**
 * Loud ~3s alarm for due reminders — alternating beeps so it cuts through.
 */
export function playAlarm(muted: boolean): void {
  if (muted) return;
  try {
    const ac = ctx();
    if (ac.state === "suspended") void ac.resume();

    const now = ac.currentTime;
    const duration = 3;
    const beat = 0.2;
    const on = 0.12;
    const freqs = [988, 1319]; // B5 / E6 — bright, attention-grabbing
    let step = 0;

    for (let t = 0; t < duration; t += beat) {
      const start = now + t;
      const end = start + on;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freqs[step % 2]!, start);
      step += 1;

      // Peak ~0.45 — loud but not harsh clip
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.45, start + 0.015);
      gain.gain.setValueAtTime(0.45, end - 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      osc.connect(gain).connect(ac.destination);
      osc.start(start);
      osc.stop(end + 0.02);
    }
  } catch {
    // Audio may be unavailable; stay silent.
  }
}
