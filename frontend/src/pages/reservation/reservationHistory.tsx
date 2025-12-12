import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import "./ReservationHistory.css"; // CSS 파일 import

// ===================================
// 1. INTERFACE DEFINITIONS
// ===================================

interface ReservationHistoryData {
    reservationId: number;
    contentId: string;
    checkInDate: string; 
    checkOutDate: string;
    amount: number; 
    title: string; 
}

// 📌 [JWT 디코딩 헬퍼 함수] - 사용자 ID 추출용 (인증 확인용으로 사용)
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
// 2. MAIN COMPONENT: 예약 내역 조회 및 렌더링
// ===================================

const ReservationHistory: React.FC = () => {
    
    const navigate = useNavigate();
    const [reservations, setReservations] = useState<ReservationHistoryData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentAccountId, setCurrentAccountId] = useState<string | null>(null); // JWT 확인용

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8484"; 
    const token = localStorage.getItem("token");

    // 📌 [EFFECT 1: JWT 확인 및 사용자 ID 로드]
    useEffect(() => {
        if (!token) {
            setError("로그인이 필요합니다.");
            setLoading(false);
            return;
        }

        const payload = decodeJwt(token);
        if (payload && payload.sub) { 
            setCurrentAccountId(payload.sub); // 로그인 확인 완료
        } else {
            setError("로그인 정보가 유효하지 않습니다.");
            setLoading(false);
        }
    }, [token]); 


    // 📌 [EFFECT 2: 예약 내역 조회]
    useEffect(() => {
        // ID 대신 token 존재 여부와 accountId 확인 완료 여부만 체크
        if (!currentAccountId || !token) return;

        const fetchReservations = async () => {
            try {
                // 🛑 [수정됨] 백엔드 @AuthenticationPrincipal에 맞춰 경로 변수 없이 호출
                const response = await axios.get<ReservationHistoryData[]>(
                    // 최종 호출 URL: http://localhost:8484/api/mypage/reservations
                    `${API_BASE_URL}/api/mypage/reservations`, 
                    { 
                        headers: { 
                            Authorization: `Bearer ${token}` // JWT 토큰을 헤더에 포함
                        } 
                    }
                );
                
                setReservations(response.data);
                setError(null);
            } catch (err) {
                console.error("예약 내역 조회 실패:", err);
                // 401이나 403 에러도 여기에 잡힙니다.
                setError("예약 내역을 불러오는 데 실패했습니다. 서버 상태 또는 인증을 확인해주세요.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchReservations();
    }, [currentAccountId, API_BASE_URL, token]);
    
    // 📌 [핸들러: 상세 페이지로 이동]
    const handleDetailClick = (contentId: string) => {
        navigate(`/info/stay/${contentId}`);
    };


    // ===================================
    // 3. JSX RENDERING
    // ===================================

    if (loading) return <div className="mypage-loading">예약 내역을 불러오는 중입니다...</div>;
    
    if (error) {
        return (
            <div className="reservation-section error-state">
                <h3>예약 내역</h3>
                <div>{error}</div>
            </div>
        );
    }

    return (
        <div className="reservation-section">
            <h2>📅 예약 내역</h2>

            {reservations.length === 0 ? (
                <div className="no-reservation">
                    <p>현재 예약된 숙소가 없습니다.</p>
                </div>
            ) : (
                <table className="reservation-table">
                    <thead>
                        <tr>
                            <th>예약 번호</th>
                            <th>숙소명</th>
                            <th>체크인</th>
                            <th>체크아웃</th>
                            <th>결제 금액</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservations.map((res) => (
                            <tr key={res.reservationId}>
                                <td>{res.reservationId}</td>
                                <td 
                                    onClick={() => handleDetailClick(res.contentId)} 
                                >
                                    {res.title}
                                </td>
                                <td>{res.checkInDate}</td>
                                <td>{res.checkOutDate}</td>
                                <td>
                                    {res.amount.toLocaleString()}원
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ReservationHistory;