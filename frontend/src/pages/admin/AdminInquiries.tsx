import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import "./AdminInquiries.css";

interface Inquiry {
  inquiryId: number;
  writerId: string;
  writerName: string;
  title: string;
  content: string;
  answerContent: string;
  answererId: string;
  answererName: string;
  status: string;
  createdDate: string;
  answeredDate: string;
}

const AdminInquiries: React.FC = () => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [answerContent, setAnswerContent] = useState("");

  useEffect(() => {
    loadInquiries();
  }, [page, status]);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      if (status) {
        params.append('status', status);
      }

      const res = await api.get(`/admin/inquiries?${params}`);
      if (res.data.success) {
        setInquiries(res.data.inquiries);
        setTotal(res.data.total);
      } else {
        alert('관리자 권한이 필요합니다.');
        navigate('/');
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert('관리자 권한이 필요합니다.');
        navigate('/');
      } else {
        console.error('문의 목록 로드 실패:', error);
        alert('데이터를 불러올 수 없습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (inquiryId: number) => {
    if (!answerContent.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    try {
      const res = await api.post(`/admin/inquiries/${inquiryId}/answer`, {
        answerContent: answerContent
      });
      if (res.data.success) {
        alert('답변이 등록되었습니다.');
        setSelectedInquiry(null);
        setAnswerContent("");
        loadInquiries();
      } else {
        alert(res.data.msg || '답변 등록에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('답변 등록 실패:', error);
      alert(error.response?.data?.msg || '답변 등록에 실패했습니다.');
    }
  };

  const totalPages = Math.ceil(total / size);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>문의 관리</h1>
        <button onClick={() => navigate('/admin')}>대시보드로</button>
      </div>

      <div className="admin-filter">
        <select value={status} onChange={(e) => {
          setStatus(e.target.value);
          setPage(0);
        }}>
          <option value="">전체</option>
          <option value="PENDING">답변 대기</option>
          <option value="ANSWERED">답변 완료</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-loading">로딩 중...</div>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>작성자</th>
                  <th>제목</th>
                  <th>상태</th>
                  <th>작성일</th>
                  <th>답변일</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.inquiryId}>
                    <td>{inquiry.inquiryId}</td>
                    <td>{inquiry.writerName}</td>
                    <td>{inquiry.title}</td>
                    <td>
                      <span className={`status-badge ${inquiry.status.toLowerCase()}`}>
                        {inquiry.status === 'PENDING' ? '답변 대기' : '답변 완료'}
                      </span>
                    </td>
                    <td>{new Date(inquiry.createdDate).toLocaleDateString('ko-KR')}</td>
                    <td>{inquiry.answeredDate ? new Date(inquiry.answeredDate).toLocaleDateString('ko-KR') : '-'}</td>
                    <td>
                      <button
                        onClick={() => setSelectedInquiry(inquiry)}
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <button
                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                disabled={page === 0}
              >
                이전
              </button>
              <span>{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={page >= totalPages - 1}
              >
                다음
              </button>
            </div>
          )}

          {selectedInquiry && (
            <div className="admin-modal">
              <div className="modal-content">
                <h2>문의 상세</h2>
                <div className="inquiry-detail">
                  <p><strong>작성자:</strong> {selectedInquiry.writerName}</p>
                  <p><strong>제목:</strong> {selectedInquiry.title}</p>
                  <p><strong>내용:</strong></p>
                  <div className="content-box">{selectedInquiry.content}</div>
                  
                  {selectedInquiry.answerContent ? (
                    <div>
                      <p><strong>답변:</strong></p>
                      <div className="content-box">{selectedInquiry.answerContent}</div>
                    </div>
                  ) : (
                    <div>
                      <p><strong>답변 작성:</strong></p>
                      <textarea
                        value={answerContent}
                        onChange={(e) => setAnswerContent(e.target.value)}
                        rows={5}
                        placeholder="답변 내용을 입력하세요..."
                      />
                      <div className="modal-actions">
                        <button onClick={() => handleAnswer(selectedInquiry.inquiryId)}>답변 등록</button>
                        <button onClick={() => {
                          setSelectedInquiry(null);
                          setAnswerContent("");
                        }}>닫기</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminInquiries;




