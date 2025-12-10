import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import "./AdminNotices.css";

interface Notice {
  noticeId: number;
  writerId: string;
  title: string;
  content: string;
  createdDate: string;
  views: number;
}

const AdminNotices: React.FC = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notices');
      setNotices(res.data);
    } catch (error) {
      console.error('공지사항 로드 실패:', error);
      alert('데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noticeId: number) => {
    if (!confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await api.delete(`/notices/${noticeId}`);
      alert('공지사항이 삭제되었습니다.');
      loadNotices();
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert('관리자 권한이 필요합니다.');
      } else {
        console.error('공지사항 삭제 실패:', error);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>공지사항 관리</h1>
        <div>
          <button onClick={() => navigate('/notice/write')}>공지사항 작성</button>
          <button onClick={() => navigate('/admin')}>대시보드로</button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">로딩 중...</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>제목</th>
                <th>작성일</th>
                <th>조회수</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((notice) => (
                <tr key={notice.noticeId}>
                  <td>{notice.noticeId}</td>
                  <td>
                    <a href={`/notice/${notice.noticeId}`} target="_blank" rel="noopener noreferrer">
                      {notice.title}
                    </a>
                  </td>
                  <td>{new Date(notice.createdDate).toLocaleDateString('ko-KR')}</td>
                  <td>{notice.views}</td>
                  <td>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(notice.noticeId)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminNotices;

