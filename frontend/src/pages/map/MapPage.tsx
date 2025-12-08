import React, { useState, useEffect } from "react";
import "../map/map.css";
import Sidebar from "../map/Sidebar";
import KakaoMap from "../map/KaKaoMap";
import MapDetail from "../map/map_detail";

const MapPage: React.FC = () => {
  const [sidebarInfo, setSidebarInfo] = useState(null);
  const [open, setOpen] = useState(true);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [walks, setWalks] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [marines, setMarines] = useState<any[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any | null>(null);

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
      />

      <KakaoMap 
        setSidebarInfo={setSidebarInfo}
        activeCategories={activeCategories}
        setRestaurants={setRestaurants}
        setWalks={setWalks}
        setThemes={setThemes}
        setMarines={setMarines}
        onRestaurantClick={(restaurant) => setSelectedRestaurant(restaurant)}
      />
     
      <button
        className={`sidebar-arrow-btn ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        {open ? "❮" : "❯"}
      </button>

      <MapDetail 
        restaurant={selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
      />
    </div>
  );
};

export default MapPage;