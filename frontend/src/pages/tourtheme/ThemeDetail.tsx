import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";
import "./ThemeDetail.css"; // ★ 아래 작성된 CSS 파일 연결

// 명소 데이터 타입 정의 (백엔드 DTO와 변수명 일치)
interface ThemeData {
  spotId: number;
  title: string;
  address: string;
  
  imageUrl?: string;   // ★ [핵심] 백엔드 변수명(imageUrl)과 일치시킴
  viewCount?: number;  // ★ [핵심] 백엔드 변수명(viewCount)과 일치시킴
  
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

  // 카카오 지도 로더
  const [loadingMap, errorMap] = useKakaoLoader({
    // ★ 본인의 JavaScript 키 입력 (933f...)
    appkey: import.meta.env.VITE_KAKAOMAP_KEY || '933f3a8d309f267a84e10a5061bc845a',
    libraries: ["services"],
  });

  useEffect(() => {
    let didCancel = false;   

    const fetchDetail = async () => {
        try {
            // 1. 조회수 증가 API 호출
            if (!didCancel && id) { 
                await axios.get(`http://localhost:8484/api/theme/view/${id}`);
            }
            // 2. 명소 상세 정보 가져오기
            const response = await axios.get(`http://localhost:8484/api/theme/${id}`);
            
            // 데이터 확인용 로그
            console.log("상세 데이터:", response.data);

            if (!didCancel) {
                setTheme(response.data);
            }
        } catch (err) {
            console.error("데이터 로딩 실패:", err);
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
  
  // 좌표 변환
  const lat = parseFloat(theme?.latitude || "0");
  const lng = parseFloat(theme?.longitude || "0");
  const isValidLocation = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

  // 로딩 및 에러 상태
  if (loading) return <div className="loading-state">명소 정보를 불러오는 중...</div>;
  if (loadingMap) return <div className="loading-state">지도 로딩 중...</div>;
  if (errorMap) return <div className="error-state">지도 로딩 실패 (API 키를 확인하세요)</div>;
  if (!theme) return <div className="error-state">정보가 없습니다.</div>;

  return (
    <div className="detail-page-container">
      {/* 상단 네비게이션 */}
      <div className="nav-header">
        <button onClick={() => navigate("/theme")} className="back-btn">
          <span>←</span> 목록으로 돌아가기
        </button>
      </div>

      {/* 상세 정보 카드 */}
      <div className="detail-card">
        <div className="detail-header">
            <h1 className="detail-title">{theme.title}</h1>
            
            {/* ★ [수정됨] 조회수 표시 (viewCount 사용) */}
            <span className="detail-view">👀 조회수 {theme.viewCount || 0}</span>
        </div>
        
        <hr className="divider" />

        <div className="detail-content">
          {/* 왼쪽: 이미지 영역 */}
          <div className="img-wrapper">
              <img 
                  // ★ [수정됨] imageUrl 사용 & 엑박 방지용 더미 이미지
                  src={theme.imageUrl || "https://dummyimage.com/600x400/dddddd/000000.png&text=No+Image"} 
                  alt={theme.title} 
                  className="detail-img"
                  onError={(e) => { 
                    e.currentTarget.src = "https://dummyimage.com/600x400/dddddd/000000.png&text=Busan+Theme"; 
                  }}
              />
          </div>
          
          {/* 오른쪽: 정보 영역 */}
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
                    <a href={theme.homepage} target="_blank" rel="noopener noreferrer" style={{color: '#007bff'}}>
                      바로가기
                    </a>
                  ) : "정보 없음"}
                </span>
            </div>
            
            <div className="desc-box">
                <strong>소개</strong>
                <p className="detail-desc">{theme.description || "소개글이 없습니다."}</p>
            </div>
          </div>
        </div>

        {/* 하단: 지도 영역 */}
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
                  <div style={{ padding: "5px", color: "#000", textAlign: "center", minWidth: "150px" }}>
                    {theme.title} <br/>
                    <a 
                      href={`https://map.kakao.com/link/map/${theme.title},${lat},${lng}`} 
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
              위치 정보가 없어 지도를 표시할 수 없습니다..
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ThemeDetail;