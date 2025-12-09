/* 위도/경도 → 기상청 격자 변환 */
export function dfs_xy_conv(lat: number, lng: number) {
  const RE = 6371.00877;
  const GRID = 5.0;
  const SLAT1 = 30.0;
  const SLAT2 = 60.0;
  const OLON = 126.0;
  const OLAT = 38.0;
  const XO = 43;
  const YO = 136;
  const DEGRAD = Math.PI / 180.0;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5);

  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);

  let sf =
    Math.tan(Math.PI * 0.25 + slat1 * 0.5) ** sn *
    (Math.cos(slat1) / sn);

  let ro =
    re *
    sf /
    Math.tan(Math.PI * 0.25 + olat * 0.5) ** sn;

  let ra =
    re *
    sf /
    Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5) ** sn;

  let theta = lng * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;

  theta *= sn;

  return {
    x: Math.floor(ra * Math.sin(theta) + XO + 0.5),
    y: Math.floor(ro - ra * Math.cos(theta) + YO + 0.5),
  };
}

/* 하늘 상태 텍스트 변환 */
export function skyStatus(sky: number | null): string {
  if (sky === null) return "정보 없음";
  if (sky === 1) return "맑음";
  if (sky === 3) return "구름많음";
  if (sky === 4) return "흐림";
  return "정보 없음";
}

/* 발표 시간 계산 (초단기 실황/예보: 매시간 30분 발표) */
export function getBaseTime(): string {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // 30분 이전이면 이전 시간 사용
  let baseHour = minute < 30 ? hour - 1 : hour;
  if (baseHour < 0) baseHour = 23;

  return `${baseHour.toString().padStart(2, "0")}30`;
}

/* 두 지점 간 거리 계산 (Haversine formula) */
export function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
