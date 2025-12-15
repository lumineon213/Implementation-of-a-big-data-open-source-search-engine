import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import './reservationSuccess.css'; 

interface ReservationDetails {
    orderId: string;
    amount: string;
    title: string;
    checkIn: string;
    checkOut: string;
    contentId: string; 
}

const ReservationSuccess: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [details, setDetails] = useState<ReservationDetails | null>(null);
    const [loading, setLoading] = useState(true);

    // URL 파라미터에서 데이터 추출
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        
        const orderId = params.get('orderId');
        const amount = params.get('amount');
        const title = params.get('title'); 
        const checkIn = params.get('checkIn'); 
        const checkOut = params.get('checkOut'); 
        const contentId = params.get('contentId'); 

        if (orderId && amount) { 
            setDetails({
                orderId: orderId,
                amount: amount,
                title: title || '숙소 이름 누락', 
                checkIn: checkIn || '체크인 날짜 누락',
                checkOut: checkOut || '체크아웃 날짜 누락',
                contentId: contentId || 'ID 누락' 
            });
        }
        setLoading(false);

    }, [location.search]);

    // 직전 페이지로 돌아가는 핸들러 함수
    const handleGoBack = () => {
        navigate(-1);
    };

    if (loading) return <div className="reservation-loading">예약 정보를 확인하는 중입니다...</div>;
    
    if (!details) {
        return (
            <div className="reservation-fail-container">
                <h1 className="fail-title">⚠️ 예약 실패 또는 정보 누락</h1>
                <p>주문 번호나 결제 금액 정보가 유효하지 않습니다. 마이페이지에서 예약 내역을 확인해주세요.</p>
                <Link to="/mypage" className="fail-btn">마이페이지로 이동</Link>
            </div>
        );
    }
    
    
    return (
        <div className="reservation-success-container">
            
            <div className="nav-header" style={{ marginBottom: '20px' }}>
                <button onClick={handleGoBack} className="back-btn">
                    <span>←</span> 직전 페이지로 돌아가기
                </button>
            </div>
            
            <div className="success-icon">✅</div>
            <h1 className="success-title">예약 및 결제가 성공적으로 완료되었습니다!</h1>
            <p className="success-message">
                <strong>{details.title}</strong> 숙소 예약이 확정되었습니다.
                즐거운 여행을 준비하세요!
            </p>

            <div className="summary-card">
                <h3>예약 요약 정보</h3>
                <div className="detail-row">
                    <span>예약 숙소</span>
                    <strong style={{ color: details.title.includes('누락') ? 'red' : 'inherit' }}>
                        {details.title}
                    </strong>
                </div>
                <div className="detail-row">
                    <span>체크인</span>
                    <strong>{details.checkIn}</strong>
                </div>
                <div className="detail-row">
                    <span>체크아웃</span>
                    <strong>{details.checkOut}</strong>
                </div>
                <div className="detail-row total">
                    <span>최종 결제 금액</span>
                    <strong>{parseInt(details.amount).toLocaleString()}원</strong>
                </div>
            </div>
            
            <div className="action-buttons">
                <Link to="/mypage" className="main-btn secondary">
                    <span role="img" aria-label="mypage">👤</span> 마이페이지 예약 확인
                </Link>
            </div>
        </div>
    );
};

export default ReservationSuccess;