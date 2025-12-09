// 날씨 조건에 따른 추천 카테고리 매핑
interface WeatherRecommendation {
  categories: string[];
  reason: string;
  icon: string;
}

/**
 * 날씨 정보를 기반으로 추천 카테고리를 반환
 * @param sky - 날씨 상태 (맑음, 흐림, 비, 눈 등)
 * @param temp - 기온 (°C)
 * @returns 추천 카테고리 배열과 이유
 */
export const getWeatherRecommendations = (
  sky: string,
  temp: number
): WeatherRecommendation => {
  const skyLower = sky.toLowerCase();
  
  // 비/눈 - 실내 활동 추천
  if (skyLower.includes('비') || skyLower.includes('rain') || 
      skyLower.includes('눈') || skyLower.includes('snow')) {
    return {
      categories: ['음식점'],
      reason: '비/눈이 오는 날씨입니다. 실내 활동을 추천합니다!',
      icon: '🌧️'
    };
  }
  
  // 너무 더운 날씨 (30도 이상) - 시원한 실내나 해양 관련
  if (temp >= 30) {
    return {
      categories: ['음식점', '해양레저'],
      reason: '더운 날씨입니다. 시원한 곳을 추천합니다!',
      icon: '🔥'
    };
  }
  
  // 추운 날씨 (5도 이하) - 실내 활동
  if (temp <= 5) {
    return {
      categories: ['음식점'],
      reason: '추운 날씨입니다. 따뜻한 실내를 추천합니다!',
      icon: '❄️'
    };
  }
  
  // 맑고 쾌적한 날씨 (6~29도) - 야외 활동 추천
  if (skyLower.includes('맑음') || skyLower.includes('clear') || 
      skyLower.includes('sunny')) {
    return {
      categories: ['산책로', '테마관광지', '해양레저', '도심관광코스'],
      reason: '맑고 좋은 날씨입니다. 야외 활동을 즐기세요!',
      icon: '☀️'
    };
  }
  
  // 흐린 날씨 - 실내외 모두 가능
  if (skyLower.includes('흐림') || skyLower.includes('cloud')) {
    return {
      categories: ['음식점', '산책로', '테마관광지'],
      reason: '흐린 날씨입니다. 가벼운 야외 활동이 좋습니다!',
      icon: '☁️'
    };
  }
  
  // 기본값 - 모든 카테고리
  return {
    categories: ['음식점', '산책로', '테마관광지', '해양레저', '도심관광코스'],
    reason: '오늘도 부산을 즐겨보세요!',
    icon: '🌤️'
  };
};

/**
 * 카테고리 이름을 영문 키로 변환
 */
export const categoryNameToKey = (categoryName: string): string => {
  const mapping: { [key: string]: string } = {
    '음식점': 'restaurants',
    '산책로': 'walks',
    '테마관광지': 'themes',
    '해양레저': 'marines',
    '도심관광코스': 'urbans'
  };
  return mapping[categoryName] || categoryName;
};

/**
 * 카테고리 키를 한글 이름으로 변환
 */
export const categoryKeyToName = (categoryKey: string): string => {
  const mapping: { [key: string]: string } = {
    'restaurants': '음식점',
    'walks': '산책로',
    'themes': '테마관광지',
    'marines': '해양레저',
    'urbans': '도심관광코스'
  };
  return mapping[categoryKey] || categoryKey;
};
