import React, { useState, useEffect } from "react";
// 스템프 이벤트 페이지 연결 예시
// import { Route, Routes } from "react-router-dom";
// import StampEvent from "../../pages/benefits/StampEvent";
import "./header.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

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

  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null); 
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInfoDropdownOpen, setIsInfoDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

      setUser(res.data);
    } catch (err) {
      console.error("JWT 인증 실패:", err);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsMenuOpen(false);
    setExpandedMenu(null);
    navigate("/");
  };

  const toggleMenu = (menuName: string) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
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
            <div className="dropdown-container" style={{display: 'inline-block', position: 'relative'}}>
              <span
                className="menu-item dropdown-trigger"
                onMouseEnter={() => setExpandedMenu('sns')}
                onMouseLeave={() => setExpandedMenu(null)}
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
                <div
                  className="dropdown-menu"
                  style={{position: 'absolute', left: 0, top: '100%', zIndex: 10}}
                  onMouseEnter={() => setExpandedMenu('sns')}
                  onMouseLeave={() => setExpandedMenu(null)}
                >
                  <Link to="/blog" className="dropdown-item">블로그</Link>
                  <Link to="/cafe" className="dropdown-item">카페</Link>
                </div>
              )}
            </div>
            <Link to="/tour" className="menu-item">명소</Link>
            <Link to="/food" className="menu-item">맛집</Link>
            <Link to="/course" className="menu-item">여행코스</Link>
            
            {/* 여행정보 드롭다운 */}
            <div className="dropdown-container">
              <span 
                className="menu-item dropdown-trigger"
                onMouseEnter={() => setIsInfoDropdownOpen(true)}
                onMouseLeave={() => setIsInfoDropdownOpen(false)}
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
                <div 
                  className="dropdown-menu"
                  onMouseEnter={() => setIsInfoDropdownOpen(true)}
                  onMouseLeave={() => setIsInfoDropdownOpen(false)}
                >
                  <Link to="/info/regions" className="dropdown-item">
                    <span className="dropdown-icon">🗺️</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">여행지역</div>
                      <div className="dropdown-desc">부산의 주요 지역 탐색</div>
                    </div>
                  </Link>
                  <Link to="/info/articles" className="dropdown-item">
                    <span className="dropdown-icon">📰</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">여행기사</div>
                      <div className="dropdown-desc">최신 여행 소식</div>
                    </div>
                  </Link>
                  <Link to="/festival" className="dropdown-item">
                    <span className="dropdown-icon">🎉</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">축제</div>
                      <div className="dropdown-desc">다양한 축제 정보</div>
                    </div>
                  </Link>
                  <Link to="/shopping" className="dropdown-item">
                    <span className="dropdown-icon">🛍️</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">쇼핑·기념품</div>
                      <div className="dropdown-desc">부산 특산품과 쇼핑 명소</div>
                    </div>
                  </Link>
                  <Link to="/info/stay" className="dropdown-item">
                    <span className="dropdown-icon">🏨</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">숙박</div>
                      <div className="dropdown-desc">추천 숙소</div>
                    </div>
                  </Link>
                  <Link to="/ai-planner" className="dropdown-item">
                    <span className="dropdown-icon">🤖</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">AI 여행 계획</div>
                      <div className="dropdown-desc">AI가 추천하는 맞춤 여행</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <div
              className="menu-item dropdown"
              onMouseEnter={() => setExpandedMenu("benefits")}
              onMouseLeave={() => setExpandedMenu(null)}
            >
              <span>여행혜택</span>
              {expandedMenu === "benefits" && (
                <div className="dropdown-menu">
                  <Link to="/benefits/event" className="dropdown-item" onClick={handleMenuClose}>
                    <span className="dropdown-icon">🎉</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">이벤트</div>
                      <div className="dropdown-desc">여행 관련 이벤트</div>
                    </div>
                  </Link>
                  <Link to="/benefits/stamp" className="dropdown-item" onClick={handleMenuClose}>
                    <span className="dropdown-icon">🛎️</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">스템프 이벤트</div>
                      <div className="dropdown-desc">명소 방문 인증/스탬프 투어</div>
                    </div>
                  </Link>
                  <Link to="/benefits/coupon" className="dropdown-item" onClick={handleMenuClose}>
                    <span className="dropdown-icon">🎫</span>
                    <div className="dropdown-content">
                      <div className="dropdown-title">기프래카드</div>
                      <div className="dropdown-desc">여행 쿠폰/카드</div>
                    </div>
                  </Link>
                  <Link to="/benefits/badge" className="dropdown-item" onClick={handleMenuClose}>
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

// 아래는 App.tsx 또는 라우터 설정 파일에 추가해야 정상 연결됩니다.
// <Routes>
//   ...existing code...
//   <Route path="/benefits/stamp" element={<StampEvent />} />
// </Routes>
