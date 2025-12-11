import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BadgePad.css';
import { api } from '../../api/axios';

interface Badge {
  id: string;
  name: string;
  img: string;
  desc: string;
  achieved: boolean;
}

interface EventDTO {
  eventId: number;
  eventType: string;
  eventName: string;
  count: number;
}

const BADGES: Badge[] = [
  {
    id: 'stamp',
    name: '스탬프 투어 완주',
    img: 'https://cdn-icons-png.flaticon.com/512/190/190411.png',
    desc: '모든 명소 스탬프를 모으면 획득!',
    achieved: false,
  },
  {
    id: 'review',
    name: '리뷰 3회 작성',
    img: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png',
    desc: '리뷰를 3회 이상 작성하면 획득!',
    achieved: false,
  },
  {
    id: 'first',
    name: '첫 방문',
    img: 'https://cdn-icons-png.flaticon.com/512/1828/1828886.png',
    desc: '첫 명소 방문 인증 시 획득!',
    achieved: false,
  },
  {
    id: 'event',
    name: '이벤트 참여',
    img: 'https://cdn-icons-png.flaticon.com/512/190/190406.png',
    desc: '이벤트에 참여하면 획득!',
    achieved: false,
  },
  {
    id: 'ai',
    name: 'AI 추천 코스',
    img: 'https://cdn-icons-png.flaticon.com/512/190/190422.png',
    desc: 'AI 추천 코스 이용 시 획득!',
    achieved: false,
  },
];

const BadgePad: React.FC = () => {
  const navigate = useNavigate();
  const [badges, setBadges] = useState<Badge[]>(BADGES);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인 후 이용 가능합니다.');
      navigate('/login');
      return;
    }
    loadMyBadges();
  }, [navigate]);

  // 내가 보유한 배지 조회
  const loadMyBadges = async () => {
    try {
      const response = await api.get('/events/type/BADGE');
      if (response.data.success && response.data.events) {
        const achievedBadgeNames = response.data.events.map((badge: EventDTO) => badge.eventName);
        const updatedBadges = BADGES.map(badge => ({
          ...badge,
          achieved: achievedBadgeNames.includes(badge.name)
        }));
        setBadges(updatedBadges);
      }
    } catch (error) {
      console.error('배지 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "50px", textAlign: "center" }}>로딩중...</div>;
  }

  return (
    <div className="badgepad-container">
      <h1 className="badgepad-title">🏅 내 뱃지패드</h1>
      <div className="badgepad-grid">
        {badges.map((badge, idx) => (
          <div
            key={badge.id}
            className={`badgepad-badge${badge.achieved ? ' achieved' : ''}`}
            onClick={() => setSelected(idx)}
          >
            <img
              src={badge.img}
              alt={badge.name}
              className="badgepad-img"
              style={{ filter: badge.achieved ? 'none' : 'grayscale(1) opacity(0.4)' }}
            />
            <div className="badgepad-name">{badge.name}</div>
          </div>
        ))}
      </div>
      <div className="badgepad-count">
        획득: {badges.filter(b => b.achieved).length} / {badges.length}
      </div>
      {selected !== null && (
        <div className="badgepad-modal-bg" onClick={() => setSelected(null)}>
          <div className="badgepad-modal" onClick={e => e.stopPropagation()}>
            <img src={badges[selected].img} alt={badges[selected].name} className="badgepad-modal-img" />
            <div className="badgepad-modal-title">{badges[selected].name}</div>
            <div className="badgepad-modal-desc">{badges[selected].desc}</div>
            <button className="badgepad-modal-close" onClick={() => setSelected(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgePad;
