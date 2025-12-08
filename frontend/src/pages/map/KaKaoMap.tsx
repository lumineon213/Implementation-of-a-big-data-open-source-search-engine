import React, { useEffect, useRef, useState, useCallback } from "react";
import DistanceSlider from "./map_distance"; 
import "./map_distance.css"; 

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  setSidebarInfo: (info: any) => void;
  activeCategories: string[];
  setRestaurants: (restaurants: any[]) => void;
  setWalks: (walks: any[]) => void;
  onRestaurantClick: (restaurant: any) => void;
}

// 헬퍼 함수 (DFS_XY_CONV, SKYSTATUS, GETBASETIME, GETDISTANCE)는 그대로 유지

/* ✓ 위도/경도 → 기상청 격자 변환 */
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

/* ✓ 하늘 상태 표시 */
function skyStatus(sky: number | null) {
  if (sky === 1) return "☀ 맑음";
  if (sky === 3) return "⛅ 구름많음";
  if (sky === 4) return "☁ 흐림";
  return "🌫 관측 불가";
}

/* ✓ 발표 시간 계산 */
function getBaseTime() {
  const now = new Date();
  const hour = now.getHours();
  const baseHour = hour - 1 < 0 ? 23 : hour - 1;
  return `${baseHour.toString().padStart(2, "0")}30`;
}

/* ✓ 두 지점 간 거리 계산 (km) */
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


const KakaoMap: React.FC<KakaoMapProps> = ({ 
  setSidebarInfo, 
  activeCategories,
  setRestaurants,
  setWalks,
  onRestaurantClick
}) => {
  const kakaoKey = import.meta.env.VITE_KAKAOMAP_KEY;
  const weatherKey = import.meta.env.VITE_WEATHER_API_KEY;

  const mapRef = useRef<any>(null);
  const myLocationMarker = useRef<any>(null);
  const restaurantMarkers = useRef<Array<{ marker: any, infowindow: any }>>([]); 
  const walkMarkers = useRef<Array<{ marker: any, infowindow: any }>>([]); 
  const currentLocation = useRef<{lat: number, lng: number} | null>(null);
  const currentInfowindow = useRef<any>(null);

  // 1. 검색 반경 상태 (기본 8km)
  const [searchRadiusKm, setSearchRadiusKm] = useState(8); 
  //2. 슬라이더 팝업 토글 상태 추가
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  // 3. 검색어 상태
  const [searchKeyword, setSearchKeyword] = useState(""); 

  /*Solr에서 음식점 데이터 가져오기 (radiusKm 인자 추가, keyword 추가) */
  const fetchRestaurants = useCallback(async (lat: number, lng: number, radiusKm: number, keyword?: string) => {
    try {
      // size=100으로 더 많은 데이터 요청
      const baseUrl = keyword 
        ? `http://localhost:8484/api/food/search?keyword=${encodeURIComponent(keyword)}&page=1&size=100`
        : "http://localhost:8484/api/food/search?page=1&size=100";
      
      const response = await fetch(baseUrl);
      const data = await response.json();

      // 백엔드 응답이 {list: [], total: N} 형태
      const resultsArray = data?.list || [];
      console.log(">>> 백엔드에서 가져온 데이터 수:", resultsArray.length);
      
      if (resultsArray.length === 0) {
        setRestaurants([]);
        displayRestaurantMarkers([]);
        return;
      }

      // 좌표가 있는 음식점만 필터링하고 거리 계산
      const nearbyRestaurants = resultsArray
        .filter((food: any) => {
          if (!food.latitude || !food.longitude) return false;
          
          const foodLat = typeof food.latitude === 'string' ? parseFloat(food.latitude) : Number(food.latitude);
          const foodLng = typeof food.longitude === 'string' ? parseFloat(food.longitude) : Number(food.longitude);
          
          if (isNaN(foodLat) || isNaN(foodLng)) return false;

          const distance = getDistance(lat, lng, foodLat, foodLng);
          
          // radiusKm(슬라이더 설정 값) 이내만 포함
          return distance <= radiusKm; 
        })
        .map((food: any) => {
          const foodLat = typeof food.latitude === 'string' ? parseFloat(food.latitude) : Number(food.latitude);
          const foodLng = typeof food.longitude === 'string' ? parseFloat(food.longitude) : Number(food.longitude);
          
          return {
            id: food.id,
            title: food.title,
            address: food.address,
            menu: food.menu_t || '',
            image: food.image_url,
            description: food.description,
            latitude: foodLat,
            longitude: foodLng,
            distance: getDistance(lat, lng, foodLat, foodLng)
          };
        })
        .sort((a: any, b: any) => a.distance - b.distance) // 거리순 정렬
        .slice(0, 30); // 최대 30개
      
      setRestaurants(nearbyRestaurants);
      displayRestaurantMarkers(nearbyRestaurants);

    } catch (error) {
      console.error("음식점 데이터 불러오기 실패:", error);
      alert("음식점 데이터를 불러오는데 실패했습니다.");
    }
  }, [setRestaurants]); // useCallback 종속성 추가

  /* Solr에서 도보여행 데이터 가져오기 */
  const fetchWalks = useCallback(async (lat: number, lng: number, radiusKm: number) => {
    try {
      console.log("🚶 도보여행 데이터 가져오기 시작...", { lat, lng, radiusKm });
      const response = await fetch("http://localhost:8484/api/walk/search?page=1&size=100");
      const data = await response.json();

      const resultsArray = data?.list || [];
      console.log(">>> 도보여행 데이터 수:", resultsArray.length);
      console.log(">>> 첫 번째 데이터:", resultsArray[0]);
      
      if (resultsArray.length === 0) {
        console.log("⚠️ 도보여행 데이터가 없습니다.");
        setWalks([]);
        displayWalkMarkers([]);
        return;
      }

      // 좌표가 있는 도보여행만 필터링하고 거리 계산
      const nearbyWalks = resultsArray
        .filter((walk: any) => {
          if (!walk.latitude || !walk.longitude) {
            console.log("❌ 좌표 없음:", walk.id, walk.title);
            return false;
          }
          
          // 배열이면 첫 번째 요소 사용
          const latValue = Array.isArray(walk.latitude) ? walk.latitude[0] : walk.latitude;
          const lngValue = Array.isArray(walk.longitude) ? walk.longitude[0] : walk.longitude;
          
          const walkLat = typeof latValue === 'string' ? parseFloat(latValue) : Number(latValue);
          const walkLng = typeof lngValue === 'string' ? parseFloat(lngValue) : Number(lngValue);
          
          console.log("🔍 좌표 체크:", walk.id, { walkLat, walkLng });
          
          if (isNaN(walkLat) || isNaN(walkLng)) {
            console.log("❌ 좌표 변환 실패:", walk.id);
            return false;
          }

          const distance = getDistance(lat, lng, walkLat, walkLng);
          console.log("📏 거리:", walk.id, distance.toFixed(2) + "km");
          return distance <= radiusKm;
        })
        .map((walk: any) => {
          const latValue = Array.isArray(walk.latitude) ? walk.latitude[0] : walk.latitude;
          const lngValue = Array.isArray(walk.longitude) ? walk.longitude[0] : walk.longitude;
          
          const walkLat = typeof latValue === 'string' ? parseFloat(latValue) : Number(latValue);
          const walkLng = typeof lngValue === 'string' ? parseFloat(lngValue) : Number(lngValue);
          
          return {
            id: walk.id,
            title: walk.title,
            subtitle: walk.subtitle,
            latitude: walkLat,
            longitude: walkLng,
            image: walk.image_url,
            tags: walk.tags,
            type: walk.type,
            distance: getDistance(lat, lng, walkLat, walkLng)
          };
        })
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, 30);
      
      console.log("✅ 필터링된 도보여행 수:", nearbyWalks.length);
      console.log("✅ 필터링된 첫 번째 데이터:", nearbyWalks[0]);
      
      setWalks(nearbyWalks);
      displayWalkMarkers(nearbyWalks);

    } catch (error) {
      console.error("❌ 도보여행 데이터 불러오기 실패:", error);
      alert("도보여행 데이터를 불러오는데 실패했습니다.");
    }
  }, [setWalks]);

  //3. 슬라이더 설정 완료 핸들러 (거리 상태 업데이트 및 재검색)
  const handleDistanceUpdate = (newDistanceKm: number) => {
    // 1. 거리 상태 업데이트
    setSearchRadiusKm(newDistanceKm);
    
    // 2. 팝업 닫기
    setIsSliderOpen(false); 

    // 3. 거리 변경 시 즉시 재검색 (현재 위치 기준으로)
    const { lat, lng } = currentLocation.current || { lat: 35.1796, lng: 129.0756 };
    if (activeCategories.includes('음식점')) {
      fetchRestaurants(lat, lng, newDistanceKm, searchKeyword); 
    }
    if (activeCategories.includes('도보여행')) {
      fetchWalks(lat, lng, newDistanceKm);
    }
  };

  /* 음식점 카테고리 선택 시 처리 (초기 로딩 및 카테고리 전환 시) */
  useEffect(() => {
    if (activeCategories.includes('음식점')) {
      const { lat, lng } = currentLocation.current || { lat: 35.1796, lng: 129.0756 };
      // 현재 searchRadiusKm 값과 검색어를 사용하여 검색
      fetchRestaurants(lat, lng, searchRadiusKm, searchKeyword); 
    } else {
      clearRestaurantMarkers();
      setRestaurants([]);
    }
  }, [activeCategories, fetchRestaurants, setRestaurants, searchRadiusKm, searchKeyword]);

  /* 도보여행 카테고리 선택 시 처리 */
  useEffect(() => {
    if (activeCategories.includes('도보여행')) {
      const { lat, lng } = currentLocation.current || { lat: 35.1796, lng: 129.0756 };
      fetchWalks(lat, lng, searchRadiusKm);
    } else {
      clearWalkMarkers();
      setWalks([]);
    }
  }, [activeCategories, fetchWalks, setWalks, searchRadiusKm]); 
  
  /* 초기 지도 로드 */
  useEffect(() => {
    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        console.error("카카오맵 API가 로드되지 않았습니다.");
        return;
      }

      window.kakao.maps.load(() => {
        const container = document.getElementById("map");
        if (!container) {
          console.error("지도 컨테이너를 찾을 수 없습니다.");
          return;
        }

        const map = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(35.146, 129.1),
          level: 4,
        });

        mapRef.current = map;
      });
    };

    // 카카오맵 API가 이미 로드되어 있으면 바로 초기화
    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      // 로드되지 않은 경우 동적으로 스크립트 추가
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false&libraries=services`;
      script.async = true;
      script.onload = initMap;
      script.onerror = () => {
        console.error("카카오맵 API 스크립트 로드에 실패했습니다.");
        alert("지도를 불러오는데 실패했습니다. API 키를 확인해주세요.");
      };
      document.body.appendChild(script);
    }
  }, [kakaoKey]);

  /* 음식점 마커 제거 */
  const clearRestaurantMarkers = () => {
    restaurantMarkers.current.forEach(item => item.marker.setMap(null));
    restaurantMarkers.current = [];
    if (currentInfowindow.current) {
      currentInfowindow.current.close();
      currentInfowindow.current = null;
    }
  };

  /* 도보여행 마커 제거 */
  const clearWalkMarkers = () => {
    walkMarkers.current.forEach(item => item.marker.setMap(null));
    walkMarkers.current = [];
  };

  /* 음식점 마커 표시 (원래 빨간 핀 마커 사용) */
  const displayRestaurantMarkers = (restaurants: any[]) => {
    clearRestaurantMarkers();

    const map = mapRef.current;
    if (!map) return;

    restaurants.forEach(restaurant => {
      const position = new window.kakao.maps.LatLng(
        restaurant.latitude,
        restaurant.longitude
      );

      // 기본 빨간 핀 마커 이미지 사용 로직
      const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png';
      const imageSize = new window.kakao.maps.Size(40, 42);
      const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);

      const marker = new window.kakao.maps.Marker({
        map,
        position,
        image: markerImage, // 이미지 설정
        title: restaurant.title
      });

      // 인포윈도우 생성
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="padding:10px; min-width:200px;">
            <strong>${restaurant.title}</strong><br/>
            <span style="font-size:12px; color:#666;">${restaurant.address}</span><br/>
            <span style="font-size:11px; color:#999;">${restaurant.distance.toFixed(2)}km</span>
          </div>
        `
      });

      // 마커 클릭 이벤트 리스너 - 상세 패널 열기
      window.kakao.maps.event.addListener(marker, 'click', () => {
        onRestaurantClick(restaurant);
      });

      // 마커와 정보창을 함께 저장
      restaurantMarkers.current.push({ marker, infowindow });
    });
  };

  /* 도보여행 마커 표시 (파란색 핀 마커 사용) */
  const displayWalkMarkers = (walks: any[]) => {
    clearWalkMarkers();

    const map = mapRef.current;
    if (!map) return;

    console.log("🎯 마커 표시 시작, 개수:", walks.length);

    walks.forEach(walk => {
      console.log("📍 마커 생성:", walk.id, walk.latitude, walk.longitude);
      
      const position = new window.kakao.maps.LatLng(
        walk.latitude,
        walk.longitude
      );

      // 기본 마커 먼저 사용 (이미지 없이)
      const marker = new window.kakao.maps.Marker({
        map,
        position,
        title: Array.isArray(walk.title) ? walk.title[0] : walk.title
      });

      console.log("✅ 마커 생성 완료:", walk.id);

      // 인포윈도우 생성
      const subtitle = Array.isArray(walk.subtitle) ? walk.subtitle[0] : walk.subtitle;
      const title = Array.isArray(walk.title) ? walk.title[0] : walk.title;
      
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="padding:10px; min-width:200px;">
            <strong>${title}</strong><br/>
            ${subtitle ? `<span style="font-size:12px; color:#666;">${subtitle}</span><br/>` : ''}
            <span style="font-size:11px; color:#999;">${walk.distance.toFixed(2)}km</span>
          </div>
        `
      });

      // 마커 클릭 이벤트 리스너 - 상세 패널 열기
      window.kakao.maps.event.addListener(marker, 'click', () => {
        onRestaurantClick(walk);
      });

      // 마커와 정보창을 함께 저장
      walkMarkers.current.push({ marker, infowindow });
    });
  };

  /* 현재 위치 버튼 */
  const handleFindMyLocation = () => {
    if (!navigator.geolocation) {
      alert("현재 위치를 지원하지 않는 브라우저입니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // 현재 위치 저장
        currentLocation.current = { lat, lng };

        const map = mapRef.current;
        const position = new window.kakao.maps.LatLng(lat, lng);

        map.panTo(position);

        /* 기존 마커 삭제 */
        if (myLocationMarker.current) {
          myLocationMarker.current.setMap(null);
        }

        /* 새 마커 생성 */
        myLocationMarker.current = new window.kakao.maps.Marker({
          map,
          position,
        });

        /* 주소 변환 및 기상청 API 호출 로직 */
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(
          lng,
          lat,
          async (res: any[], status: string) => {
            if (status !== window.kakao.maps.services.Status.OK) return;

            const address = res[0].address.address_name;

            /* ✓ 기상청 API */
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

            /* 사이드바 데이터 전달 */
            setSidebarInfo({
              address,
              temp,
              hum,
              pty,
              sky: skyStatus(sky),
            });

            // 음식점 카테고리가 활성화되어 있으면 음식점 데이터 가져오기
            if (activeCategories.includes('음식점')) {
              // 현재 searchRadiusKm 값과 검색어를 사용하여 검색
              fetchRestaurants(lat, lng, searchRadiusKm, searchKeyword); 
            }
            
            // 도보여행 카테고리가 활성화되어 있으면 도보여행 데이터 가져오기
            if (activeCategories.includes('도보여행')) {
              fetchWalks(lat, lng, searchRadiusKm);
            }
          }
        );
      },

      () => alert("현재 위치 권한을 허용해주세요.")
    );
  };

  // 슬라이더 팝업 토글 함수
  const toggleSlider = () => {
    setIsSliderOpen(prev => !prev);
  }

  // 검색 실행 함수
  const handleSearch = () => {
    if (!currentLocation.current) {
      alert("먼저 현재 위치를 설정해주세요.");
      return;
    }
    if (activeCategories.includes('음식점')) {
      const { lat, lng } = currentLocation.current;
      fetchRestaurants(lat, lng, searchRadiusKm, searchKeyword);
    }
  };

  // Enter 키로 검색
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="map-wrapper">
      <div id="map" className="map"></div>

      {/* 상단 중앙 검색창 및 현재 위치 버튼 */}
      <div className="search-top-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="맛집 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="btn-search" onClick={handleSearch}>
            🔍
          </button>
        </div>
        <button className="btn-my-location-top" onClick={handleFindMyLocation}>
          📍 현재 위치에서 검색
        </button>
      </div>

      {/*슬라이더 팝업 토글 버튼 */}
      <button 
        className="btn-toggle-slider" 
        onClick={toggleSlider}
      >
         <span className="filter-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6z60m">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
         </span>
      </button>

      {/*DistanceSlider 컴포넌트 사용 (map_distance.tsx) */}
      <DistanceSlider 
        onDistanceChange={handleDistanceUpdate} 
        initialDistanceKm={searchRadiusKm}
        isOpen={isSliderOpen}
      />
    </div>
  );
};

export default KakaoMap;