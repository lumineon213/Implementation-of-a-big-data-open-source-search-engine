import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
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
  setStays: (stays: any[]) => void;
  setParkings: (parkings: any[]) => void;
  setTours: (tours: any[]) => void;
  setShoppings: (shoppings: any[]) => void;
  setFestivals: (festivals: any[]) => void;
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
  setStays,
  setParkings,
  setTours,
  setShoppings,
  setFestivals,
  setCurrentLocation,
  onRestaurantClick,
  externalLocation
}) => {
  const { t } = useTranslation();
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
  const stayMarkers = useRef<Array<{ marker: any, infowindow: any }>>([]); 
  const parkingMarkers = useRef<Array<{ marker: any, infowindow: any }>>([]); 
  const tourMarkers = useRef<Array<{ marker: any, infowindow: any }>>([]); 
  const shoppingMarkers = useRef<Array<{ marker: any, infowindow: any }>>([]); 
  const festivalMarkers = useRef<Array<{ marker: any, infowindow: any }>>([]); 
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
      alert(t('map.search.restaurantError'));
    }
  }, [setRestaurants]);

  /* 숙소 데이터 가져오기 */
  const fetchStays = useCallback(async (lat: number, lng: number, radiusKm: number, keyword?: string) => {
    try {
      const baseUrl = new URL("http://localhost:8484/api/stay/search");
      baseUrl.searchParams.set("page", "1");
      baseUrl.searchParams.set("size", "100");
      if (keyword) {
        baseUrl.searchParams.set("keyword", keyword);
      }

      const response = await fetch(baseUrl.toString());
      const data = await response.json();
      const resultsArray = data?.list || [];

      if (resultsArray.length === 0) {
        setStays([]);
        displayStayMarkers([]);
        return;
      }

      const nearbyStays = resultsArray
        .filter((stay: any) => {
          const latValue = Array.isArray(stay.latitude) ? stay.latitude[0] : stay.latitude;
          const lngValue = Array.isArray(stay.longitude) ? stay.longitude[0] : stay.longitude;
          if (latValue === undefined || lngValue === undefined) return false;

          const stayLat = typeof latValue === 'string' ? parseFloat(latValue) : Number(latValue);
          const stayLng = typeof lngValue === 'string' ? parseFloat(lngValue) : Number(lngValue);
          if (isNaN(stayLat) || isNaN(stayLng)) return false;

          const distance = getDistance(lat, lng, stayLat, stayLng);
          return distance <= radiusKm;
        })
        .map((stay: any) => {
          const latValue = Array.isArray(stay.latitude) ? stay.latitude[0] : stay.latitude;
          const lngValue = Array.isArray(stay.longitude) ? stay.longitude[0] : stay.longitude;
          const stayLat = typeof latValue === 'string' ? parseFloat(latValue) : Number(latValue);
          const stayLng = typeof lngValue === 'string' ? parseFloat(lngValue) : Number(lngValue);

          return {
            id: stay.content_id || stay.id,
            title: stay.title,
            address: stay.address,
            latitude: stayLat,
            longitude: stayLng,
            image: stay.firstimage,
            description: stay.overview,
            type: stay.type,
            distance: getDistance(lat, lng, stayLat, stayLng)
          };
        })
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, 30);

      setStays(nearbyStays);
      displayStayMarkers(nearbyStays);
    } catch (error) {
      console.error("숙소 데이터 불러오기 실패:", error);
      alert(t('map.search.accommodationError'));
    }
  }, [setStays]);

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

  /* Solr에서 명소(tour) 데이터 가져오기 */
  const fetchTours = useCallback(async (lat: number, lng: number, radiusKm: number) => {
    try {
      console.log("🏛️ 명소 데이터 가져오기 시작...", { lat, lng, radiusKm });
      const response = await fetch("http://localhost:8484/api/search");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      const resultsArray = Array.isArray(data) ? data : (data?.list || []);
      console.log(">>> 명소 데이터 수:", resultsArray.length);
      console.log(">>> 첫 번째 데이터:", resultsArray[0]);
      console.log(">>> 현재 위치:", { lat, lng, radiusKm });
      
      if (resultsArray.length === 0) {
        console.log("⚠️ 명소 데이터가 없습니다.");
        setTours([]);
        displayTourMarkers([]);
        return;
      }

      // 좌표가 있는 명소만 필터링하고 거리 계산
      const nearbyTours = resultsArray
        .filter((tour: any) => {
          // TourDTO에서 latitude, longitude는 String 타입
          const latValue = tour.latitude || tour.lat;
          const lngValue = tour.longitude || tour.lng;
          
          if (!latValue || !lngValue) {
            console.log("❌ 좌표 없음:", tour.spotId || tour.id, tour.title);
            return false;
          }
          
          // 배열이면 첫 번째 요소 사용 (Solr 직접 응답인 경우)
          const tourLatStr = Array.isArray(latValue) ? latValue[0] : latValue;
          const tourLngStr = Array.isArray(lngValue) ? lngValue[0] : lngValue;
          
          const tourLat = typeof tourLatStr === 'string' ? parseFloat(tourLatStr) : Number(tourLatStr);
          const tourLng = typeof tourLngStr === 'string' ? parseFloat(tourLngStr) : Number(tourLngStr);
          
          console.log("🔍 좌표 체크:", tour.spotId || tour.id, { tourLat, tourLng });
          
          if (isNaN(tourLat) || isNaN(tourLng)) {
            console.log("❌ 좌표 변환 실패:", tour.spotId || tour.id);
            return false;
          }

          const distance = getDistance(lat, lng, tourLat, tourLng);
          console.log("📏 거리:", tour.spotId || tour.id, distance.toFixed(2) + "km");
          return distance <= radiusKm;
        })
        .map((tour: any) => {
          const latValue = tour.latitude || tour.lat;
          const lngValue = tour.longitude || tour.lng;
          
          const tourLatStr = Array.isArray(latValue) ? latValue[0] : latValue;
          const tourLngStr = Array.isArray(lngValue) ? lngValue[0] : lngValue;
          
          const tourLat = typeof tourLatStr === 'string' ? parseFloat(tourLatStr) : Number(tourLatStr);
          const tourLng = typeof tourLngStr === 'string' ? parseFloat(tourLngStr) : Number(tourLngStr);
          
          return {
            id: tour.spotId || tour.id,
            title: tour.title,
            address: tour.address,
            image_url: tour.imageUrl || tour.image_url,
            latitude: tourLat,
            longitude: tourLng,
            tel: tour.tel,
            homepage: tour.homepage,
            description: tour.description,
            theme_id: tour.themeId || tour.theme_id,
            distance: getDistance(lat, lng, tourLat, tourLng)
          };
        })
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, 30);
      
      console.log("✅ 필터링된 명소 수:", nearbyTours.length);
      console.log("✅ 필터링된 첫 번째 데이터:", nearbyTours[0]);
      
      setTours(nearbyTours);
      displayTourMarkers(nearbyTours);

    } catch (error: any) {
      console.error("❌ 명소 데이터 불러오기 실패:", error);
      
      // 연결 오류인 경우 더 자세한 메시지 표시
      if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        console.error("백엔드 서버(localhost:8484)가 실행 중인지 확인해주세요.");
        setTours([]);
        displayTourMarkers([]);
      } else {
        alert("명소 데이터를 불러오는데 실패했습니다: " + (error.message || error));
        setTours([]);
        displayTourMarkers([]);
      }
    }
  }, [setTours]);

  /* 축제 데이터 가져오기 */
  const fetchFestivals = useCallback(async (lat: number, lng: number, radiusKm: number, keyword?: string) => {
    try {
      const base = new URL("http://localhost:8484/api/festival/search");
      base.searchParams.set("page", "1");
      base.searchParams.set("size", "100");
      if (keyword) {
        base.searchParams.set("keyword", keyword);
      }

      const response = await fetch(base.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const resultsArray = data?.list || [];

      if (resultsArray.length === 0) {
        setFestivals([]);
        displayFestivalMarkers([]);
        return;
      }

      const nearbyFestivals = resultsArray
        .filter((festival: any) => {
          const latValue = festival.lat || festival.latitude;
          const lngValue = festival.lng || festival.longitude;
          if (latValue === undefined || lngValue === undefined) return false;
          const festLat = typeof latValue === 'string' ? parseFloat(latValue) : Number(latValue);
          const festLng = typeof lngValue === 'string' ? parseFloat(lngValue) : Number(lngValue);
          if (isNaN(festLat) || isNaN(festLng)) return false;
          const distance = getDistance(lat, lng, festLat, festLng);
          return distance <= radiusKm;
        })
        .map((festival: any) => {
          const festLat = typeof festival.lat === 'string' ? parseFloat(festival.lat) : Number(festival.lat || festival.latitude);
          const festLng = typeof festival.lng === 'string' ? parseFloat(festival.lng) : Number(festival.lng || festival.longitude);
          return {
            id: festival.ucSeq || festival.id,
            title: festival.mainTitle || festival.title,
            address: festival.addr1 || festival.place,
            latitude: festLat,
            longitude: festLng,
            image: festival.mainImgNormal,
            description: festival.description,
            period: festival.period,
            status: festival.status,
            distance: getDistance(lat, lng, festLat, festLng),
            type: 'FESTIVAL'
          };
        })
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, 30);

      setFestivals(nearbyFestivals);
      displayFestivalMarkers(nearbyFestivals);
    } catch (error) {
      console.error("❌ 축제 데이터 불러오기 실패:", error);
      alert("축제 데이터를 불러오는데 실패했습니다.");
    }
  }, [setFestivals]);

  /* Solr에서 기념품(shopping) 데이터 가져오기 */
  const fetchShoppings = useCallback(async (lat: number, lng: number, radiusKm: number) => {
    try {
      console.log("🛍️ 기념품 데이터 가져오기 시작...", { lat, lng, radiusKm });
      const response = await fetch("http://localhost:8484/api/shopping/search?page=1&size=100");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const resultsArray = data?.items || [];
      console.log(">>> 기념품 데이터 수:", resultsArray.length);
      console.log(">>> 첫 번째 데이터:", resultsArray[0]);
      console.log(">>> 현재 위치:", { lat, lng, radiusKm });
      
      if (resultsArray.length === 0) {
        console.log("⚠️ 기념품 데이터가 없습니다.");
        setShoppings([]);
        displayShoppingMarkers([]);
        return;
      }

      // 좌표가 있는 기념품만 필터링하고 거리 계산
      const nearbyShoppings = resultsArray
        .filter((shopping: any) => {
          const latValue = shopping.lat;
          const lngValue = shopping.lng;
          
          if (!latValue || !lngValue) {
            console.log("❌ 좌표 없음:", shopping.id, shopping.title || shopping.main_title);
            return false;
          }
          
          // 배열이면 첫 번째 요소 사용
          const shoppingLatStr = Array.isArray(latValue) ? latValue[0] : latValue;
          const shoppingLngStr = Array.isArray(lngValue) ? lngValue[0] : lngValue;
          
          const shoppingLat = typeof shoppingLatStr === 'string' ? parseFloat(shoppingLatStr) : Number(shoppingLatStr);
          const shoppingLng = typeof shoppingLngStr === 'string' ? parseFloat(shoppingLngStr) : Number(shoppingLngStr);
          
          console.log("🔍 좌표 체크:", shopping.id, { shoppingLat, shoppingLng });
          
          if (isNaN(shoppingLat) || isNaN(shoppingLng)) {
            console.log("❌ 좌표 변환 실패:", shopping.id);
            return false;
          }

          const distance = getDistance(lat, lng, shoppingLat, shoppingLng);
          console.log("📏 거리:", shopping.id, distance.toFixed(2) + "km");
          return distance <= radiusKm;
        })
        .map((shopping: any) => {
          const latValue = shopping.lat;
          const lngValue = shopping.lng;
          
          const shoppingLatStr = Array.isArray(latValue) ? latValue[0] : latValue;
          const shoppingLngStr = Array.isArray(lngValue) ? lngValue[0] : lngValue;
          
          const shoppingLat = typeof shoppingLatStr === 'string' ? parseFloat(shoppingLatStr) : Number(shoppingLatStr);
          const shoppingLng = typeof shoppingLngStr === 'string' ? parseFloat(shoppingLngStr) : Number(shoppingLngStr);
          
          return {
            id: shopping.id,
            title: shopping.title || shopping.main_title,
            main_title: shopping.main_title,
            address: shopping.addr1,
            gugun_nm: shopping.gugun_nm,
            lat: shopping.lat,
            lng: shopping.lng,
            latitude: shoppingLat,
            longitude: shoppingLng,
            main_img_normal: shopping.main_img_normal,
            main_img_thumb: shopping.main_img_thumb,
            cntct_tel_s: shopping.cntct_tel_s,
            homepage_url: shopping.homepage_url,
            usage_day_week_and_time: shopping.usage_day_week_and_time,
            itemcntnts: shopping.itemcntnts,
            distance: getDistance(lat, lng, shoppingLat, shoppingLng)
          };
        })
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, 30);
      
      console.log("✅ 필터링된 기념품 수:", nearbyShoppings.length);
      console.log("✅ 필터링된 첫 번째 데이터:", nearbyShoppings[0]);
      
      setShoppings(nearbyShoppings);
      displayShoppingMarkers(nearbyShoppings);

    } catch (error: any) {
      console.error("❌ 기념품 데이터 불러오기 실패:", error);
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        console.error("백엔드 서버(localhost:8484)가 실행 중인지 확인해주세요.");
        setShoppings([]);
        displayShoppingMarkers([]);
      } else {
        alert("기념품 데이터를 불러오는데 실패했습니다: " + (error.message || error));
        setShoppings([]);
        displayShoppingMarkers([]);
      }
    }
  }, [setShoppings]);

  /* Solr에서 주차장 데이터 가져오기 */
  const fetchParkings = useCallback(async (lat: number, lng: number, radiusKm: number) => {
    try {
      console.log("🅿️ 주차장 데이터 가져오기 시작...", { lat, lng, radiusKm });
      const response = await fetch("http://localhost:8484/api/parking/search?page=1&size=100");
      const data = await response.json();

      const resultsArray = Array.isArray(data) ? data : (data?.list || []);
      console.log(">>> 주차장 데이터 수:", resultsArray.length);
      console.log(">>> 첫 번째 데이터:", resultsArray[0]);
      console.log(">>> 현재 위치:", { lat, lng, radiusKm });
      
      if (resultsArray.length === 0) {
        console.log("⚠️ 주차장 데이터가 없습니다.");
        setParkings([]);
        displayParkingMarkers([]);
        return;
      }

      // 좌표가 있는 주차장만 필터링하고 거리 계산
      const nearbyParkings = resultsArray
        .filter((parking: any) => {
          // API 응답 형식 확인 및 좌표 추출
          // Solr에 저장된 형식: lat 필드에 위도, lng 필드에 경도가 저장되어야 함
          // 하지만 실제로는 반대로 저장되어 있을 수 있으므로 두 경우 모두 처리
          let latValue = parking.latitude || parking.lat;
          let lngValue = parking.longitude || parking.lng;
          
          if (!latValue || !lngValue) {
            console.log("❌ 좌표 없음:", parking.id || parking.mgntNum, parking.name || parking.title);
            return false;
          }
          
          // 배열이면 첫 번째 요소 사용
          let parkingLatStr = Array.isArray(latValue) ? latValue[0] : latValue;
          let parkingLngStr = Array.isArray(lngValue) ? lngValue[0] : lngValue;
          
          let parkingLat = typeof parkingLatStr === 'string' ? parseFloat(parkingLatStr) : Number(parkingLatStr);
          let parkingLng = typeof parkingLngStr === 'string' ? parseFloat(parkingLngStr) : Number(parkingLngStr);
          
          // 좌표가 반대로 저장된 경우 자동 교정 (부산 지역: 위도 35.x, 경도 129.x)
          // 위도는 33~38 사이, 경도는 124~132 사이가 한국 범위
          if (parkingLat > 100 || parkingLng < 100) {
            // lat이 100보다 크면 경도값, lng이 100보다 작으면 위도값
            console.log("⚠️ 좌표 교정 필요:", { 원본: { lat: parkingLat, lng: parkingLng } });
            [parkingLat, parkingLng] = [parkingLng, parkingLat]; // 교체
            console.log("✅ 좌표 교정 후:", { lat: parkingLat, lng: parkingLng });
          }
          
          console.log("🔍 좌표 체크:", parking.id || parking.mgntNum, { parkingLat, parkingLng });
          
          if (isNaN(parkingLat) || isNaN(parkingLng)) {
            console.log("❌ 좌표 변환 실패:", parking.id || parking.mgntNum);
            return false;
          }

          const distance = getDistance(lat, lng, parkingLat, parkingLng);
          console.log("📏 거리:", parking.id || parking.mgntNum, distance.toFixed(2) + "km");
          return distance <= radiusKm;
        })
        .map((parking: any) => {
          let latValue = parking.latitude || parking.lat;
          let lngValue = parking.longitude || parking.lng;
          
          let parkingLatStr = Array.isArray(latValue) ? latValue[0] : latValue;
          let parkingLngStr = Array.isArray(lngValue) ? lngValue[0] : lngValue;
          
          let parkingLat = typeof parkingLatStr === 'string' ? parseFloat(parkingLatStr) : Number(parkingLatStr);
          let parkingLng = typeof parkingLngStr === 'string' ? parseFloat(parkingLngStr) : Number(parkingLngStr);
          
          // 좌표가 반대로 저장된 경우 자동 교정
          if (parkingLat > 100 || parkingLng < 100) {
            [parkingLat, parkingLng] = [parkingLng, parkingLat];
          }
          
          // API 응답 필드명 처리 (name/title, basicFee/fee_basic 등)
          const title = parking.name || parking.title;
          const address = parking.address;
          const tel = parking.tel;
          const fee_basic = parking.basicFee || parking.fee_basic;
          const type = parking.type;
          const parkingId = parking.id || `parking_${parking.mgntNum}`;
          
          return {
            id: parkingId,
            title: title,
            address: address,
            tel: tel,
            fee_basic: fee_basic,
            type: type,
            latitude: parkingLat,
            longitude: parkingLng,
            distance: getDistance(lat, lng, parkingLat, parkingLng)
          };
        })
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, 30);
      
      console.log("✅ 필터링된 주차장 수:", nearbyParkings.length);
      console.log("✅ 필터링된 첫 번째 데이터:", nearbyParkings[0]);
      
      setParkings(nearbyParkings);
      displayParkingMarkers(nearbyParkings);

    } catch (error) {
      console.error("❌ 주차장 데이터 불러오기 실패:", error);
      alert("주차장 데이터를 불러오는데 실패했습니다.");
    }
  }, [setParkings]);

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
    if (activeCategories.includes('숙소')) {
      fetchStays(lat, lng, newDistanceKm, searchKeyword);
    }
    if (activeCategories.includes('주차장')) {
      fetchParkings(lat, lng, newDistanceKm);
    }
    if (activeCategories.includes('명소')) {
      fetchTours(lat, lng, newDistanceKm);
    }
    if (activeCategories.includes('축제')) {
      fetchFestivals(lat, lng, newDistanceKm, searchKeyword);
    }
    if (activeCategories.includes('여행코스 기념품')) {
      fetchShoppings(lat, lng, newDistanceKm);
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
  }, [activeCategories, fetchUrbans, setUrbans, searchRadiusKm]); 

  /* 숙소 카테고리 선택 시 처리 */
  useEffect(() => {
    if (activeCategories.includes('숙소')) {
      const { lat, lng } = currentLocation.current || { lat: 35.1796, lng: 129.0756 };
      fetchStays(lat, lng, searchRadiusKm, searchKeyword);
    } else {
      clearStayMarkers();
      setStays([]);
    }
  }, [activeCategories, fetchStays, setStays, searchRadiusKm, searchKeyword]);

  /* 주차장 카테고리 선택 시 처리 */
  useEffect(() => {
    if (activeCategories.includes('주차장')) {
      const { lat, lng } = currentLocation.current || { lat: 35.1796, lng: 129.0756 };
      fetchParkings(lat, lng, searchRadiusKm);
    } else {
      clearParkingMarkers();
      setParkings([]);
    }
  }, [activeCategories, fetchParkings, setParkings, searchRadiusKm]);

  /* 명소 카테고리 선택 시 처리 */
  useEffect(() => {
    if (activeCategories.includes('명소')) {
      const { lat, lng } = currentLocation.current || { lat: 35.1796, lng: 129.0756 };
      fetchTours(lat, lng, searchRadiusKm);
    } else {
      clearTourMarkers();
      setTours([]);
    }
  }, [activeCategories, fetchTours, setTours, searchRadiusKm]);

  /* 축제 카테고리 선택 시 처리 */
  useEffect(() => {
    if (activeCategories.includes('축제')) {
      const { lat, lng } = currentLocation.current || { lat: 35.1796, lng: 129.0756 };
      fetchFestivals(lat, lng, searchRadiusKm, searchKeyword);
    } else {
      clearFestivalMarkers();
      setFestivals([]);
    }
  }, [activeCategories, fetchFestivals, setFestivals, searchRadiusKm, searchKeyword]);

  /* 기념품 카테고리 선택 시 처리 */
  useEffect(() => {
    if (activeCategories.includes('여행코스 기념품')) {
      const { lat, lng } = currentLocation.current || { lat: 35.1796, lng: 129.0756 };
      fetchShoppings(lat, lng, searchRadiusKm);
    } else {
      clearShoppingMarkers();
      setShoppings([]);
    }
  }, [activeCategories, fetchShoppings, setShoppings, searchRadiusKm]);
  
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

  /* 숙소 마커 제거 */
  const clearStayMarkers = () => {
    stayMarkers.current.forEach(item => item.marker.setMap(null));
    stayMarkers.current = [];
  };

  /* 주차장 마커 제거 */
  const clearParkingMarkers = () => {
    parkingMarkers.current.forEach(item => item.marker.setMap(null));
    parkingMarkers.current = [];
  };

  /* 명소 마커 제거 */
  const clearTourMarkers = () => {
    tourMarkers.current.forEach(item => item.marker.setMap(null));
    tourMarkers.current = [];
  };

  /* 축제 마커 제거 */
  const clearFestivalMarkers = () => {
    festivalMarkers.current.forEach(item => item.marker.setMap(null));
    festivalMarkers.current = [];
  };

  /* 기념품 마커 제거 */
  const clearShoppingMarkers = () => {
    shoppingMarkers.current.forEach(item => item.marker.setMap(null));
    shoppingMarkers.current = [];
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

  /* 숙소 마커 표시 (보라색 핀 마커 사용) */
  const displayStayMarkers = (stays: any[]) => {
    clearStayMarkers();
    const map = mapRef.current;
    if (!map) return;

    stays.forEach(stay => {
      const position = new window.kakao.maps.LatLng(stay.latitude, stay.longitude);
      const content = createCustomMarkerContent(MARKER_COLORS.STAY);
      
      content.onclick = () => onRestaurantClick(stay);

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position,
        content: content,
        yAnchor: 1
      });

      customOverlay.setMap(map);
      
      const title = Array.isArray(stay.title) ? stay.title[0] : stay.title;
      const subtitle = Array.isArray(stay.address) ? stay.address[0] : stay.address;
      
      const infowindow = new window.kakao.maps.InfoWindow({
        content: createInfoWindowContent(title, subtitle, stay.distance)
      });

      stayMarkers.current.push({ marker: customOverlay, infowindow });
    });
  };

  /* 주차장 마커 표시 (회색 핀 마커 사용) */
  const displayParkingMarkers = (parkings: any[]) => {
    clearParkingMarkers();
    const map = mapRef.current;
    if (!map) return;

    parkings.forEach(parking => {
      const position = new window.kakao.maps.LatLng(parking.latitude, parking.longitude);
      const content = createCustomMarkerContent(MARKER_COLORS.PARKING);
      
      content.onclick = () => onRestaurantClick(parking);

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position,
        content: content,
        yAnchor: 1
      });

      customOverlay.setMap(map);
      
      const title = Array.isArray(parking.title) ? parking.title[0] : parking.title;
      const subtitle = Array.isArray(parking.address) ? parking.address[0] : parking.address;
      
      const infowindow = new window.kakao.maps.InfoWindow({
        content: createInfoWindowContent(title, subtitle, parking.distance)
      });

      parkingMarkers.current.push({ marker: customOverlay, infowindow });
    });
  };

  /* 명소 마커 표시 (초록색 핀 마커 사용) */
  const displayTourMarkers = (tours: any[]) => {
    clearTourMarkers();
    const map = mapRef.current;
    if (!map) return;

    tours.forEach(tour => {
      const position = new window.kakao.maps.LatLng(tour.latitude, tour.longitude);
      const content = createCustomMarkerContent(MARKER_COLORS.TOUR);
      
      content.onclick = () => onRestaurantClick(tour);

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position,
        content: content,
        yAnchor: 1
      });

      customOverlay.setMap(map);
      
      const title = Array.isArray(tour.title) ? tour.title[0] : tour.title;
      const subtitle = Array.isArray(tour.address) ? tour.address[0] : tour.address;
      
      const infowindow = new window.kakao.maps.InfoWindow({
        content: createInfoWindowContent(title, subtitle, tour.distance)
      });

      tourMarkers.current.push({ marker: customOverlay, infowindow });
    });
  };

  /* 축제 마커 표시 */
  const displayFestivalMarkers = (festivals: any[]) => {
    clearFestivalMarkers();
    const map = mapRef.current;
    if (!map) return;

    festivals.forEach(festival => {
      const position = new window.kakao.maps.LatLng(festival.latitude, festival.longitude);
      const content = createCustomMarkerContent(MARKER_COLORS.FESTIVAL);

      content.onclick = () => onRestaurantClick(festival);

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position,
        content: content,
        yAnchor: 1
      });

      customOverlay.setMap(map);

      const title = Array.isArray(festival.title) ? festival.title[0] : festival.title;
      const subtitle = Array.isArray(festival.address) ? festival.address[0] : festival.address;

      const infowindow = new window.kakao.maps.InfoWindow({
        content: createInfoWindowContent(title, subtitle, festival.distance)
      });

      festivalMarkers.current.push({ marker: customOverlay, infowindow });
    });
  };

  /* 기념품 마커 표시 (핑크색 핀 마커 사용) */
  const displayShoppingMarkers = (shoppings: any[]) => {
    clearShoppingMarkers();
    const map = mapRef.current;
    if (!map) return;

    shoppings.forEach(shopping => {
      const position = new window.kakao.maps.LatLng(shopping.latitude, shopping.longitude);
      const content = createCustomMarkerContent(MARKER_COLORS.SHOPPING);
      
      content.onclick = () => onRestaurantClick(shopping);

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position,
        content: content,
        yAnchor: 1
      });

      customOverlay.setMap(map);
      
      const title = Array.isArray(shopping.title) ? shopping.title[0] : (shopping.title || (Array.isArray(shopping.main_title) ? shopping.main_title[0] : shopping.main_title));
      const subtitle = Array.isArray(shopping.address) ? shopping.address[0] : shopping.address;
      
      const infowindow = new window.kakao.maps.InfoWindow({
        content: createInfoWindowContent(title, subtitle, shopping.distance)
      });

      shoppingMarkers.current.push({ marker: customOverlay, infowindow });
    });
  };

  /* 현재 위치 버튼 */
  const handleFindMyLocation = () => {
    if (!navigator.geolocation) {
      alert(t('map.search.browserNotSupported'));
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

            // 숙소 카테고리가 활성화되어 있으면 숙소 데이터 가져오기
            if (activeCategories.includes('숙소')) {
              fetchStays(lat, lng, searchRadiusKm, searchKeyword);
            }

            // 주차장 카테고리가 활성화되어 있으면 주차장 데이터 가져오기
            if (activeCategories.includes('주차장')) {
              fetchParkings(lat, lng, searchRadiusKm);
            }

            // 명소 카테고리가 활성화되어 있으면 명소 데이터 가져오기
            if (activeCategories.includes('명소')) {
              fetchTours(lat, lng, searchRadiusKm);
            }

            // 축제 카테고리가 활성화되어 있으면 축제 데이터 가져오기
            if (activeCategories.includes('축제')) {
              fetchFestivals(lat, lng, searchRadiusKm, searchKeyword);
            }

            // 기념품 카테고리가 활성화되어 있으면 기념품 데이터 가져오기
            if (activeCategories.includes('여행코스 기념품')) {
              fetchShoppings(lat, lng, searchRadiusKm);
            }
          }
        );
      },

      () => alert(t('map.search.permissionDenied'))
    );
  };

  // 슬라이더 팝업 토글 함수
  const toggleSlider = () => {
    setIsSliderOpen(prev => !prev);
  }

  // 검색 실행 함수
  const handleSearch = () => {
    if (!currentLocation.current) {
      alert(t('map.search.setLocationFirst'));
      return;
    }
    const { lat, lng } = currentLocation.current;
    if (activeCategories.includes('음식점')) {
      fetchRestaurants(lat, lng, searchRadiusKm, searchKeyword);
    }
    if (activeCategories.includes('숙소')) {
      fetchStays(lat, lng, searchRadiusKm, searchKeyword);
    }
    if (activeCategories.includes('축제')) {
      fetchFestivals(lat, lng, searchRadiusKm, searchKeyword);
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
            placeholder={t('map.search.placeholder')}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="btn-search" onClick={handleSearch}>
            🔍
          </button>
        </div>
        <button className="btn-my-location-top" onClick={handleFindMyLocation}>
          📍 {t('map.search.searchFromCurrentLocation')}
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