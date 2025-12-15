import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './StampEvent.css';
import { api } from '../../api/axios';

const STAMP_LIST = [
  { id: 'jagalchi'  , name: '자갈치시장', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdJGWn_7R2v6d5V2Vm47nKPl4tWjEYdud6tw&s', lat: 35.0973, lng: 129.0307 },
  { id: 'gukje', name: '국제시장', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg7jP3IEAZWskx7Z5f5cvy1QL6QpF_PDX_2Q&s', lat: 35.1055, lng: 129.0251 },
  { id: 'haeundae', name: '해운대', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToq9yotL9roPD2Z9exd1Je1g5-rIITKCIlCA&s', lat: 35.1587, lng: 129.1604 },
  { id: 'centum', name: '센텀시티', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS21IhQDySLN4tUYNYJWCJRjA4auzADntSNbw&s', lat: 35.1704, lng: 129.1306 },
  { id: 'songdo', name: '송도해수욕장', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_On3L6TAiIxJEURqJuf9H9z4Q-7tJkyprJA&s', lat: 35.0853, lng: 129.0217 },
];

interface EventDTO {
  eventId: number;
  eventType: string;
  eventName: string;
  count: number;
}

const StampEvent: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [myStamps, setMyStamps] = useState<string[]>([]);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [checkMsg, setCheckMsg] = useState<string>("");
  
  const STAMP_LIST_TRANSLATED = STAMP_LIST.map(stamp => ({
    ...stamp,
    name: t(`benefits.stamps.${stamp.id}.name`)
  }));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert(t('benefits.loginRequired'));
      navigate('/login');
      return;
    }
    loadMyStamps();
  }, [navigate, t]);

  // 내가 보유한 스탬프 조회
  const loadMyStamps = async () => {
    try {
      const response = await api.get('/events/type/STAMP');
      if (response.data.success && response.data.events) {
        const stampIds: string[] = [];
        response.data.events.forEach((stamp: EventDTO) => {
          // 스탬프 이름으로 매칭 (한국어/영어 모두 확인)
          const stampItem = STAMP_LIST.find(s => {
            const koName = t(`benefits.stamps.${s.id}.name`, { lng: 'ko' });
            const enName = t(`benefits.stamps.${s.id}.name`, { lng: 'en' });
            return stamp.eventName === koName || stamp.eventName === enName || stamp.eventName === s.name;
          });
          if (stampItem && stamp.count > 0) {
            stampIds.push(stampItem.id);
          }
        });
        setMyStamps(stampIds);
      }
    } catch (error) {
      console.error('스탬프 조회 실패:', error);
    }
  };

  // 두 좌표 거리(m) 계산 함수
  function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371000; // m
    const toRad = (v: number) => v * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // GPS 인증
  const handleCheckIn = async (id: string) => {
    if (myStamps.includes(id)) return;
    
    setCheckingId(id);
    setCheckMsg(t('benefits.stampEvent.checkingLocation'));
    
    if (!navigator.geolocation) {
      setCheckMsg(t('benefits.stampEvent.browserNotSupported'));
      setCheckingId(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const stamp = STAMP_LIST_TRANSLATED.find(s => s.id === id);
        
        if (!stamp) {
          setCheckMsg(t('benefits.stampEvent.placeNotFound'));
          setCheckingId(null);
          return;
        }
        
        const dist = getDistance(latitude, longitude, stamp.lat, stamp.lng);
        
        if (dist <= 100) {
          // 백엔드에 스탬프 저장 (한국어 이름으로 저장)
          try {
            const koName = t(`benefits.stamps.${id}.name`, { lng: 'ko' });
            const response = await api.post('/events/stamp', {
              eventName: koName,
              actionType: 'VISIT',
              description: `${koName} ${t('benefits.stampEvent.visitCertification')}`
            });
            
            if (response.data.success) {
              setMyStamps([...myStamps, id]);
              setCheckMsg(t('benefits.stampEvent.certificationSuccess'));
              
              // 모든 스탬프를 모았는지 확인
              if (myStamps.length + 1 === STAMP_LIST.length) {
                // 배지 발급
                try {
                  const badgeKoName = t('benefits.badges.stamp.name', { lng: 'ko' });
                  await api.post('/events/badge', {
                    eventName: badgeKoName,
                    actionType: 'STAMP_COMPLETE',
                    description: t('benefits.stampEvent.allStampsCollected', { lng: 'ko' })
                  });
                  setTimeout(() => {
                    alert(t('benefits.stampEvent.allStampsComplete'));
                  }, 500);
                } catch (error) {
                  console.error('배지 발급 실패:', error);
                }
              }
            } else {
              setCheckMsg(response.data.msg || t('benefits.stampEvent.issuanceFailed'));
            }
          } catch (error: any) {
            console.error('스탬프 발급 실패:', error);
            if (error.response?.data?.msg) {
              setCheckMsg(error.response.data.msg);
            } else {
              setCheckMsg(t('benefits.stampEvent.issuanceFailedRetry'));
            }
          }
        } else {
          setCheckMsg(t('benefits.stampEvent.distanceMessage', { distance: Math.round(dist) }));
        }
        
        setCheckingId(null);
      },
      () => {
        setCheckMsg(t('benefits.stampEvent.permissionDenied'));
        setCheckingId(null);
      }
    );
  };

  return (
    <div className="stamp-event-container">
      <h1 className="stamp-title">🎉 {t('benefits.stampEvent.title')}</h1>
      <p className="stamp-desc">{t('benefits.stampEvent.description')}</p>
      <div className="stamp-list">
        {STAMP_LIST_TRANSLATED.map(stamp => (
          <div key={stamp.id} className={`stamp-card${myStamps.includes(stamp.id) ? ' collected' : ''}`}> 
            <img src={stamp.img} alt={stamp.name} className="stamp-img" />
            <div className="stamp-name">{stamp.name}</div>
            <button 
              className="stamp-checkin-btn"
              disabled={myStamps.includes(stamp.id) || checkingId === stamp.id}
              onClick={() => handleCheckIn(stamp.id)}
            >
              {myStamps.includes(stamp.id) ? t('benefits.stampEvent.certificationComplete') : (checkingId === stamp.id ? t('benefits.stampEvent.checking') : t('benefits.stampEvent.certifyVisit'))}
            </button>
          </div>
        ))}
      </div>
      {checkMsg && (
        <div className="stamp-check-msg">{checkMsg}</div>
      )}
      <div className="stamp-status">
        <h2>{t('benefits.stampEvent.myStatus')}</h2>
        <div className="stamp-status-list">
          {STAMP_LIST_TRANSLATED.map(stamp => (
            <div key={stamp.id} className={`stamp-status-item${myStamps.includes(stamp.id) ? ' done' : ''}`}>{stamp.name}</div>
          ))}
        </div>
        <div className="stamp-progress">
          <span>{t('benefits.stampEvent.achieved')}: {myStamps.length} / {STAMP_LIST.length}</span>
          {myStamps.length === STAMP_LIST.length && (
            <div className="stamp-reward">🎁 {t('benefits.stampEvent.allStampsMessage')}</div>
          )}
          <div className="stamp-reward-small">🎁 {t('benefits.stampEvent.rewardMessage')}</div>
        </div>
      </div>
    </div>
  );
};

export default StampEvent;
