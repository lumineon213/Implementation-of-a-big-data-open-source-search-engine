import React, { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import './main_page.css';

// ▼▼▼ 로컬 이미지 Import ▼▼▼
import imgSlide1 from '../../components/common/img/광안리.jpg'; 
import imgSlide2 from '../../components/common/img/해운대.jpg';
import imgSlide3 from '../../components/common/img/감천문화마을.jpg';

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

const Home: React.FC = () => {
  // --- UI 상태 관리 ---
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // --- 슬라이드 자동 넘김 (5초) ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDE_DATA.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // --- 단순 UI 핸들러 ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert(`[UI 테스트] 검색어: ${searchQuery}\n(현재 프론트엔드 디자인만 적용된 상태입니다.)`);
  };

  return (
    <div className="home-layout">
      
      {/* === HERO SECTION (메인 배너) === */}
      <section className="hero-split-section">
        
        {/* 1. 왼쪽: 텍스트 & 카테고리 영역 */}
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
            
            {/* 카테고리 버튼들 */}
            <div className="hero-categories fade-in delay-3">
              {CATEGORIES.map((cat) => (
                <button 
                  key={cat} 
                  className="category-pill" 
                  onClick={() => alert(`[UI 테스트] 카테고리 클릭: ${cat}`)}
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
            />
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

    </div>
  );
};

export default Home;