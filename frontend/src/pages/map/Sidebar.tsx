import React, { useState } from "react";
import "./Sidebar.css";

interface SidebarProps {
  open: boolean;
  info: any;
}

const Sidebar: React.FC<SidebarProps> = ({ open, info }) => {
  const [activeCategories, setActiveCategories] = useState<string[]>([]);

  const handleCategoryClick = (category: string) => {
    if (activeCategories.includes(category)) {
      // 이미 선택되어 있으면 제거
      setActiveCategories(activeCategories.filter(c => c !== category));
    } else {
      // 선택되어 있지 않으면 추가
      setActiveCategories([...activeCategories, category]);
    }
    console.log(`${category} 클릭됨`);
  };

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
                onClick={() => handleCategoryClick('주변 여행지')}
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
                onClick={() => handleCategoryClick('음식점')}
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
                onClick={() => handleCategoryClick('카페')}
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
                onClick={() => handleCategoryClick('숙소')}
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
                onClick={() => handleCategoryClick('주차장')}
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
                onClick={() => handleCategoryClick('전기차충전소')}
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
                onClick={() => handleCategoryClick('품질인증')}
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
                onClick={() => handleCategoryClick('추천테마')}
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
                onClick={() => handleCategoryClick('여행코스')}
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
                onClick={() => handleCategoryClick('나의여행')}
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
        </>
      )}
    </div>
  );
};

export default Sidebar;