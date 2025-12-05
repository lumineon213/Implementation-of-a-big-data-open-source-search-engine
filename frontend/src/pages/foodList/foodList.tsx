import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom"; // URL 상태 관리를 위해 useSearchParams 추가
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
}

const FoodList: React.FC = () => {
  const navigate = useNavigate();
  // ▼▼▼ 1. URL 상태 관리 (useSearchParams 사용) ▼▼▼
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL에서 현재 상태 읽기
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentKeyword = searchParams.get('keyword') || "";
  const currentSort = searchParams.get('sort') || "latest";

  // 로컬 상태 (API 호출 결과 및 임시 입력값)
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0); 
  const [searchInput, setSearchInput] = useState(currentKeyword); // 검색창 입력값
  const [inputPage, setInputPage] = useState("");   // 페이지 점프 입력값

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
            sort: currentSort 
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

    fetchFoods();
  }, [currentPage, currentKeyword, currentSort]); // URL에서 읽은 변수를 의존성 배열로 사용

  // 3. 핸들러 함수들: URL 파라미터를 변경하도록 수정
  
  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams(prev => {
        prev.set('page', newPage.toString());
        return prev;
      });
      window.scrollTo(0, 0);
    }
  };

  // 검색 실행
  const handleSearch = () => {
    setSearchParams(prev => {
      prev.set('keyword', searchInput);
      prev.set('page', '1'); // 검색하면 1페이지로 이동
      return prev;
    });
  };

  // 정렬 변경 핸들러
  const handleSortChange = (newSort: string) => {
    setSearchParams(prev => {
      prev.set('sort', newSort);
      prev.set('page', '1'); // 정렬 바꾸면 1페이지로 리셋
      return prev;
    });
  };

  // 상세 페이지 이동
  const handleCardClick = (id: string) => {
    navigate(`/food/${id}`); 
  };

  // 페이지 점프 (Go)
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
  
  // 엔터키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: 'search' | 'jump') => {
    if (e.key === 'Enter') {
      if (type === 'search') handleSearch();
      else handleJumpToPage();
    }
  };

  // 4. 계산 로직
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
        </div>
        <div className="sort-buttons">
          <button 
            className={currentSort === "latest" ? "active" : ""} 
            onClick={() => handleSortChange("latest")}
          >
            최신순
          </button> | 
          <button 
            className={currentSort === "popular" ? "active" : ""} 
            onClick={() => handleSortChange("popular")}
          >
            인기순
          </button> | 
          <button 
            className={currentSort === "name" ? "active" : ""} 
            onClick={() => handleSortChange("name")}
          >
            가나다순
          </button>
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
      <div className="pagination-wrapper">
        
        {/* 숫자 페이징 */}
        <div className="pagination-numbers">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="page-btn prev-next">
            &lt;
          </button>

          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`page-btn ${currentPage === pageNum ? "active" : ""}`}
            >
              {pageNum}
            </button>
          ))}

          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="page-btn prev-next">
            &gt;
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
    </div>
  );
};

export default FoodList;