import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom'; // 사이드바 링크용
import axios from 'axios';
import './Home.css'; // (파일명 대소문자 확인해주세요. 보통 Home.css 혹은 home.css)

// 타입 정의: Solr에서 받을 데이터 구조
interface SolrResultItem {
  id: string;
  title: string;
  description?: string;
  start_date?: string; 
  place?: string; 
  address?: string; 
  [key: string]: any; 
}

//TypeScript에서 객체의 타입(구조)를 정의하는 방법
interface User {
  accountId: string;
  accountName: string;
  email: string;
  phoneNumber: string;
  accountRole: string;
}

const Home: React.FC = () => {
  // 1. 상태 관리 (검색 기능 + 사이드바 기능 통합)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // 사이드바 열림 상태
  
  const [searchResults, setSearchResults] = useState<SolrResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Solr 설정
  const SOLR_CORE_NAME = 'Search'; 

  // Solr 날짜 형식을 YYYY.MM.DD로 변환
  const formatDate = (isoDate: string | undefined): string => {
    if (!isoDate) return '날짜 미정';
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

  // 2. 이벤트 핸들러
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 사이드바 토글 함수
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Solr 검색 요청 함수 (비동기)
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
      // Solr 요청 필드
      const flFields = 'id,title,description,start_date,place,address'; 
      
      const query = 
        `q=${encodeURIComponent(searchQuery)}` + 
        `&defType=edismax` + 
        `&qf=title^3+place+description` + 
        `&rows=10` + 
        `&wt=json` +
        `&fl=${flFields}`;
        
      const url = `/solr/${SOLR_CORE_NAME}/select?${query}`; 
      
      console.log('Solr 요청 URL:', url);

      const response = await axios.get(url);
      const docs = response.data.response.docs as SolrResultItem[];
      setSearchResults(docs);
      
      console.log('검색 성공:', docs);

    } catch (err) {
      console.error('검색 실패:', err);
      if (axios.isAxiosError(err) && err.response) {
          setError(`검색 실패: ${err.response.status} (${err.response.statusText}). 서버 연결을 확인해주세요.`);
      } else {
          setError('검색 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 세션 확인
  useEffect(() => {
    checkSession();

    // 로그인 성공 이벤트 리스너
    const handleLoginSuccess = () => {
      setTimeout(() => {
        checkSession();
      }, 100);
    };

    // 로그아웃 성공 이벤트 리스너
    const handleLogoutSuccess = () => {
      setTimeout(() => {
        checkSession();
      }, 100);
    };

    window.addEventListener('loginSuccess', handleLoginSuccess);
    window.addEventListener('logoutSuccess', handleLogoutSuccess);

    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
      window.removeEventListener('logoutSuccess', handleLogoutSuccess);
    };
  }, []);

  // 페이지 이동 시 세션 확인
  useEffect(() => {
    checkSession();
  }, [location.pathname]);

  const checkSession = async () => {
    try {
      const res = await axios.get("/api/login/check", {
        withCredentials: true
      });

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

  return (
    <>
      {/* 3. 메인 화면 영역 */}
      {/* 검색 결과가 있으면 'results-mode' 클래스 추가 (레이아웃 변경용) */}
      <div className={`home-container ${searchResults.length > 0 ? 'results-mode' : ''}`}>
        <h1 className="home-title">KH.Solr AI 검색</h1>
        
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
                <svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6 11L10 6M10 6L6 6M10 6L10 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          {/* 상태 및 오류 메시지 */}
          {loading && <p className="status-message">검색 중...</p>}
          {error && <p className="error-message">{error}</p>}
        </form>

        {/* 4. 검색 결과 리스트 영역 */}
        <div className="search-results-list">
          {searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <div key={index} className="result-item">
                
                <div className="result-meta">
                  {/* start_date 사용 */}
                  {result.start_date && <span className="result-date">📅 {formatDate(result.start_date)}</span>}
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

      {/* 5. 사이드바 영역 (팀원 코드 복구) */}
      <button className='history-toggle-button' onClick={toggleSidebar}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="book-icon">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </button>

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

        <div className="sidebar-footer">
          {!isLoading && user ? (
            <div className="footer-actions">
              <div className="sync-prompt">
                {user.accountName}님 환영합니다
              </div>
              <button className="settings-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.74a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.74a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.74a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.74a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </button>
            </div>
          ) : (
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