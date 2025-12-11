import React, { useEffect, useState } from "react";
// 📌 useSearchParams를 추가하여 URL 쿼리 파라미터를 읽습니다.
import { useParams, useNavigate, useSearchParams } from "react-router-dom"; 
import axios from "axios";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";
import "./stayDetail.css"; 

// DTO 필드명과 일치
interface StayData {
  content_id: string; 
  title: string;
  address: string;
  firstimage?: string | null; 
  overview?: string;
  latitude?: number | string; 
  longitude?: number | string; 
  view_count?: number;
}

const StayDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // 📌 현재 URL의 파라미터(page, keyword 등)를 읽어옵니다.
  const [searchParams] = useSearchParams(); 

  const [stay, setStay] = useState<StayData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false); // 404 상태 관리

  // 카카오 맵 로더 (App Key는 .env 파일에서 불러온다고 가정)
  const [loadingMap, errorMap] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAOMAP_KEY as string,
    libraries: ["services"],
  });

  // 📌 [핵심 수정] 목록으로 돌아가기 핸들러: 쿼리 파라미터 유지
  const handleBackToList = () => {
      // 현재 URL의 쿼리 파라미터(page, keyword)를 그대로 가져와서
      const queryString = searchParams.toString();
      // 실제 목록 경로인 /info/stay 뒤에 붙여서 이동합니다.
      navigate(`/info/stay?${queryString}`); 
  };


  useEffect(() => {
    let didCancel = false;

    const fetchDetail = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/stay/view/${id}`
        );
        if (!didCancel) {
          setStay(response.data);
          setNotFound(false);
        }
      } catch (err) {
        console.error("상세 데이터 로딩 실패:", err);
        if (!didCancel && axios.isAxiosError(err) && err.response) {
           // 백엔드 (Controller)에서 404 응답을 보냈을 때 처리
           if (err.response.status === 404) {
               setNotFound(true);
           } else {
               alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
           }
        }
      } finally {
        if (!didCancel) setLoading(false);
      }
    };

    if (id) fetchDetail();

    return () => {
      didCancel = true;
    };
  }, [id]); 


  // 안전한 숫자 변환 및 지도 활성화 체크
  const lat = Number(stay?.latitude) || 0;
  const lng = Number(stay?.longitude) || 0;
  const isValidLocation = lat !== 0 && lng !== 0;


  if (loading || loadingMap) return <div className="loading-state">데이터를 불러오는 중입니다...</div>;
  if (errorMap) return <div className="error-state">지도 로딩 실패</div>;
  
  // 📌 [핵심 렌더링] 데이터가 없거나 404 상태일 때 에러 화면 표시
  if (notFound || !stay) {
    return (
      <div className="detail-page-container not-found">
        <div className="nav-header">
           {/* 404 화면에도 목록으로 돌아가기 버튼을 추가 */}
           <button onClick={handleBackToList} className="back-btn">
             <span>←</span> 목록으로 돌아가기
           </button>
        </div>
        <div className="error-card" style={{padding: '50px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '8px', marginTop: '20px'}}>
            <h2>❌ 정보를 찾을 수 없습니다. (ID: {id})</h2>
            <p style={{ marginTop: '10px' }}>
                요청하신 숙소 정보가 데이터베이스에 존재하지 않습니다.
            </p>
            <p>상세 정보 제공이 어려우니, 다른 숙소를 검색하거나 문의 부탁드립니다.</p>
            <button onClick={handleBackToList} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                목록으로 이동
            </button>
        </div>
      </div>
    );
  }


  // 이미지 URL 유효성 체크 및 안전한 대체 경로 설정
  const finalImageUrl = stay.firstimage && stay.firstimage.startsWith('http') 
                        ? stay.firstimage 
                        : 'https://via.placeholder.com/400?text=No+Image'; 

  return (
    <div className="detail-page-container">
      {/* 📌 목록으로 돌아가기 버튼 */}
      <div className="nav-header">
        <button onClick={handleBackToList} className="back-btn">
          <span>←</span> 목록으로 돌아가기
        </button>
      </div>

      <div className="detail-card">
        <div className="detail-header">
          <h1 className="detail-title">{stay.title}</h1>
          <span className="detail-view">👀 조회수 {stay.view_count || 0}</span>
        </div>

        <hr className="divider" />

        <div className="detail-content" style={{ display: "flex", gap: "30px" }}>
          <div className="img-wrapper" style={{ flex: 1, maxWidth: "400px" }}>
            <img
              src={finalImageUrl}
              alt={stay.title}
              className="detail-img"
              style={{ width: "100%", height: "auto", borderRadius: "8px" }}
              onError={(e) => {
                // 이미지 로드 실패 시 대체 텍스트 표시 로직
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

        <div className="detail-section map-section" style={{ marginTop: "40px" }}>
            <h3 className="section-title">🗺️ 위치 확인</h3>
            {isValidLocation ? (
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