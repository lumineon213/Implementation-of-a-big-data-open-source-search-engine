import React, { useEffect, useState } from "react";

interface BlogDoc {
  id: string;
  _title: string[];
  summary: string[];
  url: string[];
  author: string[];
  postdate: number[];
  thumbnail: string[];
}

const PAGE_SIZE = 9; // 한 페이지당 9개(3x3)

const BlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        // 최대 100개까지 가져와서 프론트에서 페이징 처리
        const res = await fetch("/solr/Nblog_core/select?q=*:*&wt=json&rows=100");
        const data = await res.json();
        setBlogs(data.response?.docs || []);
      } catch (err) {
        setError("블로그 데이터를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // 페이징 계산
  const totalPages = Math.ceil(blogs.length / PAGE_SIZE);
  const pagedBlogs = blogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: "0 16px" }}>
      <h2 style={{ fontSize: 28, marginBottom: 24 }}>블로그 모음</h2>
      {loading && <div>로딩 중...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {pagedBlogs.map((blog) => (
          <div
            key={blog.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 18,
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              marginBottom: 4,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <a
                href={blog.url[0]}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 18, fontWeight: 700, color: "#2c7be5", textDecoration: "none", marginBottom: 6, display: "inline-block" }}
                dangerouslySetInnerHTML={{ __html: blog._title[0] }}
              />
              <div style={{ fontSize: 15, color: "#222", margin: "8px 0 6px 0" }} dangerouslySetInnerHTML={{ __html: blog.summary[0] }} />
              <div style={{ fontSize: 13, color: "#888" }}>
                작성자: {blog.author[0]} | 날짜: {blog.postdate[0]}
              </div>
            </div>
            <img
              src={blog.thumbnail[0]}
              alt="썸네일"
              style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, marginLeft: 18, background: "#f5f5f5" }}
              onError={e => (e.currentTarget.style.display = "none")}
            />
          </div>
        ))}
      </div>
      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div style={{ marginTop: 32, textAlign: "center" }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              style={{
                margin: "0 6px",
                padding: "8px 16px",
                borderRadius: 6,
                border: page === i + 1 ? "2px solid #2c7be5" : "1px solid #ccc",
                background: page === i + 1 ? "#eaf4ff" : "#fff",
                color: page === i + 1 ? "#2c7be5" : "#222",
                fontWeight: page === i + 1 ? 700 : 400,
                cursor: "pointer",
                minWidth: 36,
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPage;
