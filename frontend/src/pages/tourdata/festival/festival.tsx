import React, { useState, useEffect } from 'react';
import './festival.css';
import axios from 'axios';

// API 응답 데이터 인터페이스 정의 (실제 데이터 구조에 맞게 조정 필요)
interface FestivalData {
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  content: string;
  imageUrl?: string;
}

const Festival: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [festivals, setFestivals] = useState<FestivalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🚩 API 키는 Spring Boot처럼 환경 변수에서 가져와야 합니다.
  // 이 예시에서는 임시로 'YOUR_FESTIVAL_API_KEY'로 표시합니다.
  const API_KEY = process.env.REACT_APP_FESTIVAL_API_KEY || 'YOUR_FESTIVAL_API_KEY';
  const FESTIVAL_API_URL = 'YOUR_FESTIVAL_API_ENDPOINT'; // 부산 축제 공공 데이터 URL

  // 1. 축제 API 데이터 로드
  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 실제 부산 축제 공공 API URL과 파라미터에 맞춰 수정해야 합니다.
        // 예시: axios.get(`${FESTIVAL_API_URL}?serviceKey=${API_KEY}&searchWord=${searchTerm}`);
        
        // 🚨 중요: 현재 API 엔드포인트가 없으므로 임시 더미 데이터를 사용합니다.
        const dummyData: FestivalData[] = [
          { title: "부산 불꽃 축제", location: "광안리 해수욕장", startDate: "2025-10-26", endDate: "2025-10-26", content: "화려한 불꽃 쇼와 레이저 연출.", imageUrl: "/images/fireworks.jpg" },
          { title: "해운대 모래 축제", location: "해운대 해수욕장", startDate: "2025-05-24", endDate: "2025-05-27", content: "세계 모래 조각가들의 작품 전시.", imageUrl: "/images/sand.jpg" },
          { title: "부산 국제 영화제", location: "영화의 전당", startDate: "2025-10-02", endDate: "2025-10-11", content: "아시아 최대 영화 축제.", imageUrl: "/images/biff.jpg" },
        ];
        
        // 검색 필터링 (더미 데이터용)
        const filtered = dummyData.filter(f => 
          f.title.includes(searchTerm) || f.content.includes(searchTerm) || f.location.includes(searchTerm)
        );
        
        setTimeout(() => {
          setFestivals(filtered);
          setLoading(false);
        }, 800);

      } catch (err) {
        console.error("축제 데이터 로드 실패:", err);
        setError("축제 데이터를 불러오는 데 실패했습니다.");
        setLoading(false);
      }
    };

    fetchFestivals();
  }, [searchTerm]); // searchTerm이 바뀔 때마다 다시 호출

  // 2. 검색어 입력 핸들러
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // 3. 축제 목록 렌더링
  const renderFestivals = () => {
    if (loading) {
      return <div className="loading-spinner">데이터를 불러오는 중...</div>;
    }
    if (error) {
      return <div className="error-message">{error}</div>;
    }
    if (festivals.length === 0 && searchTerm === '') {
      return <div className="no-results">현재 등록된 축제 정보가 없습니다.</div>;
    }
    if (festivals.length === 0 && searchTerm !== '') {
      return <div className="no-results">'{searchTerm}'에 대한 축제 검색 결과가 없습니다.</div>;
    }

    return (
      <div className="festival-list">
        {festivals.map((festival, index) => (
          <div key={index} className="festival-card">
            {festival.imageUrl && (
              <div className="card-image" style={{backgroundImage: `url(${festival.imageUrl})`}}></div>
            )}
            <div className="card-content">
              <h3 className="card-title">{festival.title}</h3>
              <p className="card-date">{festival.startDate} ~ {festival.endDate}</p>
              <p className="card-location">📍 {festival.location}</p>
              <p className="card-description">{festival.content}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="festival-page-container">
      
      {/* 1. 가운데 정렬된 제목 및 검색 영역 */}
      <section className="festival-header">
        <h1 className="main-title">부산 축제 정보 🎉</h1>
        
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="축제 이름, 장소 또는 키워드를 검색하세요..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button className="search-button">검색</button>
        </div>
      </section>

      {/* 2. 축제 목록 영역 */}
      <section className="festival-body">
        {renderFestivals()}
      </section>
      
    </div>
  );
};

export default Festival;