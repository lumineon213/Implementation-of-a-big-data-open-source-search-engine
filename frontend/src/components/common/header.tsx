import React, { useState, useEffect, useRef } from "react";
// 스템프 이벤트 페이지 연결 예시
// import { Route, Routes } from "react-router-dom";
// import StampEvent from "../../pages/benefits/StampEvent";
import "./header.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();

  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null); 
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInfoDropdownOpen, setIsInfoDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 드롭다운 외부 클릭 감지를 위한 ref
  const dropdownRefs = {
    sns: useRef<HTMLDivElement>(null),
    course: useRef<HTMLDivElement>(null),
    info: useRef<HTMLDivElement>(null),
    benefits: useRef<HTMLDivElement>(null),
    language: useRef<HTMLDivElement>(null),
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
      if (isLanguageDropdownOpen && dropdownRefs.language.current && !dropdownRefs.language.current.contains(target)) {
        setIsLanguageDropdownOpen(false);
      }
    };

    if (expandedMenu || isInfoDropdownOpen || isLanguageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedMenu, isInfoDropdownOpen, isLanguageDropdownOpen]);

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
    setIsLanguageDropdownOpen(false);
  };

  // 언어 변경 함수
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    setIsLanguageDropdownOpen(false);
  };

  // 현재 언어 표시 텍스트
  const getLanguageText = () => {
    return i18n.language === 'en' ? 'English' : '한국어';
  };

  return (
    <>
      <header className="header-container">
        <div className="header-inner">
          <Link to="/" className="header-logo">
            {t('header.logo')} <span className="header-logo-round">{t('header.logoSub')}</span>
          </Link>

          <nav className="header-desktop-menu">
            <Link to="/" className="menu-item">{t('header.home')}</Link>
            
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
                  <Link to="/blog" className="dropdown-item" onClick={() => setExpandedMenu(null)}>{t('header.blog')}</Link>
                  <Link to="/cafe" className="dropdown-item" onClick={() => setExpandedMenu(null)}>{t('header.cafe')}</Link>
                </div>
              )}
            </div>
            
            <Link to="/tour" className="menu-item">{t('header.tour')}</Link>
            <Link to="/food" className="menu-item">{t('header.food')}</Link>
            <div 
              className="dropdown-wrapper"
              ref={dropdownRefs.course}
            >
              <span 
                className="menu-item"
                onClick={() => toggleMenu("course")}
                style={{ cursor: 'pointer' }}
              >
                {t('header.travelCourse')}
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
                    <img src={walk} alt={t('header.walkTravel')} className="course-icon" />
                    <div className="course-info">
                      <div className="course-info-title">{t('header.walkTravel')}</div>
                      <div className="course-info-desc">{t('header.walkTravelDesc')}</div>
                    </div>
                  </Link>

                  <Link to="/course/theme" className="course-card" onClick={() => setExpandedMenu(null)}>
                    <img src={theme} alt={t('header.themeTravel')} className="course-icon" />
                    <div className="course-info">
                      <div className="course-info-title">{t('header.themeTravel')}</div>
                      <div className="course-info-desc">{t('header.themeTravelDesc')}</div>
                    </div>
                  </Link>

                  <Link to="/course/marine" className="course-card" onClick={() => setExpandedMenu(null)}>
                    <img src={marine} alt={t('header.marineTravel')} className="course-icon" />
                    <div className="course-info">
                      <div className="course-info-title">{t('header.marineTravel')}</div>
                      <div className="course-info-desc">{t('header.marineTravelDesc')}</div>
                    </div>
                  </Link>

                  <Link to="/course/urban" className="course-card" onClick={() => setExpandedMenu(null)}>
                    <img src={urban} alt={t('header.urbanTravel')} className="course-icon" />
                    <div className="course-info">
                      <div className="course-info-title">{t('header.urbanTravel')}</div>
                      <div className="course-info-desc">{t('header.urbanTravelDesc')}</div>
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
                {t('header.travelInfo')}
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
                      <div className="dropdown-title">{t('header.travelRegion')}</div>
                      <div className="dropdown-desc">{t('header.travelRegionDesc')}</div>
                    </div>
                  </Link>
                  <Link to="/info/news" className="dropdown-item" onClick={() => setIsInfoDropdownOpen(false)}> {/* 💡 경로 수정 완료 */}
                    <span className="dropdown-icon">📰</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">{t('header.travelArticles')}</div>
                      <div className="dropdown-desc">{t('header.travelArticlesDesc')}</div>
                    </div>
                  </Link>
                  <Link to="/festival" className="dropdown-item" onClick={() => setIsInfoDropdownOpen(false)}>
                    <span className="dropdown-icon">🎉</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">{t('header.festival')}</div>
                      <div className="dropdown-desc">{t('header.festivalDesc')}</div>
                    </div>
                  </Link>
                  <Link to="/shopping" className="dropdown-item" onClick={() => setIsInfoDropdownOpen(false)}>
                    <span className="dropdown-icon">🛍️</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">{t('header.shopping')}</div>
                      <div className="dropdown-desc">{t('header.shoppingDesc')}</div>
                    </div>
                  </Link>
                  <Link to="/info/stay" className="dropdown-item" onClick={() => setIsInfoDropdownOpen(false)}>
                    <span className="dropdown-icon">🏨</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">{t('header.accommodation')}</div>
                      <div className="dropdown-desc">{t('header.accommodationDesc')}</div>
                    </div>
                  </Link>
                  <Link to="/ai-planner" className="dropdown-item" onClick={() => setIsInfoDropdownOpen(false)}>
                    <span className="dropdown-icon">🤖</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">{t('header.aiPlanner')}</div>
                      <div className="dropdown-desc">{t('header.aiPlannerDesc')}</div>
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
                {t('header.travelBenefits')}
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
                      <div className="dropdown-title">{t('header.event')}</div>
                      <div className="dropdown-desc">{t('header.eventDesc')}</div>
                    </div>
                  </Link>
                  <Link to="/benefits/stamp" className="dropdown-item" onClick={() => { setExpandedMenu(null); handleMenuClose(); }}>
                    <span className="dropdown-icon">🛎️</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">{t('header.stampEvent')}</div>
                      <div className="dropdown-desc">{t('header.stampEventDesc')}</div>
                    </div>
                  </Link>
                  <Link to="/benefits/coupon" className="dropdown-item" onClick={() => { setExpandedMenu(null); handleMenuClose(); }}>
                    <span className="dropdown-icon">🎫</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">{t('header.giftCard')}</div>
                      <div className="dropdown-desc">{t('header.giftCardDesc')}</div>
                    </div>
                  </Link>
                  <Link to="/benefits/badge" className="dropdown-item" onClick={() => { setExpandedMenu(null); handleMenuClose(); }}>
                    <span className="dropdown-icon">🏅</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">{t('header.badgePad')}</div>
                      <div className="dropdown-desc">{t('header.badgePadDesc')}</div>
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
                  placeholder={t('header.searchPlaceholder')}
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
                <Link to="/mypage" className="icon-btn" title={t('header.mypage')}>
                  👤
                </Link>
              ) : (
                <Link to="/login" className="icon-btn" title={t('header.login')}>
                  👤
                </Link>
              )}

              <button 
                className="icon-btn dark-mode-toggle" 
                onClick={toggleDarkMode}
                title={isDarkMode ? t('header.lightMode') : t('header.darkMode')}
              >
                {isDarkMode ? "☀️" : "🌙"}
              </button>

              <div className="dropdown-wrapper" ref={dropdownRefs.language} style={{ position: 'relative' }}>
                <button 
                  className="icon-btn language-btn"
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                >
                  {getLanguageText()} <span style={{ fontSize: '10px' }}>▼</span>
                </button>
                {isLanguageDropdownOpen && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      background: isDarkMode ? 'var(--bg-secondary)' : '#fff',
                      border: `1px solid ${isDarkMode ? 'var(--border-color)' : '#ddd'}`,
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      zIndex: 1000,
                      minWidth: '120px',
                      overflow: 'hidden'
                    }}
                  >
                    <button
                      onClick={() => changeLanguage('ko')}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        background: i18n.language === 'ko' 
                          ? (isDarkMode ? 'rgba(0, 102, 255, 0.2)' : '#e3f2fd')
                          : 'transparent',
                        color: isDarkMode ? 'var(--text-primary)' : '#333',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: i18n.language === 'ko' ? '600' : '400',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (i18n.language !== 'ko') {
                          e.currentTarget.style.background = isDarkMode ? 'var(--bg-tertiary)' : '#f5f5f5';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (i18n.language !== 'ko') {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {t('header.korean')}
                    </button>
                    <button
                      onClick={() => changeLanguage('en')}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        borderTop: `1px solid ${isDarkMode ? 'var(--border-color)' : '#eee'}`,
                        background: i18n.language === 'en'
                          ? (isDarkMode ? 'rgba(0, 102, 255, 0.2)' : '#e3f2fd')
                          : 'transparent',
                        color: isDarkMode ? 'var(--text-primary)' : '#333',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: i18n.language === 'en' ? '600' : '400',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (i18n.language !== 'en') {
                          e.currentTarget.style.background = isDarkMode ? 'var(--bg-tertiary)' : '#f5f5f5';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (i18n.language !== 'en') {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {t('header.english')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!isLoading && user && (
              <span className="header-welcome">{user.accountName}{t('header.welcome')}</span>
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
          <input className="header-mobile-search" placeholder={t('header.searchInput')} />
          <button className="header-mobile-search-btn">🔍</button>
        </div>

        <nav className="header-mobile-tabs">
          <Link to="/" className="mobile-tab-item">{t('header.mobileHome')}</Link>
          <Link to="/theme" className="mobile-tab-item">{t('header.mobileTheme')}</Link>
          <Link to="/food" className="mobile-tab-item">{t('header.mobileFood')}</Link>
          <Link to="/course" className="mobile-tab-item">{t('header.mobileCourse')}</Link>
          <Link to="/info" className="mobile-tab-item">{t('header.mobileInfo')}</Link>
          <Link to="/benefits" className="mobile-tab-item">{t('header.mobileBenefits')}</Link>
        </nav>
      </header>

      <nav className="mobile-bottom-nav">
        <Link to="/" className="bottom-nav-item">
          🏠 <span>{t('header.mobileHome')}</span>
        </Link>
        <Link to="/search" className="bottom-nav-item">
          🔍 <span>{t('header.mobileSearch')}</span>
        </Link>
        <Link to="/map" className="bottom-nav-item">
          🗺️ <span>{t('header.mobileTravelMap')}</span>
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
                <p className="user-greeting">{user.accountName}{t('header.mobileGreeting')}</p>
                <p className="user-subtitle">
                  {t('header.mobileSubtitle')}
                </p>
              </Link>
            ) : (
              <Link
                to="/login"
                className="mobile-user-link"
                onClick={handleMenuClose}
              >
                <p className="user-greeting">{t('header.mobileLogout')}</p>
                <p className="user-subtitle">{t('header.mobileLogoutDesc')}</p>
              </Link>
            )}
          </div>

          <nav className="mobile-nav">
            <Link to="/" className="mobile-nav-item" onClick={handleMenuClose}>
              🏠 {t('header.mobileHome')}
            </Link>

            <Link to="/theme" className="mobile-nav-item" onClick={handleMenuClose}>
              ⭐ {t('header.mobileTheme')}
            </Link>

            <Link to="/map" className="mobile-nav-item" onClick={handleMenuClose}>
              🗺️ {t('header.mobileInfo')}
            </Link>

            <div
              className="mobile-nav-item expandable"
              onClick={() => toggleMenu("course")}
            >
              🎯 {t('header.mobileCourse')}
              <span className={`nav-arrow ${expandedMenu === "course" ? "expanded" : ""}`}>
                ›
              </span>
            </div>

              {expandedMenu === "course" && (
              <div className="mobile-sub-nav">
                <Link to="/course/walk" onClick={handleMenuClose}>
                  {t('header.walkTravel')}
                </Link>

                <Link to="/course/theme" onClick={handleMenuClose}>
                  {t('header.themeTravel')}
                </Link>

                <Link to="/course/marine" onClick={handleMenuClose}>
                  {t('header.marineTravel')}
                </Link>

                <Link to="/course/urban" onClick={handleMenuClose}>
                  {t('header.urbanTravel')}
                </Link>
                <Link to="/course/recommended" onClick={handleMenuClose}>
                  {t('header.travelCourse')}
                </Link>
                <Link to="/course/planner" onClick={handleMenuClose}>
                  {t('header.aiPlanner')}
                </Link>
              </div>
            )}

            <div
              className="mobile-nav-item expandable"
              onClick={() => toggleMenu("info")}
            >
              ℹ️ {t('header.travelInfo')}
              <span className={`nav-arrow ${expandedMenu === "info" ? "expanded" : ""}`}>
                ›
              </span>
            </div>

            {expandedMenu === "info" && (
              <div className="mobile-sub-nav">
                <Link to="/info/regions" onClick={handleMenuClose}>{t('header.travelRegion')}</Link>
                <Link to="/info/news" onClick={handleMenuClose}>{t('header.travelArticles')}</Link> {/* 💡 경로 수정 완료 */}
                <Link to="/festival" onClick={handleMenuClose}>{t('header.festival')}</Link>
                <Link to="/shopping" onClick={handleMenuClose}>{t('header.shopping')}</Link>
                <Link to="/info/accommodation" onClick={handleMenuClose}>{t('header.accommodation')}</Link>
                <Link to="/ai-planner" onClick={handleMenuClose}>{t('header.aiPlanner')}</Link>
              </div>
            )}

            <div
              className="mobile-nav-item expandable"
              onClick={() => toggleMenu("benefits")}
            >
              🎁 {t('header.travelBenefits')}
              <span className={`nav-arrow ${expandedMenu === "benefits" ? "expanded" : ""}`}>
                ›
              </span>
            </div>

            {expandedMenu === "benefits" && (
              <div className="mobile-sub-nav">
                <Link to="/benefits/event" onClick={handleMenuClose}>{t('header.event')}</Link>
                <Link to="/benefits/stamp" onClick={handleMenuClose}>{t('header.stampEvent')}</Link>
                <Link to="/benefits/coupon" onClick={handleMenuClose}>{t('header.giftCard')}</Link>
                <Link to="/benefits/badge" onClick={handleMenuClose}>{t('header.badgePad')}</Link>
              </div>
            )}

            <Link to="/map" className="mobile-nav-item" onClick={handleMenuClose}>
              🗺️ {t('header.mobileTravelMap')}
            </Link>
          </nav>

          {user ? (
            <button className="mobile-auth-btn" onClick={handleLogout}>
              {t('mypage.logout')}
            </button>
          ) : (
            <Link to="/login" onClick={handleMenuClose} className="mobile-auth-btn">
              {t('header.login')}
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;