import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ThemeCourseList.css";

interface ThemeCourse {
  id: string;
  title: string;
  subtitle?: string;
  address?: string;
  image_url?: string;
}

const ThemeCourseList: React.FC = () => {
  const [courses, setCourses] = useState<ThemeCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [inputPage, setInputPage] = useState("");

  const size = 9;
  const pageGroupSize = 10;

  useEffect(() => {
    const fetchTheme = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8484/api/theme/search", {
          params: { page, size, keyword }
        });

        console.log("🔍 theme search:", res.data);

        const listData = res.data.data || res.data.list || [];
        const totalCount = res.data.total || res.data.count || 0;

        setCourses(listData);
        setTotal(totalCount);
      } catch (err) {
        console.error("[Theme] 검색 오류:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, [page, keyword]);

  const totalPages = total > 0 ? Math.ceil(total / size) : 1;

  const startPage = Math.floor((page - 1) / pageGroupSize) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  const handleJumpToPage = () => {
    const pageNum = Number(inputPage);
    if (!inputPage || isNaN(pageNum)) {
      alert("숫자를 입력해주세요.");
      return;
    }
    if (pageNum < 1 || pageNum > totalPages) {
      alert(`1~${totalPages} 범위의 숫자를 입력해주세요.`);
      return;
    }
    setPage(pageNum);
    setInputPage("");
    window.scrollTo(0, 0);
  };

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

  if (loading) return <div className="loading">테마 여행 정보를 불러오는 중입니다...</div>;

  return (
    <div className="theme-container">
      {/* 검색 영역 */}
      <div className="search-filter-container">
        <h2 className="search-title">부산 테마 여행 🌴</h2>
        <p className="search-sub">바다 · 숲 · 감성 · 사진 명소까지 한눈에!</p>

        <div className="search-box-wrapper">
          <input
            type="text"
            placeholder="테마명 또는 지역명 검색"
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

      {/* 리스트 정보 */}
      <div className="list-info-bar">
        총 <b>{total.toLocaleString()}</b>개의 테마 여행
      </div>

      {/* 리스트 출력 */}
      <div className="theme-list-wrapper">
        {courses.length === 0 ? (
          <div className="empty">검색 결과가 없습니다.</div>
        ) : (
          courses.map((course) => (
            <div className="theme-card" key={course.id}>
              <div className="theme-image-box">
                <img
                  src={course.image_url || "https://via.placeholder.com/200?text=Theme"}
                  alt={course.title}
                />
              </div>
              <div className="theme-info-box">
                <h3 className="theme-title">{course.title}</h3>
                {course.subtitle && <p className="theme-sub">{course.subtitle}</p>}
                {course.address && <p className="theme-address">{course.address}</p>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이징 */}
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

        {/* 점프 */}
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

export default ThemeCourseList;
