import React, { useEffect, useRef, useState, useCallback } from "react";
import DistanceSlider from "./map_distance"; 
import "./map_distance.css";
import { dfs_xy_conv, skyStatus, getBaseTime, getDistance } from "./mapHelpers";
import { 
  createCustomMarkerContent, 
  createInfoWindowContent, 
  MARKER_COLORS 
} from "./markerUtils";

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
  setThemes: (themes: any[]) => void;
  setMarines: (marines: any[]) => void;
  setUrbans: (urbans: any[]) => void;
  setCurrentLocation: (location: { lat: number; lng: number } | null) => void;
  onRestaurantClick: (restaurant: any) => void;
  externalLocation?: { lat: number; lng: number; title: string } | null;
}


const KakaoMap: React.FC<KakaoMapProps> = ({ 
  setSidebarInfo, 
  activeCategories,
  setRestaurants,
  setWalks,
  setThemes,
  setMarines,
  setUrbans,
  setCurrentLocation,
  onRestaurantClick,
  externalLocation
}) => {
  const kakaoKey = import.meta.env.VITE_KAKAOMAP_KEY;
  const weatherKey = import.meta.env.VITE_WEATHER_API_KEY;

  const mapRef = useRef<any>(null);
  const myLocationMarker = useRef<any>(null);
  const externalMarker = useRef<any>(null);
  const externalInfowindow = useRef<any>(null);
  const restaurantMarkers = useRef<Array<{ marker: any, infowindow: any }>>([]); 
  const walkMarkers = useRef<Array<{ marker: any, infowindow: any }>>([]); 
  const themeMarkers = useRef<Array<{ marker: any, infowindow: any }>>([]); 
  const marineMarkers = useRef<Array<{ marker: any, infowindow: any }>>([]); 
  const urbanMarkers = useRef<Array<{ marker: any, infowindow: any }>>([]); 
  const currentLocation = useRef<{lat: number, lng: number} | null>(null);
  const currentInfowindow = useRef<any>(null);

  // 1. 검색 반경 상태 (기본 8km)
  const [searchRadiusKm, setSearchRadiusKm] = useState(8); 
  //2. 슬라이더 팝업 토글 상태 추가
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  // 3. 검색어 상태
  const [searchKeyword, setSearchKeyword] = useState("");
  // 4. 지도 준비 상태
  const [isMapReady, setIsMapReady] = useState(false); 

  /* 음식점 데이터 가져오기 (keyword 지원) */
  const fetchRestaurants = useCallback(async (lat: number, lng: number, radiusKm: number, keyword?: string) => {
    try {
      const baseUrl = keyword 
        ? `http://localhost:8484/api/food/search?keyword=${encodeURIComponent(keyword)}&page=1&size=100`
        : "http://localhost:8484/api/food/search?page=1&size=100";
      
      const response = await fetch(baseUrl);
      const data = await response.json();
      const resultsArray = data?.list || [];
      
      if (resultsArray.length === 0) {
        setRestaurants([]);
        displayRestaurantMarkers([]);
        return;
      }

      const nearbyRestaurants = resultsArray
        .filter((food: any) => {
          if (!food.latitude || !food.longitude) return false;
          const foodLat = typeof food.latitude === 'string' ? parseFloat(food.latitude) : Number(food.latitude);
          const foodLng = typeof food.longitude === 'string' ? parseFloat(food.longitude) : Number(food.longitude);
          if (isNaN(foodLat) || isNaN(foodLng)) return false;
          const distance = getDistance(lat, lng, foodLat, foodLng);
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
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, 30);
      
      setRestaurants(nearbyRestaurants);
      displayRestaurantMarkers(nearbyRestaurants);
    } catch (error) {
      console.error("음식점 데이터 불러오기 실패:", error);
      alert("음식점 데이터를 불러오는데 실패했습니다.");
    }
  }, [setRestaurants]);

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

  /* Solr에서 테마여행 데이터 가져오기 */
  const fetchThemes = useCallback(async (lat: number, lng: number, radiusKm: number) => {
    try {
      console.log("🎭 테마여행 데이터 가져오기 시작...", { lat, lng, radiusKm });
      const response = await fetch("http://localhost:8484/api/theme/search?page=1&size=100");
      const data = await response.json();

      const resultsArray = data?.list || [];
      console.log(">>> 테마여행 데이터 수:", resultsArray.length);
      console.log(">>> 첫 번째 데이터:", resultsArray[0]);
      
      if (resultsArray.length === 0) {
        console.log("⚠️ 테마여행 데이터가 없습니다.");
        setThemes([]);
        displayThemeMarkers([]);
        return;
      }

      // 좌표가 있는 테마여행만 필터링하고 거리 계산
      const nearbyThemes = resultsArray
        .filter((theme: any) => {
          if (!theme.latitude || !theme.longitude) {
            console.log("❌ 좌표 없음:", theme.id, theme.title);
            return false;
          }
          
          // 배열이면 첫 번째 요소 사용
          const latValue = Array.isArray(theme.latitude) ? theme.latitude[0] : theme.latitude;
          const lngValue = Array.isArray(theme.longitude) ? theme.longitude[0] : theme.longitude;
          
          const themeLat = typeof latValue === 'string' ? parseFloat(latValue) : Number(latValue);
          const themeLng = typeof lngValue === 'string' ? parseFloat(lngValue) : Number(lngValue);
          
          console.log("🔍 좌표 체크:", theme.id, { themeLat, themeLng });
          
          if (isNaN(themeLat) || isNaN(themeLng)) {
            console.log("❌ 좌표 변환 실패:", theme.id);
            return false;
          }

          const distance = getDistance(lat, lng, themeLat, themeLng);
          console.log("📏 거리:", theme.id, distance.toFixed(2) + "km");
          return distance <= radiusKm;
        })
        .map((theme: any) => {
          const latValue = Array.isArray(theme.latitude) ? theme.latitude[0] : theme.latitude;
          const lngValue = Array.isArray(theme.longitude) ? theme.longitude[0] : theme.longitude;
          
          const themeLat = typeof latValue === 'string' ? parseFloat(latValue) : Number(latValue);
          const themeLng = typeof lngValue === 'string' ? parseFloat(lngValue) : Number(lngValue);
          
          return {
            id: theme.id,
            title: theme.title,
            subtitle: theme.subtitle,
            latitude: themeLat,
            longitude: themeLng,
            image: theme.image_url,
            address: theme.address,
            type: theme.type,
            distance: getDistance(lat, lng, themeLat, themeLng)
          };
        })
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, 30);
      
      console.log("✅ 필터링된 테마여행 수:", nearbyThemes.length);
      console.log("✅ 필터링된 첫 번째 데이터:", nearbyThemes[0]);
      
      setThemes(nearbyThemes);
      displayThemeMarkers(nearbyThemes);

    } catch (error) {
      console.error("❌ 테마여행 데이터 불러오기 실패:", error);
      alert("테마여행 데이터를 불러오는데 실패했습니다.");
    }
  }, [setThemes]);

  /* Solr에서 해양여행 데이터 가져오기 */
  const fetchMarines = useCallback(async (lat: number, lng: number, radiusKm: number) => {
    try {
      console.log("🌊 해양여행 데이터 가져오기 시작...", { lat, lng, radiusKm });
      const response = await fetch("http://localhost:8484/api/marine/search?page=1&size=100");
      const data = await response.json();

      const resultsArray = data?.list || [];
      console.log(">>> 해양여행 데이터 수:", resultsArray.length);
      console.log(">>> 첫 번째 데이터:", resultsArray[0]);
      
      if (resultsArray.length === 0) {
        console.log("⚠️ 해양여행 데이터가 없습니다.");
        setMarines([]);
        displayMarineMarkers([]);
        return;
      }

      // 좌표가 있는 해양여행만 필터링하고 거리 계산
      const nearbyMarines = resultsArray
        .filter((marine: any) => {
          if (!marine.latitude || !marine.longitude) {
            console.log("❌ 좌표 없음:", marine.id, marine.title);
            return false;
          }
          
          // 배열이면 첫 번째 요소 사용
          const latValue = Array.isArray(marine.latitude) ? marine.latitude[0] : marine.latitude;
          const lngValue = Array.isArray(marine.longitude) ? marine.longitude[0] : marine.longitude;
          
          const marineLat = typeof latValue === 'string' ? parseFloat(latValue) : Number(latValue);
          const marineLng = typeof lngValue === 'string' ? parseFloat(lngValue) : Number(lngValue);
          
          console.log("🔍 좌표 체크:", marine.id, { marineLat, marineLng });
          
          if (isNaN(marineLat) || isNaN(marineLng)) {
            console.log("❌ 좌표 변환 실패:", marine.id);
            return false;
          }

          const distance = getDistance(lat, lng, marineLat, marineLng);
          console.log("📏 거리:", marine.id, distance.toFixed(2) + "km");
          return distance <= radiusKm;
        })
        .map((marine: any) => {
          const latValue = Array.isArray(marine.latitude) ? marine.latitude[0] : marine.latitude;
          const lngValue = Array.isArray(marine.longitude) ? marine.longitude[0] : marine.longitude;
          
          const marineLat = typeof latValue === 'string' ? parseFloat(latValue) : Number(latValue);
          const marineLng = typeof lngValue === 'string' ? parseFloat(lngValue) : Number(lngValue);
          
          return {
            id: marine.id,
            title: marine.title,
            subtitle: marine.subtitle,
            latitude: marineLat,
            longitude: marineLng,
            image: marine.image_url,
            address: marine.address,
            type: marine.type,
            distance: getDistance(lat, lng, marineLat, marineLng)
          };
        })
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, 30);
      
      console.log("✅ 필터링된 해양여행 수:", nearbyMarines.length);
      console.log("✅ 필터링된 첫 번째 데이터:", nearbyMarines[0]);
      
      setMarines(nearbyMarines);
      displayMarineMarkers(nearbyMarines);

    } catch (error) {
      console.error("❌ 해양여행 데이터 불러오기 실패:", error);
      alert("해양여행 데이터를 불러오는데 실패했습니다.");
    }
  }, [setMarines]);

  /* Solr에서 도시여행 데이터 가져오기 */
  const fetchUrbans = useCallback(async (lat: number, lng: number, radiusKm: number) => {
    try {
      console.log("🏙️ 도시여행 데이터 가져오기 시작...", { lat, lng, radiusKm });
      const response = await fetch("http://localhost:8484/api/urban/search?page=1&size=100");
      const data = await response.json();

      const resultsArray = data?.list || [];
      console.log(">>> 도시여행 데이터 수:", resultsArray.length);
      console.log(">>> 첫 번째 데이터:", resultsArray[0]);
      
      if (resultsArray.length === 0) {
        console.log("⚠️ 도시여행 데이터가 없습니다.");
        setUrbans([]);
        displayUrbanMarkers([]);
        return;
      }

      // 좌표가 있는 도시여행만 필터링하고 거리 계산
      const nearbyUrbans = resultsArray
        .filter((urban: any) => {
          if (!urban.latitude || !urban.longitude) {
            console.log("❌ 좌표 없음:", urban.id, urban.title);
            return false;
          }
          
          // 배열이면 첫 번째 요소 사용
          const latValue = Array.isArray(urban.latitude) ? urban.latitude[0] : urban.latitude;
          const lngValue = Array.isArray(urban.longitude) ? urban.longitude[0] : urban.longitude;
          
          const urbanLat = typeof latValue === 'string' ? parseFloat(latValue) : Number(latValue);
          const urbanLng = typeof lngValue === 'string' ? parseFloat(lngValue) : Number(lngValue);
          
          console.log("🔍 좌표 체크:", urban.id, { urbanLat, urbanLng });
          
          if (isNaN(urbanLat) || isNaN(urbanLng)) {
            console.log("❌ 좌표 변환 실패:", urban.id);
            return false;
          }

          const distance = getDistance(lat, lng, urbanLat, urbanLng);
          console.log("📏 거리:", urban.id, distance.toFixed(2) + "km");
          return distance <= radiusKm;
        })
        .map((urban: any) => {
          const latValue = Array.isArray(urban.latitude) ? urban.latitude[0] : urban.latitude;
          const lngValue = Array.isArray(urban.longitude) ? urban.longitude[0] : urban.longitude;
          
          const urbanLat = typeof latValue === 'string' ? parseFloat(latValue) : Number(latValue);
          const urbanLng = typeof lngValue === 'string' ? parseFloat(lngValue) : Number(lngValue);
          
          return {
            id: urban.id,
            title: urban.title,
            subtitle: urban.subtitle,
            latitude: urbanLat,
            longitude: urbanLng,
            image: urban.image_url,
            address: urban.address,
            type: urban.type,
            distance: getDistance(lat, lng, urbanLat, urbanLng)
          };
        })
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, 30);
      
      console.log("✅ 필터링된 도시여행 수:", nearbyUrbans.length);
      console.log("✅ 필터링된 첫 번째 데이터:", nearbyUrbans[0]);
      
      setUrbans(nearbyUrbans);
      displayUrbanMarkers(nearbyUrbans);

    } catch (error) {
      console.error("❌ 도시여행 데이터 불러오기 실패:", error);
      alert("도시여행 데이터를 불러오는데 실패했습니다.");
    }
  }, [setUrbans]);

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
    if (activeCategories.includes('테마여행')) {
      fetchThemes(lat, lng, newDistanceKm);
    }
    if (activeCategories.includes('해양여행')) {
      fetchMarines(lat, lng, newDistanceKm);
    }
    if (activeCategories.includes('도시여행')) {
      fetchUrbans(lat, lng, newDistanceKm);
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

  /* 테마여행 카테고리 선택 시 처리 */
  useEffect(() => {
    if (activeCategories.includes('테마여행')) {
      const { lat, lng } = currentLocation.current || { lat: 35.1796, lng: 129.0756 };
      fetchThemes(lat, lng, searchRadiusKm);
    } else {
      clearThemeMarkers();
      setThemes([]);
    }
  }, [activeCategories, fetchThemes, setThemes, searchRadiusKm]); 

  /* 해양여행 카테고리 선택 시 처리 */
  useEffect(() => {
    if (activeCategories.includes('해양여행')) {
      const { lat, lng } = currentLocation.current || { lat: 35.1796, lng: 129.0756 };
      fetchMarines(lat, lng, searchRadiusKm);
    } else {
      clearMarineMarkers();
      setMarines([]);
    }
  }, [activeCategories, fetchMarines, setMarines, searchRadiusKm]);

  /* 도시여행 카테고리 선택 시 처리 */
  useEffect(() => {
    if (activeCategories.includes('도시여행')) {
      const { lat, lng } = currentLocation.current || { lat: 35.1796, lng: 129.0756 };
      fetchUrbans(lat, lng, searchRadiusKm);
    } else {
      clearUrbanMarkers();
      setUrbans([]);
    }
  }, [activeCategories, setUrbans, searchRadiusKm]); 
  
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

        // 지도 크기 재조정 - 약간의 지연 후 실행
        setTimeout(() => {
          if (map && map.relayout) {
            map.relayout();
            map.setCenter(new window.kakao.maps.LatLng(35.146, 129.1));
          }
          // 지도 준비 완료
          setIsMapReady(true);
          console.log("🗺️ Map is ready");
        }, 100);
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

  /* 지도 리사이즈 처리 */
  useEffect(() => {
    const handleResize = () => {
      const map = mapRef.current;
      if (map && map.relayout) {
        map.relayout();
      }
    };

    window.addEventListener('resize', handleResize);
    
    // 컴포넌트 마운트 시에도 한 번 실행
    setTimeout(handleResize, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  /* 외부에서 전달된 위치 처리 (쇼핑 등에서 지도 보기) */
  useEffect(() => {
    // 지도가 준비되고, externalLocation이 있을 때만 실행
    if (!isMapReady || !externalLocation || !mapRef.current || !window.kakao) {
      return;
    }

    console.log("🛍️ External location detected:", externalLocation);
    
    const { lat, lng, title } = externalLocation;
    
    // 현재 위치로 설정
    currentLocation.current = { lat, lng };
    setCurrentLocation({ lat, lng });

    const kakao = window.kakao;
    const position = new kakao.maps.LatLng(lat, lng);
    
    // 지도 중심 이동
    mapRef.current.panTo(position);
    mapRef.current.setLevel(3);
    
    // 기존 external 마커 제거
    if (externalMarker.current) {
      externalMarker.current.setMap(null);
    }
    if (externalInfowindow.current) {
      externalInfowindow.current.close();
    }
    
    // 약간의 지연 후 마커 생성 (지도 이동 완료 대기)
    setTimeout(() => {
      // External 마커 생성 (별도 관리)
      externalMarker.current = new kakao.maps.Marker({
        position: position,
        map: mapRef.current,
        zIndex: 9999
      });
      
      // 인포윈도우 생성
      externalInfowindow.current = new kakao.maps.InfoWindow({
        content: `<div style="padding:10px 15px;font-size:14px;font-weight:600;color:#333;white-space:nowrap;min-width:120px;text-align:center;background:white;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.15);">${title}</div>`,
        removable: false
      });
      
      externalInfowindow.current.open(mapRef.current, externalMarker.current);
      
      console.log("✅ External marker created and displayed");
    }, 300);
  }, [externalLocation, isMapReady, setCurrentLocation]);

  /* 지도나 카테고리가 변경되어도 external 마커 유지 */
  useEffect(() => {
    if (externalMarker.current && mapRef.current && isMapReady) {
      console.log("🔄 Re-applying external marker to map");
      externalMarker.current.setMap(mapRef.current);
      if (externalInfowindow.current) {
        externalInfowindow.current.open(mapRef.current, externalMarker.current);
      }
    }
  }, [activeCategories, searchRadiusKm, isMapReady]);

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

  /* 테마여행 마커 제거 */
  const clearThemeMarkers = () => {
    themeMarkers.current.forEach(item => item.marker.setMap(null));
    themeMarkers.current = [];
  };

  /* 해양여행 마커 제거 */
  const clearMarineMarkers = () => {
    marineMarkers.current.forEach(item => item.marker.setMap(null));
    marineMarkers.current = [];
  };

  /* 도시여행 마커 제거 */
  const clearUrbanMarkers = () => {
    urbanMarkers.current.forEach(item => item.marker.setMap(null));
    urbanMarkers.current = [];
  };

  /* 음식점 마커 표시 (주황색 핀 마커 사용) */
  const displayRestaurantMarkers = (restaurants: any[]) => {
    clearRestaurantMarkers();
    const map = mapRef.current;
    if (!map) return;

    restaurants.forEach(restaurant => {
      const position = new window.kakao.maps.LatLng(restaurant.latitude, restaurant.longitude);
      const content = createCustomMarkerContent(MARKER_COLORS.RESTAURANT);
      
      content.onclick = () => onRestaurantClick(restaurant);

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position,
        content: content,
        yAnchor: 1
      });

      customOverlay.setMap(map);
      
      const infowindow = new window.kakao.maps.InfoWindow({
        content: createInfoWindowContent(restaurant.title, restaurant.address, restaurant.distance)
      });

      restaurantMarkers.current.push({ marker: customOverlay, infowindow });
    });
  };

  /* 도보여행 마커 표시 (청록색 핀 마커 사용) */
  const displayWalkMarkers = (walks: any[]) => {
    clearWalkMarkers();
    const map = mapRef.current;
    if (!map) return;

    walks.forEach(walk => {
      const position = new window.kakao.maps.LatLng(walk.latitude, walk.longitude);
      const content = createCustomMarkerContent(MARKER_COLORS.WALK);
      
      content.onclick = () => onRestaurantClick(walk);

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position,
        content: content,
        yAnchor: 1
      });

      customOverlay.setMap(map);
      
      const title = Array.isArray(walk.title) ? walk.title[0] : walk.title;
      const subtitle = Array.isArray(walk.subtitle) ? walk.subtitle[0] : walk.subtitle;
      
      const infowindow = new window.kakao.maps.InfoWindow({
        content: createInfoWindowContent(title, subtitle, walk.distance)
      });

      walkMarkers.current.push({ marker: customOverlay, infowindow });
    });
  };

  /* 테마여행 마커 표시 (초록색 핀 마커 사용) */
  const displayThemeMarkers = (themes: any[]) => {
    clearThemeMarkers();
    const map = mapRef.current;
    if (!map) return;

    themes.forEach(theme => {
      const position = new window.kakao.maps.LatLng(theme.latitude, theme.longitude);
      const content = createCustomMarkerContent(MARKER_COLORS.THEME);
      
      content.onclick = () => onRestaurantClick(theme);

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position,
        content: content,
        yAnchor: 1
      });

      customOverlay.setMap(map);
      
      const title = Array.isArray(theme.title) ? theme.title[0] : theme.title;
      const subtitle = Array.isArray(theme.subtitle) ? theme.subtitle[0] : theme.subtitle;
      
      const infowindow = new window.kakao.maps.InfoWindow({
        content: createInfoWindowContent(title, subtitle, theme.distance)
      });

      themeMarkers.current.push({ marker: customOverlay, infowindow });
    });
  };

  /* 해양여행 마커 표시 (파란색 핀 마커 사용) */
  const displayMarineMarkers = (marines: any[]) => {
    clearMarineMarkers();
    const map = mapRef.current;
    if (!map) return;

    marines.forEach(marine => {
      const position = new window.kakao.maps.LatLng(marine.latitude, marine.longitude);
      const content = createCustomMarkerContent(MARKER_COLORS.MARINE);
      
      content.onclick = () => onRestaurantClick(marine);

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position,
        content: content,
        yAnchor: 1
      });

      customOverlay.setMap(map);
      
      const title = Array.isArray(marine.title) ? marine.title[0] : marine.title;
      const subtitle = Array.isArray(marine.subtitle) ? marine.subtitle[0] : marine.subtitle;
      
      const infowindow = new window.kakao.maps.InfoWindow({
        content: createInfoWindowContent(title, subtitle, marine.distance)
      });

      marineMarkers.current.push({ marker: customOverlay, infowindow });
    });
  };

  /* 도시여행 마커 표시 (빨간색 핀 마커 사용) */
  const displayUrbanMarkers = (urbans: any[]) => {
    clearUrbanMarkers();
    const map = mapRef.current;
    if (!map) return;

    urbans.forEach(urban => {
      const position = new window.kakao.maps.LatLng(urban.latitude, urban.longitude);
      const content = createCustomMarkerContent(MARKER_COLORS.URBAN);
      
      content.onclick = () => onRestaurantClick(urban);

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position,
        content: content,
        yAnchor: 1
      });

      customOverlay.setMap(map);
      
      const title = Array.isArray(urban.title) ? urban.title[0] : urban.title;
      const subtitle = Array.isArray(urban.subtitle) ? urban.subtitle[0] : urban.subtitle;
      
      const infowindow = new window.kakao.maps.InfoWindow({
        content: createInfoWindowContent(title, subtitle, urban.distance)
      });

      urbanMarkers.current.push({ marker: customOverlay, infowindow });
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
        setCurrentLocation({ lat, lng }); // MapPage로 전달

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

            let temp: number | null = null;
            let hum: number | null = null;
            let pty: number | null = null;
            let sky: number | null = null;

            try {
              /* 초단기 실황 */
              const ncstUrl =
                `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst` +
                `?serviceKey=${weatherKey}&pageNo=1&numOfRows=100&dataType=JSON` +
                `&base_date=${base_date}&base_time=${base_time}&nx=${x}&ny=${y}`;

              const ncstRes = await fetch(ncstUrl);
              const ncstText = await ncstRes.text();
              const ncstJson = JSON.parse(ncstText);

              if (ncstJson.response?.header?.resultCode === "00") {
                const ncstItems = ncstJson.response?.body?.items?.item ?? [];
                ncstItems.forEach((item: any) => {
                  if (item.category === "T1H") temp = Number(item.obsrValue);
                  if (item.category === "REH") hum = Number(item.obsrValue);
                  if (item.category === "PTY") pty = Number(item.obsrValue);
                });
              }

              /* 초단기 예보 (SKY) */
              const fcstUrl =
                `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst` +
                `?serviceKey=${weatherKey}&pageNo=1&numOfRows=100&dataType=JSON` +
                `&base_date=${base_date}&base_time=${base_time}&nx=${x}&ny=${y}`;

              const fcstRes = await fetch(fcstUrl);
              const fcstText = await fcstRes.text();
              const fcstJson = JSON.parse(fcstText);

              if (fcstJson.response?.header?.resultCode === "00") {
                const fcstItems = fcstJson.response?.body?.items?.item ?? [];
                fcstItems.forEach((item: any) => {
                  if (item.category === "SKY") sky = Number(item.fcstValue);
                });
              }
            } catch (error) {
              console.error("날씨 API 호출 실패:", error);
            }

            /* 사이드바 데이터 전달 */
            setSidebarInfo({
              address,
              temp: temp ?? -999,
              hum: hum ?? -999,
              pty: pty ?? 0,
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

            // 테마여행 카테고리가 활성화되어 있으면 테마여행 데이터 가져오기
            if (activeCategories.includes('테마여행')) {
              fetchThemes(lat, lng, searchRadiusKm);
            }

            // 해양여행 카테고리가 활성화되어 있으면 해양여행 데이터 가져오기
            if (activeCategories.includes('해양여행')) {
              fetchMarines(lat, lng, searchRadiusKm);
            }

            // 도시여행 카테고리가 활성화되어 있으면 도시여행 데이터 가져오기
            if (activeCategories.includes('도시여행')) {
              fetchUrbans(lat, lng, searchRadiusKm);
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