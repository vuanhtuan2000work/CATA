import {
  BASE_HEIGHT,
  SPLAT_IMPACT_MAX,
  SPLAT_IMPACT_SPEED,
  STAND_ASPECT,
  type PetState,
} from "./constants.js";

export interface SizeBox {
  w: number;
  h: number;
}

export function standArea(size: number): number {
  return size * size * STAND_ASPECT;
}

/** Bảo toàn diện tích pet đứng — dùng cho tư thế nằm (sleep). */
export function sizeFromAspect(size: number, aspect: number): SizeBox {
  const a = Math.max(0.35, Math.min(3.5, aspect));
  const area = standArea(size);
  const h = Math.sqrt(area / a);
  return { w: Math.round(a * h), h: Math.round(h) };
}

/** Hộp splat từ vận tốc va chạm: rơi càng mạnh càng bẹp. */
export function splatBoxFromImpact(size: number, impact: number): SizeBox {
  const area = standArea(size);
  const t = Math.max(
    0,
    Math.min(1, (impact - SPLAT_IMPACT_SPEED) / (SPLAT_IMPACT_MAX - SPLAT_IMPACT_SPEED))
  );
  const h = size * (0.45 - 0.23 * t);
  const standW = size * STAND_ASPECT;
  const w = Math.max(standW * 1.15, Math.min(size * 2.6, area / h));
  return { w: Math.round(w), h: Math.round(h) };
}

/** Side-view walk/run không rộng quá tỉ lệ này so với chiều cao chuẩn. */
const MAX_LOCOMOTION_ASPECT = 1.7;
/** walk1/2 + run1/2: giảm 15% so với kích thước chuẩn. */
const LOCOMOTION_SCALE = 0.85;

export function boxForState(
  state: PetState,
  size: number,
  naturalWidth: number,
  naturalHeight: number
): SizeBox {
  const aspect = naturalWidth / Math.max(1, naturalHeight);
  if (state.kind === "splat") return splatBoxFromImpact(size, state.impact);
  if (state.kind === "sleep") return sizeFromAspect(size, aspect);

  const isLocomotion =
    state.kind === "walk" || state.kind === "run" || state.kind === "chase";

  if (isLocomotion || state.kind === "jump" || state.kind === "fall") {
    const base = isLocomotion ? size * LOCOMOTION_SCALE : size;
    if (aspect > MAX_LOCOMOTION_ASPECT) {
      const w = base * MAX_LOCOMOTION_ASPECT;
      const h = w / aspect;
      return { w: Math.round(w), h: Math.round(h) };
    }
    return { w: Math.round(base * aspect), h: Math.round(base) };
  }

  return { w: Math.round(size * aspect), h: size };
}

export function scaledBaseHeight(scale: number): number {
  return Math.round(BASE_HEIGHT * scale);
}
