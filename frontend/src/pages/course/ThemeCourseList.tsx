import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ThemeCourseList.css";
import { useNavigate, useLocation } from "react-router-dom";

interface ThemeCourse {
  id: string;
  title: string;
  subtitle?: string;
  address?: string | string[];   // 🔥 배열 + 문자열 둘 다 허용
  image_url?: string;
}


const ThemeCourseList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const defaultPage = Number(query.get("page")) || 1;
  const defaultKeyword = query.get("keyword") || "";

  const [courses, setCourses] = useState<ThemeCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(defaultPage);
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [searchInput, setSearchInput] = useState(defaultKeyword);

  const [total, setTotal] = useState(0);
  const size = 12;
  const pageGroupSize = 10;

  /** 🔄 URL 상태 유지 */
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (keyword) params.set("keyword", keyword);

    navigate(`/course/theme?${params.toString()}`, { replace: true });
  }, [page, keyword]);

  /** 📡 API 호출 */
  useEffect(() => {
    const fetchTheme = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8484/api/theme/search", {
          params: { page, size, keyword },
        });

        setCourses(res.data.list || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error("[theme] 데이터 로딩 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, [page, keyword]);

  const totalPages = Math.max(1, Math.ceil(total / size));

  /** 🔢 페이징 그룹 계산 */
  const currentGroup = Math.floor((page - 1) / pageGroupSize);
  const startPage = currentGroup * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  /** 🔍 검색 */
  const handleSearch = () => {
    setPage(1);
    setKeyword(searchInput);
  };

  if (loading) return <div className="loading">테마 여행 정보를 불러오는 중입니다...</div>;

  return (
    <div className="theme-list-page">
      <div className="theme-list-container">

        {/* 헤더 */}
        <div className="theme-list-header">
          <h2 className="theme-list-title">부산 테마 여행 🌴</h2>
          <p className="theme-list-sub">바다 · 숲 · 감성 · 사진 명소까지 한눈에!</p>
        </div>

        {/* 검색 */}
        <div className="theme-list-search-box">
          <input
            type="text"
            placeholder="테마명 또는 지역명 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="theme-list-search-input"
          />
          <button className="theme-list-search-btn" onClick={handleSearch}>
            검색
          </button>
        </div>

        {/* 총 개수 */}
        <div className="theme-list-info-bar">
          총 <span className="theme-list-total">{total.toLocaleString()}</span>개의 테마 여행
        </div>

        {/* 리스트 */}
        <div className="theme-list-grid">
          {courses.length === 0 ? (
            <div className="theme-list-empty">검색 결과가 없습니다.</div>
          ) : (
            courses.map((course) => {
              const addressText = Array.isArray(course.address)
                ? course.address.join(" ")
                : course.address || "";

              return (
                <div
                  key={course.id}
                  className="theme-list-card"
                  onClick={() =>
                    navigate(`/course/theme/${course.id}?page=${page}&keyword=${keyword}`)
                  }
                >
                  <div className="theme-list-image-box">
                    <img
                      src={course.image_url || "https://via.placeholder.com/200?text=Theme"}
                      alt={course.title}
                    />
                  </div>

                  <div className="theme-list-info">
                    <h3 className="theme-list-card-title">{course.title}</h3>

                    {course.subtitle && (
                      <p className="theme-list-card-sub">{course.subtitle}</p>
                    )}

                    {course.address && (
                      <p className="theme-address">
                        {Array.isArray(course.address)
                          ? course.address.join(" ")
                          : course.address}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 페이지네이션 */}
        <div className="theme-list-pagination">
          {/* 이전 그룹 */}
          <button
            className="theme-list-page-btn"
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
                className={`theme-list-page-btn ${num === page ? "active" : ""}`}
                onClick={() => setPage(num)}
              >
                {num}
              </button>
            );
          })}

          {/* 다음 그룹 */}
          <button
            className="theme-list-page-btn"
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

export default ThemeCourseList;
