import React, { useState } from "react";
import "./map_detail.css";

interface MapDetailProps {
  restaurant: any | null;
  onClose: () => void;
}

const MapDetail: React.FC<MapDetailProps> = ({ restaurant, onClose }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  if (!restaurant) return null;

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    // TODO: 즐겨찾기 저장 로직 구현
  };

  // 배열 형태의 데이터 처리
  const getValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value[0] || "";
    }
    return value || "";
  };

  const title = getValue(restaurant.title);
  const subtitle = getValue(restaurant.subtitle);
  const address = getValue(restaurant.address);
  const description = getValue(restaurant.description);
  const imageUrl = getValue(restaurant.image || restaurant.image_url);
  const menu = restaurant.menu || restaurant.menu_t || "";
  const openTime = restaurant.opentime_t || "";
  const tags = getValue(restaurant.tags);
  const type = getValue(restaurant.type);
  const distance = restaurant.distance ? restaurant.distance.toFixed(2) : "";
  
  // 도보여행 여부 확인
  const isWalk = type === "WALK";

  return (
    <div className="map-detail-panel">
      <div className="map-detail-container">
        <button className="map-detail-close" onClick={onClose}>
          ✕
        </button>

        <div className="map-detail-header">
          <div className="map-detail-image">
            <img
              src={imageUrl || "https://via.placeholder.com/300?text=No+Image"}
              alt={title}
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/300?text=Food";
              }}
            />
          </div>
          <div className="map-detail-title-wrapper">
            <h2 className="map-detail-title">{title}</h2>
            <button 
              className={`map-detail-favorite ${isFavorite ? 'active' : ''}`}
              onClick={handleFavoriteClick}
              aria-label="즐겨찾기"
            >
              {isFavorite ? '★' : '☆'}
            </button>
          </div>
        </div>

        <div className="map-detail-content">
          {distance && (
            <div className="map-detail-item">
              <span className="map-detail-label">📍 거리</span>
              <span className="map-detail-value">{distance}km</span>
            </div>
          )}

          {isWalk && subtitle && (
            <div className="map-detail-item">
              <span className="map-detail-label">💬 부제</span>
              <span className="map-detail-value">{subtitle}</span>
            </div>
          )}

          {address && (
            <div className="map-detail-item">
              <span className="map-detail-label">📍 주소</span>
              <span className="map-detail-value">{address}</span>
            </div>
          )}

          {isWalk && tags && (
            <div className="map-detail-item">
              <span className="map-detail-label">🚌 교통정보</span>
              <span className="map-detail-value" style={{ whiteSpace: 'pre-line' }}>{tags}</span>
            </div>
          )}

          {!isWalk && menu && (
            <div className="map-detail-item">
              <span className="map-detail-label">🍽️ 대표 메뉴</span>
              <div className="map-detail-menu">
                {menu.split(",").map((item: string, idx: number) => (
                  <span key={idx} className="menu-badge">
                    {item.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!isWalk && openTime && (
            <div className="map-detail-item">
              <span className="map-detail-label">🕐 영업시간</span>
              <span className="map-detail-value">{openTime.replace(/\n/g, " ")}</span>
            </div>
          )}

          {description && (
            <div className="map-detail-item">
              <span className="map-detail-label">📝 설명</span>
              <p className="map-detail-description">{description}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MapDetail;

