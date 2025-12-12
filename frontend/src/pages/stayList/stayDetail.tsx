import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom"; 
import axios from "axios";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";
import * as TossPaymentsSDK from '@tosspayments/payment-sdk';
import "./stayDetail.css"; 

// ===================================
// 1. INTERFACE DEFINITIONS
// ===================================

// DTO 필드명과 일치 (content_id, view_count 스네이크 케이스 유지)
interface StayData {
    content_id: string; 
    title: string;
    address: string;
    firstimage?: string | null; 
    overview?: string;
    latitude?: number | string; 
    longitude?: number | string; 
    view_count?: number;
    price: number; // 숙소 가격 필드 추가
}

// 📌 [JWT 디코딩 헬퍼 함수]
const decodeJwt = (token: string): { sub: string } | null => {
    try {
        const payloadBase64 = token.split('.')[1];
        const decoded = atob(payloadBase64); 
        return JSON.parse(decoded);
    } catch (e) {
        return null;
    }
};

// ===================================
// 2. MAIN COMPONENT
// ===================================

const StayDetail: React.FC = () => {
    // TossPaymentsSDK 로딩 헬퍼 
    const loadTossPayments = (TossPaymentsSDK as any).default || (TossPaymentsSDK as any).loadTossPayments || TossPaymentsSDK;

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams(); 

    const [stay, setStay] = useState<StayData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [notFound, setNotFound] = useState<boolean>(false); 

    const token = localStorage.getItem("token"); 

    // 📌 [예약 및 결제 상태]
    const [checkInDate, setCheckInDate] = useState<string>('');
    const [checkOutDate, setCheckOutDate] = useState<string>('');
    const [nights, setNights] = useState<number>(0);
    const [finalAmount, setFinalAmount] = useState<number>(0); 

    // 📌 [로그인 상태 및 사용자 ID 상태]
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); 
    const [currentAccountId, setCurrentAccountId] = useState<string>('guest');
    
    // 📌 [Toss 키 및 API 경로]
    const DUMMY_ORDER_ID = `order_${id}_${Date.now()}`; 
    const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY as string;
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8484"; 

    // 📌 [날짜 유효성 검증을 위한 오늘 날짜]
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`; // YYYY-MM-DD 형식

    // 카카오 맵 로더 (유지)
    const [loadingMap, errorMap] = useKakaoLoader({
        appkey: import.meta.env.VITE_KAKAOMAP_KEY as string,
        libraries: ["services"],
    });

    // ===================================
    // 3. DATA & LOGIC
    // ===================================

    // 📌 [EFFECT 1: JWT를 확인하고 사용자 ID 로드]
    useEffect(() => {
        if (token) {
            const payload = decodeJwt(token);
            if (payload && payload.sub) { 
                setIsLoggedIn(true);
                setCurrentAccountId(payload.sub); 
                return;
            }
        }
        setIsLoggedIn(false);
        setCurrentAccountId('guest');
    }, [token]); 


    // 📌 [EFFECT 2: 숙소 상세 정보 로딩 및 초기 날짜 설정]
    useEffect(() => {
        let didCancel = false;
        if (!id) return;

        const fetchDetail = async () => {
            const accessToken = localStorage.getItem('token'); 
            
            try {
                const response = await axios.get<StayData>(
                    `${API_BASE_URL}/api/stay/view/${id}`,
                    { headers: { Authorization: `Bearer ${accessToken}` } } 
                );
                if (!didCancel) {
                    setStay({ ...response.data, price: response.data.price || 50000 }); 
                    setNotFound(false);
                    
                    const today = new Date().toISOString().split('T')[0];
                    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                    setCheckInDate(today);
                    setCheckOutDate(tomorrow);
                }
            } catch (err) {
                console.error("상세 데이터 로딩 실패:", err);
                if (!didCancel && axios.isAxiosError(err) && err.response) {
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

        fetchDetail();

        return () => {
            didCancel = true;
        };
    }, [id, API_BASE_URL]); 


    // 📌 [EFFECT 3: 숙박 일수 및 최종 금액 계산]
    useEffect(() => {
        if (!stay || !checkInDate || !checkOutDate) {
             setFinalAmount(0);
             setNights(0);
             return;
        }

        const inDate = new Date(checkInDate);
        const outDate = new Date(checkOutDate);
        
        let diffDays = 0;
        
        if (outDate <= inDate) {
             // 체크아웃 날짜가 유효하지 않으면 1박으로 계산
             diffDays = 1;
        } else {
            const diffTime = Math.abs(outDate.getTime() - inDate.getTime());
            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        setNights(diffDays);
        setFinalAmount(diffDays * (stay.price || 50000)); 

    }, [checkInDate, checkOutDate, stay?.price, stay]);

    // 목록으로 돌아가기 핸들러 (유지)
    const handleBackToList = () => {
        const queryString = searchParams.toString();
        navigate(`/info/stay?${queryString}`); 
    };

    // 📌 [Toss 결제 실행 핸들러] - 최종 수정
    const handleTossPayment = async () => {
        
        // 🛑 1. 로그인 검사
        if (!isLoggedIn) {
            alert("로그인을 하셔야 예약 및 결제를 진행할 수 있습니다."); 
            navigate('/login', { state: { from: window.location.pathname } }); 
            return;
        }

        // 🛑 2. 날짜 및 금액 유효성 검사
        if (!checkInDate || !checkOutDate || nights < 1 || finalAmount <= 0) {
            alert("예약할 체크인/체크아웃 날짜를 올바르게 선택해주세요."); 
            return; 
        }
        
        // 🛑 3. 나머지 필수 정보 유효성 검사
        if (!clientKey || !stay || !stay.content_id) {
            alert("필수 결제 정보가 누락되었습니다. (환경 변수 또는 숙소 데이터)");
            return;
        }
        
        // 4. 결제 준비 및 위젯 호출
        try {
            const tossPayments = await loadTossPayments(clientKey);

            // 💡 현재 프론트엔드 URL을 최종 복귀 URL로 설정
            const successReturnUrl = `${window.location.origin}/info/stay/${id}`; 

            // 💡 [핵심] 성공/실패 URL에 예약 정보와 returnUrl을 쿼리 파라미터로 전달
            const reservationParams = new URLSearchParams({
                accountId: currentAccountId, 
                contentId: stay.content_id, 
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
                amount: finalAmount.toString(), 
                title: stay.title || "숙소 예약",
                
                // 🛑 [결제 후 돌아올 URL] 백엔드에서 결제 검증 후 이 주소로 리다이렉트합니다.
                returnUrl: successReturnUrl 
            }).toString();

            // 🛑 [await 추가 및 결제 요청]
            await tossPayments.requestPayment({
                method: "카드", 
                amount: finalAmount, 
                orderId: DUMMY_ORDER_ID, 
                orderName: `${stay.title} 예약 (${nights}박)`,
                customerName: currentAccountId, 
                
                // 백엔드 성공 처리 API에 예약 정보와 returnUrl을 함께 보냅니다.
                successUrl: `${API_BASE_URL}/api/payment/toss/success?${reservationParams}`, 
                failUrl: `${API_BASE_URL}/api/payment/toss/fail`,
                flowMode: 'default',
            });

        } catch (error) {
            console.error("토스 결제 요청 실패:", error);
            alert("토스 결제 위젯을 불러오는 데 실패했습니다.");
        }
    };


    // ===================================
    // 4. JSX RENDERING
    // ===================================

    const lat = Number(stay?.latitude) || 0;
    const lng = Number(stay?.longitude) || 0;
    const isValidLocation = lat !== 0 && lng !== 0;

    if (loading || loadingMap) return <div className="loading-state">데이터를 불러오는 중입니다...</div>;
    if (errorMap) return <div className="error-state">지도 로딩 실패</div>;
    
    if (notFound || !stay) {
        return (
            <div className="detail-page-container not-found">
                <div className="nav-header">
                    <button onClick={handleBackToList} className="back-btn">
                        <span>←</span> 목록으로 돌아가기
                    </button>
                </div>
                <div className="error-card" style={{padding: '50px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '8px', marginTop: '20px'}}>
                    <h2>❌ 정보를 찾을 수 없습니다. (ID: {id})</h2>
                    <p style={{ marginTop: '10px' }}>요청하신 숙소 정보가 데이터베이스에 존재하지 않습니다.</p>
                    <button onClick={handleBackToList} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        목록으로 이동
                    </button>
                </div>
            </div>
        );
    }

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
                
                {/* 📌 [날짜 선택 UI 및 버튼 통합 섹션] */}
                <div className="reservation-input-section" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '30px', backgroundColor: '#f9f9f9' }}>
                    
                    <h3>🗓️ 숙소 이용 날짜 선택</h3>
                    
                    <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
                        <div className="date-input-group">
                            <label htmlFor="checkIn" style={{ fontWeight: 'bold' }}>체크인 날짜:</label>
                            <input 
                                id="checkIn" 
                                type="date" 
                                value={checkInDate} 
                                onChange={(e) => setCheckInDate(e.target.value)}
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                min={todayString} 
                            />
                        </div>
                        <div className="date-input-group">
                            <label htmlFor="checkOut" style={{ fontWeight: 'bold' }}>체크아웃 날짜:</label>
                            <input 
                                id="checkOut" 
                                type="date" 
                                value={checkOutDate} 
                                onChange={(e) => setCheckOutDate(e.target.value)}
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                min={checkInDate || todayString} 
                            />
                        </div>
                    </div>
                    
                    <p style={{ marginTop: '15px', fontWeight: 'bold', color: '#007bff' }}>
                        숙박 기간: {nights}박 (1박당 {stay.price.toLocaleString()}원)
                    </p>

                    <p style={{ marginTop: '5px', fontWeight: 'bold', fontSize: '1.2em', color: '#dc3545' }}>
                        💰 예상 결제 금액: {finalAmount.toLocaleString()}원
                    </p>

                    {/* 📌 [결제 버튼] */}
                    <button 
                        onClick={handleTossPayment}
                        disabled={finalAmount <= 0} 
                        style={{ padding: '15px 30px', fontSize: '1.2em', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}
                    >
                        {finalAmount > 0 ? `${finalAmount.toLocaleString()}원 예약/결제` : '예약/결제'}
                    </button>
                    
                </div>


                <div className="detail-content" style={{ display: "flex", gap: "30px" }}>
                    <div className="img-wrapper" style={{ flex: 1, maxWidth: "400px" }}>
                        <img
                            src={finalImageUrl}
                            alt={stay.title}
                            className="detail-img"
                            style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                            onError={(e) => {
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