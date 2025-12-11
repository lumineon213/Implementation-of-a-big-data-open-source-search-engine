import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";
import "./ThemeDetail.css";

interface ThemeData {
  spotId: number;
  title: string;
  address: string;
  imageUrl?: string;
  viewCount?: number;
  description?: string;
  latitude?: string;
  longitude?: string;
  tel?: string;
  homepage?: string;
}

const ThemeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [theme, setTheme] = useState<ThemeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 카카오 지도 로더 (API 키 환경변수 확인)
  const [loadingMap, errorMap] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAOMAP_KEY || '933f3a8d309f267a84e10a5061bc845a',
    libraries: ["services"],
  });

  useEffect(() => {
    // 1. ID가 없으면 목록으로 리턴
    if (!id) {
        navigate("/theme");
        return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);

        // 조회수 증가 API (실패해도 상세 정보는 불러와야 하므로 개별 try-catch 혹은 무시)
        try {
            await axios.get(`http://localhost:8484/api/theme/view/${id}`);
        } catch (e) {
            console.warn("조회수 증가 실패 (무시됨)", e);
        }

        // 상세 정보 가져오기
        // 주의: 백엔드 컨트롤러에서 @GetMapping("/api/theme/{id}")가 있어야 함
        const response = await axios.get(`http://localhost:8484/api/theme/${id}`);
        
        console.log("상세 데이터 원본:", response.data);

        // ★ [핵심 수정] 백엔드가 배열([])로 주든 객체({})로 주든 처리
        let dataToSet: ThemeData | null = null;

        if (Array.isArray(response.data)) {
            // 배열로 왔다면 첫 번째 요소를 사용
            if (response.data.length > 0) {
                dataToSet = response.data[0];
            }
        } else if (response.data && typeof response.data === 'object') {
            // 객체로 왔다면 그대로 사용
            dataToSet = response.data;
        }

        if (dataToSet) {
            setTheme(dataToSet);
        } else {
            console.error("데이터가 비어있습니다.");
        }

      } catch (err) {
        console.error("상세 데이터 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, navigate]);

  // 좌표 변환 및 유효성 검사
  const lat = parseFloat(theme?.latitude || "0");
  const lng = parseFloat(theme?.longitude || "0");
  
  // 한국 좌표 범위 내인지 간단 체크 (대략적인 범위)
  const isValidLocation = !isNaN(lat) && !isNaN(lng) && lat > 30 && lat < 40 && lng > 120 && lng < 135;

  if (loading) return <div className="loading-state">정보를 불러오는 중입니다...</div>;
  
  // 데이터가 없을 때 표시
  if (!theme) return (
    <div className="error-state">
        <p>해당 여행지 정보를 찾을 수 없습니다.</p>
        <button onClick={() => navigate("/theme")}>목록으로 돌아가기</button>
    </div>
  );

  return (
    <div className="detail-page-container">
      <div className="nav-header">
        <button onClick={() => navigate("/theme")} className="back-btn">
          <span>←</span> 목록으로 돌아가기
        </button>
      </div>

      <div className="detail-card">
        <div className="detail-header">
            <h1 className="detail-title">{theme.title}</h1>
            <span className="detail-view">👀 조회수 {theme.viewCount || 0}</span>
        </div>
        
        <hr className="divider" />

        <div className="detail-content">
          {/* 이미지 영역 */}
          <div className="img-wrapper">
              <img 
                  src={theme.imageUrl || "https://dummyimage.com/600x400/dddddd/000000.png&text=No+Image"} 
                  alt={theme.title} 
                  className="detail-img"
                  onError={(e) => { 
                    e.currentTarget.src = "https://dummyimage.com/600x400/dddddd/000000.png&text=Busan+Theme"; 
                  }}
              />
          </div>
          
          {/* 정보 영역 */}
          <div className="detail-info">
            <div className="info-item">
                <strong>📍 주소</strong>
                <span>{theme.address}</span>
            </div>
            
            <div className="info-item">
                <strong>📞 전화번호</strong>
                <span>{theme.tel || "정보 없음"}</span>
            </div>
            
            <div className="info-item">
                <strong>🌐 홈페이지</strong>
                <span>
                  {theme.homepage ? (
                    <a href={theme.homepage} target="_blank" rel="noopener noreferrer" className="link-text">
                      바로가기
                    </a>
                  ) : "정보 없음"}
                </span>
            </div>
            
            <div className="desc-box">
                <strong>소개</strong>
                <p className="detail-desc">{theme.description || "상세 소개글이 없습니다."}</p>
            </div>
          </div>
        </div>

        {/* 지도 영역 */}
        <div className="detail-section map-section">
          <h3 className="section-title">🗺️ 위치 확인</h3>
          
          {loadingMap ? (
            <div>지도를 불러오는 중...</div>
          ) : errorMap ? (
            <div>지도 로딩 오류 (API 키 확인 필요)</div>
          ) : isValidLocation ? (
            <div className="map-wrapper"> 
              <Map
                center={{ lat: lat, lng: lng }}
                style={{ width: "100%", height: "350px", borderRadius: "8px" }} 
                level={3}
              >
                <MapMarker position={{ lat: lat, lng: lng }}>
                  <div style={{ padding: "5px", color: "#000", textAlign: "center", minWidth: "150px" }}>
                    {theme.title} <br/>
                    <a 
                      href={`https://map.kakao.com/link/map/${theme.title},${lat},${lng}`} 
                      style={{ color: "blue", fontSize: "12px" }}
                      target="_blank" 
                      rel="noreferrer"
                    >
                      크게 보기
                    </a>
                  </div>
                </MapMarker>
              </Map>
            </div>
          ) : (
            <div className="no-map" style={{ padding: "20px", backgroundColor: "#f9f9f9", textAlign: "center" }}>
              <p>위치 정보가 정확하지 않아 지도를 표시할 수 없습니다.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ThemeDetail;