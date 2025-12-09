import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './FestivalDetail.css';

interface FestivalDetail {
  mainTitle: string;
  gugunNm: string;
  place: string;
  addr1: string;
  itemCntnts: string;
  mainImgNormal: string;
  cntctTel?: string;
  homepageUrl?: string;
}

const FestivalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [festival, setFestival] = useState<FestivalDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/festival/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json() as FestivalDetail;
        setFestival(data);
      } catch {
        alert('축제를 불러올 수 없습니다');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) return <div className="loading">로딩 중...</div>;
  if (!festival) return <div>축제를 찾을 수 없습니다</div>;

  return (
    <div className="detail-page">
      {/* 예쁜 뒤로가기 버튼 */}
      <button className="back-button" onClick={() => navigate(-1)}>
        ← 목록으로 돌아가기
      </button>

      <div className="detail-container">
        {/* 큰 사진 */}
        <div className="hero-image">
          <img 
            src={festival.mainImgNormal || '/placeholder.jpg'} 
            alt={festival.mainTitle}
          />
        </div>

        {/* 제목 + 장소 */}
        <div className="title-section">
          <h1 className="main-title">{festival.mainTitle}</h1>
          <p className="location">
            {festival.place || festival.addr1 || '부산'}
          </p>
        </div>

        {/* 상세 정보 카드 */}
        <div className="info-card">
          <h2>상세 정보</h2>
          
          <div className="description">
            {(festival.itemCntnts || '상세 정보가 없습니다.')
              .toString()
              .split('\n')
              .filter(line => line.trim())
              .map((line, i) => (
                <p key={i}>{line}</p>
              ))}
          </div>

          {/* 연락처 & 홈페이지 */}
          <div className="extra-info">
            {festival.cntctTel && (
              <div className="info-row">
                <strong>연락처</strong>
                <span>{festival.cntctTel}</span>
              </div>
            )}
            {festival.homepageUrl && (
              <div className="info-row">
                <strong>홈페이지</strong>
                <a href={festival.homepageUrl} target="_blank" rel="noopener noreferrer">
                  바로가기 →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FestivalDetail;