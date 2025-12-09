import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ShoppingDetail.css';

interface ShoppingItem {
  id: string;
  uc_seq: string;
  main_title: string;
  title: string;
  subtitle?: string;
  gugun_nm: string;
  place: string;
  addr1: string;
  addr2?: string;
  cntct_tel_s?: string;
  homepage_url?: string;
  usage_day_week_and_time?: string;
  main_img_normal?: string;
  main_img_thumb?: string;
  itemcntnts?: string;
  lat?: string;
  lng?: string;
}

const ShoppingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ShoppingItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8484/api/shopping/search`, {
        params: {
          keyword: id,
          page: 1,
          size: 100
        }
      });
      const found = response.data.items.find((item: ShoppingItem) => item.id === id);
      setItem(found || null);
    } catch (error) {
      console.error('상세 정보 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="shopping-detail-loading">
        <div className="spinner"></div>
        <p>정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="shopping-detail-error">
        <h2>😢 정보를 찾을 수 없습니다</h2>
        <button onClick={() => navigate('/shopping')}>목록으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="shopping-detail-container">
      <button className="back-button" onClick={() => navigate('/shopping')}>
        ← 목록으로
      </button>

      <div className="shopping-detail-content">
        {/* 이미지 */}
        <div className="detail-image-section">
          <img
            src={item.main_img_normal || item.main_img_thumb || 'https://via.placeholder.com/800x500?text=No+Image'}
            alt={item.main_title}
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/800x500?text=Shopping';
            }}
          />
          <div className="detail-badge">{item.gugun_nm}</div>
        </div>

        {/* 정보 */}
        <div className="detail-info-section">
          <h1 className="detail-title">{item.main_title || item.title}</h1>
          {item.subtitle && <p className="detail-subtitle">{item.subtitle}</p>}

          <div className="detail-info-grid">
            <div className="info-item">
              <span className="info-icon">📍</span>
              <div>
                <strong>위치</strong>
                <p>{item.place}</p>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">🏠</span>
              <div>
                <strong>주소</strong>
                <p>{item.addr1}</p>
                {item.addr2 && <p className="addr2">{item.addr2}</p>}
              </div>
            </div>

            {item.cntct_tel_s && (
              <div className="info-item">
                <span className="info-icon">📞</span>
                <div>
                  <strong>전화번호</strong>
                  <p>
                    <a href={`tel:${item.cntct_tel_s}`}>{item.cntct_tel_s}</a>
                  </p>
                </div>
              </div>
            )}

            {item.homepage_url && (
              <div className="info-item">
                <span className="info-icon">🌐</span>
                <div>
                  <strong>홈페이지</strong>
                  <p>
                    <a href={item.homepage_url} target="_blank" rel="noopener noreferrer">
                      바로가기
                    </a>
                  </p>
                </div>
              </div>
            )}

            {item.usage_day_week_and_time && (
              <div className="info-item full-width">
                <span className="info-icon">🕐</span>
                <div>
                  <strong>이용시간</strong>
                  <p>{item.usage_day_week_and_time}</p>
                </div>
              </div>
            )}
          </div>

          {item.itemcntnts && (
            <div className="detail-description">
              <h3>📝 상세 정보</h3>
              <p>{item.itemcntnts}</p>
            </div>
          )}

          {/* 지도 버튼 */}
          {item.lat && item.lng && (
            <div className="detail-actions">
              <button
                className="map-button"
                onClick={() => {
                  navigate('/map', {
                    state: {
                      lat: parseFloat(item.lat!),
                      lng: parseFloat(item.lng!),
                      title: item.main_title || item.title
                    }
                  });
                }}
              >
                🗺️ 지도에서 보기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingDetail;
