// src/pages/courseBuilder/courseBuilder.coords.ts
export type LatLng = { lat: number; lng: number };

export function toNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (Array.isArray(v)) return toNumber(v[0]);
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const t = v.trim();
    if (!t) return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function isValidLatLng(lat: number | null, lng: number | null): lat is number {
  return (
    lat !== null &&
    lng !== null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * 주차장 등에서 lat/lng가 뒤집히는 케이스 방어.
 * - 기본은 (lat,lng) 사용
 * - lat가 90 범위를 벗어나면 스왑 시도
 */
export function normalizeMaybeSwapped(latRaw: unknown, lngRaw: unknown): LatLng | null {
  const a = toNumber(latRaw);
  const b = toNumber(lngRaw);
  if (a === null || b === null) return null;

  // 1) 정상 범위면 그대로
  if (isValidLatLng(a, b)) return { lat: a, lng: b };

  // 2) 스왑해서 정상 범위면 스왑 채택
  if (isValidLatLng(b, a)) return { lat: b, lng: a };

  return null;
}

export function safeText(v: unknown, fallback: string = ""): string {
  if (v === null || v === undefined) return fallback;
  if (Array.isArray(v)) return safeText(v[0], fallback);
  const s = String(v).trim();
  return s ? s : fallback;
}
