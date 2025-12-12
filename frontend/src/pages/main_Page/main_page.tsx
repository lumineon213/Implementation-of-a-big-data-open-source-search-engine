import React, { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Search, ArrowRight, MapPin, Calendar, Star, Compass, Palmtree, Camera, UtensilsCrossed, PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './main_page.css';

// ▼▼▼ 로컬 이미지 Import ▼▼▼
import imgSlide1 from '../../components/common/img/광안리.jpg';
import imgSlide2 from '../../components/common/img/해운대.jpg';
import imgSlide3 from '../../components/common/img/감천문화마을.jpg';

// 타입 정의
interface SolrPlace {
  id: string;
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

const CATEGORIES = ["전체", "가족여행", "커플데이트", "맛집투어", "액티비티", "힐링", "문화예술"];

// 추천 활동
const ACTIVITIES = [
  { icon: <UtensilsCrossed size={24} />, title: "맛집 탐방", desc: "부산 대표 먹거리", link: "/food" },
  { icon: <MapPin size={24} />, title: "명소 투어", desc: "부산 필수 관광지", link: "/tour" },
  { icon: <PartyPopper size={24} />, title: "축제 정보", desc: "부산 문화 축제", link: "/festival" },
  { icon: <Palmtree size={24} />, title: "여행 코스", desc: "테마별 추천 코스", link: "/course" }
];

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
  const SOLR_CORE_NAME = 'Search';

  // --- UI 상태 관리 ---
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [popularPlaces, setPopularPlaces] = useState<SolrPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState<boolean>(true);

  // --- 슬라이드 자동 넘김 (5초) ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDE_DATA.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // --- Solr Search core에서 인기 여행지 데이터 가져오기 ---
  useEffect(() => {
    const fetchPopularPlaces = async () => {
      try {
        setLoadingPlaces(true);

        // Solr Search core에서 인기 장소 가져오기
        const response = await axios.get('/api/search', {
          params: {
            keyword: '' // 키워드 없이 전체 조회
          }
        });

        // TourDTO 배열로 반환되므로 변환
        const tourData = response.data || [];
        
        // 이미지가 있는 것만 필터링하고 랜덤으로 섞기
        const placesWithImage = tourData
          .filter((item: any) => item.title && item.imageUrl) // 제목과 이미지가 있는 것만
          .map((item: any) => ({
            id: String(item.spotId || item.id || ''),
            title: item.title || '',
            description: item.description || '',
            place: '부산',
            address: item.address || '',
            imageUrl: item.imageUrl || '' // 이미지 URL 추가
          }));

        // 랜덤으로 섞기
        const shuffled = placesWithImage.sort(() => Math.random() - 0.5);
        
        // 최대 3개만 선택
        const places: SolrPlace[] = shuffled.slice(0, 3);

        setPopularPlaces(places);
      } catch (error) {
        console.error('인기 여행지 데이터 로딩 실패:', error);
        // 실패 시 빈 배열 유지
        setPopularPlaces([]);
      } finally {
        setLoadingPlaces(false);
      }
    };

    fetchPopularPlaces();
  }, []);

  // --- 단순 UI 핸들러 ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

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
              <div className="hero-search-bar">
                <Search size={20} className="search-icon-svg" />
                <input
                  type="text"
                  placeholder="부산 여행지를 검색해보세요..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  className="hero-search-input"
                />
                <button type="submit" className="hero-search-btn">
                  <ArrowRight size={20} />
                </button>
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
          <h2 className="section-title">부산 인기 여행지</h2>
          <p className="section-subtitle">지금 가장 HOT한 부산 명소</p>
        </div>

        {loadingPlaces ? (
          <div className="loading-places">
            <div className="spinner"></div>
            <p>인기 여행지를 불러오는 중...</p>
          </div>
        ) : (
          <div className="popular-grid">
            {popularPlaces.length > 0 ? (
              popularPlaces.map((place) => (
                <div
                  key={place.id}
                  className="popular-card"
                  onClick={() => navigate(`/tour/view/${place.id}`)}
                >
                  <div 
                    className="card-image" 
                    style={{ 
                      backgroundImage: `url(${place.imageUrl || getImageByTitle(place.title)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="card-badge">
                      {getCategoryIcon(place.title)}
                      <span>{place.place || '부산'}</span>
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
                        : '부산의 아름다운 명소를 만나보세요'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-places">
                <p>인기 여행지 정보를 불러올 수 없습니다.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* === 추천 활동 섹션 === */}
      <section className="activities-section">
        <div className="section-header">
          <h2 className="section-title">부산에서 뭐하지?</h2>
          <p className="section-subtitle">취향대로 골라보는 부산 여행</p>
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
          <h2 className="cta-title">나만의 부산 여행 계획 세우기</h2>
          <p className="cta-desc">AI가 추천하는 맞춤형 여행 코스를 만나보세요</p>
          <button className="cta-button" onClick={() => navigate('/ai-planner')}>
            여행 계획 시작하기
            <ArrowRight size={20} style={{ marginLeft: '8px' }} />
          </button>
        </div>
      </section>

    </div>
  );
};

export default Home;