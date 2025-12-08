import React, { useState } from "react";
import axios from "axios";
import "./Notice.css";

const NoticeWrite: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해 주세요.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        "http://localhost:8484/api/notices",
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("공지사항 등록 요청을 전송했습니다.");
      setTitle("");
      setContent("");
    } catch (e: any) {
      if (e?.response?.status === 403) {
        alert("관리자만 공지사항을 등록할 수 있습니다.");
      } else {
        alert("공지사항 등록 중 오류가 발생했습니다.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="notice-page">
      <div className="notice-header">
        <h1>공지사항 작성</h1>
        <p>관리자 전용 공지 등록 페이지입니다.</p>
      </div>

      <form className="notice-write-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="공지 제목을 입력하세요"
          />
        </div>
        <div className="form-group">
          <label>내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder="공지 내용을 입력하세요"
          />
        </div>
        <button type="submit" className="notice-write-btn" disabled={submitting}>
          {submitting ? "등록 중..." : "등록"}
        </button>
      </form>
    </div>
  );
};

export default NoticeWrite;
