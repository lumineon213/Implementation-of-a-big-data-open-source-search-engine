import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MarineCourseList.css";
import { useNavigate, useLocation } from "react-router-dom";

interface MarineCourse {
  id: string;
  title: string;
  subtitle?: string;
  address?: string;
  image_url?: string;
}

const MarineCourseList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // URL → 상태 초기화
  const query = new URLSearchParams(location.search);
  const defaultPage = Number(query.get("page")) || 1;
  const defaultKeyword = query.get("keyword") || "";

  const [courses, setCourses] = useState<MarineCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(defaultPage);
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [searchInput, setSearchInput] = useState(defaultKeyword);

  const [total, setTotal] = useState(0);
  const size = 9;
  const pageGroupSize = 10;

  // page 또는 keyword가 바뀌면 URL 동기화
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (keyword) params.set("keyword", keyword);

    navigate(`/course/marine?${params.toString()}`, { replace: true });
  }, [page, keyword, navigate]);

  // 데이터 불러오기
  useEffect(() => {
    const fetchMarine = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8484/api/marine/search", {
          params: { page, size, keyword },
        });

        setCourses(res.data.list || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error("[marine] 데이터 로딩 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarine();
  }, [page, keyword]);

  const totalPages = Math.max(1, Math.ceil(total / size));
  const startPage = Math.floor((page - 1) / pageGroupSize) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const handleSearch = () => {
    setPage(1);
    setKeyword(searchInput);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  if (loading) return <div className="loading">해양 체험 정보를 불러오는 중입니다...</div>;

  return (
    <div className="marine-container">

      {/* 검색 */}
      <div className="search-filter-container">
        <h2 className="search-title">부산 해양 체험 🌊</h2>
        <p className="search-sub">서핑 · 요트 · 아쿠아리움 등 바다 여행 코스를 만나보세요.</p>

        <div className="search-box-wrapper">
          <input
            type="text"
            placeholder="시설명 또는 지역명 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="main-search-input"
          />
          <button className="main-search-btn" onClick={handleSearch}>검색</button>
        </div>
      </div>

      {/* 총 개수 */}
      <div className="list-info-bar">
        총 <b>{total.toLocaleString()}</b>개의 해양 체험
      </div>

      {/* 리스트 */}
      <div className="marine-list-wrapper">
        {courses.length === 0 ? (
          <div className="empty">검색 결과가 없습니다.</div>
        ) : (
          courses.map((course) => (
            <div
              className="marine-card"
              key={course.id}
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(
                  `/course/marine/${course.id}?page=${page}&keyword=${keyword}`
                )
              }
            >
              <div className="marine-image-box">
                <img
                  src={course.image_url || "https://via.placeholder.com/200?text=Marine"}
                  alt={course.title}
                />
              </div>
              <div className="marine-info-box">
                <h3 className="marine-title">{course.title}</h3>
                {course.subtitle && <p className="marine-sub">{course.subtitle}</p>}
                {course.address && <p className="marine-address">{course.address}</p>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      <div className="pagination-wrapper">
        <div className="pagination-numbers">
          <button
            className="page-btn prev-next"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            &lt;
          </button>

          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
            (num) => (
              <button
                key={num}
                className={`page-btn ${page === num ? "active" : ""}`}
                onClick={() => handlePageChange(num)}
              >
                {num}
              </button>
            )
          )}

          <button
            className="page-btn prev-next"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarineCourseList;
