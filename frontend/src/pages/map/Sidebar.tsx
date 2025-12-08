import React from "react";
import "./Sidebar.css";

interface SidebarProps {
  open: boolean;
  info: any;
  activeCategories: string[];
  onCategoryClick: (category: string) => void;
  restaurants: any[];
  onRestaurantClick: (restaurant: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  open, 
  info, 
  activeCategories, 
  onCategoryClick,
  restaurants,
  onRestaurantClick
}) => {

  return (
    <div className={`sidebar ${open ? "open" : ""}`}>
      {!info ? (
        <p>현재 위치를 눌러보세요.</p>
      ) : (
        <>
          <div className="location-title">{info.address}</div>

          <div className="weather-box">
            <div className="weather-label">현재 날씨</div>
            <div className="weather-temp">{info.temp}°</div>
            <div className="weather-sky">{info.sky}</div>
            <div className="weather-extra">
              최고 {info.temp + 1}° | 최저 {info.temp - 1}°
            </div>
          </div>

          <div className="category-grid">
            <div className="category-row">
              <div 
                className={`category-item ${activeCategories.includes('주변 여행지') ? 'active' : ''}`}
                onClick={() => onCategoryClick('주변 여행지')}
              >
                <div 
                  className="category-icon" 
                  style={{backgroundColor: activeCategories.includes('주변 여행지') ? '#4CAF50' : '#9E9E9E'}}
                >
                  🚗
                </div>
                <div className="category-label">주변 여행지</div>
              </div>
              <div 
                className={`category-item ${activeCategories.includes('음식점') ? 'active' : ''}`}
                onClick={() => onCategoryClick('음식점')}
              >
                <div 
                  className="category-icon" 
                  style={{backgroundColor: activeCategories.includes('음식점') ? '#FF9800' : '#9E9E9E'}}
                >
                  🍴
                </div>
                <div className="category-label">음식점</div>
              </div>
              <div 
                className={`category-item ${activeCategories.includes('카페') ? 'active' : ''}`}
                onClick={() => onCategoryClick('카페')}
              >
                <div 
                  className="category-icon" 
                  style={{backgroundColor: activeCategories.includes('카페') ? '#E91E63' : '#9E9E9E'}}
                >
                  ☕
                </div>
                <div className="category-label">카페</div>
              </div>
              <div 
                className={`category-item ${activeCategories.includes('숙소') ? 'active' : ''}`}
                onClick={() => onCategoryClick('숙소')}
              >
                <div 
                  className="category-icon" 
                  style={{backgroundColor: activeCategories.includes('숙소') ? '#9C27B0' : '#9E9E9E'}}
                >
                  🏨
                </div>
                <div className="category-label">숙소</div>
              </div>
              <div 
                className={`category-item ${activeCategories.includes('주차장') ? 'active' : ''}`}
                onClick={() => onCategoryClick('주차장')}
              >
                <div 
                  className="category-icon" 
                  style={{backgroundColor: activeCategories.includes('주차장') ? '#607D8B' : '#9E9E9E'}}
                >
                  🅿️
                </div>
                <div className="category-label">주차장</div>
              </div>
            </div>
            <div className="category-row">
              <div 
                className={`category-item ${activeCategories.includes('전기차충전소') ? 'active' : ''}`}
                onClick={() => onCategoryClick('전기차충전소')}
              >
                <div 
                  className="category-icon" 
                  style={{backgroundColor: activeCategories.includes('전기차충전소') ? '#ccc017ff' : '#9E9E9E'}}
                >
                  ⚡
                </div>
                <div className="category-label">전기차<br/>충전소</div>
              </div>
              <div 
                className={`category-item ${activeCategories.includes('품질인증') ? 'active' : ''}`}
                onClick={() => onCategoryClick('품질인증')}
              >
                <div 
                  className="category-icon" 
                  style={{backgroundColor: activeCategories.includes('품질인증') ? '#0b7691ff' : '#9E9E9E'}}
                >
                  📋
                </div>
                <div className="category-label">품질인증<br/>업소추천</div>
              </div>
              <div 
                className={`category-item ${activeCategories.includes('추천테마') ? 'active' : ''}`}
                onClick={() => onCategoryClick('추천테마')}
              >
                <div 
                  className="category-icon" 
                  style={{backgroundColor: activeCategories.includes('추천테마') ? '#59ce16ff' : '#9E9E9E'}}
                >
                  🎭
                </div>
                <div className="category-label">추천테마</div>
              </div>
              <div 
                className={`category-item ${activeCategories.includes('여행코스') ? 'active' : ''}`}
                onClick={() => onCategoryClick('여행코스')}
              >
                <div 
                  className="category-icon" 
                  style={{backgroundColor: activeCategories.includes('여행코스') ? '#0866f1ff' : '#9E9E9E'}}
                >
                  📍
                </div>
                <div className="category-label">여행코스</div>
              </div>
              <div 
                className={`category-item ${activeCategories.includes('나의여행') ? 'active' : ''}`}
                onClick={() => onCategoryClick('나의여행')}
              >
                <div 
                  className="category-icon" 
                  style={{backgroundColor: activeCategories.includes('나의여행') ? '#b80b0bff' : '#9E9E9E'}}
                >
                  💼
                </div>
                <div className="category-label">나의여행</div>
              </div>
            </div>
          </div>

          {/*음식점 목록 표시 */}
          {activeCategories.includes('음식점') && restaurants.length > 0 && (
            <div className="restaurant-list">
              <div className="restaurant-header">
                <h3>🍴 주변 맛집 ({restaurants.length})</h3>
              </div>
              
              <div className="restaurant-items">
                {restaurants.map((restaurant) => (
                  <div 
                    key={restaurant.id} 
                    className="restaurant-card"
                    onClick={() => onRestaurantClick(restaurant)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="restaurant-image">
                      <img 
                        src={restaurant.image || restaurant.image_url || "https://via.placeholder.com/80?text=No+Image"} 
                        alt={restaurant.title}
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/80?text=Food";
                        }}
                      />
                    </div>
                    
                    <div className="restaurant-info">
                      <div className="restaurant-title">
                        {Array.isArray(restaurant.title) ? restaurant.title[0] : restaurant.title}
                      </div>
                      <div className="restaurant-distance">📍 {restaurant.distance.toFixed(2)}km</div>
                      <div className="restaurant-menu">
                        {restaurant.menu && restaurant.menu.split(',').slice(0, 2).map((item: string, idx: number) => (
                          <span key={idx} className="menu-tag">#{item.trim()}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Sidebar;