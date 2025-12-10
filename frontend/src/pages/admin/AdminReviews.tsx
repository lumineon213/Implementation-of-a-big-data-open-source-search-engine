import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import "./AdminReviews.css";

interface Review {
  reviewId: number;
  accountId: string;
  accountName: string;
  placeId: string;
  placeName: string;
  placeType: string;
  content: string;
  createdAt: string;
}

const AdminReviews: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadReviews();
  }, [page, search]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      if (search) {
        params.append('search', search);
      }

      const res = await api.get(`/admin/reviews?${params}`);
      if (res.data.success) {
        setReviews(res.data.reviews);
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
        console.error('리뷰 목록 로드 실패:', error);
        alert('데이터를 불러올 수 없습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const res = await api.delete(`/admin/reviews/${reviewId}`);
      if (res.data.success) {
        alert('리뷰가 삭제되었습니다.');
        loadReviews();
      } else {
        alert(res.data.msg || '리뷰 삭제에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('리뷰 삭제 실패:', error);
      alert(error.response?.data?.msg || '리뷰 삭제에 실패했습니다.');
    }
  };

  const totalPages = Math.ceil(total / size);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>리뷰 관리</h1>
        <button onClick={() => navigate('/admin')}>대시보드로</button>
      </div>

      <div className="admin-search">
        <input
          type="text"
          placeholder="내용, 작성자, 장소로 검색..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
        <button onClick={loadReviews}>검색</button>
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
                  <th>장소</th>
                  <th>타입</th>
                  <th>내용</th>
                  <th>작성일</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.reviewId}>
                    <td>{review.reviewId}</td>
                    <td>{review.accountName}</td>
                    <td>{review.placeName || review.placeId}</td>
                    <td>{review.placeType}</td>
                    <td className="content-cell">
                      {review.content.length > 50 
                        ? review.content.substring(0, 50) + '...' 
                        : review.content}
                    </td>
                    <td>{new Date(review.createdAt).toLocaleDateString('ko-KR')}</td>
                    <td>
                      <button
                        className="btn-danger"
                        onClick={() => handleDeleteReview(review.reviewId)}
                      >
                        삭제
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
        </>
      )}
    </div>
  );
};

export default AdminReviews;

