import React, { useEffect, useState } from 'react';
import './GiftCard.css';
import { api } from '../../api/axios';

const COUPONS = [
  {
    id: 'hotel',
    title: '부산 숙소 5,000원 할인권',
    desc: '부산 내 제휴 호텔/게스트하우스에서 사용 가능',
    img: '', // 이미지 경로 직접 입력
    valid: '2025-12-31까지',
  },
  {
    id: 'cafe',
    title: '해운대 카페 20% 할인',
    desc: '해운대 해변 인근 제휴 카페에서 사용 가능',
    img: '',
    valid: '2025-12-31까지',
  },
  {
    id: 'drone',
    title: '광안리 드론쇼 우대석 추첨권',
    desc: '이벤트 응모 시 자동 추첨, 당첨자 개별 안내',
    img: '',
    valid: '2025-12-31 행사일까지',
  },
  {
    id: 'tower',
    title: '부산타워 입장권 30% 할인',
    desc: '부산타워 현장 매표소에서 사용 가능',
    img: '',
    valid: '2025-12-31까지',
  },
  {
    id: 'yacht',
    title: '요트투어 1만원 할인',
    desc: '부산 요트투어 제휴사에서 사용 가능',
    img: '',
    valid: '2025-12-31까지',
  },
];

interface EventDTO {
  eventId: number;
  eventType: string;
  eventName: string;
  count: number;
}

const GiftCard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [received, setReceived] = useState<{[id: string]: boolean}>({});
  const [loading, setLoading] = useState<{[id: string]: boolean}>({});

  // 로그인 상태 및 보유 쿠폰 확인
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    if (token) {
      loadMyGifts();
    }
  }, []);

  // 내가 보유한 기프트 조회
  const loadMyGifts = async () => {
    try {
      const response = await api.get('/events/type/GIFT');
      if (response.data.success && response.data.events) {
        const receivedMap: {[id: string]: boolean} = {};
        response.data.events.forEach((gift: EventDTO) => {
          // 쿠폰 이름으로 매칭
          const coupon = COUPONS.find(c => c.title === gift.eventName);
          if (coupon) {
            receivedMap[coupon.id] = true;
          }
        });
        setReceived(receivedMap);
      }
    } catch (error) {
      console.error('기프트 조회 실패:', error);
    }
  };

  const handleGetCoupon = async (id: string, title: string) => {
    // 이미 받은 쿠폰인지 확인
    if (received[id]) {
      alert('이미 발급받은 쿠폰입니다.');
      return;
    }

    // 토큰 확인
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    setLoading(prev => ({ ...prev, [id]: true }));

    try {
      const response = await api.post('/events/gift', {
        eventName: title,
        actionType: 'COUPON_RECEIVE',
        description: `쿠폰 발급: ${title}`
      });

      if (response.data.success) {
        setReceived(prev => ({ ...prev, [id]: true }));
        alert(`${title} 쿠폰이 발급되었습니다! 마이페이지에서 확인하세요.`);
        // 쿠폰 목록 새로고침
        loadMyGifts();
      } else {
        alert(response.data.msg || '쿠폰 발급에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('쿠폰 발급 실패:', error);
      const errorMsg = error.response?.data?.msg || error.message || '쿠폰 발급에 실패했습니다.';
      
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다. 다시 로그인해주세요.');
      } else if (error.response?.status === 400) {
        alert(errorMsg);
      } else {
        alert(`쿠폰 발급에 실패했습니다: ${errorMsg}`);
      }
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="giftcard-container">
      <h1 className="giftcard-title">🎁 여행 기프래카드</h1>
      <div className="giftcard-list">
        {COUPONS.map(coupon => (
          <div key={coupon.id} className="giftcard-item">
            {coupon.img && <img src={coupon.img} alt={coupon.title} className="giftcard-img" />}
            <div className="giftcard-info">
              <div className="giftcard-title2">{coupon.title}</div>
              <div className="giftcard-desc">{coupon.desc}</div>
              <div className="giftcard-valid">유효기간: {coupon.valid}</div>
            </div>
            {isLoggedIn && (
              <button
                className="giftcard-btn"
                disabled={received[coupon.id] || loading[coupon.id]}
                title={received[coupon.id] ? '이미 발급된 쿠폰입니다.' : ''}
                onClick={() => handleGetCoupon(coupon.id, coupon.title)}
              >
                {loading[coupon.id] ? '발급중...' : (received[coupon.id] ? '받음' : '쿠폰받기')}
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="giftcard-tip">※ 쿠폰 이미지는 직접 등록해 주세요. 사용 조건 및 유의사항은 상세 안내 참고</div>
      {!isLoggedIn && (
        <div className="giftcard-login-msg">로그인한 회원만 쿠폰을 받을 수 있습니다.</div>
      )}
    </div>
  );
};

export default GiftCard;
