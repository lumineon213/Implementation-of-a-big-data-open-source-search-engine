import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Notice.css";

interface Notice {
  noticeId: number;
  title: string;
  writerId: string;
  createdDate: string;
  views: number;
}

interface CurrentUser {
  accountId: string;
  accountName: string;
  email: string;
  phoneNumber: string;
  accountRole: string;
}

const NoticeList: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await axios.get<Notice[]>("http://localhost:8484/api/notices");
        setNotices(res.data || []);
      } catch (e) {
        console.error("공지사항 목록 조회 실패", e);
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

    fetchNotices();
    fetchCurrentUser();
  }, []);

  const handleClick = (id: number) => {
    navigate(`/notice/${id}`);
  };

  const itemsPerPage = 10;
  const totalPages = notices.length > 0 ? Math.ceil(notices.length / itemsPerPage) : 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentNotices = notices.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return <div className="notice-loading">공지사항을 불러오는 중입니다...</div>;
  }

  return (
    <div className="notice-page">
      <div className="notice-header-row">
        <div className="notice-header">
          <h1>공지사항</h1>
          <p>우리 부산 GO? 서비스 이용에 필요한 주요 안내를 확인하세요.</p>
        </div>
        {currentUser?.accountRole === "ADMIN" && (
          <button
            className="notice-write-btn"
            onClick={() => navigate("/notice/write")}
          >
            공지 작성
          </button>
        )}
      </div>

      <div className="notice-table-wrapper">
        <table className="notice-table">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>번호</th>
              <th>제목</th>
              <th style={{ width: "160px" }}>작성자</th>
              <th style={{ width: "140px" }}>등록일</th>
              <th style={{ width: "100px" }}>조회수</th>
            </tr>
          </thead>
          <tbody>
            {notices.length === 0 ? (
              <tr>
                <td colSpan={5} className="notice-empty">등록된 공지사항이 없습니다.</td>
              </tr>
            ) : (
              currentNotices.map((n, idx) => (
                <tr key={n.noticeId} onClick={() => handleClick(n.noticeId)} className="notice-row">
                  <td>{notices.length - (startIndex + idx)}</td>
                  <td className="notice-title">{n.title}</td>
                  <td>{n.writerId}</td>
                  <td>{new Date(n.createdDate).toLocaleDateString()}</td>
                  <td>{n.views}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {notices.length > itemsPerPage && (
        <div className="notice-pagination">
          <button
            className="page-btn prev-next"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`page-btn ${currentPage === page ? "active" : ""}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="page-btn prev-next"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default NoticeList;
