import React, { useState } from "react";
import "../map/map.css";
import Sidebar from "../map/Sidebar";
import KakaoMap from "../map/KaKaoMap";

const MapPage: React.FC = () => {
  const [sidebarInfo, setSidebarInfo] = useState(null);
  const [open, setOpen] = useState(true); // 기본 열림

  return (
    <div className="map-page">
      
      <Sidebar info={sidebarInfo} open={open} />

      {/* 지도 */}
      <KakaoMap setSidebarInfo={setSidebarInfo} />

     
      <button
        className={`sidebar-arrow-btn ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        {open ? "❮" : "❯"}
      </button>
    </div>
  );
};

export default MapPage;
