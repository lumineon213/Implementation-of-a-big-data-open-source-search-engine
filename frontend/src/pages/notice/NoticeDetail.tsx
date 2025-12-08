import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./Notice.css";

interface Notice {
  noticeId: number;
  title: string;
  writerId: string;
  createdDate: string;
  views: number;
  content: string;
}

interface CurrentUser {
  accountId: string;
  accountName: string;
  email: string;
  phoneNumber: string;
  accountRole: string;
}

const NoticeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get<Notice>(`http://localhost:8484/api/notices/${id}`);
        setNotice(res.data);
      } catch (e) {
        console.error("공지사항 상세 조회 실패", e);
      } finally {
        setLoading(false);
      }
    };
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await axios.get<CurrentUser>("/api/mypage", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCurrentUser(res.data);
      } catch (e) {
        console.error("현재 사용자 정보 조회 실패", e);
      }
    };

    if (id) {
      fetchDetail();
      fetchCurrentUser();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("해당 공지사항을 삭제하시겠습니까?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await axios.delete(`http://localhost:8484/api/notices/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("삭제되었습니다.");
      navigate("/notice");
    } catch (e: any) {
      if (e?.response?.status === 403) {
        alert("관리자만 공지사항을 삭제할 수 있습니다.");
      } else {
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  if (loading) {
    return <div className="notice-loading">공지사항을 불러오는 중입니다...</div>;
  }

  if (!notice) {
    return <div className="notice-loading">해당 공지사항을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="notice-page">
      <div className="notice-detail-header">
        <h1 className="notice-detail-title">{notice.title}</h1>
        <div className="notice-meta">
          <span>작성자: {notice.writerId}</span>
          <span>등록일: {new Date(notice.createdDate).toLocaleString()}</span>
          <span>조회수: {notice.views}</span>
        </div>
      </div>

      <div className="notice-detail-content">
        {notice.content.split("\n").map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </div>

      <div className="notice-detail-footer">
        <button onClick={() => navigate(-1)} className="notice-back-btn">
          ← 목록으로
        </button>
        {currentUser?.accountRole === "ADMIN" && (
          <button onClick={handleDelete} className="notice-write-btn" style={{ marginLeft: "8px" }}>
            삭제
          </button>
        )}
      </div>
    </div>
  );
};

export default NoticeDetail;
