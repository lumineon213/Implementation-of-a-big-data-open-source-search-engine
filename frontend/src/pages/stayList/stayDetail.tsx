import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";
import "./stayDetail.css"; 

// 📌 StayData 인터페이스를 DTO 필드명과 일치시킵니다.
interface StayData {
  content_id: string; // DTO 필드명
  title: string;
  address: string;
  firstimage?: string | null; // DTO 필드명
  overview?: string;
  latitude?: number | string; 
  longitude?: number | string; 
  view_count?: number;
}

const StayDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [stay, setStay] = useState<StayData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [loadingMap, errorMap] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAOMAP_KEY as string,
    libraries: ["services"],
  });

  useEffect(() => {
    // ... (fetchDetail 로직 유지) ...
    let didCancel = false;

    const fetchDetail = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/stay/view/${id}`
        );
        if (!didCancel) setStay(response.data);
      } catch (err) {
        console.error("상세 데이터 로딩 실패:", err);
        if (!didCancel) {
          if (axios.isAxiosError(err) && err.response && err.response.status !== 404) {
             alert("서버 오류로 인해 정보를 불러올 수 없습니다.");
          }
          // 404가 아닌 다른 에러 시에는 리스트 페이지로 이동하지 않습니다. (에러만 표시)
        }
      } finally {
        if (!didCancel) setLoading(false);
      }
    };

    if (id) fetchDetail();

    return () => {
      didCancel = true;
    };
  }, [id, navigate]);


  // 📌 [핵심] 안전한 숫자 변환 및 지도 활성화 체크
  const lat = Number(stay?.latitude) || 0;
  const lng = Number(stay?.longitude) || 0;
  const isValidLocation = lat !== 0 && lng !== 0;

  if (loading || loadingMap) return <div className="loading-state">데이터를 불러오는 중입니다...</div>;
  if (errorMap) return <div className="error-state">지도 로딩 실패</div>;
  if (!stay) return <div className="error-state">요청하신 숙소 정보를 찾을 수 없습니다.</div>;

  // 📌 이미지 URL 유효성 체크 및 안전한 대체 경로 설정
  const finalImageUrl = stay.firstimage && stay.firstimage.startsWith('http') 
                        ? stay.firstimage 
                        : 'https://via.placeholder.com/400?text=No+Image'; // 안전한 외부 URL 사용

  return (
    <div className="detail-page-container">
      {/* ... (네비게이션 및 헤더 영역 유지) ... */}
      <div className="detail-card">
        <div className="detail-header">
          <h1 className="detail-title">{stay.title}</h1>
          <span className="detail-view">👀 조회수 {stay.view_count || 0}</span>
        </div>

        <hr className="divider" />

        <div className="detail-content" style={{ display: "flex", gap: "30px" }}>
          <div className="img-wrapper" style={{ flex: 1, maxWidth: "400px" }}>
            <img
              src={finalImageUrl} // 📌 finalImageUrl 사용
              alt={stay.title}
              className="detail-img"
              style={{ width: "100%", height: "auto", borderRadius: "8px" }}
              onError={(e) => {
                // 📌 [핵심] 무한 재시도 및 ERR_NAME_NOT_RESOLVED 방지
                e.currentTarget.style.display = 'none'; 
                const wrapper = e.currentTarget.parentElement;
                if(wrapper) {
                    wrapper.style.backgroundColor = '#f0f0f0';
                    wrapper.style.display = 'flex';
                    wrapper.style.justifyContent = 'center';
                    wrapper.style.alignItems = 'center';
                    wrapper.style.minHeight = '200px';
                    wrapper.innerHTML = `<span style="color: #888;">이미지 로드 실패</span>`;
                }
              }}
            />
          </div>

          <div className="detail-info" style={{ flex: 2, minWidth: "300px" }}>
            <div className="info-item" style={{ marginBottom: "15px" }}>
              <strong>📍 주소</strong>
              <p style={{ margin: "5px 0" }}>{stay.address}</p>
            </div>

            <div className="desc-box">
              <strong>📜 소개</strong>
              <p
                className="detail-desc"
                style={{ whiteSpace: "pre-wrap", lineHeight: "1.6", marginTop: "5px" }}
              >
                {stay.overview || "상세 설명이 준비되지 않았습니다."}
              </p>
            </div>
          </div>
        </div>

        {/* ... (지도 영역 유지) ... */}
        <div className="detail-section map-section" style={{ marginTop: "40px" }}>
            <h3 className="section-title">🗺️ 위치 확인</h3>
            {isValidLocation ? (
                // ... (Map 컴포넌트 유지) ...
                <div className="map-wrapper" style={{ border: "1px solid #ddd", borderRadius: "8px" }}>
                    <Map
                      center={{ lat, lng }}
                      style={{ width: "100%", height: "350px", borderRadius: "8px" }}
                      level={3}
                    >
                      <MapMarker position={{ lat, lng }} />
                    </Map>
                </div>
            ) : (
                <div className="no-map" style={{ padding: "20px", border: "1px solid #eee", borderRadius: "8px" }}>
                    위치 정보가 없어 지도를 표시할 수 없습니다.
                </div>
            )}
        </div>
        
      </div>
    </div>
  );
};

export default StayDetail;