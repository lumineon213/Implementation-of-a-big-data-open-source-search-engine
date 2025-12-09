import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import "./ThemePage.css"; // ★ 중요: 파일명과 똑같이 맞춰야 합니다!

// 데이터 타입 정의
interface TourSpot {
  id: string;
  title: string;
  address: string;
  imageUrl: string;
  themeId: number;
}

const Theme: React.FC = () => {
  const [spots, setSpots] = useState<TourSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  
  // 1. 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 페이지당 10개

  const keyword = searchParams.get('keyword');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 백엔드 포트(8484) 확인
        const url = keyword 
          ? `http://localhost:8484/api/search?keyword=${encodeURIComponent(keyword)}`
          : `http://localhost:8484/api/search`;

        const response = await axios.get(url);
        setSpots(response.data);
        setCurrentPage(1); // 데이터 바뀌면 1페이지로
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [keyword]);

  // 2. 현재 페이지에 맞는 데이터 자르기
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSpots = spots.slice(indexOfFirstItem, indexOfLastItem);
  
  // 총 페이지 수 계산
  const totalPages = Math.ceil(spots.length / itemsPerPage);

  // 페이지 변경 함수
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  if (loading) return <div style={{padding: '100px', textAlign: 'center'}}>데이터를 불러오는 중입니다...</div>;

  return (
    <div className="info-container">
      <h2 className="page-title">
        {keyword ? `'${keyword}' 검색 결과` : '부산 여행 정보'}
      </h2>
      
      {spots.length === 0 ? (
        <div className="no-result">검색 결과가 없습니다.</div>
      ) : (
        /* 리스트와 페이지네이션을 묶어주는 Fragment (<> ... </>) */
        <>
          <div className="card-grid">
            {currentSpots.map((spot) => (
              <div key={spot.id} className="tour-card">
                <div className="card-image">
                  {spot.imageUrl ? (
                    <img src={spot.imageUrl} alt={spot.title} />
                  ) : (
                    <div className="no-image">이미지 없음</div>
                  )}
                </div>
                <div className="card-content">
                  <span className={`badge theme-${spot.themeId}`}>
                    {getThemeName(spot.themeId)}
                  </span>
                  <h3>{spot.title}</h3>
                  <p>📍 {spot.address}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 버튼 영역 */}
          <div className="pagination">
            {/* 이전 버튼 */}
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              className="page-btn prev-btn"
            >
              &lt;
            </button>

            {/* 숫자 버튼들 */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => handlePageChange(number)}
                className={`page-btn ${currentPage === number ? 'active' : ''}`}
              >
                {number}
              </button>
            ))}

            {/* 다음 버튼 */}
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="page-btn next-btn"
            >
              &gt;
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// 테마 이름 변환기
const getThemeName = (id: number) => {
  switch (id) {
    case 1: return "반려동물";
    case 2: return "가족 여행";
    case 3: return "혼자 여행";
    default: return "기타";
  }
};

export default Theme;