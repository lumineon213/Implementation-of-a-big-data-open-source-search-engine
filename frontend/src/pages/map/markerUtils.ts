/* 마커 생성 유틸리티 함수들 */

/* 커스텀 핀 마커 HTML 생성 */
export function createCustomMarkerContent(color: string): HTMLDivElement {
  const content = document.createElement('div');
  content.innerHTML = `
    <div style="
      position: relative;
      width: 30px;
      height: 40px;
      cursor: pointer;
    ">
      <div style="
        position: absolute;
        width: 30px;
        height: 30px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>
      <div style="
        position: absolute;
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
        top: 6px;
        left: 6px;
        transform: rotate(45deg);
      "></div>
    </div>
  `;
  return content;
}

/* 인포윈도우 콘텐츠 생성 */
export function createInfoWindowContent(
  title: string,
  subtitle: string | undefined,
  distance: number
): string {
  return `
    <div style="padding:10px; min-width:200px;">
      <strong>${title}</strong><br/>
      ${subtitle ? `<span style="font-size:12px; color:#666;">${subtitle}</span><br/>` : ''}
      <span style="font-size:11px; color:#999;">${distance.toFixed(2)}km</span>
    </div>
  `;
}

/* 배열 값 추출 헬퍼 */
export function getArrayValue(value: any): string {
  return Array.isArray(value) ? value[0] : value;
}

/* 마커 색상 정의 */
export const MARKER_COLORS = {
  RESTAURANT: '#FF9800',  // 주황색
  WALK: '#0b7691',        // 청록색
  THEME: '#59ce16',       // 초록색
  MARINE: '#0866f1',      // 파란색
  URBAN: '#b80b0b',       // 빨간색
  STAY: '#9C27B0'         // 보라색 (숙소)
};
