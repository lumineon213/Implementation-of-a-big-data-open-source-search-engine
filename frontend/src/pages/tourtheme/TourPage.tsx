import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import "./TourPage.css";

// 데이터 타입 정의
interface TourSpot {
  spotId: number;
  title: string;
  address: string;
  imageUrl: string;
  themeId: number;
}

const TourPage: React.FC = () => {
  const [spots, setSpots] = useState<TourSpot[]>([]);
  const [loading, setLoading] = useState(true);

  // URL 쿼리스트링 관리
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';

  const [searchTerm, setSearchTerm] = useState(keyword);
  const navigate = useNavigate();

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // 카드형은 한 페이지에 8~12개가 보기 좋습니다.

  // 1. 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setSearchTerm(keyword);

        // 검색어가 있으면 검색 API, 없으면 전체 목록 API (API 주소 확인 필요)
        // 백엔드 컨트롤러 주소와 정확히 일치해야 합니다.
        const url = keyword
          ? `http://localhost:8484/api/search?keyword=${encodeURIComponent(keyword)}`
          : `http://localhost:8484/api/search`; 
          // 만약 전체 목록 API가 별도로 있다면 위 주소를 수정하세요. 예: /api/tour/list

        const response = await axios.get(url);
        console.log("목록 조회 결과:", response.data);

        // [핵심] 응답이 배열인지 확인 후 설정
        if (Array.isArray(response.data)) {
          setSpots(response.data);
        } else {
          console.warn("데이터가 배열 형식이 아닙니다:", response.data);
          setSpots([]); 
        }
        
        setCurrentPage(1);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
        setSpots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [keyword]);

  // 검색 버튼 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ keyword: searchTerm });
  };

  // 상세 페이지 이동
  const handleCardClick = (spotId: number) => {
    navigate(`/theme/view/${spotId}`);
  };

  // 페이지네이션 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSpots = spots.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(spots.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>데이터를 불러오는 중...</div>;

  return (
    <div className="info-container">
      <h2 className="page-title">부산 여행 정보</h2>

      <form className="search-box" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="검색어를 입력하세요 (예: 해운대, 광안리)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">검색</button>
      </form>

      {spots.length === 0 ? (
        <div className="no-result">
           <p>'{keyword}'에 대한 검색 결과가 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="card-grid">
            {currentSpots.map((spot) => (
              <div
                key={spot.spotId}
                className="tour-card"
                onClick={() => handleCardClick(spot.spotId)}
                style={{ cursor: "pointer" }}
              >
                <div className="card-image">
                    <img
                      src={spot.imageUrl || "https://dummyimage.com/600x400/dddddd/000000.png&text=No+Image"}
                      alt={spot.title}
                      onError={(e) => {
                        e.currentTarget.src = "https://dummyimage.com/600x400/dddddd/000000.png&text=Busan+Tour";
                      }}
                    />
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

          {/* 페이지네이션 (데이터가 있을 때만 표시) */}
          {spots.length > 0 && (
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
          )}
        </>
      )}
    </div>
  );
};

// 테마 이름 변환 함수
const getThemeName = (id: number) => {
  switch (id) {
    case 1: return "명소";
    case 2: return "맛집";
    case 3: return "코스";
    default: return "부산 여행";
  }
};

export default ThemePage;