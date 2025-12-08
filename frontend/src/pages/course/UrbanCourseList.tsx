import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UrbanCourseList.css";

interface UrbanCourse {
  id: string;
  title: string;
  subtitle?: string;
  address?: string;
  image_url?: string;
}

const UrbanCourseList: React.FC = () => {
  const [courses, setCourses] = useState<UrbanCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [inputPage, setInputPage] = useState("");

  const size = 9; 
  const pageGroupSize = 10;

  useEffect(() => {
    const fetchUrban = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8484/api/urban/search", {
          params: { page, size, keyword }
        });

        console.log("🏙 urban search:", res.data);

        const listData = res.data.list || [];
        const totalCount = res.data.total || 0;

        setCourses(listData);
        setTotal(totalCount);
      } catch (err) {
        console.error("[urban] 데이터 로딩 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUrban();
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
      alert(`1~${totalPages} 사이의 페이지를 입력해주세요.`);
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

  if (loading) return <div className="loading">도심 관광 정보를 불러오는 중입니다...</div>;

  return (
    <div className="urban-container">
      
      <div className="search-filter-container">
        <h2 className="search-title">부산 도심 관광 🏙</h2>
        <p className="search-sub">전시·카페·공원·도심 명소 등 다양한 도심 여행을 둘러보세요.</p>

        <div className="search-box-wrapper">
          <input
            type="text"
            placeholder="시설명 또는 지역명 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "search")}
            className="main-search-input"
          />
          <button className="main-search-btn" onClick={handleSearch}>검색</button>
        </div>
      </div>

      <div className="list-info-bar">
        총 <b>{total.toLocaleString()}</b>개의 도심 관광지
      </div>

      <div className="urban-list-wrapper">
        {courses.length === 0 ? (
          <div className="empty">검색 결과가 없습니다.</div>
        ) : (
          courses.map((course) => (
            <div className="urban-card" key={course.id}>
              <div className="urban-image-box">
                <img
                  src={course.image_url || "https://via.placeholder.com/200?text=Urban"}
                  alt={course.title}
                />
              </div>
              <div className="urban-info-box">
                <h3 className="urban-title">{course.title}</h3>
                {course.subtitle && <p className="urban-sub">{course.subtitle}</p>}
                {course.address && <p className="urban-address">{course.address}</p>}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pagination-wrapper">
        <div className="pagination-numbers">
          <button className="page-btn prev-next" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
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

          <button className="page-btn prev-next" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
            &gt;
          </button>
        </div>

        <div className="pagination-jump">
          <input
            type="number"
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "jump")}
            placeholder="Go"
            className="jump-input"
          />
          <button className="jump-btn" onClick={handleJumpToPage}>이동</button>
        </div>
      </div>
    </div>
  );
};

export default UrbanCourseList;
