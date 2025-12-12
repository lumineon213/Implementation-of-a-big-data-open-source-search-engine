import React, { useEffect, useState } from "react";
import { useDarkMode } from "../contexts/DarkModeContext";

// 기본 썸네일 이미지 경로 (public 폴더에 default-thumbnail.png 필요)
const defaultThumbnail = "/default-thumbnail.png";

// 카페 데이터 타입 정의 (중복 제거)
type CafeDoc = {
  id?: string;
  _title?: string[];
  title?: string[];
  summary?: string[];
  url?: string[];
  author?: string[];
  postdate?: string[];
  thumbnail?: string[];
};

const PAGE_SIZE = 10;

const CafePage: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const [cafes, setCafes] = useState<CafeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchCafes = async () => {
      try {
        setLoading(true);
        setError(null);
        // 실제 Solr 카페 core 이름에 맞게 수정 필요
        const res = await fetch("/solr/Ncafe_core/select?q=*:*&wt=json&rows=100");
        const data = await res.json();
        setCafes(data.response?.docs || []);
      } catch (err) {
        setError("카페 데이터를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchCafes();
  }, []);

  const totalPages = Math.ceil(cafes.length / PAGE_SIZE);
  const pagedCafes = cafes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getDarkModeStyle = (lightStyle: React.CSSProperties): React.CSSProperties => {
    if (!isDarkMode) return lightStyle;
    return {
      ...lightStyle,
      backgroundColor: lightStyle.backgroundColor === "#fff" ? "var(--bg-secondary)" : lightStyle.backgroundColor,
      color: lightStyle.color === "#222" ? "var(--text-primary)" : 
             lightStyle.color === "#888" ? "var(--text-secondary)" : lightStyle.color,
      borderColor: lightStyle.borderColor === "#eee" ? "var(--border-color)" :
                   lightStyle.borderColor === "#ccc" ? "var(--border-color)" : lightStyle.borderColor,
      background: lightStyle.background === "#fff" ? "var(--bg-secondary)" :
                  lightStyle.background === "#f5f5f5" ? "var(--bg-tertiary)" :
                  lightStyle.background === "#eaf4ff" ? "rgba(100, 181, 246, 0.2)" : lightStyle.background,
    };
  };

  return (
    <div style={{ 
      maxWidth: 1100, 
      margin: "40px auto", 
      padding: "0 16px",
      backgroundColor: isDarkMode ? "var(--bg-primary)" : "transparent",
      minHeight: "100vh"
    }}>
      <h2 style={{ 
        fontSize: 28, 
        marginBottom: 24,
        color: isDarkMode ? "var(--text-primary)" : "#222"
      }}>카페 모음</h2>
      {loading && <div style={{ color: isDarkMode ? "var(--text-secondary)" : "#222" }}>로딩 중...</div>}
      {error && <div style={{ color: "#ff6b6b" }}>{error}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {pagedCafes.map((cafe: CafeDoc) => (
          <div
            key={cafe.id}
            style={getDarkModeStyle({
              display: "flex",
              alignItems: "flex-start",
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 18,
              background: "#fff",
              boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.04)",
              marginBottom: 4,
            })}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <a
                href={cafe.url?.[0] || "#"}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  fontSize: 18, 
                  fontWeight: 700, 
                  color: "#64b5f6", 
                  textDecoration: "none", 
                  marginBottom: 6, 
                  display: "inline-block" 
                }}
                dangerouslySetInnerHTML={{ __html: cafe.title?.[0] || cafe._title?.[0] || "" }}
              />
              <div style={{ 
                fontSize: 15, 
                color: isDarkMode ? "var(--text-secondary)" : "#222", 
                margin: "8px 0 6px 0" 
              }} dangerouslySetInnerHTML={{ __html: cafe.summary?.[0] || "" }} />
              <div style={{ 
                fontSize: 13, 
                color: isDarkMode ? "var(--text-tertiary)" : "#888" 
              }}>
                작성자: {cafe.author?.[0] || "알 수 없음"} | 날짜: {cafe.postdate?.[0] || ""}
              </div>
            </div>
            <img
              src={cafe.thumbnail?.[0] || defaultThumbnail}
              alt="썸네일"
              style={{ 
                width: 80, 
                height: 80, 
                objectFit: "cover", 
                borderRadius: 8, 
                marginLeft: 18, 
                background: isDarkMode ? "var(--bg-tertiary)" : "#f5f5f5" 
              }}
              onError={e => {
                if (e.currentTarget.src !== defaultThumbnail) {
                  e.currentTarget.src = defaultThumbnail;
                }
              }}
            />
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div style={{ marginTop: 32, textAlign: "center" }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              style={getDarkModeStyle({
                margin: "0 6px",
                padding: "8px 16px",
                borderRadius: 6,
                border: page === i + 1 ? "2px solid #64b5f6" : "1px solid #ccc",
                background: page === i + 1 ? (isDarkMode ? "rgba(100, 181, 246, 0.3)" : "#eaf4ff") : (isDarkMode ? "var(--bg-secondary)" : "#fff"),
                color: page === i + 1 ? "#64b5f6" : (isDarkMode ? "var(--text-primary)" : "#222"),
                fontWeight: page === i + 1 ? 700 : 400,
                cursor: "pointer",
                minWidth: 36,
              })}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CafePage;
