import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

interface FestivalItem {
  id: string;
  title: string;
  subtitle?: string;
  address?: string;
  place?: string;
  gugun?: string;
  description?: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
}

const PAGE_SIZE = 10;

const TravelFestival: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentKeyword = searchParams.get("keyword") || "";

  const [festivals, setFestivals] = useState<FestivalItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(currentKeyword);

  useEffect(() => {
    const fetchFestivals = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8484/api/festival/search", {
          params: {
            keyword: currentKeyword,
            page: currentPage,
            size: PAGE_SIZE,
          },
        });

        setFestivals(res.data.list || []);
        setTotal(res.data.total || 0);
      } catch (e) {
        console.error("축제 데이터 로딩 실패", e);
      } finally {
        setLoading(false);
      }
    };

    fetchFestivals();
  }, [currentKeyword, currentPage]);

  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;

  const handleSearch = () => {
    setSearchParams((prev) => {
      prev.set("keyword", searchInput);
      prev.set("page", "1");
      return prev;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setSearchParams((prev) => {
      prev.set("page", page.toString());
      return prev;
    });
    window.scrollTo(0, 0);
  };

  const handleCardClick = (id: string) => {
    navigate(`/info/festival/${encodeURIComponent(id)}`);
  };

  if (loading) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center" }}>
        축제 정보를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 20px 80px", maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>부산축제 정보</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        부산의 다양한 축제 일정을 확인하고, 상세 정보를 지도와 함께 살펴보세요.
      </p>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
        }}
      >
        <input
          type="text"
          placeholder="축제 이름, 구군, 장소로 검색"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#2b6cb0",
            color: "#fff",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          검색
        </button>
      </div>

      <div style={{ marginBottom: 16, color: "#666", fontSize: 14 }}>
        총 <b>{total.toLocaleString()}</b>개의 축제가 검색되었습니다.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {festivals.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#777" }}>
            검색 결과가 없습니다.
          </div>
        ) : (
          festivals.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item.id)}
              style={{
                borderRadius: 12,
                border: "1px solid #e5e5e5",
                padding: 16,
                cursor: "pointer",
                transition: "box-shadow 0.15s ease, transform 0.1s ease, border-color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 4px 14px rgba(0,0,0,0.08)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "#2b6cb0";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                (e.currentTarget as HTMLDivElement).style.borderColor = "#e5e5e5";
              }}
            >
              <h2 style={{ fontSize: 18, marginBottom: 4 }}>{item.title}</h2>
              {item.subtitle && (
                <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>
                  {item.subtitle}
                </div>
              )}
              <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>
                {item.gugun && <span>[{item.gugun}] </span>}
                {item.place && <span>{item.place} · </span>}
                {item.address}
              </div>
              {item.description && (
                <div style={{ fontSize: 13, color: "#777" }}>
                  {item.description.length > 80
                    ? item.description.substring(0, 80) + "..."
                    : item.description}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            marginTop: 32,
          }}
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ padding: "6px 10px" }}
          >
            &lt;
          </button>
          <span style={{ fontSize: 14, color: "#555" }}>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ padding: "6px 10px" }}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default TravelFestival;
