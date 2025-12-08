import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";
import './detailview.css'; // 👈 CSS 파일 연결

const SOLR_CORE_NAME = 'Search';

interface FestivalDetailData {
  id: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  place?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  [key: string]: any;
}

const FestivalDetail: React.FC = () => {
  // 카카오 지도 로더
  const [loadingMap, errorMap] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAOMAP_KEY, 
    libraries: ["services", "clusterer"],
  });

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [festival, setFestival] = useState<FestivalDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 날짜 변환 함수
  const formatDate = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return isoDate;
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    } catch { return isoDate; }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const flFields = 'id,title,description,start_date,end_date,place,address,latitude,longitude';
        const query = `q=id:${id}&wt=json&fl=${flFields}`;
        const url = `/solr/${SOLR_CORE_NAME}/select?${query}`;
        
        const response = await axios.get(url);
        
        if (response.data.response.docs.length > 0) {
          setFestival(response.data.response.docs[0]);
        }
      } catch (error) {
        console.error("상세 정보 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  if (loading) return <div className="loading-state">로딩 중...</div>;
  if (!festival) return <div className="error-state">축제 정보를 찾을 수 없습니다.</div>;

  const hasLocation = festival.latitude && festival.longitude;
  const lat = parseFloat(festival.latitude || "0");
  const lng = parseFloat(festival.longitude || "0");

  return (
    <div className="detail-page-container">
      
      {/* 상단 네비게이션 */}
      <div className="nav-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <span>←</span> 뒤로가기
        </button>
      </div>

      {/* 상세 정보 카드 */}
      <div className="detail-card">
        {/* 제목 */}
        <h1 className="detail-title">{festival.title}</h1>
        
        {/* 날짜 및 장소 */}
        <div className="detail-meta">
          {festival.start_date && (
            <span className="meta-item">
              📅 {formatDate(festival.start_date)} ~ {festival.end_date ? formatDate(festival.end_date) : ''}
            </span>
          )}
          {festival.place && <span className="meta-item">📍 {festival.place}</span>}
        </div>

        <hr className="divider" />

        {/* 축제 소개 */}
        <div className="detail-section">
          <h3 className="section-title">축제 소개</h3>
          <p className="section-content">
            {festival.description || "상세 설명이 없습니다."}
          </p>
        </div>

        {/* 오시는 길 (지도) */}
        <div className="detail-section">
          <h3 className="section-title">오시는 길</h3>
          
          <div className="address-box">
            <span className="address-icon">🏠</span>
            <div>
              <span className="address-label">주소</span>
              <span className="address-text">{festival.address || "주소 정보 없음"}</span>
            </div>
          </div>

          {/* 지도 렌더링 */}
          {hasLocation ? (
            <div className="map-wrapper">
              <Map
                center={{ lat: lat, lng: lng }}
                style={{ width: "100%", height: "100%" }}
                level={3}
              >
                <MapMarker position={{ lat: lat, lng: lng }}>
                  <div className="map-marker-info">
                    {festival.title} <br/>
                    <a 
                      href={`https://map.kakao.com/link/map/${festival.title},${lat},${lng}`} 
                      className="map-link"
                      target="_blank" 
                      rel="noreferrer"
                    >
                      큰 지도 보기
                    </a>
                  </div>
                </MapMarker>
              </Map>
            </div>
          ) : (
            <div className="no-map">
              지도 정보가 없습니다.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FestivalDetail;