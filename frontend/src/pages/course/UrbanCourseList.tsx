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

  // URL 쿼리 가져오기
  const query = new URLSearchParams(location.search);
  const defaultPage = Number(query.get("page")) || 1;
  const defaultKeyword = query.get("keyword") || "";

  const [courses, setCourses] = useState<UrbanCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(defaultPage);
  const [keyword, setKeyword] = useState(defaultKeyword);

  const [searchInput, setSearchInput] = useState(defaultKeyword);
  const [inputPage, setInputPage] = useState("");

  const size = 9;
  const pageGroupSize = 10;

  // 리스트 로딩
  useEffect(() => {
    const fetchUrban = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8484/api/urban/search", {
          params: { page, size, keyword },
        });
        setCourses(res.data.list || []);
        setLoading(false);
      } catch (err) {
        console.error("[urban] 로딩 실패", err);
        setLoading(false);
      }
    };

    fetchUrban();
  }, [page, keyword]);

  // URL 업데이트 (뒤로가기 대비)
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (keyword) params.set("keyword", keyword);

    navigate(`/course/urban?${params.toString()}`, { replace: true });
  }, [page, keyword, navigate]);

  const totalPages = 20; // 필요한 경우 서버 total 처리

  const handleSearch = () => {
    setKeyword(searchInput);
    setPage(1);
  };

  const handleJumpToPage = () => {
    const pageNum = Number(inputPage);
    if (!pageNum || pageNum < 1 || pageNum > totalPages) return;
    setPage(pageNum);
    setInputPage("");
  };

  if (loading) return <div className="loading">불러오는 중...</div>;

  return (
    <div className="urban-container">

      {/* 검색 영역 */}
      <div className="search-filter-container">
        <h2 className="search-title">부산 도심 관광 🏙</h2>
        <p className="search-sub">도심 관광지 정보를 검색해보세요.</p>

        <div className="search-box-wrapper">
          <input
            type="text"
            placeholder="지역명 또는 시설 검색"
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

      {/* 리스트 */}
      <div className="urban-list-wrapper">
        {courses.map((course) => (
          <div
            className="urban-card"
            key={course.id}
            onClick={() =>
              navigate(
                `/course/urban/${course.id}?page=${page}&keyword=${keyword}`
              )
            }
          >
            <div className="urban-image-box">
              <img
                src={course.image_url || "https://via.placeholder.com/200"}
                alt={course.title}
              />
            </div>

            <div className="urban-info-box">
              <h3 className="urban-title">{course.title}</h3>
              {course.subtitle && <p className="urban-sub">{course.subtitle}</p>}
              {course.address && <p className="urban-address">{course.address}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="pagination-wrapper">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          &lt;
        </button>

        <button onClick={() => setPage(page + 1)}>&gt;</button>

        <input
          type="number"
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleJumpToPage()}
          placeholder="Go"
        />
        <button onClick={handleJumpToPage}>이동</button>
      </div>
    </div>
  );
};

export default UrbanCourseList;
