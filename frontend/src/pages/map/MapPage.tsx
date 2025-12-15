import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../map/map.css";
import Sidebar from "../map/Sidebar";
import KakaoMap from "../map/KaKaoMap";
import MapDetail from "../map/map_detail";

const MapPage: React.FC = () => {
  const location = useLocation();
  const stateData = location.state as { 
    lat?: number; 
    lng?: number; 
    title?: string;
    placeId?: string;
    placeType?: string;
    placeData?: any;
  } | null;
  
  const [sidebarInfo, setSidebarInfo] = useState(null);
  const [open, setOpen] = useState(true);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [walks, setWalks] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [marines, setMarines] = useState<any[]>([]);
  const [urbans, setUrbans] = useState<any[]>([]);
  const [stays, setStays] = useState<any[]>([]);
  const [parkings, setParkings] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [shoppings, setShoppings] = useState<any[]>([]);
  const [festivals, setFestivals] = useState<any[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(
    stateData ? { lat: stateData.lat!, lng: stateData.lng! } : null
  );
  const [externalLocation, setExternalLocation] = useState<{ lat: number; lng: number; title: string } | null>(
    stateData ? { lat: stateData.lat!, lng: stateData.lng!, title: stateData.title || '' } : null
  );
  
  // 리뷰에서 온 경우 장소 디테일 열기
  useEffect(() => {
    if (stateData?.placeData) {
      const place = stateData.placeData;
      // placeData를 맵 디테일 형식에 맞게 변환
      const formattedPlace = {
        id: place.id || stateData.placeId,
        place_id: place.id || stateData.placeId,
        title: place.title || place.main_title || place.name,
        address: place.address || place.addr1,
        latitude: place.latitude,
        longitude: place.longitude,
        image_url: place.image_url || place.firstimage,
        description: place.description || place.overview,
        type: stateData.placeType
      };
      setSelectedRestaurant(formattedPlace);
      
      // 위치가 있으면 지도 중심 이동 및 externalLocation 설정
      if (place.latitude && place.longitude) {
        const lat = typeof place.latitude === 'string' ? parseFloat(place.latitude) : place.latitude;
        const lng = typeof place.longitude === 'string' ? parseFloat(place.longitude) : place.longitude;
        
        if (!isNaN(lat) && !isNaN(lng)) {
          const location = {
            lat,
            lng
          };
          setCurrentLocation(location);
          // externalLocation 설정 - 지도 로드에 필요
          setExternalLocation({
            lat,
            lng,
            title: formattedPlace.title || ''
          });
          console.log('📍 리뷰에서 전달된 위치 설정:', { lat, lng, title: formattedPlace.title });
        } else {
          console.warn('⚠️ 유효하지 않은 위치 정보:', { latitude: place.latitude, longitude: place.longitude });
        }
      } else {
        console.warn('⚠️ 위치 정보가 없습니다:', place);
      }
    }
  }, [stateData]);

  // 컴포넌트 마운트 시 푸터 숨기기
  useEffect(() => {
    // 푸터 찾아서 숨기기
    const footer = document.querySelector('footer');
    const footerWithClass = document.querySelector('.footer');
    
    if (footer) {
      (footer as HTMLElement).style.display = 'none';
    }
    if (footerWithClass) {
      (footerWithClass as HTMLElement).style.display = 'none';
    }

    // body에 클래스 추가 (CSS로 제어하기 위해)
    document.body.classList.add('map-page-active');

    // 컴포넌트 언마운트 시 푸터 다시 보이기
    return () => {
      if (footer) {
        (footer as HTMLElement).style.display = 'block';
      }
      if (footerWithClass) {
        (footerWithClass as HTMLElement).style.display = 'block';
      }
      document.body.classList.remove('map-page-active');
    };
  }, []);

  const handleCategoryClick = (category: string) => {
    if (activeCategories.includes(category)) {
      setActiveCategories(activeCategories.filter(c => c !== category));
    } else {
      setActiveCategories([...activeCategories, category]);
    }
  };

  return (
    <div className="map-page">
      <Sidebar 
        info={sidebarInfo} 
        open={open}
        activeCategories={activeCategories}
        onCategoryClick={handleCategoryClick}
        restaurants={restaurants}
        onRestaurantClick={(restaurant) => setSelectedRestaurant(restaurant)}
        walks={walks}
        onWalkClick={(walk) => setSelectedRestaurant(walk)}
        themes={themes}
        onThemeClick={(theme) => setSelectedRestaurant(theme)}
        marines={marines}
        onMarineClick={(marine) => setSelectedRestaurant(marine)}
        urbans={urbans}
        onUrbanClick={(urban) => setSelectedRestaurant(urban)}
        stays={stays}
        onStayClick={(stay) => setSelectedRestaurant(stay)}
        parkings={parkings}
        onParkingClick={(parking) => setSelectedRestaurant(parking)}
        tours={tours}
        onTourClick={(tour) => setSelectedRestaurant(tour)}
        shoppings={shoppings}
        onShoppingClick={(shopping) => setSelectedRestaurant(shopping)}
        festivals={festivals}
        onFestivalClick={(festival) => setSelectedRestaurant(festival)}
      />

      <KakaoMap 
        setSidebarInfo={setSidebarInfo}
        activeCategories={activeCategories}
        setRestaurants={setRestaurants}
        setWalks={setWalks}
        setThemes={setThemes}
        setMarines={setMarines}
        setUrbans={setUrbans}
        setStays={setStays}
        setParkings={setParkings}
        setTours={setTours}
        setShoppings={setShoppings}
        setFestivals={setFestivals}
        setCurrentLocation={setCurrentLocation}
        onRestaurantClick={(restaurant) => setSelectedRestaurant(restaurant)}
        externalLocation={externalLocation}
      />
     
      <button
        className={`sidebar-arrow-btn ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        {open ? "❮" : "❯"}
      </button>

      <MapDetail 
        restaurant={selectedRestaurant}
        currentLocation={currentLocation}
        onClose={() => setSelectedRestaurant(null)}
      />
    </div>
  );
};

export default MapPage;