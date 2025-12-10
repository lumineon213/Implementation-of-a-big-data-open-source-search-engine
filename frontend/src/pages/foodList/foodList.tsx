import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom"; 
import "./FoodList.css";

// FoodData 인터페이스
interface FoodData {
  id: string;
  title: string;
  address: string;
  menu_t?: string;
  image_url?: string;
  description?: string;
  view_count?: number;
  // distance_km 필드 제거됨
}

const FoodList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL에서 현재 상태 읽기
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentKeyword = searchParams.get('keyword') || "";
  const currentSort = searchParams.get('sort') || "name"; // 기본값: 가나다순
  // currentUserLat, currentUserLng 제거됨

  // 로컬 상태 (API 호출 결과 및 임시 입력값)
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0); 
  const [searchInput, setSearchInput] = useState(currentKeyword); 
  const [inputPage, setInputPage] = useState("");  

  const size = 10;
  const pageGroupSize = 10;

  // 2. 데이터 불러오기 (URL 파라미터가 바뀌면 재실행)
  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8484/api/food/search", {
          params: { 
            page: currentPage, 
            size: size,
            keyword: currentKeyword,
            sort: currentSort,
            // userLat, userLng 파라미터 제거됨
          }
        });

        setFoods(response.data.list || []);
        setTotal(response.data.total || 0);

      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    // 의존성 배열에서 userLat, userLng 제거됨
    fetchFoods();
  }, [currentPage, currentKeyword, currentSort]); 

  
  // ▼▼▼ 3. 정렬 핸들러 (거리순 로직 제거) ▼▼▼
  const handleSortChange = (newSort: string) => {
    // Geolocation 로직이 완전히 제거되고, 모든 정렬은 바로 URL 업데이트로 처리됨
    setSearchParams(prev => {
        prev.set('sort', newSort);
        prev.set('page', '1');
        return prev;
    });
  };

  // 4. 기타 핸들러 및 로직 (유지)
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams(prev => {
        prev.set('page', newPage.toString());
        return prev;
      });
      window.scrollTo(0, 0);
    }
  };

  const handleSearch = () => {
    setSearchParams(prev => {
      prev.set('keyword', searchInput);
      prev.set('page', '1'); 
      return prev;
    });
  };

  const handleCardClick = (id: string) => {
    // 상세보기 클릭 시, 현재 URL의 모든 상태(페이지, 정렬 등)를 유지
    const currentPath = `/food/${id}?${searchParams.toString()}`;
    navigate(currentPath); 
  };

  const handleJumpToPage = () => {
    const pageNum = Number(inputPage);
    if (!inputPage || isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
      alert(`1부터 ${totalPages} 사이의 페이지를 입력해주세요.`);
      return;
    }
    setSearchParams(prev => {
      prev.set('page', pageNum.toString());
      return prev;
    });
    setInputPage("");
    window.scrollTo(0, 0);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: 'search' | 'jump') => {
    if (e.key === 'Enter') {
      if (type === 'search') handleSearch();
      else handleJumpToPage();
    }
  };

  const totalPages = total > 0 ? Math.ceil(total / size) : 1;
  const startPage = Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  if (loading) return <div style={{ padding:"100px", textAlign:"center", fontSize:"18px" }}>데이터를 불러오는 중입니다...</div>;

  return (
    <div className="food-list-container" style={{ paddingBottom: "100px" }}>
      
      {/* 1. 상단 검색 배너 */}
      <div className="search-filter-container">
        <h2 className="search-title">부산의 맛을 찾아 떠나보세요 🌊</h2>
        
        <div className="search-box-wrapper">
          <input 
            type="text" 
            placeholder="지역명(예: 해운대) 또는 메뉴(예: 국밥) 검색" 
            className="main-search-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 'search')}
          />
          <button className="main-search-btn" onClick={handleSearch}>검색</button>
        </div>

        <div style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginTop: '10px' }}>
          추천 태그: #돼지국밥 #밀면 #광안리 #오션뷰 #횟집
        </div>
      </div>

      {/* 2. 리스트 정보 바 (총 개수 + 정렬 버튼) */}
      <div className="list-info-bar">
        <div className="total-count">
          총 <b>{total.toLocaleString()}</b>개의 맛집이 검색되었습니다.
          {/* 거리순 정렬 중 표시 제거됨 */}
        </div>
      </div>

      {/* 3. 맛집 리스트 영역 */}
      <div className="food-list-wrapper">
        {foods.length === 0 ? (
          <div style={{ padding:"50px", textAlign:"center", width: "100%" }}>검색 결과가 없습니다.</div>
        ) : (
          foods.map((food, index) => (
            <div 
              key={food.id || index} 
              className="food-card" 
              onClick={() => handleCardClick(food.id)} 
              style={{ cursor: "pointer" }}
            >
              <div className="food-image-box">
                <img 
                  src={food.image_url || "https://via.placeholder.com/200?text=No+Image"} 
                  alt={food.title} 
                  onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/200?text=Busan+Food"; }}
                />
              </div>
              <div className="food-info-box">
                <h3 className="food-title">{food.title}</h3>
                <p className="food-address">{food.address}</p>
                <p className="food-desc">
                  {food.description && food.description.length > 50 
                    ? food.description.substring(0, 50) + "..." 
                    : food.description}
                </p>
                {/* 거리 표시 제거됨 */}
                
                {/* 조회수 표시 */}
                {food.view_count !== undefined && food.view_count > 0 && (
                   <span style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                     👀 {food.view_count}회 조회
                   </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. 하단 페이징 영역 (숫자 + 점프) */}
      {total > 0 && (
        <div className="pagination-wrapper">
          
          {/* 숫자 페이징 */}
          <div className="pagination-numbers">
            
            {/* 📌 이전 그룹 버튼 (<<) */}
            <button 
                onClick={() => handlePageChange(startPage - pageGroupSize)} 
                disabled={startPage === 1} 
                className="page-btn prev-next group-prev"
            >
                &lt;&lt; 
            </button>

            {/* 📌 개별 이전 페이지 버튼 (<) */}
            <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1} 
                className="page-btn prev-next single-prev"
            >
                &lt;
            </button>

            {/* 개별 페이지 버튼 (1, 2, 3...) */}
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`page-btn ${currentPage === pageNum ? "active" : ""}`}
              >
                {pageNum}
              </button>
            ))}

            {/* 📌 개별 다음 페이지 버튼 (>) */}
            <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages} 
                className="page-btn prev-next single-next"
            >
                &gt;
            </button>

            {/* 📌 다음 그룹 버튼 (>>) */}
            <button 
                onClick={() => handlePageChange(endPage + 1)} 
                disabled={endPage === totalPages} 
                className="page-btn prev-next group-next"
            >
                &gt;&gt;
            </button>
          </div>

          {/* 페이지 점프 입력창 */}
          <div className="pagination-jump">
            <input 
              type="number" 
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'jump')}
              placeholder="Go"
              className="jump-input"
            />
            <button onClick={handleJumpToPage} className="jump-btn">이동</button>
          </div>

        </div>

      )}  </div>
  );
};

export default FoodList;