import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./Sidebar.css";
import History from "./history";
import { api } from "../../api/axios";
import { getWeatherRecommendations } from "./weatherRecommendation";

interface RecentPlace {
  id: string;
  title: string;
  distance?: number;
  timestamp: number;
}

interface SidebarProps {
  open: boolean;
  info: any;
  activeCategories: string[];
  onCategoryClick: (category: string) => void;
  restaurants: any[];
  onRestaurantClick: (restaurant: any) => void;
  walks: any[];
  onWalkClick: (walk: any) => void;
  themes: any[];
  onThemeClick: (theme: any) => void;
  marines: any[];
  onMarineClick: (marine: any) => void;
  urbans: any[];
  onUrbanClick: (urban: any) => void;
  stays: any[];
  onStayClick: (stay: any) => void;
  parkings: any[];
  onParkingClick: (parking: any) => void;
  tours: any[];
  onTourClick: (tour: any) => void;
  shoppings: any[];
  onShoppingClick: (shopping: any) => void;
  festivals: any[];
  onFestivalClick: (festival: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  open, 
  info, 
  activeCategories, 
  onCategoryClick,
  restaurants,
  onRestaurantClick,
  walks,
  onWalkClick,
  themes,
  onThemeClick,
  marines,
  onMarineClick,
  urbans,
  onUrbanClick,
  stays,
  onStayClick,
  parkings,
  onParkingClick,
  tours,
  onTourClick,
  shoppings,
  onShoppingClick,
  festivals,
  onFestivalClick
}) => {
  const { t } = useTranslation();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // search-log API로 로그인 확인 (이미 인증 체크가 있음)
        await api.get('/search-log');
        console.log('Login check success - user is logged in');
        setIsLoggedIn(true);
      } catch (error: any) {
        console.log('Login check - not logged in or error:', error?.response?.status);
        // 401이면 로그인 안 됨, 그 외는 로그인됨
        if (error?.response?.status === 401) {
          setIsLoggedIn(false);
        } else {
          // 다른 에러는 로그인된 상태로 간주
          setIsLoggedIn(true);
        }
      }
    };
    checkLoginStatus();
  }, []);

  // 최근 본 장소 저장
  const saveRecentPlace = async (place: any) => {
    const title = Array.isArray(place.title) ? place.title[0] : place.title;
    
    console.log('Saving recent place:', title, 'isLoggedIn:', isLoggedIn);
    
    // DB에 저장 (로그인한 경우)
    if (isLoggedIn) {
      try {
        console.log('Attempting to save to database...');
        const response = await api.post('/search-log', {
          keyword: title
        });
        console.log('Save to database success:', response);
      } catch (error: any) {
        console.error('Failed to save to database:', error);
        console.error('Error status:', error?.response?.status);
        console.error('Error data:', error?.response?.data);
      }
    } else {
      console.log('Not logged in, skipping database save');
    }

    // localStorage에도 저장 (백업용)
    const newPlace: RecentPlace = {
      id: place.id,
      title: title,
      distance: place.distance,
      timestamp: Date.now()
    };

    const stored = localStorage.getItem('recentPlaces');
    const existing = stored ? JSON.parse(stored) : [];
    const updated = [newPlace, ...existing.filter((p: RecentPlace) => p.id !== place.id)].slice(0, 5);
    localStorage.setItem('recentPlaces', JSON.stringify(updated));
    console.log('Saved to localStorage:', updated);
  };

  // 원래 클릭 핸들러를 감싸서 최근 본 장소에 저장
  const handlePlaceClick = (place: any, originalHandler: (place: any) => void) => {
    saveRecentPlace(place);
    originalHandler(place);
  };

  const handleHistoryPlaceClick = (placeId: string) => {
    const allPlaces = [...restaurants, ...walks, ...themes, ...marines, ...urbans, ...stays, ...parkings, ...tours, ...shoppings];
    const foundPlace = allPlaces.find(p => p.id === placeId);
    if (foundPlace) {
      if (restaurants.some(r => r.id === placeId)) onRestaurantClick(foundPlace);
      else if (walks.some(w => w.id === placeId)) onWalkClick(foundPlace);
      else if (themes.some(t => t.id === placeId)) onThemeClick(foundPlace);
      else if (marines.some(m => m.id === placeId)) onMarineClick(foundPlace);
      else if (urbans.some(u => u.id === placeId)) onUrbanClick(foundPlace);
      else if (stays.some(s => s.id === placeId)) onStayClick(foundPlace);
      else if (parkings.some(p => p.id === placeId)) onParkingClick(foundPlace);
      else if (tours.some(t => t.id === placeId)) onTourClick(foundPlace);
      else if (shoppings.some(s => s.id === placeId)) onShoppingClick(foundPlace);
    }
  };

  return (
    <>
      <div className={`sidebar ${open ? "open" : ""}`}>
        {!info ? (
          <p>{t('map.sidebar.clickLocation')}</p>
        ) : (
          <>
            <div className="location-title">
              {info.address}
              {isLoggedIn && (
                <button 
                  className="history-toggle-button"
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  title={t('map.sidebar.recentPlaces')}
                >
                  🕐
                </button>
              )}
            </div>          <div className="weather-box">
            <div className="weather-label">{t('map.sidebar.weather.label')}</div>
            <div className="weather-temp">{info.temp}°</div>
            <div className="weather-sky">{info.sky}</div>
            <div className="weather-extra">
              {t('map.sidebar.weather.high')} {info.temp + 1}° | {t('map.sidebar.weather.low')} {info.temp - 1}°
            </div>
          </div>

          {/* 날씨 기반 추천 */}
          {(() => {
            const recommendation = getWeatherRecommendations(info.sky, info.temp);
            // reason을 번역 키로 매핑
            const reasonKeyMap: { [key: string]: string } = {
              '비/눈이 오는 날씨입니다. 실내 활동을 추천합니다!': 'map.weather.rainRecommendation',
              '더운 날씨입니다. 시원한 곳을 추천합니다!': 'map.weather.hotRecommendation',
              '추운 날씨입니다. 따뜻한 실내를 추천합니다!': 'map.weather.coldRecommendation',
              '맑고 좋은 날씨입니다. 야외 활동을 즐기세요!': 'map.weather.sunnyRecommendation',
              '흐린 날씨입니다. 가벼운 야외 활동이 좋습니다!': 'map.weather.cloudyRecommendation',
              '오늘도 부산을 즐겨보세요!': 'map.weather.defaultRecommendation'
            };
            const reasonKey = reasonKeyMap[recommendation.reason] || 'map.weather.defaultRecommendation';
            
            // 카테고리 이름을 번역
            const categoryNameMap: { [key: string]: string } = {
              '음식점': t('map.sidebar.categories.restaurant'),
              '산책로': t('map.sidebar.categories.walking'),
              '테마관광지': t('map.sidebar.categories.theme'),
              '해양레저': t('map.sidebar.categories.marine'),
              '도심관광코스': t('map.sidebar.categories.urban')
            };
            
            return (
              <div className="weather-recommendation" style={{
                margin: '0 0 20px 0',
                padding: '14px 16px',
                background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
                borderRadius: '12px',
                color: 'white',
                boxShadow: '0 2px 8px rgba(74, 144, 226, 0.2)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '22px' }}>{recommendation.icon}</span>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{t('map.sidebar.weather.todayRecommendation')}</span>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '10px' }}>
                  {t(reasonKey)}
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '6px' 
                }}>
                  {recommendation.categories.map((cat) => {
                    const categoryName = categoryNameMap[cat] || cat;
                    return (
                      <span 
                        key={cat}
                        onClick={() => {
                          const mapping: { [key: string]: string } = {
                            '음식점': '음식점',
                            '산책로': '도보여행',
                            '테마관광지': '테마여행',
                            '해양레저': '해양여행',
                            '도심관광코스': '도시여행'
                          };
                          onCategoryClick(mapping[cat] || cat);
                        }}
                        style={{
                          padding: '5px 12px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '14px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: '1px solid rgba(255, 255, 255, 0.35)',
                          fontWeight: '500'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {categoryName}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div className="category-grid">
            <div className="category-row">
              <div 
                className={`category-item ${activeCategories.includes('명소') ? 'active' : ''}`}
                onClick={() => onCategoryClick('명소')}
              >
                <div 
                  className="category-icon" 
                  style={{backgroundColor: activeCategories.includes('명소') ? '#4CAF50' : '#9E9E9E'}}
                >
                  🏛️
                </div>
                <div className="category-label">{t('map.sidebar.categories.attraction')}</div>
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
                <div className="category-label">{t('map.sidebar.categories.restaurant')}</div>
              </div>
              <div 
              className={`category-item ${activeCategories.includes('축제') ? 'active' : ''}`}
              onClick={() => onCategoryClick('축제')}
            >
              <div 
                className="category-icon" 
                style={{backgroundColor: activeCategories.includes('축제') ? '#FFB300' : '#9E9E9E'}}
              >
                🎪
              </div>
              <div className="category-label">{t('map.sidebar.categories.festival')}</div>
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
                <div className="category-label">{t('map.sidebar.categories.accommodation')}</div>
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
                <div className="category-label">{t('map.sidebar.categories.parking')}</div>
              </div>
            </div>
            <div className="category-row">
              <div 
                className={`category-item ${activeCategories.includes('여행코스 기념품') ? 'active' : ''}`}
                onClick={() => onCategoryClick('여행코스 기념품')}
              >
                <div 
                  className="category-icon" 
                  style={{backgroundColor: activeCategories.includes('여행코스 기념품') ? '#E91E63' : '#9E9E9E'}}
                >
                  🛍️
                </div>
                <div className="category-label" dangerouslySetInnerHTML={{ __html: t('map.sidebar.categories.souvenir').replace(/<br\/>/g, '<br/>') }} />
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
                <div className="category-label" dangerouslySetInnerHTML={{ __html: t('map.sidebar.categories.walking').replace(/<br\/>/g, '<br/>') }} />
              </div>
              <div 
                className={`category-item ${activeCategories.includes('테마여행') ? 'active' : ''}`}
                onClick={() => onCategoryClick('테마여행')}
              >
                <div 
                  className="category-icon" 
                  style={{backgroundColor: activeCategories.includes('테마여행') ? '#59ce16ff' : '#9E9E9E'}}
                >
                  🎭
                </div>
                <div className="category-label" dangerouslySetInnerHTML={{ __html: t('map.sidebar.categories.theme').replace(/<br\/>/g, '<br/>') }} />
              </div>
              <div 
                className={`category-item ${activeCategories.includes('해양여행') ? 'active' : ''}`}
                onClick={() => onCategoryClick('해양여행')}
              >
                <div 
                  className="category-icon" 
                  style={{backgroundColor: activeCategories.includes('해양여행') ? '#0866f1ff' : '#9E9E9E'}}
                >
                  🌊
                </div>
                <div className="category-label" dangerouslySetInnerHTML={{ __html: t('map.sidebar.categories.marine').replace(/<br\/>/g, '<br/>') }} />
              </div>
              <div 
                className={`category-item ${activeCategories.includes('도시여행') ? 'active' : ''}`}
                onClick={() => onCategoryClick('도시여행')}
              >
                <div 
                  className="category-icon" 
                  style={{backgroundColor: activeCategories.includes('도시여행') ? '#b80b0bff' : '#9E9E9E'}}
                >
                  🏙️
                </div>
                <div className="category-label" dangerouslySetInnerHTML={{ __html: t('map.sidebar.categories.urban').replace(/<br\/>/g, '<br/>') }} />
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
                  🍴 {t('map.sidebar.lists.nearbyRestaurants')} ({restaurants.length}{t('map.sidebar.lists.items')})
                </h3>
              </div>
              
              <div className="restaurant-items" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {restaurants.map((restaurant) => (
                  <div 
                    key={restaurant.id} 
                    className="restaurant-card"
                    onClick={() => handlePlaceClick(restaurant, onRestaurantClick)}
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

          {/*숙소 목록 표시 */}
          {activeCategories.includes('숙소') && stays.length > 0 && (
            <div className="restaurant-list" style={{ marginTop: '10px' }}>
              <div className="restaurant-header" style={{ 
                background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                padding: '12px 15px',
                borderRadius: '8px',
                marginBottom: '10px'
              }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                  🏨 {t('map.sidebar.lists.nearbyAccommodations')} ({stays.length}{t('map.sidebar.lists.items')})
                </h3>
              </div>
              
              <div className="restaurant-items" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {stays.map((stay) => (
                  <div 
                    key={stay.id} 
                    className="restaurant-card"
                    onClick={() => handlePlaceClick(stay, onStayClick)}
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
                        src={stay.image || stay.image_url || stay.firstimage || "https://via.placeholder.com/80?text=Stay"} 
                        alt={stay.title}
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/80?text=Stay";
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
                        {Array.isArray(stay.title) ? stay.title[0] : stay.title}
                      </div>
                      {stay.distance && (
                        <div className="restaurant-distance" style={{ 
                          fontSize: '12px',
                          color: '#666',
                          marginBottom: '6px'
                        }}>
                          📍 {stay.distance.toFixed(2)}km
                        </div>
                      )}
                      <div className="restaurant-menu" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {stay.address && (
                          <span className="menu-tag" style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            background: '#F3E5F5',
                            color: '#7B1FA2',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%'
                          }}>{Array.isArray(stay.address) ? stay.address[0] : stay.address}</span>
                        )}
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
                  🚶 {t('map.sidebar.lists.walkingCourse')} ({walks.length}{t('map.sidebar.lists.items')})
                </h3>
              </div>
              
              <div className="restaurant-items" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {walks.map((walk) => (
                  <div 
                    key={walk.id} 
                    className="restaurant-card"
                    onClick={() => handlePlaceClick(walk, onWalkClick)}
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

          {/*테마여행 목록 표시 */}
          {activeCategories.includes('테마여행') && themes.length > 0 && (
            <div className="restaurant-list" style={{ marginTop: '10px' }}>
              <div className="restaurant-header" style={{ 
                background: 'linear-gradient(135deg, #59ce16 0%, #47a811 100%)',
                padding: '12px 15px',
                borderRadius: '8px',
                marginBottom: '10px'
              }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                  🎭 {t('map.sidebar.lists.themeCourse')} ({themes.length}{t('map.sidebar.lists.items')})
                </h3>
              </div>
              
              <div className="restaurant-items" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {themes.map((theme) => (
                  <div 
                    key={theme.id} 
                    className="restaurant-card"
                    onClick={() => handlePlaceClick(theme, onThemeClick)}
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
                        src={theme.image || theme.image_url || "https://via.placeholder.com/80?text=Theme"} 
                        alt={theme.title}
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/80?text=Theme";
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
                        {Array.isArray(theme.title) ? theme.title[0] : theme.title}
                      </div>
                      <div className="restaurant-distance" style={{ 
                        fontSize: '12px',
                        color: '#666',
                        marginBottom: '6px'
                      }}>
                        📍 {theme.distance.toFixed(2)}km
                      </div>
                      {theme.subtitle && (
                        <div className="restaurant-menu" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <span className="menu-tag" style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            background: '#E8F5E9',
                            color: '#2E7D32',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%'
                          }}>{Array.isArray(theme.subtitle) ? theme.subtitle[0] : theme.subtitle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/*해양여행 목록 표시 */}
          {activeCategories.includes('해양여행') && marines.length > 0 && (
            <div className="restaurant-list" style={{ marginTop: '10px' }}>
              <div className="restaurant-header" style={{ 
                background: 'linear-gradient(135deg, #0866f1 0%, #0652c7 100%)',
                padding: '12px 15px',
                borderRadius: '8px',
                marginBottom: '10px'
              }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                  🌊 {t('map.sidebar.lists.marineCourse')} ({marines.length}{t('map.sidebar.lists.items')})
                </h3>
              </div>
              
              <div className="restaurant-items" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {marines.map((marine) => (
                  <div 
                    key={marine.id} 
                    className="restaurant-card"
                    onClick={() => handlePlaceClick(marine, onMarineClick)}
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
                        src={marine.image || marine.image_url || "https://via.placeholder.com/80?text=Marine"} 
                        alt={marine.title}
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/80?text=Marine";
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
                        {Array.isArray(marine.title) ? marine.title[0] : marine.title}
                      </div>
                      <div className="restaurant-distance" style={{ 
                        fontSize: '12px',
                        color: '#666',
                        marginBottom: '6px'
                      }}>
                        📍 {marine.distance.toFixed(2)}km
                      </div>
                      {marine.subtitle && (
                        <div className="restaurant-menu" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <span className="menu-tag" style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            background: '#E3F2FD',
                            color: '#1565C0',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%'
                          }}>{Array.isArray(marine.subtitle) ? marine.subtitle[0] : marine.subtitle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/*도시여행 목록 표시 */}
          {activeCategories.includes('도시여행') && urbans.length > 0 && (
            <div className="restaurant-list" style={{ marginTop: '10px' }}>
              <div className="restaurant-header" style={{ 
                background: 'linear-gradient(135deg, #b80b0bff 0%, #8a0808 100%)',
                padding: '12px 15px',
                borderRadius: '8px',
                marginBottom: '10px'
              }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                  🏙️ {t('map.sidebar.lists.urbanCourse')} ({urbans.length}{t('map.sidebar.lists.items')})
                </h3>
              </div>
              
              <div className="restaurant-items" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {urbans.map((urban) => (
                  <div 
                    key={urban.id} 
                    className="restaurant-card"
                    onClick={() => handlePlaceClick(urban, onUrbanClick)}
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
                        src={urban.image || urban.image_url || "https://via.placeholder.com/80?text=Urban"} 
                        alt={urban.title}
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/80?text=Urban";
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
                        {Array.isArray(urban.title) ? urban.title[0] : urban.title}
                      </div>
                      <div className="restaurant-distance" style={{ 
                        fontSize: '12px',
                        color: '#666',
                        marginBottom: '6px'
                      }}>
                        📍 {urban.distance.toFixed(2)}km
                      </div>
                      {urban.subtitle && (
                        <div className="restaurant-menu" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <span className="menu-tag" style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            background: '#FFE0E0',
                            color: '#B80B0B',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%'
                          }}>{Array.isArray(urban.subtitle) ? urban.subtitle[0] : urban.subtitle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/*명소 목록 표시 */}
          {activeCategories.includes('명소') && tours.length > 0 && (
            <div className="restaurant-list" style={{ marginTop: '10px' }}>
              <div className="restaurant-header" style={{ 
                background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                padding: '12px 15px',
                borderRadius: '8px',
                marginBottom: '10px'
              }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                  🏛️ {t('map.sidebar.lists.nearbyAttractions')} ({tours.length}{t('map.sidebar.lists.items')})
                </h3>
              </div>
              
              <div className="restaurant-items" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {tours.map((tour) => (
                  <div 
                    key={tour.id} 
                    className="restaurant-card"
                    onClick={() => handlePlaceClick(tour, onTourClick)}
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
                        src={tour.image_url || tour.imageUrl || "https://via.placeholder.com/80?text=Tour"} 
                        alt={tour.title}
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/80?text=Tour";
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
                        {Array.isArray(tour.title) ? tour.title[0] : tour.title}
                      </div>
                      {tour.distance && (
                        <div className="restaurant-distance" style={{ 
                          fontSize: '12px',
                          color: '#666',
                          marginBottom: '6px'
                        }}>
                          📍 {tour.distance.toFixed(2)}km
                        </div>
                      )}
                      <div className="restaurant-menu" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {tour.address && (
                          <span className="menu-tag" style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            background: '#E8F5E9',
                            color: '#2E7D32',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%'
                          }}>{Array.isArray(tour.address) ? tour.address[0] : tour.address}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* 축제 목록 표시 */}
        {activeCategories.includes('축제') && festivals.length > 0 && (
          <div className="restaurant-list" style={{ marginTop: '10px' }}>
            <div className="restaurant-header" style={{ 
              background: 'linear-gradient(135deg, #FFB300 0%, #FF8F00 100%)',
              padding: '12px 15px',
              borderRadius: '8px',
              marginBottom: '10px'
            }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                🎪 {t('map.sidebar.lists.nearbyFestivals') || '주변 축제'} ({festivals.length}{t('map.sidebar.lists.items')})
              </h3>
            </div>
            
            <div className="restaurant-items" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {festivals.map((festival) => (
                <div 
                  key={festival.id} 
                  className="restaurant-card"
                  onClick={() => handlePlaceClick(festival, onFestivalClick)}
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
                      src={festival.image || festival.mainImgNormal || "https://via.placeholder.com/80?text=Festival"} 
                      alt={festival.title}
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/80?text=Festival";
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
                      {festival.title}
                    </div>
                    {festival.distance && (
                      <div className="restaurant-distance" style={{ 
                        fontSize: '12px',
                        color: '#666',
                        marginBottom: '6px'
                      }}>
                        📍 {festival.distance.toFixed(2)}km
                      </div>
                    )}
                    <div className="restaurant-menu" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {festival.address && (
                        <span className="menu-tag" style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          background: '#FFF3E0',
                          color: '#E65100',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%'
                        }}>{festival.address}</span>
                      )}
                      {festival.period && (
                        <span className="menu-tag" style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          background: '#E3F2FD',
                          color: '#1565C0',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%'
                        }}>{festival.period}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

          {/*기념품 목록 표시 */}
          {activeCategories.includes('여행코스 기념품') && shoppings.length > 0 && (
            <div className="restaurant-list" style={{ marginTop: '10px' }}>
              <div className="restaurant-header" style={{ 
                background: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
                padding: '12px 15px',
                borderRadius: '8px',
                marginBottom: '10px'
              }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                  🛍️ {t('map.sidebar.lists.nearbySouvenirs')} ({shoppings.length}{t('map.sidebar.lists.items')})
                </h3>
              </div>
              
              <div className="restaurant-items" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {shoppings.map((shopping) => (
                  <div 
                    key={shopping.id} 
                    className="restaurant-card"
                    onClick={() => handlePlaceClick(shopping, onShoppingClick)}
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
                        src={shopping.main_img_normal || shopping.main_img_thumb || shopping.image_url || "https://via.placeholder.com/80?text=Shopping"} 
                        alt={shopping.title || shopping.main_title}
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/80?text=Shopping";
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
                        {Array.isArray(shopping.title) ? shopping.title[0] : (shopping.title || (Array.isArray(shopping.main_title) ? shopping.main_title[0] : shopping.main_title))}
                      </div>
                      {shopping.distance && (
                        <div className="restaurant-distance" style={{ 
                          fontSize: '12px',
                          color: '#666',
                          marginBottom: '6px'
                        }}>
                          📍 {shopping.distance.toFixed(2)}km
                        </div>
                      )}
                      <div className="restaurant-menu" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {shopping.addr1 && (
                          <span className="menu-tag" style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            background: '#FCE4EC',
                            color: '#C2185B',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%'
                          }}>{Array.isArray(shopping.addr1) ? shopping.addr1[0] : shopping.addr1}</span>
                        )}
                        {shopping.gugun_nm && (
                          <span className="menu-tag" style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            background: '#F8BBD0',
                            color: '#AD1457',
                            borderRadius: '12px'
                          }}>{Array.isArray(shopping.gugun_nm) ? shopping.gugun_nm[0] : shopping.gugun_nm}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/*주차장 목록 표시 */}
          {activeCategories.includes('주차장') && parkings.length > 0 && (
            <div className="restaurant-list" style={{ marginTop: '10px' }}>
              <div className="restaurant-header" style={{ 
                background: 'linear-gradient(135deg, #607D8B 0%, #455A64 100%)',
                padding: '12px 15px',
                borderRadius: '8px',
                marginBottom: '10px'
              }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                  🅿️ {t('map.sidebar.lists.nearbyParking')} ({parkings.length}{t('map.sidebar.lists.items')})
                </h3>
              </div>
              
              <div className="restaurant-items" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {parkings.map((parking) => (
                  <div 
                    key={parking.id} 
                    className="restaurant-card"
                    onClick={() => handlePlaceClick(parking, onParkingClick)}
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
                      flexShrink: 0,
                      background: '#ECEFF1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '32px' }}>🅿️</span>
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
                        {Array.isArray(parking.title) ? parking.title[0] : parking.title}
                      </div>
                      {parking.distance && (
                        <div className="restaurant-distance" style={{ 
                          fontSize: '12px',
                          color: '#666',
                          marginBottom: '6px'
                        }}>
                          📍 {parking.distance.toFixed(2)}km
                        </div>
                      )}
                      <div className="restaurant-menu" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {parking.address && (
                          <span className="menu-tag" style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            background: '#ECEFF1',
                            color: '#455A64',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%'
                          }}>{Array.isArray(parking.address) ? parking.address[0] : parking.address}</span>
                        )}
                        {parking.type && (
                          <span className="menu-tag" style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            background: '#CFD8DC',
                            color: '#37474F',
                            borderRadius: '12px'
                          }}>{Array.isArray(parking.type) ? parking.type[0] : parking.type}</span>
                        )}
                        {parking.fee_basic && (
                          <span className="menu-tag" style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            background: '#B0BEC5',
                            color: '#263238',
                            borderRadius: '12px'
                          }}>{t('map.sidebar.parking.basicFee')}: {Array.isArray(parking.fee_basic) ? parking.fee_basic[0] : parking.fee_basic}원</span>
                        )}
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
    
    <History 
      isOpen={isHistoryOpen}
      onClose={() => setIsHistoryOpen(false)}
      onPlaceClick={handleHistoryPlaceClick}
    />
    </>
  );
};

export default Sidebar;