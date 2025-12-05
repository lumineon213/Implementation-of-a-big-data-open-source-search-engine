import React, { useState, useEffect } from "react";
import axios from "axios";
import "./WalkCourseList.css";

interface WalkCourse {
  id: string;
  title: string;
  address: string;
  image_url: string;
  description?: string;
}

const WalkCourseList: React.FC = () => {
  // 데이터 관련 상태
  const [courses, setCourses] = useState<WalkCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // 검색 + 페이징 상태
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [inputPage, setInputPage] = useState("");

  const size = 10; // 한 페이지 개수
  const pageGroupSize = 10;

  // API 호출 (page, keyword 바뀔 때마다 실행)
  useEffect(() => {
    const fetchWalk = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8484/api/walk/search", {
          params: {
            page,
            size,
            keyword
          }
        });

        console.log("🚀 walk search response:", response.data);

        const listData = response.data.list || [];
        const totalCount = response.data.total || 0;

        setCourses(listData);
        setTotal(totalCount);
      } catch (err) {
        console.error("[walk] 데이터 로딩 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWalk();
  }, [page, keyword]);

  // 전체 페이지 수 계산
  const totalPages = total > 0 ? Math.ceil(total / size) : 1;

  const startPage = Math.floor((page - 1) / pageGroupSize) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  // 페이지 점프
  const handleJumpToPage = () => {
    const pageNum = Number(inputPage);
    if (!inputPage || isNaN(pageNum)) {
      alert("숫자를 입력해주세요.");
      return;
    }
    if (pageNum < 1 || pageNum > totalPages) {
      alert(`1~${totalPages} 사이의 페이지를 입력해주세요.`);
      return;
    }
    setPage(pageNum);
    setInputPage("");
    window.scrollTo(0, 0);
  };

  // 검색
  const handleSearch = () => {
    setKeyword(searchInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: "search" | "jump") => {
    if (e.key === "Enter") {
      if (type === "search") handleSearch();
      else handleJumpToPage();
    }
  };

  if (loading) {
    return <div className="loading">도보 여행 정보를 불러오는 중입니다...</div>;
  }

  return (
    <div className="walk-container">

      {/* 검색 영역 */}
      <div className="search-filter-container">
        <h2 className="search-title">부산 도보 여행 코스 🥾</h2>
        <p className="search-sub">부산의 다양한 도보 여행 코스를 둘러보세요.</p>

        <div className="search-box-wrapper">
          <input
            type="text"
            placeholder="지역명 또는 코스명 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "search")}
            className="main-search-input"
          />
          <button className="main-search-btn" onClick={handleSearch}>
            검색
          </button>
        </div>
      </div>

      {/* 리스트 정보 영역 */}
      <div className="list-info-bar">
        <div className="total-count">
          총 <b>{total.toLocaleString()}</b>개의 도보 코스
        </div>
      </div>

      {/* 리스트 출력 */}
      <div className="walk-list-wrapper">
        {courses.length === 0 ? (
          <div className="empty">검색 결과가 없습니다.</div>
        ) : (
          courses.map((course) => (
            <div className="walk-card" key={course.id}>
              <div className="walk-image-box">
                <img
                  src={course.image_url || "https://via.placeholder.com/200?text=Walk+Course"}
                  alt={course.title}
                />
              </div>
              <div className="walk-info-box">
                <h3 className="walk-title">{course.title}</h3>
                <p className="walk-address">{course.address}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이징 영역 */}
      <div className="pagination-wrapper">
        <div className="pagination-numbers">
          <button
            className="page-btn prev-next"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            &lt;
          </button>

          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((num) => (
            <button
              key={num}
              className={`page-btn ${page === num ? "active" : ""}`}
              onClick={() => handlePageChange(num)}
            >
              {num}
            </button>
          ))}

          <button
            className="page-btn prev-next"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            &gt;
          </button>
        </div>

        {/* 페이지 점프 */}
        <div className="pagination-jump">
          <input
            type="number"
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "jump")}
            placeholder="Go"
            className="jump-input"
          />
          <button className="jump-btn" onClick={handleJumpToPage}>
            이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalkCourseList;
