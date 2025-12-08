import React from "react";
import "./Sidebar.css";

interface SidebarProps {
  open: boolean;
  info: any;
  activeCategories: string[];
  onCategoryClick: (category: string) => void;
  restaurants: any[];
  onRestaurantClick: (restaurant: any) => void;
  walks: any[];
  onWalkClick: (walk: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  open, 
  info, 
  activeCategories, 
  onCategoryClick,
  restaurants,
  onRestaurantClick,
  walks,
  onWalkClick
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
                className={`category-item ${activeCategories.includes('도보여행') ? 'active' : ''}`}
                onClick={() => onCategoryClick('도보여행')}
              >
                <div 
                  className="category-icon" 
                  style={{backgroundColor: activeCategories.includes('도보여행') ? '#0b7691ff' : '#9E9E9E'}}
                >
                  🚶
                </div>
                <div className="category-label">여행코스<br/>도보여행</div>
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
            <div className="restaurant-list" style={{ marginTop: '10px' }}>
              <div className="restaurant-header" style={{ 
                background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
                padding: '12px 15px',
                borderRadius: '8px',
                marginBottom: '10px'
              }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                  🍴 주변 맛집 ({restaurants.length}개)
                </h3>
              </div>
              
              <div className="restaurant-items" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {restaurants.map((restaurant) => (
                  <div 
                    key={restaurant.id} 
                    className="restaurant-card"
                    onClick={() => onRestaurantClick(restaurant)}
                    style={{ 
                      cursor: 'pointer',
                      marginBottom: '10px',
                      padding: '12px',
                      background: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s',
                      display: 'flex',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div className="restaurant-image" style={{ 
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <img 
                        src={restaurant.image || restaurant.image_url || "https://via.placeholder.com/80?text=No+Image"} 
                        alt={restaurant.title}
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/80?text=Food";
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    
                    <div className="restaurant-info" style={{ flex: 1, minWidth: 0 }}>
                      <div className="restaurant-title" style={{ 
                        fontWeight: 'bold',
                        fontSize: '14px',
                        marginBottom: '6px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {Array.isArray(restaurant.title) ? restaurant.title[0] : restaurant.title}
                      </div>
                      <div className="restaurant-distance" style={{ 
                        fontSize: '12px',
                        color: '#666',
                        marginBottom: '6px'
                      }}>
                        📍 {restaurant.distance.toFixed(2)}km
                      </div>
                      <div className="restaurant-menu" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {restaurant.menu && restaurant.menu.split(',').slice(0, 2).map((item: string, idx: number) => (
                          <span key={idx} className="menu-tag" style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            background: '#FFF3E0',
                            color: '#F57C00',
                            borderRadius: '12px'
                          }}>#{item.trim()}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/*도보여행 목록 표시 */}
          {activeCategories.includes('도보여행') && walks.length > 0 && (
            <div className="restaurant-list" style={{ marginTop: '10px' }}>
              <div className="restaurant-header" style={{ 
                background: 'linear-gradient(135deg, #0b7691 0%, #0a5c75 100%)',
                padding: '12px 15px',
                borderRadius: '8px',
                marginBottom: '10px'
              }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                  🚶 도보여행 코스 ({walks.length}개)
                </h3>
              </div>
              
              <div className="restaurant-items" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {walks.map((walk) => (
                  <div 
                    key={walk.id} 
                    className="restaurant-card"
                    onClick={() => onWalkClick(walk)}
                    style={{ 
                      cursor: 'pointer',
                      marginBottom: '10px',
                      padding: '12px',
                      background: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s',
                      display: 'flex',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div className="restaurant-image" style={{ 
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <img 
                        src={walk.image || walk.image_url || "https://via.placeholder.com/80?text=Walk"} 
                        alt={walk.title}
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/80?text=Walk";
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    
                    <div className="restaurant-info" style={{ flex: 1, minWidth: 0 }}>
                      <div className="restaurant-title" style={{ 
                        fontWeight: 'bold',
                        fontSize: '14px',
                        marginBottom: '6px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {Array.isArray(walk.title) ? walk.title[0] : walk.title}
                      </div>
                      <div className="restaurant-distance" style={{ 
                        fontSize: '12px',
                        color: '#666',
                        marginBottom: '6px'
                      }}>
                        📍 {walk.distance.toFixed(2)}km
                      </div>
                      {walk.subtitle && (
                        <div className="restaurant-menu" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <span className="menu-tag" style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            background: '#E0F2F7',
                            color: '#0277BD',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%'
                          }}>{Array.isArray(walk.subtitle) ? walk.subtitle[0] : walk.subtitle}</span>
                        </div>
                      )}
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