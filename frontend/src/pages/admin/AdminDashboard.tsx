import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import "./AdminDashboard.css";

interface Statistics {
  totalUsers: number;
  totalReviews: number;
  totalEvents: number;
  todayNewUsers: number;
  todayNewReviews: number;
  activeUsers: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [topPlaces, setTopPlaces] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      // 통계 데이터 로드
      const res = await api.get('/admin/statistics');
      if (res.data.success) {
        setStatistics(res.data.statistics);
        setDailyStats(res.data.dailyStatistics || []);
        setTopPlaces(res.data.topPlaces || []);
        setTopUsers(res.data.topUsers || []);
        // 디버깅용 로그
        console.log('Top Places:', res.data.topPlaces);
        console.log('Top Users:', res.data.topUsers);
      } else {
        alert('관리자 권한이 필요합니다.');
        navigate('/');
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert('관리자 권한이 필요합니다.');
        navigate('/');
      } else {
        console.error('통계 로드 실패:', error);
        alert('데이터를 불러올 수 없습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">로딩 중...</div>;
  }

  if (!statistics) {
    return <div className="admin-error">데이터를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>관리자 대시보드</h1>
        <div className="admin-nav">
          <button onClick={() => navigate('/admin')} className="nav-active">대시보드</button>
          <button onClick={() => navigate('/admin/users')}>회원 관리</button>
          <button onClick={() => navigate('/admin/reviews')}>리뷰 관리</button>
          <button onClick={() => navigate('/admin/inquiries')}>문의 관리</button>
          <button onClick={() => navigate('/admin/notices')}>공지사항 관리</button>
          <button onClick={() => navigate('/admin/events')}>이벤트 관리</button>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="stat-card">
          <h3>전체 회원</h3>
          <p className="stat-number">{statistics.totalUsers.toLocaleString()}</p>
          <span className="stat-change">오늘 +{statistics.todayNewUsers}</span>
        </div>
        <div className="stat-card">
          <h3>전체 리뷰</h3>
          <p className="stat-number">{statistics.totalReviews.toLocaleString()}</p>
          <span className="stat-change">오늘 +{statistics.todayNewReviews}</span>
        </div>
        <div className="stat-card">
          <h3>전체 이벤트</h3>
          <p className="stat-number">{statistics.totalEvents.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>활성 사용자</h3>
          <p className="stat-number">{statistics.activeUsers.toLocaleString()}</p>
          <span className="stat-change">최근 30일</span>
        </div>
      </div>

      <div className="admin-content-grid">
        <div className="admin-section">
          <h2>인기 장소 (리뷰 수 기준)</h2>
          <div className="top-list">
            {topPlaces.length > 0 ? (
              topPlaces.map((place, idx) => (
                <div key={idx} className="top-item">
                  <span className="rank">{idx + 1}</span>
                  <span className="name">
                    {place.PLACE_NAME || place.placeName || place.PLACE_ID || place.placeId || '알 수 없음'}
                  </span>
                  <span className="count">{(place.REVIEW_COUNT || place.reviewCount || 0)}개</span>
                </div>
              ))
            ) : (
              <p>데이터가 없습니다.</p>
            )}
          </div>
        </div>

        <div className="admin-section">
          <h2>활발한 사용자 (리뷰 수 기준)</h2>
          <div className="top-list">
            {topUsers.length > 0 ? (
              topUsers.map((user, idx) => (
                <div key={idx} className="top-item">
                  <span className="rank">{idx + 1}</span>
                  <span className="name">{user.ACCOUNT_NAME || user.accountName || '알 수 없음'}</span>
                  <span className="count">{(user.REVIEW_COUNT || user.reviewCount || 0)}개</span>
                </div>
              ))
            ) : (
              <p>데이터가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

