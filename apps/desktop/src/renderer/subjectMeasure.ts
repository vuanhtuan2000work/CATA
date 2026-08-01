/**
 * Đo "thân" mèo theo mật độ alpha, bỏ đuôi/mép mỏng.
 * Scale theo bodyH/bodyW — không theo cả khung ảnh (đuôi dài/ngắn làm lệch).
 */

export interface SubjectMetrics {
  fullW: number;
  fullH: number;
  /** Hộp dày của thân (không gồm đuôi mỏng / râu). */
  bodyW: number;
  bodyH: number;
}

const cache = new Map<string, SubjectMetrics>();

const ALPHA_MIN = 16;
/** Hàng có mass >= tỉ lệ này so với hàng dày nhất → thuộc thân theo chiều cao. */
const ROW_THRESH = 0.12;
/** Cột dày hơn tỉ lệ này → thuộc thân; đuôi mỏng bị cắt. */
const COL_THRESH = 0.22;

export function measureSubject(img: HTMLImageElement): SubjectMetrics {
  const key = `${img.currentSrc || img.src}|${img.naturalWidth}x${img.naturalHeight}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const fullW = img.naturalWidth || 1;
  const fullH = img.naturalHeight || 1;

  let metrics: SubjectMetrics;
  try {
    metrics = sample(img, fullW, fullH);
  } catch {
    metrics = { fullW, fullH, bodyW: fullW, bodyH: fullH };
  }

  cache.set(key, metrics);
  return metrics;
}

function sample(img: HTMLImageElement, w: number, h: number): SubjectMetrics {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { fullW: w, fullH: h, bodyW: w, bodyH: h };

  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);

  const rowMass = new Float64Array(h);
  const colMass = new Float64Array(w);
  let total = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a < ALPHA_MIN) continue;
      const m = a / 255;
      rowMass[y] += m;
      colMass[x] += m;
      total += m;
    }
  }

  if (total < 1) return { fullW: w, fullH: h, bodyW: w, bodyH: h };

  let maxRow = 0;
  let maxCol = 0;
  for (let y = 0; y < h; y++) maxRow = Math.max(maxRow, rowMass[y]);
  for (let x = 0; x < w; x++) maxCol = Math.max(maxCol, colMass[x]);

  const yRange = spanAbove(rowMass, maxRow * ROW_THRESH);
  const xRange = spanAbove(colMass, maxCol * COL_THRESH);

  let bodyW = Math.max(1, xRange.end - xRange.start + 1);
  let bodyH = Math.max(1, yRange.end - yRange.start + 1);

  // Threshold quá gắt → fallback bbox alpha đầy đủ
  if (bodyW < w * 0.2 || bodyH < h * 0.2) {
    const full = fullAlphaBBox(data, w, h);
    bodyW = full.w;
    bodyH = full.h;
  }

  return { fullW: w, fullH: h, bodyW, bodyH };
}

function spanAbove(mass: Float64Array, thresh: number): { start: number; end: number } {
  let start = 0;
  let end = mass.length - 1;
  while (start < mass.length && mass[start] < thresh) start++;
  while (end > start && mass[end] < thresh) end--;
  if (start >= mass.length) return { start: 0, end: Math.max(0, mass.length - 1) };
  return { start, end };
}

function fullAlphaBBox(
  data: Uint8ClampedArray,
  w: number,
  h: number
): { w: number; h: number } {
  let x0 = w;
  let y0 = h;
  let x1 = 0;
  let y1 = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] < ALPHA_MIN) continue;
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < x0 || y1 < y0) return { w, h };
  return { w: x1 - x0 + 1, h: y1 - y0 + 1 };
}
