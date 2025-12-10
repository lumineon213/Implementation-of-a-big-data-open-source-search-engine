import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

interface StayData {
  id: string;
  title: string;
  address: string;       
  image_url?: string;     
  description?: string;   
  latitude?: number;      
  longitude?: number;     
  view_count?: number;    
}

const StayDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [stay, setStay] = useState<StayData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Kakao Map Loader
  const [loadingMap, errorMap] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAOMAP_KEY as string, 
    libraries: ["services"],
  });

  // 데이터 페칭: 백엔드 API 호출
  useEffect(() => {
    let didCancel = false;  
    const fetchDetail = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8484/api/stay/view/${id}`);
            
            if (!didCancel) { setStay(response.data); }
        } catch (err) {
            console.error("상세 데이터 로딩 실패:", err);
        } finally {
            if (!didCancel) { setLoading(false); }
        }
    };

    if (id) { fetchDetail(); }
    return () => { didCancel = true; };
  }, [id, navigate]);
  
  const lat = stay?.latitude || 0;
  const lng = stay?.longitude || 0;
  const isValidLocation = lat !== 0 && lng !== 0;

  if (loading || loadingMap) return <div className="loading-state">데이터를 불러오는 중입니다...</div>;
  if (!stay) return <div className="error-state">요청하신 숙소 정보를 찾을 수 없습니다.</div>;

  // 이미지 렌더링 로직 (외부 이미지 오류 방지용 안전 장치)
  const ImageComponent = stay.image_url ? (
    <img 
      src={stay.image_url} 
      alt={stay.title} 
      className="detail-img"
      style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
      onError={(e) => { 
        e.currentTarget.style.display = 'none'; 
        const wrapper = e.currentTarget.parentElement;
        if(wrapper) {
            wrapper.style.backgroundColor = '#f0f0f0';
            wrapper.style.display = 'flex';
            wrapper.style.height = '300px';
            wrapper.innerHTML = `<span style="margin: auto; color: #888; font-size: 1.1em;">이미지 준비 중</span>`;
        }
      }}
    />
  ) : (
    <div 
      className="placeholder-image" 
      style={{ 
        width: '100%', height: '300px', backgroundColor: '#f0f0f0', borderRadius: '8px', 
        display: 'flex', alignItems: 'center', justifyContent: 'center' 
      }}
    >
      <span style={{ color: '#888', fontSize: '1.1em' }}>이미지 없음</span>
    </div>
  );

  return (
    <div className="detail-page-container">
      <div className="nav-header">
        <button onClick={() => window.history.back()} className="back-btn" style={{ cursor: 'pointer' }}>
          <span>←</span> 목록으로 돌아가기
        </button>
      </div>

      <div className="detail-card">
        <div className="detail-header">
            <h1 className="detail-title">{stay.title}</h1>
            <span className="detail-view">👀 조회수 {stay.view_count || 0}</span>
        </div>
        
        <hr className="divider" />

        <div className="detail-content" style={{ display: 'flex', gap: '30px' }}>
          <div className="img-wrapper" style={{ flex: 1, maxWidth: '400px' }}>
            {ImageComponent}
          </div>
          
          <div className="detail-info" style={{ flex: 2, minWidth: '300px' }}>
            <div className="info-item" style={{ marginBottom: '15px' }}>
                <strong>📍 주소</strong>
                <p style={{ margin: '5px 0' }}>{stay.address}</p> 
            </div>
            
            <div className="desc-box">
                <strong>📜 소개</strong>
                <p className="detail-desc" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', marginTop: '5px' }}>
                    {stay.description || "상세 설명이 준비되지 않았습니다."}
                </p>
            </div>
          </div>
        </div>

        <div className="detail-section map-section" style={{ marginTop: '40px' }}>
          <h3 className="section-title">🗺️ 위치 확인</h3>
          
          {isValidLocation ? (
            <div className="map-wrapper" style={{ border: '1px solid #ddd', borderRadius: '8px' }}> 
              <Map
                center={{ lat: lat, lng: lng }}
                style={{ width: "100%", height: "350px", borderRadius: "8px" }} 
                level={3}
              >
                <MapMarker position={{ lat: lat, lng: lng }}>
                  <div style={{ padding: "5px", color: "#000", textAlign: "center", fontSize: '14px' }}>
                    {stay.title}
                  </div>
                </MapMarker>
              </Map>
            </div>
          ) : (
            <div className="no-map" style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
              위치 정보가 없어 지도를 표시할 수 없습니다.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StayDetail;