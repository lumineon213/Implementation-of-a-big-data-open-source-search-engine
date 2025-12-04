import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  setSidebarInfo: (info: any) => void;
}

/* ✔ 위도/경도 → 기상청 격자 변환 */
function dfs_xy_conv(lat: number, lng: number) {
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

/* ✔ 하늘 상태 표시 */
function skyStatus(sky: number | null) {
  if (sky === 1) return "☀ 맑음";
  if (sky === 3) return "⛅ 구름많음";
  if (sky === 4) return "☁ 흐림";
  return "🌫 관측 불가";
}

/* ✔ 발표 시간 계산 */
function getBaseTime() {
  const now = new Date();
  const hour = now.getHours();
  const baseHour = hour - 1 < 0 ? 23 : hour - 1;
  return `${baseHour.toString().padStart(2, "0")}30`;
}

const KakaoMap: React.FC<KakaoMapProps> = ({ setSidebarInfo }) => {
  const kakaoKey = import.meta.env.VITE_KAKAOMAP_KEY;
  const weatherKey = import.meta.env.VITE_WEATHER_API_KEY;

  const mapRef = useRef<any>(null);
  const myLocationMarker = useRef<any>(null); // 현재 위치 마커 저장

  /* 초기 지도 로드 */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false&libraries=services`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById("map");

        const map = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(35.146, 129.1),
          level: 4,
        });

        mapRef.current = map;
      });
    };

    document.body.appendChild(script);
  }, []);

  /* 📍 현재 위치 버튼 */
  const handleFindMyLocation = () => {
    if (!navigator.geolocation) {
      alert("현재 위치를 지원하지 않는 브라우저입니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const map = mapRef.current;
        const position = new window.kakao.maps.LatLng(lat, lng);

        map.panTo(position);

        /* 🔥 기존 마커 삭제 */
        if (myLocationMarker.current) {
          myLocationMarker.current.setMap(null);
        }

        /* 🔥 새 마커 생성 */
        myLocationMarker.current = new window.kakao.maps.Marker({
          map,
          position,
        });

        /* 주소 변환 */
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(
          lng,
          lat,
          async (res: any[], status: string) => {
            if (status !== window.kakao.maps.services.Status.OK) return;

            const address = res[0].address.address_name;

            /* ✔ 기상청 API */
            const { x, y } = dfs_xy_conv(lat, lng);
            const today = new Date();
            const base_date = today.toISOString().slice(0, 10).replace(/-/g, "");
            const base_time = getBaseTime();

            /* 초단기 실황 */
            const ncstUrl =
              `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst` +
              `?serviceKey=${weatherKey}&pageNo=1&numOfRows=100&dataType=JSON` +
              `&base_date=${base_date}&base_time=${base_time}&nx=${x}&ny=${y}`;

            const ncstRes = await fetch(ncstUrl);
            const ncstJson = await ncstRes.json();
            const ncstItems = ncstJson.response?.body?.items?.item ?? [];

            let temp: number | null = null;
            let hum: number | null = null;
            let pty: number | null = null;

            ncstItems.forEach((item: any) => {
              if (item.category === "T1H") temp = Number(item.obsrValue);
              if (item.category === "REH") hum = Number(item.obsrValue);
              if (item.category === "PTY") pty = Number(item.obsrValue);
            });

            /* 초단기 예보 (SKY) */
            const fcstUrl =
              `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst` +
              `?serviceKey=${weatherKey}&pageNo=1&numOfRows=100&dataType=JSON` +
              `&base_date=${base_date}&base_time=${base_time}&nx=${x}&ny=${y}`;

            const fcstRes = await fetch(fcstUrl);
            const fcstJson = await fcstRes.json();
            const fcstItems = fcstJson.response?.body?.items?.item ?? [];

            let sky: number | null = null;
            fcstItems.forEach((item: any) => {
              if (item.category === "SKY") sky = Number(item.fcstValue);
            });

            /* 🔥 사이드바 데이터 전달 */
            setSidebarInfo({
              address,
              temp,
              hum,
              pty,
              sky: skyStatus(sky),
            });
          }
        );
      },

      () => alert("현재 위치 권한을 허용해주세요.")
    );
  };

  return (
    <div className="map-wrapper">
      <div id="map" className="map"></div>

      <button className="btn-my-location" onClick={handleFindMyLocation}>
        📍 현재 위치
      </button>
    </div>
  );
};

export default KakaoMap;
