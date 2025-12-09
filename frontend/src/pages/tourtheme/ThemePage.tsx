import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import "./ThemePage.css"; 

// 데이터 타입 정의
interface TourSpot {
  spotId: number;   //  핵심: 백엔드에서 보내주는 변수명(spotId)과 일치
  title: string;
  address: string;
  imageUrl: string;
  themeId: number;
}

const Theme: React.FC = () => {
  const [spots, setSpots] = useState<TourSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // 페이지 이동을 위한 훅
  
  // 1. 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  const keyword = searchParams.get('keyword');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 백엔드 포트(8484) 확인 및 검색 URL 설정
        const url = keyword 
          ? `http://localhost:8484/api/search?keyword=${encodeURIComponent(keyword)}`
          : `http://localhost:8484/api/search`;

        const response = await axios.get(url);
        
        // 데이터 확인용 로그 (개발 완료 후 삭제 가능)
        console.log("받은 데이터:", response.data);

        setSpots(response.data);
        setCurrentPage(1); 
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [keyword]);

  // 2. 현재 페이지에 맞는 데이터 자르기 (Pagination Logic)
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

  // ★ 카드 클릭 시 상세 페이지로 이동 (spotId 사용)
  const handleCardClick = (spotId: number) => {
    navigate(`/theme/view/${spotId}`); 
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
        <>
          <div className="card-grid">
            {currentSpots.map((spot) => (
              <div 
                key={spot.spotId}         // 고유 키값 설정
                className="tour-card"
                onClick={() => handleCardClick(spot.spotId)} // 클릭 이벤트 연결
                style={{ cursor: "pointer" }} // 마우스 올렸을 때 손가락 모양
              >
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
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              className="page-btn prev-btn"
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => handlePageChange(number)}
                className={`page-btn ${currentPage === number ? 'active' : ''}`}
              >
                {number}
              </button>
            ))}

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

// 테마 ID를 이름으로 변환하는 함수
const getThemeName = (id: number) => {
  switch (id) {
    case 1: return "반려동물";
    case 2: return "가족 여행";
    case 3: return "혼자 여행";
    default: return "기타";
  }
};

export default Theme;