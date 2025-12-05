import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FoodList.css";

interface FoodData {
  id: string;
  title: string;
  address: string;
  menu_t: string;
  image_url: string;
  description: string;
}

const FoodList: React.FC = () => {
  // 1. 데이터 상태
  const [foods, setFoods] = useState<FoodData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 2. 검색 및 페이징 상태
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0); 
  const [keyword, setKeyword] = useState("");      // 실제 검색에 쓰일 키워드
  const [searchInput, setSearchInput] = useState(""); // 검색창 입력값
  const [inputPage, setInputPage] = useState("");  // 페이지 점프 입력값

  const size = 10;          // 한 페이지당 개수
  const pageGroupSize = 10; // 페이징 그룹 크기 (1~10)

  // 3. 데이터 불러오기 (page나 keyword가 바뀌면 실행)
  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8484/api/food/search", {
          params: { 
            page: page, 
            size: size,
            keyword: keyword // 검색어 파라미터 추가
          }
        });

        const listData = response.data.list || [];
        const totalCount = response.data.total || 0;

        setFoods(listData);
        setTotal(totalCount);

      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, [page, keyword]); // page 또는 keyword가 변경될 때마다 재실행

  // 4. 계산 로직
  const totalPages = total > 0 ? Math.ceil(total / size) : 1;
  const startPage = Math.floor((page - 1) / pageGroupSize) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  // 5. 핸들러 함수들
  
  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  // 페이지 점프 (Go)
  const handleJumpToPage = () => {
    const pageNum = Number(inputPage);
    if (!inputPage || isNaN(pageNum)) {
      alert("숫자를 입력해주세요.");
      return;
    }
    if (pageNum < 1 || pageNum > totalPages) {
      alert(`1부터 ${totalPages} 사이의 페이지를 입력해주세요.`);
      return;
    }
    setPage(pageNum);
    setInputPage("");
    window.scrollTo(0, 0);
  };

  // 검색 버튼 클릭
  const handleSearch = () => {
    setKeyword(searchInput); // 검색어 상태 업데이트 -> useEffect 실행됨
    setPage(1);              // 검색하면 1페이지로 이동
  };

  // 엔터키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: 'search' | 'jump') => {
    if (e.key === 'Enter') {
      if (type === 'search') handleSearch();
      else handleJumpToPage();
    }
  };

  if (loading) return <div style={{ padding:"100px", textAlign:"center", fontSize:"18px" }}>데이터를 불러오는 중입니다...</div>;

  return (
    <div className="food-list-container" style={{ paddingBottom: "100px" }}>
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

      {/* ▼▼▼ 2. 리스트 정보 바 (총 개수) ▼▼▼ */}
      <div className="list-info-bar">
        <div className="total-count">
          총 <b>{total.toLocaleString()}</b>개의 맛집이 검색되었습니다.
        </div>
        <div className="sort-buttons">
          <button className="active">최신순</button> | 
          <button>인기순</button> | 
          <button>가나다순</button>
        </div>
      </div>

      {/* ▼▼▼ 3. 맛집 리스트 영역 ▼▼▼ */}
      <div className="food-list-wrapper">
        {foods.length === 0 ? (
          <div style={{ padding:"50px", textAlign:"center", width: "100%" }}>검색 결과가 없습니다.</div>
        ) : (
          foods.map((food, index) => (
            <div key={food.id || index} className="food-card">
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
              </div>
            </div>
          ))
        )}
      </div>

      {/* ▼▼▼ 4. 하단 페이징 영역 (숫자 + 점프) ▼▼▼ */}
      <div className="pagination-wrapper">
        
        {/* 숫자 페이징 */}
        <div className="pagination-numbers">
          <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="page-btn prev-next">
            &lt;
          </button>

          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`page-btn ${page === pageNum ? "active" : ""}`}
            >
              {pageNum}
            </button>
          ))}

          <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="page-btn prev-next">
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