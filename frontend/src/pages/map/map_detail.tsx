import React, { useState } from "react";
import "./map_detail.css";

interface MapDetailProps {
  restaurant: any | null;
  onClose: () => void;
  currentLocation: { lat: number; lng: number } | null;
}

const MapDetail: React.FC<MapDetailProps> = ({ restaurant, onClose, currentLocation }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!restaurant) return null;

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    // TODO: 즐겨찾기 저장 로직 구현
  };

  // 경로 찾기 기능
  const handleFindRoute = (routeType: string) => {
    if (!restaurant.latitude || !restaurant.longitude) {
      alert("목적지 좌표 정보가 없습니다.");
      return;
    }

    const destLat = Array.isArray(restaurant.latitude) ? restaurant.latitude[0] : restaurant.latitude;
    const destLng = Array.isArray(restaurant.longitude) ? restaurant.longitude[0] : restaurant.longitude;
    const destName = getValue(restaurant.title);

    let kakaoUrl = "";

    if (currentLocation) {
      // 현재 위치가 있으면 출발지 포함
      kakaoUrl = `https://map.kakao.com/link/to/${encodeURIComponent(destName)},${destLat},${destLng}/from/현재위치,${currentLocation.lat},${currentLocation.lng}`;
    } else {
      // 현재 위치가 없으면 도착지만
      kakaoUrl = `https://map.kakao.com/link/to/${encodeURIComponent(destName)},${destLat},${destLng}`;
    }

    window.open(kakaoUrl, "_blank");
  };

  // 카카오맵에서 보기
  const handleOpenInKakaoMap = () => {
    if (!restaurant.latitude || !restaurant.longitude) {
      alert("좌표 정보가 없습니다.");
      return;
    }

    const lat = Array.isArray(restaurant.latitude) ? restaurant.latitude[0] : restaurant.latitude;
    const lng = Array.isArray(restaurant.longitude) ? restaurant.longitude[0] : restaurant.longitude;
    const name = getValue(restaurant.title);

    const kakaoUrl = `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;
    window.open(kakaoUrl, "_blank");
  };

  // 공유하기 기능
  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  // URL 복사 - 카카오맵 링크로 복사
  const handleCopyLink = async () => {
    const lat = Array.isArray(restaurant.latitude) ? restaurant.latitude[0] : restaurant.latitude;
    const lng = Array.isArray(restaurant.longitude) ? restaurant.longitude[0] : restaurant.longitude;
    const name = getValue(restaurant.title);
    
    const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;
    
    try {
      await navigator.clipboard.writeText(kakaoMapUrl);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareMenu(false);
      }, 2000);
    } catch (err) {
      // Clipboard API 실패 시 대체 방법
      const textArea = document.createElement('textarea');
      textArea.value = kakaoMapUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
          setShowShareMenu(false);
        }, 2000);
      } catch (err2) {
        alert("링크 복사에 실패했습니다.");
      }
      document.body.removeChild(textArea);
    }
  };

  // 카카오톡 공유 - 카카오맵 공유 기능 사용
  const handleKakaoShare = () => {
    if (!restaurant.latitude || !restaurant.longitude) {
      alert("좌표 정보가 없습니다.");
      return;
    }

    const lat = Array.isArray(restaurant.latitude) ? restaurant.latitude[0] : restaurant.latitude;
    const lng = Array.isArray(restaurant.longitude) ? restaurant.longitude[0] : restaurant.longitude;
    const name = getValue(restaurant.title);
    
    // 카카오맵 공유 링크
    const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;
    
    // 모바일에서는 카카오톡 앱 공유, PC에서는 링크 복사 안내
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      // 모바일: 카카오톡 공유 URL Scheme
      const kakaoTalkUrl = `kakaotalk://share?text=${encodeURIComponent(name + '\n' + kakaoMapUrl)}`;
      window.location.href = kakaoTalkUrl;
      
      // 카카오톡 앱이 없을 경우 대비
      setTimeout(() => {
        if (confirm('카카오톡 앱이 설치되어 있지 않습니다.\n링크를 복사하시겠습니까?')) {
          handleCopyLink();
        }
      }, 1500);
    } else {
      // PC: 링크 복사 후 안내
      navigator.clipboard.writeText(kakaoMapUrl).then(() => {
        alert('링크가 복사되었습니다!\n카카오톡에서 붙여넣기 하세요.');
        setShowShareMenu(false);
      }).catch(() => {
        alert('링크 복사에 실패했습니다.');
      });
    }
  };

  // 배열 형태의 데이터 처리
  const getValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value[0] || "";
    }
    return value || "";
  };

  const title = getValue(restaurant.title);
  const subtitle = getValue(restaurant.subtitle);
  const address = getValue(restaurant.address);
  const description = getValue(restaurant.description);
  const imageUrl = getValue(restaurant.image || restaurant.image_url);
  const menu = restaurant.menu || restaurant.menu_t || "";
  const openTime = restaurant.opentime_t || "";
  const tags = getValue(restaurant.tags);
  const type = getValue(restaurant.type);
  const distance = restaurant.distance ? restaurant.distance.toFixed(2) : "";
  
  // 도보여행 여부 확인
  const isWalk = type === "WALK";

  return (
    <div className="map-detail-panel">
      <div className="map-detail-container">
        <button className="map-detail-close" onClick={onClose}>
          ✕
        </button>

        <div className="map-detail-header">
          <div className="map-detail-image">
            <img
              src={imageUrl || "https://via.placeholder.com/300?text=No+Image"}
              alt={title}
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/300?text=Food";
              }}
            />
          </div>
          <div className="map-detail-title-wrapper">
            <h2 className="map-detail-title">{title}</h2>
            <button 
              className={`map-detail-favorite ${isFavorite ? 'active' : ''}`}
              onClick={handleFavoriteClick}
              aria-label="즐겨찾기"
            >
              {isFavorite ? '★' : '☆'}
            </button>
          </div>
        </div>

        <div className="map-detail-content">
          {distance && (
            <div className="map-detail-item">
              <span className="map-detail-label">📍 거리</span>
              <span className="map-detail-value">{distance}km</span>
            </div>
          )}

          {isWalk && subtitle && (
            <div className="map-detail-item">
              <span className="map-detail-label">💬 부제</span>
              <span className="map-detail-value">{subtitle}</span>
            </div>
          )}

          {address && (
            <div className="map-detail-item">
              <span className="map-detail-label">📍 주소</span>
              <span className="map-detail-value">{address}</span>
            </div>
          )}

          {isWalk && tags && (
            <div className="map-detail-item">
              <span className="map-detail-label">🚌 교통정보</span>
              <span className="map-detail-value" style={{ whiteSpace: 'pre-line' }}>{tags}</span>
            </div>
          )}

          {!isWalk && menu && (
            <div className="map-detail-item">
              <span className="map-detail-label">🍽️ 대표 메뉴</span>
              <div className="map-detail-menu">
                {menu.split(",").map((item: string, idx: number) => (
                  <span key={idx} className="menu-badge">
                    {item.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!isWalk && openTime && (
            <div className="map-detail-item">
              <span className="map-detail-label">🕐 영업시간</span>
              <span className="map-detail-value">{openTime.replace(/\n/g, " ")}</span>
            </div>
          )}

          {description && (
            <div className="map-detail-item">
              <span className="map-detail-label">📝 설명</span>
              <p className="map-detail-description">{description}</p>
            </div>
          )}

          {/* 경로 찾기 버튼 */}
          <div className="map-detail-actions">
            <button 
              className="map-detail-button primary"
              onClick={() => handleFindRoute("default")}
              title="카카오맵에서 길찾기"
            >
              🚗 길찾기
            </button>
            <button 
              className="map-detail-button secondary"
              onClick={handleOpenInKakaoMap}
              title="카카오맵에서 보기"
            >
              🗺️ 카카오맵
            </button>
          </div>

          {/* 공유하기 버튼 */}
          <div className="map-detail-share-section">
            <button 
              className="map-detail-share-button"
              onClick={handleShare}
              title="공유하기"
            >
              <span className="share-icon">🔗</span>
              <span>공유하기</span>
            </button>

            {showShareMenu && (
              <div className="share-menu">
                <button 
                  className="share-menu-item"
                  onClick={handleCopyLink}
                >
                  <span className="share-menu-icon">📋</span>
                  <span>{copySuccess ? "복사완료! ✓" : "링크 복사"}</span>
                </button>
                <button 
                  className="share-menu-item"
                  onClick={handleKakaoShare}
                >
                  <span className="share-menu-icon">💬</span>
                  <span>카카오톡</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MapDetail;

