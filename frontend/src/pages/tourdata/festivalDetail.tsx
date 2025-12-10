import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './FestivalDetail.css';

// TypeScript window 객체에 kakao를 추가 (카카오맵 사용을 위해)
declare global {
  interface Window {
    kakao: any;
  }
}

// 백엔드 API 응답 인터페이스 (유지)
interface FestivalDetail {
    ucSeq: string;
    mainTitle: string;
    gugunNm: string;
    lat: number;
    lng: number;
    place: string;
    addr1: string;
    cntctTel: string;
    homepageUrl: string;
    trfcInfo: string;
    usageDayWeekAndTime: string;
    hldyInfo: string;
    usageAmount: string;
    middleSizeRm1: string;
    mainImgNormal: string;
    itemCntnts: string; // 상세 설명
    viewCount: number;
}

// ⭐ 환경 변수에서 키를 읽어옵니다. (Vite 환경)
const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAOMAP_KEY;

const FestivalDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [detail, setDetail] = useState<FestivalDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [kakaoLoaded, setKakaoLoaded] = useState(false); // 카카오 스크립트 로드 상태

    // 0. 카카오맵 SDK 동적 로드 (맨 처음 한 번만 실행)
    useEffect(() => {
        if (!KAKAO_MAP_KEY) {
            console.error(".env에 VITE_KAKAOMAP_KEY가 정의되지 않았습니다.");
            return;
        }
        
        // SDK가 이미 로드되었는지 확인
        if (window.kakao && window.kakao.maps) {
            setKakaoLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false`;
        script.async = true;
        
        // 로드 완료 시 초기화 함수 호출
        script.onload = () => {
            window.kakao.maps.load(() => {
                setKakaoLoaded(true);
            });
        };
        document.head.appendChild(script);

    }, []);

    // 1. 데이터 로딩 (백엔드 API 호출)
    useEffect(() => {
        // ... (기존 API 호출 로직 유지) ...
        const fetchDetail = async () => {
            if (!id) return;
            try {
                await fetch(`/api/festival/view/${id}`);
                const res = await fetch(`/api/festival/${id}`);
                
                if (!res.ok) {
                    throw new Error("상세 정보를 불러올 수 없습니다.");
                }

                const data: FestivalDetail = await res.json();
                setDetail(data);

            } catch (err) {
                console.error(err);
                setError("데이터 로드 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    // 2. 카카오맵 초기화 로직 (데이터 로드 완료 및 SDK 로드 완료 시 실행)
    useEffect(() => {
        if (detail && kakaoLoaded) {
            const container = document.getElementById('kakao-map');
            if (!container) return;

            // ... (기존 카카오맵 초기화 로직 유지) ...
            const mapOption = {
                center: new window.kakao.maps.LatLng(detail.lat, detail.lng), 
                level: 3,
            };
            
            const map = new window.kakao.maps.Map(container, mapOption);
            const markerPosition  = new window.kakao.maps.LatLng(detail.lat, detail.lng); 
            const marker = new window.kakao.maps.Marker({ position: markerPosition });
            marker.setMap(map);
            
            const infowindow = new window.kakao.maps.InfoWindow({
                content: `<div style="padding:5px;font-size:12px;">${detail.mainTitle}</div>`
            });
            infowindow.open(map, marker);

        } else if (detail && !kakaoLoaded) {
             console.warn("Kakao Map SDK 로드 대기 중.");
        }
    }, [detail, kakaoLoaded]); // ⭐ kakaoLoaded를 의존성 배열에 추가


    if (loading) return <div className="detail-container">로딩 중...</div>;
    if (error) return <div className="detail-container" style={{ color: 'red' }}>{error}</div>;
    if (!detail) return <div className="detail-container">정보를 찾을 수 없습니다.</div>;


    return (
        <div className="detail-container">
            
            <div className="main-content-wrapper">
                {/* ========== 좌측 영역: 이미지 및 기본 정보 ========== */}
                <div className="info-section">
                    
                    {/* 타이틀 영역 */}
                    <div className="festival-title-area">
                        <h1>{detail.mainTitle}</h1>
                        <div className="view-count">조회수: {detail.viewCount}회</div>
                    </div>

                    {/* 이미지 (API에서 받은 URL 사용) */}
                    <img 
                        src={detail.mainImgNormal} 
                        alt={detail.mainTitle} 
                        className="festival-image-large"
                        // 이미지 로드 오류 시 대체 처리
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src="https://via.placeholder.com/600x400?text=No+Image"; }}
                    />
                    
                </div>

                {/* ========== 우측 영역: 사이드바 (정보) ========== */}
                <div className="sidebar-section">
                    <h3>세부 정보 및 안내</h3>
                    
                    <div className="sidebar-item">
                        <strong>주소</strong>
                        <p>{detail.addr1}</p>
                    </div>
                    
                    <div className="sidebar-item">
                        <strong>장소</strong>
                        <p>{detail.place} ({detail.gugunNm})</p>
                    </div>
                    
                    <div className="sidebar-item">
                        <strong>운영 시간</strong>
                        <p>{detail.usageDayWeekAndTime || '정보 없음'}</p>
                    </div>
                    <div className="sidebar-item">
                        <strong>연락처</strong>
                        <p>{detail.cntctTel || '정보 없음'}</p>
                    </div>
                    <div className="sidebar-item">
                        <strong>이용 요금</strong>
                        <p>{detail.usageAmount || '무료 또는 정보 없음'}</p>
                    </div>
                    
                </div>
            </div>

            {/* ========== 전체 너비 영역: 상세 설명 및 지도 ========== */}
            
            {/* 상세 설명 */}
            <div className="description-section">
                <h2>축제 소개</h2>
                <p>{detail.itemCntnts}</p>
            </div>
            
            {/* 지도 */}
            <div className="map-section">
                <h2>위치 확인</h2>
                {/* 카카오맵이 렌더링될 컨테이너 */}
                <div id="kakao-map" className="kakao-map-container" />
                {!kakaoLoaded && <p style={{textAlign: 'center', marginTop: '10px', color: '#888'}}>지도 SDK 로드 중...</p>}
            </div>

        </div>
    );
};

export default FestivalDetail;