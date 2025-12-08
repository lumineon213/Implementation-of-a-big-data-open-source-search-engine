import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";
import "./foodDetail.css"; 

interface FoodData {
  id: string;
  title: string;
  address: string;
  menu_t?: string;
  image_url?: string;
  description?: string;
  opentime_t?: string;
  latitude?: string;
  longitude?: string;
  view_count?: number; 
}

const FoodDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [food, setFood] = useState<FoodData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. 카카오 지도 로더
  const [loadingMap, errorMap] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAOMAP_KEY || 'YOUR_APP_KEY', 
    libraries: ["services"],
  });

  // 2. 데이터 불러오기
  useEffect(() => {
    let didCancel = false;  

    const fetchDetail = async () => {
        try {
            if (!didCancel) { 
                await axios.get(`http://localhost:8484/api/food/view/${id}`);
            }
            const response = await axios.get(`http://localhost:8484/api/food/${id}`);
            
            if (!didCancel) {
                setFood(response.data);
            }
        } catch (err) {
            console.error("데이터 로딩 실패:", err);
            if (!didCancel) {
                alert("맛집 정보를 불러올 수 없습니다.");
                navigate("/");
            }
        } finally {
            if (!didCancel) { 
                setLoading(false); 
            }
        }
    };

    if (id) {
        fetchDetail();
    }
    
    return () => {
      didCancel = true;
    };
  }, [id, navigate]);
  
  const lat = parseFloat(food?.latitude || "0");
  const lng = parseFloat(food?.longitude || "0");
  const isValidLocation = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

  if (loading || loadingMap) return <div className="loading-state">데이터를 불러오는 중...</div>;
  if (errorMap) return <div className="error-state">지도 로딩 실패</div>;
  if (!food) return <div className="error-state">정보가 없습니다.</div>;

  return (
    <div className="detail-page-container">
      <div className="nav-header">
        <button onClick={() => window.history.back()} className="back-btn">
          <span>←</span> 목록으로 돌아가기
        </button>
      </div>

      <div className="detail-card">
        <div className="detail-header">
            <h1 className="detail-title">{food.title}</h1>
            <span className="detail-view">👀 조회수 {food.view_count || 0}</span>
        </div>
        
        <hr className="divider" />

        <div className="detail-content">
          <div className="img-wrapper">
              <img 
                  src={food.image_url || "https://via.placeholder.com/400?text=No+Image"} 
                  alt={food.title} 
                  className="detail-img"
                  onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/400?text=Busan+Food"; }}
              />
          </div>
          
          <div className="detail-info">
            {/* ▼▼▼ 수정됨: Flex 구조에 맞춰 strong과 span으로 분리 ▼▼▼ */}
            <div className="info-item">
                <strong>📍 주소</strong>
                <span>{food.address}</span>
            </div>
            <div className="info-item">
                <strong>🍽️ 대표메뉴</strong>
                <span>{food.menu_t || "정보 없음"}</span>
            </div>
            <div className="info-item">
                <strong>⏰ 운영시간</strong>
                <span>{food.opentime_t || "정보 없음"}</span>
            </div>
            {/* ▲▲▲ 수정 끝 ▲▲▲ */}
            
            <div className="desc-box">
                <strong>소개</strong>
                <p className="detail-desc">{food.description || "소개글이 없습니다."}</p>
            </div>
          </div>
        </div>

        <div className="detail-section map-section">
          <h3 className="section-title">🗺️ 위치 확인</h3>
          
          {isValidLocation ? (
            <div className="map-wrapper"> 
              <Map
                center={{ lat: lat, lng: lng }}
                style={{ width: "100%", height: "350px", borderRadius: "8px" }} 
                level={3}
              >
                <MapMarker position={{ lat: lat, lng: lng }}>
                  <div style={{ padding: "5px", color: "#000", textAlign: "center" }}>
                    {food.title} <br/>
                    <a 
                      href={`https://map.kakao.com/link/map/${food.title},${lat},${lng}`} 
                      style={{ color: "blue", fontSize: "12px" }}
                      target="_blank" 
                      rel="noreferrer"
                    >
                      카카오맵 보기
                    </a>
                  </div>
                </MapMarker>
              </Map>
            </div>
          ) : (
            <div className="no-map" style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f0f0f0" }}>
              위치 정보가 없어 지도를 표시할 수 없습니다.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FoodDetail;