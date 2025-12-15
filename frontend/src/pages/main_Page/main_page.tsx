import React, { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Search, ArrowRight, MapPin, Calendar, Star, Compass, Palmtree, Camera, UtensilsCrossed, PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './main_page.css';

// ▼▼▼ 로컬 이미지 Import ▼▼▼
import imgSlide1 from '../../components/common/img/광안리.jpg';
import imgSlide2 from '../../components/common/img/해운대.jpg';
import imgSlide3 from '../../components/common/img/감천문화마을.jpg';

// 타입 정의
interface SolrPlace {
  spotId?: number;
  id?: string;
  title: string;
  description?: string;
  place?: string;
  address?: string;
  imageUrl?: string;
  [key: string]: any;
}

// ▼▼▼ 슬라이드 데이터 (텍스트 & 이미지) ▼▼▼
const SLIDE_DATA = [
  {
    id: 1,
    image: imgSlide1,
    label: "NIGHT VIEW",
    title: "별빛이 흐르는\n부산의 밤을 걷다",
    desc: "광안대교 야경부터 수변공원까지, 황홀한 밤 산책 코스."
  },
  {
    id: 2,
    image: imgSlide2,
    label: "HEALING",
    title: "바다를 달리는 기차,\n낭만 가득 힐링 여행",
    desc: "해운대 블루라인파크에서 즐기는 여유로운 바다 풍경."
  },
  {
    id: 3,
    image: imgSlide3,
    label: "LOCAL TRIP",
    title: "골목골목 숨겨진\n보물 같은 이야기",
    desc: "감천문화마을과 산복도로, 부산 토박이만 아는 감성 스팟."
  }
];

// 추천 활동은 컴포넌트 내부에서 번역 함수 사용

// 이미지 매핑 (Solr 데이터의 제목에 따라 이미지 할당)
const getImageByTitle = (title: string): string => {
  if (title.includes('해운대') || title.includes('블루라인')) return imgSlide2;
  if (title.includes('광안리') || title.includes('광안대교')) return imgSlide1;
  if (title.includes('감천') || title.includes('문화마을')) return imgSlide3;
  // 기본 이미지
  return imgSlide1;
};

// 카테고리 아이콘 매핑
const getCategoryIcon = (title: string) => {
  if (title.includes('해수욕장') || title.includes('해변')) return <Camera size={20} />;
  if (title.includes('야경') || title.includes('광안리')) return <Star size={20} />;
  if (title.includes('문화') || title.includes('마을')) return <Compass size={20} />;
  return <MapPin size={20} />;
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const SOLR_CORE_NAME = 'Search';

  const CATEGORIES = [
    t('main.hero.categories.all'),
    t('main.hero.categories.family'),
    t('main.hero.categories.couple'),
    t('main.hero.categories.foodTour'),
    t('main.hero.categories.activity'),
    t('main.hero.categories.healing'),
    t('main.hero.categories.culture')
  ];

  const ACTIVITIES = [
    { icon: <UtensilsCrossed size={24} />, title: t('main.activities.foodTour'), desc: t('main.activities.foodTourDesc'), link: "/food" },
    { icon: <MapPin size={24} />, title: t('main.activities.spotTour'), desc: t('main.activities.spotTourDesc'), link: "/tour" },
    { icon: <PartyPopper size={24} />, title: t('main.activities.festivalInfo'), desc: t('main.activities.festivalInfoDesc'), link: "/festival" },
    { icon: <Palmtree size={24} />, title: t('main.activities.travelCourse'), desc: t('main.activities.travelCourseDesc'), link: "/course" }
  ];

  // --- UI 상태 관리 ---
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [popularPlaces, setPopularPlaces] = useState<SolrPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState<boolean>(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // --- 슬라이드 자동 넘김 (5초) ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDE_DATA.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // --- Solr에서 인기 여행지 데이터 가져오기 ---
  useEffect(() => {
    const fetchPopularPlaces = async () => {
      try {
        setLoadingPlaces(true);

        // /api/solr/all에서 모든 데이터 가져오기
        const response = await axios.get('/api/solr/all');
        
        // 에러 응답인 경우 처리
        if (response.data && response.data.error) {
          console.error('서버 에러:', response.data.message);
          setPopularPlaces([]);
          return;
        }
        
        const allPlaces: SolrPlace[] = Array.isArray(response.data) ? response.data : (response.data?.data || []);

        console.log('가져온 데이터 개수:', allPlaces.length);

        if (allPlaces && allPlaces.length > 0) {
          // 랜덤으로 3개 선택
          const shuffled = [...allPlaces].sort(() => 0.5 - Math.random());
          const randomPlaces = shuffled.slice(0, 3);
          console.log('랜덤 선택된 장소:', randomPlaces);
          setPopularPlaces(randomPlaces);
        } else {
          console.warn('Solr에 데이터가 없습니다. /api/solr/import를 먼저 실행해주세요.');
          setPopularPlaces([]);
        }
      } catch (error: any) {
        console.error('인기 여행지 데이터 로딩 실패:', error);
        console.error('에러 상세:', error.response?.status, error.response?.data);
        // 실패 시 빈 배열 유지
        setPopularPlaces([]);
      } finally {
        setLoadingPlaces(false);
      }
    };

    fetchPopularPlaces();
  }, []);

  // 검색어 제안 가져오기
  const fetchSuggestions = async (query: string) => {
    if (!query || query.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await axios.get('/api/solr/suggestions', {
        params: {
          q: query,
          limit: 10
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setSuggestions(response.data);
        setShowSuggestions(response.data.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('제안 가져오기 실패:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // --- 단순 UI 핸들러 ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchSuggestions(value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // 제안 클릭 핸들러
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  // 외부 클릭 시 제안 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="home-layout">

      {/* === HERO SECTION (메인 배너) === */}
      <section className="hero-split-section">

        {/* 1. 왼쪽: 텍스트 & 검색창 영역 */}
        <div className="hero-left">
          <div className="hero-text-content">
            {/* 라벨 & 타이틀 */}
            <span className="hero-label fade-in">{SLIDE_DATA[currentSlide].label}</span>
            <h1 className="hero-title fade-in delay-1">
              {SLIDE_DATA[currentSlide].title.split('\n').map((line, i) => (
                <React.Fragment key={i}>{line}<br/></React.Fragment>
              ))}
            </h1>
            <p className="hero-desc fade-in delay-2">{SLIDE_DATA[currentSlide].desc}</p>

            {/* 검색창 추가 */}
            <form onSubmit={handleSubmit} className="hero-search-form fade-in delay-3">
              <div style={{ position: 'relative', width: '100%' }}>
                <div className="hero-search-bar">
                  <Search size={20} className="search-icon-svg" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('main.hero.searchPlaceholder')}
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    className="hero-search-input"
                  />
                  <button type="submit" className="hero-search-btn">
                    <ArrowRight size={20} />
                  </button>
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <div ref={suggestionsRef} className="suggestions-dropdown" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 1000,
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        onMouseDown={(e) => e.preventDefault()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 16px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          color: '#1f2937',
                          borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Search size={16} style={{ marginRight: '8px', opacity: 0.6 }} />
                        <span style={{ flex: 1, fontSize: '0.95rem' }}>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>

            {/* 카테고리 버튼들 */}
            <div className="hero-categories fade-in delay-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className="category-pill"
                  onClick={() => navigate(`/search?category=${cat}`)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. 오른쪽: 이미지 슬라이더 영역 */}
        <div className="hero-right">
          {SLIDE_DATA.map((slide, idx) => (
            <div
              key={slide.id}
              className={`hero-image-slide ${idx === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* 이미지 위 그라디언트 오버레이 */}
              <div className="image-overlay"></div>
            </div>
          ))}

          {/* 슬라이드 점(Indicator) */}
          <div className="slide-controls">
            {SLIDE_DATA.map((_, idx) => (
              <span
                key={idx}
                className={`control-dot ${idx === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* === 인기 여행지 섹션 === */}
      <section className="popular-section">
        <div className="section-header">
          <h2 className="section-title">{t('main.popular.title')}</h2>
          <p className="section-subtitle">{t('main.popular.subtitle')}</p>
        </div>

        {loadingPlaces ? (
          <div className="loading-places">
            <div className="spinner"></div>
            <p>{t('main.popular.loading')}</p>
          </div>
        ) : (
          <div className="popular-grid">
            {popularPlaces.length > 0 ? (
              popularPlaces.map((place) => {
                const placeId = place.spotId || place.id;
                const imageUrl = place.imageUrl || getImageByTitle(place.title);
                return (
                  <div
                    key={placeId}
                    className="popular-card"
                    onClick={() => navigate(`/tour/view/${placeId}`)}
                  >
                    <div className="card-image" style={{ backgroundImage: `url(${imageUrl})` }}>
                      <div className="card-badge">
                        {getCategoryIcon(place.title)}
                        <span>{place.place || t('main.popular.defaultPlace')}</span>
                      </div>
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{place.title}</h3>
                      {place.address && (
                        <p className="card-address">
                          <MapPin size={14} style={{ marginRight: '4px' }} />
                          {place.address}
                        </p>
                      )}
                      <p className="card-description">
                        {place.description
                          ? place.description.length > 80
                            ? place.description.substring(0, 80) + '...'
                            : place.description
                          : t('main.popular.defaultDescription')}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-places">
                <p>{t('main.popular.error')}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* === 추천 활동 섹션 === */}
      <section className="activities-section">
        <div className="section-header">
          <h2 className="section-title">{t('main.activities.title')}</h2>
          <p className="section-subtitle">{t('main.activities.subtitle')}</p>
        </div>

        <div className="activities-grid">
          {ACTIVITIES.map((activity, idx) => (
            <div
              key={idx}
              className="activity-card"
              onClick={() => navigate(activity.link)}
            >
              <div className="activity-icon">{activity.icon}</div>
              <h3 className="activity-title">{activity.title}</h3>
              <p className="activity-desc">{activity.desc}</p>
              <ArrowRight size={20} className="activity-arrow" />
            </div>
          ))}
        </div>
      </section>

      {/* === 여행 시작하기 CTA 섹션 === */}
      <section className="cta-section">
        <div className="cta-content">
          <Calendar size={48} className="cta-icon" />
          <h2 className="cta-title">{t('main.cta.title')}</h2>
          <p className="cta-desc">{t('main.cta.description')}</p>
          <button className="cta-button" onClick={() => navigate('/ai-planner')}>
            {t('main.cta.button')}
            <ArrowRight size={20} style={{ marginLeft: '8px' }} />
          </button>
        </div>
      </section>

    </div>
  );
};

export default Home;