import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UrbanCourseList.css";
import { useNavigate, useLocation } from "react-router-dom";

interface UrbanCourse {
  id: string;
  title: string;
  subtitle?: string;
  address?: string;
  image_url?: string;
}

const UrbanCourseList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // URL 쿼리 읽기
  const query = new URLSearchParams(location.search);
  const defaultPage = Number(query.get("page")) || 1;
  const defaultKeyword = query.get("keyword") || "";

  const [courses, setCourses] = useState<UrbanCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(defaultPage);
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [searchInput, setSearchInput] = useState(defaultKeyword);

  const [total, setTotal] = useState(0);
  const size = 9;
  const pageGroupSize = 10;

  // URL 동기화 (page 또는 keyword 바뀔 때마다 반영)
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (keyword) params.set("keyword", keyword);
    navigate(`/course/urban?${params.toString()}`, { replace: true });
  }, [page, keyword, navigate]);

  // 데이터 로딩
  useEffect(() => {
    const fetchUrban = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8484/api/urban/search", {
          params: { page, size, keyword },
        });

        setCourses(res.data.list || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error("[urban] 데이터 로딩 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUrban();
  }, [page, keyword]);

  const totalPages = Math.max(1, Math.ceil(total / size));
  const startPage = Math.floor((page - 1) / pageGroupSize) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const handleSearch = () => {
    setPage(1);
    setKeyword(searchInput);
  };

  if (loading)
    return <div className="loading">도심 관광 정보를 불러오는 중입니다...</div>;

  return (
    <div className="urban-container">
      {/* 검색 영역 */}
      <div className="search-filter-container">
        <h2 className="search-title">부산 도심 관광 🏙</h2>
        <p className="search-sub">
          전시·카페·공원·도심 명소 등 다양한 도심 여행을 둘러보세요.
        </p>

        <div className="search-box-wrapper">
          <input
            type="text"
            placeholder="시설명 또는 지역명 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="main-search-input"
          />
          <button className="main-search-btn" onClick={handleSearch}>
            검색
          </button>
        </div>
      </div>

      {/* 총 개수 */}
      <div className="list-info-bar">
        총 <b>{total.toLocaleString()}</b>개의 도심 관광지
      </div>

      {/* 리스트 */}
      <div className="urban-list-wrapper">
        {courses.length === 0 ? (
          <div className="empty">검색 결과가 없습니다.</div>
        ) : (
          courses.map((course) => (
            <div
              className="urban-card"
              key={course.id}
              onClick={() =>
                navigate(
                  `/course/urban/${course.id}?page=${page}&keyword=${keyword}`
                )
              }
              style={{ cursor: "pointer" }}
            >
              <div className="urban-image-box">
                <img
                  src={
                    course.image_url ||
                    "https://via.placeholder.com/200?text=Urban"
                  }
                  alt={course.title}
                />
              </div>
              <div className="urban-info-box">
                <h3 className="urban-title">{course.title}</h3>
                {course.subtitle && (
                  <p className="urban-sub">{course.subtitle}</p>
                )}
                {course.address && (
                  <p className="urban-address">{course.address}</p>
                )}
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
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            &lt;
          </button>

          {Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
          ).map((num) => (
            <button
              key={num}
              className={`page-btn ${page === num ? "active" : ""}`}
              onClick={() => setPage(num)}
            >
              {num}
            </button>
          ))}

          <button
            className="page-btn prev-next"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default UrbanCourseList;
