import React, { useEffect, useState } from 'react';
import './GiftCard.css';

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

const GiftCard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 쿠폰별 발급 상태 관리
  const [received, setReceived] = useState<{[id: string]: boolean}>({});
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handleGetCoupon = (id: string, title: string) => {
    setReceived(prev => ({ ...prev, [id]: true }));
    alert(`${title} 쿠폰이 발급되었습니다! 마이페이지에서 확인하세요.`);
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
                disabled={received[coupon.id]}
                title={received[coupon.id] ? '이미 발급된 쿠폰입니다.' : ''}
                onClick={!received[coupon.id] ? () => handleGetCoupon(coupon.id, coupon.title) : undefined}
              >
                {received[coupon.id] ? '받음' : '쿠폰받기'}
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
