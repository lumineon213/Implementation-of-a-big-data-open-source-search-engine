import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [received, setReceived] = useState<{[id: string]: boolean}>({});
  const [loading, setLoading] = useState<{[id: string]: boolean}>({});
  
  const COUPONS_TRANSLATED = COUPONS.map(coupon => ({
    ...coupon,
    title: t(`benefits.coupons.${coupon.id}.title`),
    desc: t(`benefits.coupons.${coupon.id}.desc`),
    valid: t(`benefits.coupons.${coupon.id}.valid`)
  }));

  // 로그인 상태 및 보유 쿠폰 확인
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    if (token) {
      loadMyGifts();
    }
  }, [t]);

  // 내가 보유한 기프트 조회
  const loadMyGifts = async () => {
    try {
      const response = await api.get('/events/type/GIFT');
      if (response.data.success && response.data.events) {
        const receivedMap: {[id: string]: boolean} = {};
        response.data.events.forEach((gift: EventDTO) => {
          // 쿠폰 이름으로 매칭 (한국어/영어 모두 확인)
          const coupon = COUPONS.find(c => {
            const koTitle = t(`benefits.coupons.${c.id}.title`, { lng: 'ko' });
            const enTitle = t(`benefits.coupons.${c.id}.title`, { lng: 'en' });
            return gift.eventName === koTitle || gift.eventName === enTitle || gift.eventName === c.title;
          });
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
      alert(t('benefits.giftCard.alreadyReceived'));
      return;
    }

    // 토큰 확인
    const token = localStorage.getItem('token');
    if (!token) {
      alert(t('benefits.loginRequired'));
      return;
    }

    setLoading(prev => ({ ...prev, [id]: true }));

    try {
      // 한국어 제목으로 서버에 전송 (서버가 한국어로 저장하므로)
      const koTitle = t(`benefits.coupons.${id}.title`, { lng: 'ko' });
      const response = await api.post('/events/gift', {
        eventName: koTitle,
        actionType: 'COUPON_RECEIVE',
        description: `${t('benefits.giftCard.couponIssuance')}: ${koTitle}`
      });

      if (response.data.success) {
        setReceived(prev => ({ ...prev, [id]: true }));
        alert(t('benefits.giftCard.issuanceSuccess', { title }));
        // 쿠폰 목록 새로고침
        loadMyGifts();
      } else {
        alert(response.data.msg || t('benefits.giftCard.issuanceFailed'));
      }
    } catch (error: any) {
      console.error('쿠폰 발급 실패:', error);
      const errorMsg = error.response?.data?.msg || error.message || t('benefits.giftCard.issuanceFailed');
      
      if (error.response?.status === 401) {
        alert(t('benefits.giftCard.loginRequiredAgain'));
      } else if (error.response?.status === 400) {
        alert(errorMsg);
      } else {
        alert(`${t('benefits.giftCard.issuanceFailed')}: ${errorMsg}`);
      }
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="giftcard-container">
      <h1 className="giftcard-title">🎁 {t('benefits.giftCard.title')}</h1>
      <div className="giftcard-list">
        {COUPONS_TRANSLATED.map(coupon => (
          <div key={coupon.id} className="giftcard-item">
            {coupon.img && <img src={coupon.img} alt={coupon.title} className="giftcard-img" />}
            <div className="giftcard-info">
              <div className="giftcard-title2">{coupon.title}</div>
              <div className="giftcard-desc">{coupon.desc}</div>
              <div className="giftcard-valid">{t('benefits.giftCard.validPeriod')}: {coupon.valid}</div>
            </div>
            {isLoggedIn && (
              <button
                className="giftcard-btn"
                disabled={received[coupon.id] || loading[coupon.id]}
                title={received[coupon.id] ? t('benefits.giftCard.alreadyIssued') : ''}
                onClick={() => handleGetCoupon(coupon.id, coupon.title)}
              >
                {loading[coupon.id] ? t('benefits.giftCard.issuing') : (received[coupon.id] ? t('benefits.giftCard.received') : t('benefits.giftCard.getCoupon'))}
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="giftcard-tip">{t('benefits.giftCard.tip')}</div>
      {!isLoggedIn && (
        <div className="giftcard-login-msg">{t('benefits.giftCard.loginMessage')}</div>
      )}
    </div>
  );
};

export default GiftCard;
