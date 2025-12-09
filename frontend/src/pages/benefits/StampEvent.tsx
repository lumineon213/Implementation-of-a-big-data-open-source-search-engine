import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StampEvent.css';

const STAMP_LIST = [
  { id: 'jagalchi'  , name: '자갈치시장', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdJGWn_7R2v6d5V2Vm47nKPl4tWjEYdud6tw&s', lat: 35.0973, lng: 129.0307 },
  { id: 'gukje', name: '국제시장', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg7jP3IEAZWskx7Z5f5cvy1QL6QpF_PDX_2Q&s', lat: 35.1055, lng: 129.0251 },
  { id: 'haeundae', name: '해운대', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToq9yotL9roPD2Z9exd1Je1g5-rIITKCIlCA&s', lat: 35.1587, lng: 129.1604 },
  { id: 'centum', name: '센텀시티', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS21IhQDySLN4tUYNYJWCJRjA4auzADntSNbw&s', lat: 35.1704, lng: 129.1306 },
  { id: 'songdo', name: '송도해수욕장', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_On3L6TAiIxJEURqJuf9H9z4Q-7tJkyprJA&s', lat: 35.0853, lng: 129.0217 },
];

const StampEvent: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인 후 이용 가능합니다.');
      navigate('/login');
    }
  }, [navigate]);
  const [myStamps, setMyStamps] = useState<string[]>([]);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [checkMsg, setCheckMsg] = useState<string>("");

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
  const handleCheckIn = (id: string) => {
    if (myStamps.includes(id)) return;
    setCheckingId(id);
    setCheckMsg('위치 확인 중...');
    if (!navigator.geolocation) {
      setCheckMsg('이 브라우저는 위치 정보를 지원하지 않습니다.');
      setCheckingId(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const stamp = STAMP_LIST.find(s => s.id === id);
        if (!stamp) {
          setCheckMsg('명소 정보를 찾을 수 없습니다.');
          setCheckingId(null);
          return;
        }
        const dist = getDistance(latitude, longitude, stamp.lat, stamp.lng);
        if (dist <= 100) {
          setMyStamps([...myStamps, id]);
          setCheckMsg('인증 성공!');
        } else {
          setCheckMsg(`현재 위치와 명소가 ${Math.round(dist)}m 떨어져 있습니다. 100m 이내에서 인증 가능합니다.`);
        }
        setCheckingId(null);
      },
      (err) => {
        setCheckMsg('위치 정보 확인에 실패했습니다. 권한을 허용해 주세요.');
        setCheckingId(null);
      }
    );
  };

  return (
    <div className="stamp-event-container">
      <h1 className="stamp-title">🎉 부산 명소 스탬프 투어 이벤트</h1>
      <p className="stamp-desc">부산의 대표 명소를 방문하고 스탬프를 모아보세요!<br />
        모든 스탬프를 모으면 특별 뱃지와 기념품을 드립니다.</p>
      <div className="stamp-list">
        {STAMP_LIST.map(stamp => (
          <div key={stamp.id} className={`stamp-card${myStamps.includes(stamp.id) ? ' collected' : ''}`}> 
            <img src={stamp.img} alt={stamp.name} className="stamp-img" />
            <div className="stamp-name">{stamp.name}</div>
            <button 
              className="stamp-checkin-btn"
              disabled={myStamps.includes(stamp.id) || checkingId === stamp.id}
              onClick={() => handleCheckIn(stamp.id)}
            >
              {myStamps.includes(stamp.id) ? '인증 완료!' : (checkingId === stamp.id ? '확인 중...' : '방문 인증하기')}
            </button>
          </div>
        ))}
      </div>
      {checkMsg && (
        <div className="stamp-check-msg">{checkMsg}</div>
      )}
      <div className="stamp-status">
        <button className="stamp-reset-btn" onClick={() => setMyStamps([])}>
          스탬프 초기화
        </button>
        <h2>내 스탬프 현황</h2>
        <div className="stamp-status-list">
          {STAMP_LIST.map(stamp => (
            <div key={stamp.id} className={`stamp-status-item${myStamps.includes(stamp.id) ? ' done' : ''}`}>{stamp.name}</div>
          ))}
        </div>
        <div className="stamp-progress">
          <span>획득: {myStamps.length} / {STAMP_LIST.length}</span>
          {myStamps.length === STAMP_LIST.length && (
            <div className="stamp-reward">🎁 모든 스탬프를 모았습니다! 기념품을 신청하세요.</div>
          )}
          <div className="stamp-reward-small">🎁 성공 시 숙소 3,000원 할인권 증정!</div>
        </div>
      </div>
    </div>
  );
};

export default StampEvent;
