import React, { useState, useEffect, useRef } from "react";
// 스템프 이벤트 페이지 연결 예시
// import { Route, Routes } from "react-router-dom";
// import StampEvent from "../../pages/benefits/StampEvent";
import "./header.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import walk from '../../components/common/img/walk.png'; 
import theme from '../../components/common/img/theme.png';
import marine from '../../components/common/img/marine.png';
import urban from '../../components/common/img/urban.png';
import { useDarkMode } from '../../contexts/DarkModeContext';


interface User {
  accountId: string;
  accountName: string;
  email: string;
  phoneNumber: string;
  accountRole: string;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null); 
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInfoDropdownOpen, setIsInfoDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 드롭다운 외부 클릭 감지를 위한 ref
  const dropdownRefs = {
    sns: useRef<HTMLDivElement>(null),
    course: useRef<HTMLDivElement>(null),
    info: useRef<HTMLDivElement>(null),
    benefits: useRef<HTMLDivElement>(null),
  };

  const checkAuth = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.get("/api/mypage", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("API 응답 데이터:", res.data); // 디버깅용
      
      // userInfo 객체에서 사용자 정보 가져오기
      if (res.data && res.data.userInfo) {
        setUser(res.data.userInfo);
      }
    } catch (err) {
      console.error("JWT 인증 실패:", err);
      if (axios.isAxiosError(err)) {
        console.error("응답 상태:", err.response?.status);
        console.error("응답 데이터:", err.response?.data);
      }
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // 각 드롭다운 외부 클릭 확인
      if (expandedMenu === 'sns' && dropdownRefs.sns.current && !dropdownRefs.sns.current.contains(target)) {
        setExpandedMenu(null);
      }
      if (expandedMenu === 'course' && dropdownRefs.course.current && !dropdownRefs.course.current.contains(target)) {
        setExpandedMenu(null);
      }
      if (expandedMenu === 'benefits' && dropdownRefs.benefits.current && !dropdownRefs.benefits.current.contains(target)) {
        setExpandedMenu(null);
      }
      if (isInfoDropdownOpen && dropdownRefs.info.current && !dropdownRefs.info.current.contains(target)) {
        setIsInfoDropdownOpen(false);
      }
    };

    if (expandedMenu || isInfoDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedMenu, isInfoDropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsMenuOpen(false);
    setExpandedMenu(null);
    navigate("/");
  };

  const toggleMenu = (menuName: string) => {
    // 다른 드롭다운이 열려있으면 닫고 새 메뉴 열기
    if (expandedMenu && expandedMenu !== menuName) {
      setExpandedMenu(menuName);
      setIsInfoDropdownOpen(false);
    } else if (expandedMenu === menuName) {
      // 같은 메뉴를 다시 클릭하면 닫기
      setExpandedMenu(null);
      setIsInfoDropdownOpen(false);
    } else {
      // 새 메뉴 열기
      setExpandedMenu(menuName);
      setIsInfoDropdownOpen(false);
    }
  };

  const toggleInfoMenu = () => {
    // 다른 드롭다운이 열려있으면 닫고 여행정보 열기
    if (expandedMenu) {
      setExpandedMenu(null);
    }
    setIsInfoDropdownOpen(!isInfoDropdownOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
    setExpandedMenu(null);
    setIsInfoDropdownOpen(false);
  };

  return (
    <>
      <header className="header-container">
        <div className="header-inner">
          <Link to="/" className="header-logo">
            우리 <span className="header-logo-round">부산 GO?</span>
          </Link>

          <nav className="header-desktop-menu">
            <Link to="/" className="menu-item">홈</Link>
            
            <div className="dropdown-wrapper" ref={dropdownRefs.sns}>
              <span
                className="menu-item"
                onClick={() => toggleMenu('sns')}
                style={{ cursor: 'pointer' }}
              >
                SNS
                <svg
                  className={`dropdown-arrow ${expandedMenu === 'sns' ? 'open' : ''}`}
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              {expandedMenu === 'sns' && (
                <div className="dropdown-menu">
                  <Link to="/blog" className="dropdown-item" onClick={() => setExpandedMenu(null)}>블로그</Link>
                  <Link to="/cafe" className="dropdown-item" onClick={() => setExpandedMenu(null)}>카페</Link>
                </div>
              )}
            </div>
            
            <Link to="/tour" className="menu-item">명소</Link>
            <Link to="/food" className="menu-item">맛집</Link>
            <div 
              className="dropdown-wrapper"
              ref={dropdownRefs.course}
            >
              <span 
                className="menu-item"
                onClick={() => toggleMenu("course")}
                style={{ cursor: 'pointer' }}
              >
                여행코스
                <svg 
                  className={`dropdown-arrow ${expandedMenu === "course" ? "open" : ""}`}
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>

              {expandedMenu === "course" && (
                <div className="dropdown-menu course-dropdown">

                  <Link to="/course/walk" className="course-card" onClick={() => setExpandedMenu(null)}>
                    <img src={walk} alt="도보 여행" className="course-icon" />
                    <div className="course-info">
                      <div className="course-info-title">도보 여행</div>
                      <div className="course-info-desc">부산을 걸으며 즐기는 여행 코스</div>
                    </div>
                  </Link>

                  <Link to="/course/theme" className="course-card" onClick={() => setExpandedMenu(null)}>
                    <img src={theme} alt="테마 여행" className="course-icon" />
                    <div className="course-info">
                      <div className="course-info-title">테마 여행</div>
                      <div className="course-info-desc">힐링 · 바다 · 감성 루트</div>
                    </div>
                  </Link>

                  <Link to="/course/marine" className="course-card" onClick={() => setExpandedMenu(null)}>
                    <img src={marine} alt="해양 여행" className="course-icon" />
                    <div className="course-info">
                      <div className="course-info-title">해양 여행</div>
                      <div className="course-info-desc">바다를 즐기는 특별한 코스</div>
                    </div>
                  </Link>

                  <Link to="/course/urban" className="course-card" onClick={() => setExpandedMenu(null)}>
                    <img src={urban} alt="도시 여행" className="course-icon" />
                    <div className="course-info">
                      <div className="course-info-title">도시 여행</div>
                      <div className="course-info-desc">도시를 즐기는 특별한 코스</div>
                    </div>
                  </Link>

                </div>
              )}
              </div>


            
            {/* 여행정보 드롭다운 */}
            <div 
              className="dropdown-wrapper"
              ref={dropdownRefs.info}
            >
              <span 
                className="menu-item"
                onClick={toggleInfoMenu}
                style={{ cursor: 'pointer' }}
              >
                여행정보
                <svg 
                  className={`dropdown-arrow ${isInfoDropdownOpen ? 'open' : ''}`}
                  width="10" 
                  height="6" 
                  viewBox="0 0 10 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>

              {isInfoDropdownOpen && (
                <div className="dropdown-menu">
                  <Link to="/info/regions" className="dropdown-item" onClick={() => setIsInfoDropdownOpen(false)}>
                    <span className="dropdown-icon">🗺️</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">여행지역</div>
                      <div className="dropdown-desc">부산의 주요 지역 탐색</div>
                    </div>
                  </Link>
                  <Link to="/info/articles" className="dropdown-item" onClick={() => setIsInfoDropdownOpen(false)}>
                    <span className="dropdown-icon">📰</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">여행기사</div>
                      <div className="dropdown-desc">최신 여행 소식</div>
                    </div>
                  </Link>
                  <Link to="/festival" className="dropdown-item" onClick={() => setIsInfoDropdownOpen(false)}>
                    <span className="dropdown-icon">🎉</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">축제</div>
                      <div className="dropdown-desc">다양한 축제 정보</div>
                    </div>
                  </Link>
                  <Link to="/shopping" className="dropdown-item" onClick={() => setIsInfoDropdownOpen(false)}>
                    <span className="dropdown-icon">🛍️</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">쇼핑·기념품</div>
                      <div className="dropdown-desc">부산 특산품과 쇼핑 명소</div>
                    </div>
                  </Link>
                  <Link to="/info/stay" className="dropdown-item" onClick={() => setIsInfoDropdownOpen(false)}>
                    <span className="dropdown-icon">🏨</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">숙박</div>
                      <div className="dropdown-desc">추천 숙소</div>
                    </div>
                  </Link>
                  <Link to="/ai-planner" className="dropdown-item" onClick={() => setIsInfoDropdownOpen(false)}>
                    <span className="dropdown-icon">🤖</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">AI 여행 계획</div>
                      <div className="dropdown-desc">AI가 추천하는 맞춤 여행</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* 여행혜택 드롭다운 */}
            <div className="dropdown-wrapper" ref={dropdownRefs.benefits}>
              <span 
                className="menu-item"
                onClick={() => toggleMenu("benefits")}
                style={{ cursor: 'pointer' }}
              >
                여행혜택
                <svg
                  className={`dropdown-arrow ${expandedMenu === "benefits" ? "open" : ""}`}
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              {expandedMenu === "benefits" && (
                <div className="dropdown-menu">
                  <Link to="/footer_details/event" className="dropdown-item" onClick={() => { setExpandedMenu(null); handleMenuClose(); }}>
                    <span className="dropdown-icon">🎉</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">이벤트</div>
                      <div className="dropdown-desc">여행 관련 이벤트</div>
                    </div>
                  </Link>
                  <Link to="/benefits/stamp" className="dropdown-item" onClick={() => { setExpandedMenu(null); handleMenuClose(); }}>
                    <span className="dropdown-icon">🛎️</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">스템프 이벤트</div>
                      <div className="dropdown-desc">명소 방문 인증/스탬프 투어</div>
                    </div>
                  </Link>
                  <Link to="/benefits/coupon" className="dropdown-item" onClick={() => { setExpandedMenu(null); handleMenuClose(); }}>
                    <span className="dropdown-icon">🎫</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">기프래카드</div>
                      <div className="dropdown-desc">여행 쿠폰/카드</div>
                    </div>
                  </Link>
                  <Link to="/benefits/badge" className="dropdown-item" onClick={() => { setExpandedMenu(null); handleMenuClose(); }}>
                    <span className="dropdown-icon">🏅</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">베지패드</div>
                      <div className="dropdown-desc">스페셜 뱃지</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          <div className="header-right">
            {isSearchOpen && (
              <div className="header-search-wrapper">
                <input
                  className="header-search"
                  placeholder="어디로, 어떤 여행을 떠날 예정인가요?"
                  autoFocus
                />
                <button 
                  className="header-search-close" 
                  onClick={() => setIsSearchOpen(false)}
                >
                  ✕
                </button>
              </div>
            )}

            <div className="header-icons">
              <button 
                className="icon-btn" 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                🔍
              </button>

              <Link to="/map" className="icon-btn">
                🗺️
              </Link>

              {user ? (
                <Link to="/mypage" className="icon-btn" title="마이페이지">
                  👤
                </Link>
              ) : (
                <Link to="/login" className="icon-btn" title="로그인">
                  👤
                </Link>
              )}

              <button 
                className="icon-btn dark-mode-toggle" 
                onClick={toggleDarkMode}
                title={isDarkMode ? "라이트 모드" : "다크 모드"}
              >
                {isDarkMode ? "☀️" : "🌙"}
              </button>

              <button className="icon-btn language-btn">
                한국어 ▼
              </button>
            </div>

            {!isLoading && user && (
              <span className="header-welcome">{user.accountName}님</span>
            )}

            <button
              className="header-ham"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>

        <div className="header-mobile-search-wrapper">
          <input className="header-mobile-search" placeholder="검색어 입력" />
          <button className="header-mobile-search-btn">🔍</button>
        </div>

        <nav className="header-mobile-tabs">
          <Link to="/" className="mobile-tab-item">홈</Link>
          <Link to="/theme" className="mobile-tab-item">추천 명소</Link>
          <Link to="/food" className="mobile-tab-item">맛집</Link>
          <Link to="/course" className="mobile-tab-item">여행코스</Link>
          <Link to="/info" className="mobile-tab-item">여행정보</Link>
          <Link to="/benefits" className="mobile-tab-item">여행혜택</Link>
        </nav>
      </header>

      <nav className="mobile-bottom-nav">
        <Link to="/" className="bottom-nav-item">
          🏠 <span>홈</span>
        </Link>
        <Link to="/search" className="bottom-nav-item">
          🔍 <span>검색</span>
        </Link>
        <Link to="/map" className="bottom-nav-item">
          🗺️ <span>여행지도</span>
        </Link>
      </nav>

      <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
        <div className="mobile-inner">
          <div className="mobile-user-section">
            <div className="mobile-user-icon">👤</div>

            {user ? (
              <Link
                to="/mypage"
                className="mobile-user-link"
                onClick={handleMenuClose}
              >
                <p className="user-greeting">{user.accountName}님 안녕하세요</p>
                <p className="user-subtitle">
                  마이페이지에서 회원정보를 확인하세요.
                </p>
              </Link>
            ) : (
              <Link
                to="/login"
                className="mobile-user-link"
                onClick={handleMenuClose}
              >
                <p className="user-greeting">로그인 해주세요</p>
                <p className="user-subtitle">더 많은 서비스를 이용할 수 있어요.</p>
              </Link>
            )}
          </div>

          <nav className="mobile-nav">
            <Link to="/" className="mobile-nav-item" onClick={handleMenuClose}>
              🏠 홈
            </Link>

            <Link to="/theme" className="mobile-nav-item" onClick={handleMenuClose}>
              ⭐ 테마
            </Link>

            <Link to="/map" className="mobile-nav-item" onClick={handleMenuClose}>
              🗺️ 지역
            </Link>

            <div
              className="mobile-nav-item expandable"
              onClick={() => toggleMenu("course")}
            >
              🎯 여행코스
              <span className={`nav-arrow ${expandedMenu === "course" ? "expanded" : ""}`}>
                ›
              </span>
            </div>

            {expandedMenu === "course" && (
              <div className="mobile-sub-nav">
                <Link to="/course/walk" onClick={handleMenuClose}>
                  도보 여행
                </Link>

                <Link to="/course/theme" onClick={handleMenuClose}>
                  테마 여행
                </Link>

                <Link to="/course/marine" onClick={handleMenuClose}>
                  해양 여행
                </Link>

                <Link to="/course/urban" onClick={handleMenuClose}>
                  도시 여행
                </Link>
                <Link to="/course/recommended" onClick={handleMenuClose}>
                  추천코스
                </Link>
                <Link to="/course/planner" onClick={handleMenuClose}>
                  스크랩 플래너
                </Link>
              </div>
            )}

            <div
              className="mobile-nav-item expandable"
              onClick={() => toggleMenu("info")}
            >
              ℹ️ 여행정보
              <span className={`nav-arrow ${expandedMenu === "info" ? "expanded" : ""}`}>
                ›
              </span>
            </div>

            {expandedMenu === "info" && (
              <div className="mobile-sub-nav">
                <Link to="/info/regions" onClick={handleMenuClose}>여행지역</Link>
                <Link to="/info/articles" onClick={handleMenuClose}>여행기사</Link>
                <Link to="/festival" onClick={handleMenuClose}>축제</Link>
                <Link to="/shopping" onClick={handleMenuClose}>쇼핑·기념품</Link>
                <Link to="/info/accommodation" onClick={handleMenuClose}>숙박/맛집</Link>
                <Link to="/ai-planner" onClick={handleMenuClose}>AI 여행 계획</Link>
              </div>
            )}

            <div
              className="mobile-nav-item expandable"
              onClick={() => toggleMenu("benefits")}
            >
              🎁 여행혜택
              <span className={`nav-arrow ${expandedMenu === "benefits" ? "expanded" : ""}`}>
                ›
              </span>
            </div>

            {expandedMenu === "benefits" && (
              <div className="mobile-sub-nav">
                <Link to="/benefits/event" onClick={handleMenuClose}>이벤트</Link>
                <Link to="/benefits/stamp" onClick={handleMenuClose}>스템프 이벤트</Link>
                <Link to="/benefits/coupon" onClick={handleMenuClose}>기프래카드</Link>
                <Link to="/benefits/badge" onClick={handleMenuClose}>베지패드</Link>
              </div>
            )}

            <Link to="/map" className="mobile-nav-item" onClick={handleMenuClose}>
              🗺️ 여행지도
            </Link>
          </nav>

          {user ? (
            <button className="mobile-auth-btn" onClick={handleLogout}>
              로그아웃
            </button>
          ) : (
            <Link to="/login" onClick={handleMenuClose} className="mobile-auth-btn">
              로그인
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;

