import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
// ▼▼▼ 카카오맵 라이브러리 추가 ▼▼▼
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";
import "./foodDetail.css"; 

// FoodData 인터페이스
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

  // ▼▼▼ 1. 카카오 지도 로더 (App Key 로드) ▼▼▼
  const [loadingMap, errorMap] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAOMAP_KEY || 'YOUR_APP_KEY_HERE', 
    libraries: ["services"],
  });

  // ▼▼▼ 2. 데이터 Fetch 및 조회수 1회 증가 로직 (Strict Mode 대응) ▼▼▼
  useEffect(() => {
    let didCancel = false;  

    const fetchDetail = async () => {
        try {
            // 1. 조회수 증가 (Side Effect - 1회 실행 보장)
            if (!didCancel) { 
                await axios.get(`http://localhost:8484/api/food/view/${id}`);
            }

            // 2. 상세 데이터 가져오기
            const response = await axios.get(`http://localhost:8484/api/food/${id}`);
            
            if (!didCancel) {
                setFood(response.data);
            }
        } catch (err) {
            console.error("상세 정보 로딩 또는 조회수 증가 실패:", err);
            if (!didCancel) {
                alert("데이터를 불러올 수 없습니다.");
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
  
  // 3. 위치 데이터 파싱 및 유효성 검사
  const hasLocation = food?.latitude && food?.longitude;
  const lat = parseFloat(food?.latitude || "0");
  const lng = parseFloat(food?.longitude || "0");
  const isValidLocation = hasLocation && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

  // 로딩 및 에러 처리
  if (loading || loadingMap) return <div className="loading-state">로딩 중...</div>;
  if (errorMap) return <div className="error-state">지도 로딩 실패 (App Key 확인 필요)</div>;
  if (!food) return <div className="error-state">맛집 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="detail-page-container">
      <div className="nav-header">
        {/* URL 파라미터가 저장되어 있으므로 navigate(-1)이 정확히 이전 페이지로 이동시킵니다. */}
        <button onClick={() => window.history.back()} className="back-btn">
          <span>←</span> 목록으로
        </button>
      </div>

      <div className="detail-card">
        <h1 className="detail-title">{food.title}</h1>
        <p className="detail-view">👀 조회수 {food.view_count || 0}</p>
        
        <hr className="divider" />

        <div className="detail-content">
          {/* 사진 표시 영역 */}
          <img 
              src={food.image_url || "https://via.placeholder.com/400"} 
              alt={food.title} 
              className="detail-img"
          />
          
          <div className="detail-info">
            <p><strong>📍 주소:</strong> {food.address}</p>
            <p><strong>🍽️ 대표메뉴:</strong> {food.menu_t || "정보 없음"}</p>
            <p><strong>⏰ 운영시간:</strong> {food.opentime_t || "정보 없음"}</p>
            <hr />
            <p className="detail-desc">{food.description}</p>
          </div>
        </div>

        {/* 오시는 길 (지도) */}
        <div className="detail-section">
          <h3 className="section-title">오시는 길</h3>
          
          {isValidLocation ? (
            <div className="map-wrapper"> 
              <Map
                center={{ lat: lat, lng: lng }}
                style={{ width: "100%", height: "100%", borderRadius: "8px" }} 
                level={3}
              >
                <MapMarker position={{ lat: lat, lng: lng }}>
                  <div className="map-marker-info">
                    {food.title} <br/>
                    <a 
                      href={`https://map.kakao.com/link/map/${food.title},${lat},${lng}`} 
                      className="map-link"
                      target="_blank" 
                      rel="noreferrer"
                    >
                      큰 지도 보기 / 길찾기
                    </a>
                  </div>
                </MapMarker>
              </Map>
            </div>
          ) : (
            <div className="no-map" style={{height: '300px'}}>
              위치 정보가 유효하지 않아 지도를 표시할 수 없습니다.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FoodDetail;