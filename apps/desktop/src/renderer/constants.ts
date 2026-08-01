export type PetState =
  | { kind: "idle"; until: number }
  | { kind: "walk"; until: number; dir: 1 | -1 }
  | { kind: "run"; until: number; dir: 1 | -1 }
  | { kind: "jump"; vy: number; dir: 1 | -1 }
  | { kind: "drag" }
  | { kind: "fall"; vy: number }
  | { kind: "splat"; until: number; impact: number }
  | { kind: "chase" }
  | { kind: "sleep"; until: number }
  | { kind: "talk"; until: number }
  | { kind: "alert"; until: number; hops: number; vy: number };

export const FRAMES = {
  idle: ["idle1", "idle2"],
  splat: ["splat1", "splat2"],
  walk: ["walk1", "walk2"],
  run: ["run1", "run2"],
  jump: ["jump"],
  sleep: ["sleep1", "sleep2"],
  talk: ["talk"],
  alert: ["alert"],
  drag: ["drag"],
} as const;

export const ASSET_BASE = "../../assets/frames/";
export const BASE_HEIGHT = 110;
export const STAND_ASPECT = 0.7;
export const SPLAT_IMPACT_MAX = 1600;
export const SPLAT_IMPACT_SPEED = 650;
export const SPLAT_DURATION_MS = 1100;

export const CHASE_START_DISTANCE = 240;
export const CHASE_STOP_DISTANCE = 110;
export const WALK_SPEED = 60;
export const RUN_SPEED = 220;
export const GRAVITY = 1600;
export const JUMP_VY = -520;

export const GREETINGS = [
  "greeting1",
  "greeting2",
  "greeting3",
  "greeting4",
] as const;

export function assertNever(value: never): never {
  throw new Error(`Unhandled state: ${JSON.stringify(value)}`);
}

export function frameSrc(frame: string): string {
  return `${ASSET_BASE}${frame}.png`;
}

export function framesForState(state: PetState): readonly string[] {
  switch (state.kind) {
    case "idle":
      return FRAMES.idle;
    case "walk":
      return FRAMES.walk;
    case "run":
    case "chase":
      return FRAMES.run;
    case "jump":
    case "fall":
      return FRAMES.jump;
    case "splat":
      return FRAMES.splat;
    case "drag":
      return FRAMES.drag;
    case "sleep":
      return FRAMES.sleep;
    case "talk":
      return FRAMES.talk;
    case "alert":
      return FRAMES.alert;
    default:
      return assertNever(state);
  }
}

export function frameDuration(kind: PetState["kind"]): number {
  switch (kind) {
    case "run":
    case "alert":
    case "chase":
      return 0.12;
    case "splat":
      return 0.18;
    default:
      return 0.35;
  }
}
