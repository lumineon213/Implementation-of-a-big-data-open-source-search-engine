import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UrbanCourseList.css";
import { useNavigate, useLocation } from "react-router-dom";

interface UrbanCourse {
  id: string;
  title: string;
  subtitle?: string;
  address?: string | string[];
  image_url?: string;
}

const UrbanCourseList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // URL 쿼리 파싱
  const query = new URLSearchParams(location.search);
  const defaultPage = Number(query.get("page")) || 1;
  const defaultKeyword = query.get("keyword") || "";

  const [courses, setCourses] = useState<UrbanCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(defaultPage);
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [searchInput, setSearchInput] = useState(defaultKeyword);

  const [total, setTotal] = useState(0);
  const size = 12;
  const pageGroupSize = 10;

  // URL 변경 반영
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (keyword) params.set("keyword", keyword);

    navigate(`/course/urban?${params.toString()}`, { replace: true });
  }, [page, keyword]);

  // API 호출
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

  const currentGroup = Math.floor((page - 1) / pageGroupSize);
  const startPage = currentGroup * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const handleSearch = () => {
    setPage(1);
    setKeyword(searchInput);
  };

  if (loading)
    return <div className="loading">도심 관광 정보를 불러오는 중입니다...</div>;

  return (
    <div className="urban-list-page">
      <div className="urban-list-container">
        
        {/* 제목 */}
        <div className="urban-list-header">
          <h2 className="urban-list-title">부산 도심 관광 🏙</h2>
          <p className="urban-list-sub">
            전시 · 카페 · 공원 · 도심 명소 등 다양한 도시 여행지
          </p>
        </div>

        {/* 검색 */}
        <div className="urban-list-search-box">
          <input
            type="text"
            placeholder="시설명 또는 지역명 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="urban-list-search-input"
          />
          <button className="urban-list-search-btn" onClick={handleSearch}>
            검색
          </button>
        </div>

        {/* 총 개수 */}
        <div className="urban-list-info-bar">
          총 <span className="urban-list-total">{total.toLocaleString()}</span>개의 도심 관광지
        </div>

        {/* 리스트 */}
        <div className="urban-list-grid">
          {courses.length === 0 ? (
            <div className="urban-list-empty">검색 결과가 없습니다.</div>
          ) : (
            courses.map((course) => {
              const addressText = Array.isArray(course.address)
                ? course.address.join(" ")
                : course.address || "";

              return (
                <div
                  key={course.id}
                  className="urban-list-card"
                  onClick={() =>
                    navigate(`/course/urban/${course.id}?page=${page}&keyword=${keyword}`)
                  }
                >
                  <div className="urban-list-image-box">
                    <img
                      src={course.image_url || "https://via.placeholder.com/200?text=Urban"}
                      alt={course.title}
                    />
                  </div>

                  <div className="urban-list-info">
                    <h3 className="urban-list-card-title">{course.title}</h3>

                    {course.subtitle && (
                      <p className="urban-list-card-sub">{course.subtitle}</p>
                    )}

                    {addressText && (
                      <p className="urban-address">{addressText}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 페이지네이션 */}
        <div className="urban-list-pagination">
          <button
            className="urban-list-page-btn"
            onClick={() => setPage(startPage - 1)}
            disabled={page === 1}
          >
            &lt;
          </button>

          {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
            const num = startPage + i;
            return (
              <button
                key={num}
                className={`urban-list-page-btn ${num === page ? "active" : ""}`}
                onClick={() => setPage(num)}
              >
                {num}
              </button>
            );
          })}

          <button
            className="urban-list-page-btn"
            onClick={() => setPage(endPage + 1)}
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
