import React, { useState, useEffect } from 'react';
import './history.css';
import { api } from '../../api/axios';

interface RecentPlace {
  id: string;
  title: string;
  distance?: number;
  timestamp: number;
}

interface HistoryProps {
  onPlaceClick: (placeId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const History: React.FC<HistoryProps> = ({ onPlaceClick, isOpen, onClose }) => {
  const [recentPlaces, setRecentPlaces] = useState<RecentPlace[]>([]);

  const loadRecentPlaces = async () => {
    try {
      // DB에서 가져오기
      const response = await api.get('/search-log');
      if (response.data && Array.isArray(response.data)) {
        const places = response.data.map((log: any, index: number) => ({
          id: `log-${log.logId || index}`,
          title: log.keyword,
          timestamp: log.searchDate ? new Date(log.searchDate).getTime() : Date.now()
        }));
        setRecentPlaces(places);
      } else {
        setRecentPlaces([]);
      }
    } catch (error) {
      console.error('Failed to load from database:', error);
      // DB 조회 실패 시 localStorage 백업 사용
      const saved = localStorage.getItem('recentPlaces');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setRecentPlaces(parsed);
        } catch (error) {
          console.error('Failed to parse recent places:', error);
          setRecentPlaces([]);
        }
      } else {
        setRecentPlaces([]);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRecentPlaces();
    }
  }, [isOpen]);

  const deleteRecentPlace = async (placeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // DB에서 삭제
    const logId = placeId.replace('log-', '');
    if (logId && !isNaN(Number(logId))) {
      try {
        await api.delete(`/search-log/${logId}`);
        // 삭제 후 다시 로드
        await loadRecentPlaces();
      } catch (error) {
        console.error('Failed to delete from database:', error);
      }
    }
  };

  const clearAllRecentPlaces = async () => {
    try {
      // DB에서 전체 삭제
      await api.delete('/search-log/all');
      // 삭제 후 다시 로드
      await loadRecentPlaces();
    } catch (error) {
      console.error('Failed to clear database:', error);
    }
  };

  const handlePlaceClick = (placeId: string) => {
    onPlaceClick(placeId);
  };

  if (!isOpen) return null;

  return (
    <div className={`history-panel ${isOpen ? 'open' : ''}`}>
      <div className="history-header">
        <div className="history-header-left">
          <span className="history-icon">🕐</span>
          <span className="history-title">최근 본 장소</span>
        </div>
        <div className="history-header-right">
          {recentPlaces.length > 0 && (
            <button 
              className="clear-all-button"
              onClick={clearAllRecentPlaces}
              title="전체 삭제"
            >
              전체삭제
            </button>
          )}
          <button 
            className="close-button"
            onClick={onClose}
            title="닫기"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="history-content">
        {recentPlaces.length === 0 ? (
          <div className="empty-history">
            <span className="empty-icon"></span>
            <p>최근 본 장소가 없습니다</p>
          </div>
        ) : (
          <div className="history-list">
            {recentPlaces.map((place) => (
              <div
                key={place.id}
                className="history-item"
                onClick={() => handlePlaceClick(place.id)}
              >
                <div className="history-item-content">
                  <span className="history-item-title">{place.title}</span>
                  {place.distance && (
                    <span className="history-item-distance">
                      {place.distance.toFixed(1)}km
                    </span>
                  )}
                </div>
                <button
                  className="delete-button"
                  onClick={(e) => deleteRecentPlace(place.id, e)}
                  title="삭제"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
