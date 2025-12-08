import React, { useState } from "react";
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
  const [selectedRestaurant, setSelectedRestaurant] = useState<any | null>(null);

  const handleCategoryClick = (category: string) => {
    if (activeCategories.includes(category)) {
      // 이미 선택되어 있으면 제거
      setActiveCategories(activeCategories.filter(c => c !== category));
    } else {
      // 선택되어 있지 않으면 추가
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
      />

      <KakaoMap 
        setSidebarInfo={setSidebarInfo}
        activeCategories={activeCategories}
        setRestaurants={setRestaurants}
        setWalks={setWalks}
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