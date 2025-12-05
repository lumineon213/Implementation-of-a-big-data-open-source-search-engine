import React, { useState, useEffect } from 'react';
import './map_distance.css'; 

interface DistanceSliderProps {
  onDistanceChange: (distanceKm: number) => void;
  initialDistanceKm: number;
  isOpen: boolean; 
}

const MAX_VALUE = 8000; // 8km = 8000m

const DistanceSlider: React.FC<DistanceSliderProps> = ({ 
  onDistanceChange, 
  initialDistanceKm,
  isOpen
}) => {
  // 컴포넌트 내부에서 슬라이더 위치를 관리하는 상태 (미터 단위)
  const [currentMeters, setCurrentMeters] = useState(initialDistanceKm * 1000); 

  // initialDistanceKm이 변경될 때 (외부 상태가 변경되어 초기화가 필요할 때) 내부 상태도 업데이트
  useEffect(() => {
    setCurrentMeters(initialDistanceKm * 1000);
  }, [initialDistanceKm]);

  const tickPoints = [
    { value: 0, label: '0' },
    // { value: 500, label: '500m' },
    { value: 1000, label: '1km' },
    { value: 2000, label: '2km' },
    { value: 4000, label: '4km' },
    { value: 8000, label: '8km' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMeters(Number(e.target.value));
  };

  const handleComplete = () => {
    const distanceKm = currentMeters / 1000;
    // 부모 컴포넌트로 최종 거리 값 전달 (이때만 검색 실행)
    onDistanceChange(distanceKm); 
  };

  // 활성화된 트랙의 너비 및 썸 위치 계산
  const activeTrackWidth = (currentMeters / MAX_VALUE) * 100;
  const thumbPosition = `${activeTrackWidth}%`;

  return (
    // isOpen 상태에 따라 is-open 클래스를 토글하여 CSS로 표시/숨김을 제어합니다.
    <div className={`distance-slider-popup ${isOpen ? 'is-open' : ''}`}>
      <h3>조회 거리</h3>
      
      <div className="slider-area">
        
        {/* 트랙 배경 */}
        <div className="slider-track"></div>
        {/* 활성화된 트랙 */}
        <div 
          className="slider-active-track" 
          style={{ width: `${activeTrackWidth}%` }}
        ></div>
        {/* 슬라이더 Thumb (핸들) */}
        <div 
          className="slider-thumb" 
          style={{ left: thumbPosition }}
        ></div>

        {/* 실제 range input */}
        <input
          type="range"
          min="0"
          max={MAX_VALUE}
          step="500" 
          value={currentMeters}
          onChange={handleChange}
          className="slider-input"
        />

        {/* 눈금 및 레이블 표시 */}
        <div className="slider-ticks">
          {tickPoints.map((tick, index) => {
            let position = (tick.value / MAX_VALUE) * 100;
            const isActive = tick.value <= currentMeters;
            
            // 레이블 겹침 방지를 위한 위치 조정 로직
            // 0km와 500m 사이의 간격 확보
            if (tick.label === '500m') {
                position = position + 3; // 오른쪽으로 3% 이동
            }
            // 500m와 1km 사이의 간격 확보
            if (tick.label === '1km') {
                position = position - 2; // 왼쪽으로 2% 이동
            }
            
            return (
              <div 
                key={index} 
                className={`slider-tick-label ${isActive ? 'is-active' : ''}`}
                style={{ left: `${position}%` }} // 조정된 position 적용
              >
                {tick.label}
              </div>
            );
          })}
        </div>
      </div>
      
      <button 
        onClick={handleComplete} 
        className="slider-complete-button"
      >
        설정 완료
      </button>
    </div>
  );
};

export default DistanceSlider;