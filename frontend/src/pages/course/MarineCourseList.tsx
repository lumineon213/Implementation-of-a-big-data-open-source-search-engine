import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MarineCourseList.css";
import { useNavigate, useLocation } from "react-router-dom";

interface MarineCourse {
  id: string;
  title: string;
  subtitle?: string;
  address?: string | string[];
  image_url?: string;
}

const MarineCourseList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const defaultPage = Number(query.get("page")) || 1;
  const defaultKeyword = query.get("keyword") || "";

  const [courses, setCourses] = useState<MarineCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(defaultPage);
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [searchInput, setSearchInput] = useState(defaultKeyword);

  const [total, setTotal] = useState(0);
  const size = 12;
  const pageGroupSize = 10;

  /** 🔄 URL 유지 */
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (keyword) params.set("keyword", keyword);

    navigate(`/course/marine?${params.toString()}`, { replace: true });
  }, [page, keyword]);

  /** 📡 API 호출 */
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

  /** 🔢 페이징 그룹 */
  const currentGroup = Math.floor((page - 1) / pageGroupSize);
  const startPage = currentGroup * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const handleSearch = () => {
    setPage(1);
    setKeyword(searchInput);
  };

  if (loading) return <div className="loading">해양 체험 정보를 불러오는 중입니다...</div>;

  return (
    <div className="marine-list-page">
      <div className="marine-list-container">

        {/* 헤더 */}
        <div className="marine-list-header">
          <h2 className="marine-list-title">부산 해양 체험 🌊</h2>
          <p className="marine-list-sub">서핑 · 요트 · 아쿠아리움 등 바다 여행 코스를 만나보세요.</p>
        </div>

        {/* 검색 */}
        <div className="marine-list-search-box">
          <input
            type="text"
            placeholder="시설명 또는 지역명 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="marine-list-search-input"
          />
          <button className="marine-list-search-btn" onClick={handleSearch}>
            검색
          </button>
        </div>

        {/* 총 개수 */}
        <div className="marine-list-info-bar">
          총 <span className="marine-list-total">{total.toLocaleString()}</span>개의 해양 체험
        </div>

        {/* 리스트 */}
        <div className="marine-list-grid">
          {courses.length === 0 ? (
            <div className="marine-list-empty">검색 결과가 없습니다.</div>
          ) : (
            courses.map((course) => {
              const addressText = Array.isArray(course.address)
                ? course.address.join(" ")
                : course.address || "";

              return (
                <div
                  key={course.id}
                  className="marine-list-card"
                  onClick={() =>
                    navigate(`/course/marine/${course.id}?page=${page}&keyword=${keyword}`)
                  }
                >
                  <div className="marine-list-image-box">
                    <img
                      src={course.image_url || "https://via.placeholder.com/200?text=Marine"}
                      alt={course.title}
                    />
                  </div>

                  <div className="marine-list-info">
                    <h3 className="marine-list-card-title">{course.title}</h3>

                    {course.subtitle && (
                      <p className="marine-list-card-sub">{course.subtitle}</p>
                    )}

                    {course.address && (
                      <p className="marine-address">{addressText}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 페이지네이션 */}
        <div className="marine-list-pagination">
          {/* 이전 그룹 */}
          <button
            className="marine-list-page-btn"
            onClick={() => setPage(startPage - 1)}
            disabled={page === 1}
          >
            &lt;
          </button>

          {/* 페이징 번호 */}
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
            const num = startPage + i;
            return (
              <button
                key={num}
                className={`marine-list-page-btn ${num === page ? "active" : ""}`}
                onClick={() => setPage(num)}
              >
                {num}
              </button>
            );
          })}

          {/* 다음 그룹 */}
          <button
            className="marine-list-page-btn"
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

export default MarineCourseList;
