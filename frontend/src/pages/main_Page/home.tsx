import React, { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

// 1. 타입 정의
// Solr 결과 데이터 타입
interface SolrResultItem {
  id: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  place?: string; 
  address?: string; 
  [key: string]: any; 
}

// 사용자 정보 타입 (팀원 코드)
interface User {
  accountId: string;
  accountName: string;
  email: string;
  phoneNumber: string;
  accountRole: string;
}

const Home: React.FC = () => {
  // --- 상태 관리 (State) ---
  
  // 1) 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SolrResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 2) UI 및 세션 관련 상태
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // 세션 로딩 상태

  const location = useLocation();
  const SOLR_CORE_NAME = 'Search'; 

  // --- 헬퍼 함수 ---

  // 날짜 변환 (YYYY.MM.DD)
  const formatDate = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return isoDate;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    } catch {
      return isoDate;
    }
  };

  // 날짜 범위 표시 (시작 ~ 종료)
  const formatDateRange = (start?: string, end?: string): string => {
    if (!start) return '날짜 미정';
    const startStr = formatDate(start);
    if (!end) return startStr;
    const endStr = formatDate(end);
    return `${startStr} ~ ${endStr}`;
  };

  // --- 세션(로그인) 관리 로직 ---
  const checkSession = async () => {
    try {
      // 백엔드에 로그인 상태 확인 요청
      const res = await axios.get("/api/login/check", { withCredentials: true });
      if (res.data.isLogin && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("세션 확인 실패:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();

    // 로그인/로그아웃 이벤트 리스너 등록
    const handleLoginSuccess = () => setTimeout(() => checkSession(), 100);
    const handleLogoutSuccess = () => setTimeout(() => checkSession(), 100);

    window.addEventListener('loginSuccess', handleLoginSuccess);
    window.addEventListener('logoutSuccess', handleLogoutSuccess);

    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
      window.removeEventListener('logoutSuccess', handleLogoutSuccess);
    };
  }, []);

  // 페이지 이동 시 세션 재확인
  useEffect(() => {
    checkSession();
  }, [location.pathname]);


  // --- 이벤트 핸들러 ---

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Solr 검색 요청
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSearchResults([]);
    
    if (!searchQuery.trim()) {
      alert('검색어를 입력해 주세요.');
      return;
    }

    setLoading(true);

    try {
      const flFields = 'id,title,description,start_date,end_date,place,address'; 
      const query = 
        `q=${encodeURIComponent(searchQuery)}` + 
        `&defType=edismax` + 
        `&qf=title^3+place+description` + 
        `&rows=10` + 
        `&wt=json` +
        `&fl=${flFields}`;
        
      const url = `/solr/${SOLR_CORE_NAME}/select?${query}`; 
      
      const response = await axios.get(url);
      const docs = response.data.response.docs as SolrResultItem[];
      setSearchResults(docs);

    } catch (err) {
      console.error('검색 실패:', err);
      if (axios.isAxiosError(err) && err.response) {
          setError(`검색 실패: ${err.response.status}. 서버 설정을 확인해주세요.`);
      } else {
          setError('검색 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 메인 컨테이너: 검색 결과가 있으면 레이아웃 변경 */}
      <div className={`home-container ${searchResults.length > 0 ? 'results-mode' : ''}`}>
        <h1 className="home-title">KH.Solr AI 검색</h1>
        
        {/* 검색 폼 */}
        <form className="search-form" onSubmit={handleSubmit}>
          <div className="search-container">
            <div className="search-bar">
              <div className="search-icon"></div>
              
              <input
                type="text"
                className="search-input"
                placeholder="가장 빠른 AI 검색"
                value={searchQuery}
                onChange={handleInputChange}
              />
              
              <button type="submit" className="search-button" disabled={loading}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 11L10 6M10 6L6 6M10 6L10 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          {/* 상태 메시지 */}
          {loading && <p className="status-message">검색 중...</p>}
          {error && <p className="error-message">{error}</p>}
        </form>

        {/* 검색 결과 리스트 */}
        <div className="search-results-list">
          {searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <div key={index} className="result-item">
                <div className="result-meta">
                  {(result.start_date || result.end_date) && (
                    <span className="result-date">
                      📅 {formatDateRange(result.start_date, result.end_date)}
                    </span>
                  )}
                  {result.place && <span className="result-place">📍 {result.place}</span>}
                </div>
                
                <h3>{result.title}</h3>
                
                {result.address && <p className="result-address">{result.address}</p>} 
                
                <p>{result.description || '내용 없음'}</p>
              </div>
            ))
          ) : (
            !loading && !error && searchQuery.trim() && searchResults.length === 0 && (
              <p className="no-results-message">검색 결과가 없습니다.</p>
            )
          )}
        </div>
      </div>

      {/* 사이드바 토글 버튼 */}
      <button className='history-toggle-button' onClick={toggleSidebar}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="book-icon">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </button>

      {/* 사이드바 내용 */}
      <div className={`search-history-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">KH.solr</div>
          <button className="close-sidebar-button" onClick={toggleSidebar}>
            &times; 
          </button>
        </div>
        
        <div className="sidebar-content">
          <div className="no-history">
            <p>아직 기록이 없어요.</p>
            <p>새로운 검색을 해보세요.</p>
          </div>
        </div>

        {/* 사이드바 푸터 (로그인 상태에 따라 변경) */}
        <div className="sidebar-footer">
          {!isLoading && user ? (
            // 로그인 상태일 때
            <div className="footer-actions">
              <div className="sync-prompt" style={{ flexGrow: 1, fontWeight: 'bold' }}>
                {user.accountName}님 환영합니다 👋
              </div>
              <button className="settings-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.74a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.74a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.74a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.74a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </button>
            </div>
          ) : (
            // 로그아웃 상태일 때
            <>
              <div className="sync-prompt">
                로그인하고 기록을 동기화 해보세요
              </div>
              <div className="footer-actions">
                <Link to="/login" className="login-button">
                  로그인
                </Link>
                <button className="settings-button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.74a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.74a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.74a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.74a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Home;