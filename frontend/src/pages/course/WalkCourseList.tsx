import React, { useState, useEffect } from "react";
import axios from "axios";
import "./WalkCourseList.css";
import { useNavigate, useLocation } from "react-router-dom";

interface WalkCourse {
  id: string;
  title: string;
  subtitle?: string;
  place?: string;
  image_url?: string;
  category?: string;
}

const WalkCourseList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const defaultPage = Number(query.get("page")) || 1;
  const defaultKeyword = query.get("keyword") || "";

  const [courses, setCourses] = useState<WalkCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(defaultPage);
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [searchInput, setSearchInput] = useState(defaultKeyword);

  const [total, setTotal] = useState(0);
  const size = 12;
  const pageGroupSize = 10;

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (keyword) params.set("keyword", keyword);
    navigate(`/course/walk?${params.toString()}`, { replace: true });
  }, [page, keyword, navigate]);

  useEffect(() => {
    const fetchWalk = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8484/api/walk/search", {
          params: { page, size, keyword },
        });

        setCourses(res.data.list || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error("[walk] 데이터 로딩 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWalk();
  }, [page, keyword]);

  const totalPages = Math.max(1, Math.ceil(total / size));
  const startPage = Math.floor((page - 1) / pageGroupSize) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const handleSearch = () => {
    setPage(1);
    setKeyword(searchInput);
  };

  if (loading)
    return <div className="loading">도보 여행 정보를 불러오는 중입니다...</div>;

  return (
    <div className="walk-container">
      <div className="search-filter-container">
        <h2 className="search-title">부산 도보 여행 🥾</h2>
        <p className="search-sub">부산의 다양한 도보 여행 코스를 둘러보세요.</p>

        <div className="search-box-wrapper">
          <input
            type="text"
            placeholder="지역명 또는 코스명 검색"
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

      <div className="list-info-bar">
        총 <b>{total.toLocaleString()}</b>개의 도보 코스
      </div>

      <div className="walk-list-wrapper">
        {courses.length === 0 ? (
          <div className="empty">검색 결과가 없습니다.</div>
        ) : (
          courses.map((course) => (
            <div
              className="walk-card"
              key={course.id}
              onClick={() =>
                navigate(
                  `/course/walk/${course.id}?page=${page}&keyword=${keyword}`
                )
              }
              style={{ cursor: "pointer" }}
            >
              <div className="walk-image-box">
                <img
                  src={
                    course.image_url ||
                    "https://via.placeholder.com/200?text=Walk+Course"
                  }
                  alt={course.title}
                />
              </div>

              <div className="walk-info-box">
                <h3 className="walk-title">{course.title}</h3>
                {course.subtitle && (
                  <p className="walk-sub">{course.subtitle}</p>
                )}
                {course.category && (
                  <p className="walk-cat">📁 {course.category}</p>
                )}
                {course.place && (
                  <p className="walk-address">📍 {course.place}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

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

export default WalkCourseList;
