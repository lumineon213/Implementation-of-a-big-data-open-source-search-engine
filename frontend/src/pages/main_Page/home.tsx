import React, { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Search, Heart, Calendar, MapPin, Trash2, BookOpen, X, LogIn, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './home.css';
import Modal from '../../components/common/modal';
import AIChatBot from '../chatbot/chatbot'; // 챗봇 컴포넌트 경로 확인 필요

// 타입 정의
interface SolrResultItem {
  id: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  place?: string;
  address?: string;
  type?: 'NEWS' | 'TRAVEL';
  [key: string]: any;
}

interface FavoriteItem {
  fav_id: number;
  id: string;
  title: string;
  date: string;
  type: string;
}

interface SearchLog {
  logId: number;
  keyword: string;
  date: string;
}

interface User {
  accountId: string;
  accountName: string;
  email: string;
  phoneNumber: string;
  accountRole: string;
}

interface HomeProps {
  searchResults: SolrResultItem[];
  setSearchResults: React.Dispatch<React.SetStateAction<SolrResultItem[]>>;
}

const Home: React.FC<HomeProps> = ({ searchResults, setSearchResults }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const SOLR_CORE_NAME = 'Search'; 

  // --- 상태 관리 ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearched, setIsSearched] = useState<boolean>(false);

  // UI & 세션
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('history'); // 👈 기본값 'history'로 변경!
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // 데이터 상태 (즐겨찾기 & 검색기록)
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchLog[]>([]); // 검색 기록 상태 추가

  // 다크모드
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  // --- 헬퍼 함수 ---
  const formatDate = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return isoDate;
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    } catch { return isoDate; }
  };

  const formatDateRange = (start?: string, end?: string): string => {
    if (!start) return '날짜 미정';
    const startStr = formatDate(start);
    if (!end) return startStr;
    return `${startStr} ~ ${formatDate(end)}`;
  };

  // --- 즐겨찾기 로직 ---
  const toggleFavorite = (item: SolrResultItem) => {
    const existingIndex = favorites.findIndex(f => f.id === item.id);
    if (existingIndex !== -1) {
      setFavorites(prev => prev.filter((_, index) => index !== existingIndex));
    } else {
      const newFav: FavoriteItem = {
        fav_id: Date.now(),
        id: item.id,
        title: item.title,
        date: formatDate(item.start_date || ''),
        type: 'TRAVEL'
      };
      setFavorites(prev => [...prev, newFav]);
      // 찜하면 탭을 즐겨찾기로 바꾸고 사이드바 열기 (선택사항)
      setActiveTab('favorites');
      if(!isSidebarOpen) setIsSidebarOpen(true);
    }
  };

  const isFavorite = (item: SolrResultItem) => {
    return favorites.some(f => f.id === item.id);
  };

  // --- 검색 기록 로직 ---
  const addSearchLog = (keyword: string) => {
    // 중복 제거 후 최신 검색어를 위로
    const newLog: SearchLog = { logId: Date.now(), keyword, date: new Date().toLocaleDateString() };
    setSearchHistory(prev => [newLog, ...prev.filter(log => log.keyword !== keyword)].slice(0, 20)); // 최대 20개
  };

  const deleteSearchLog = (logId: number) => {
    setSearchHistory(prev => prev.filter(log => log.logId !== logId));
  };

  const clearAllSearchLogs = () => {
    setSearchHistory([]);
  };

  // --- 세션 체크 ---
  const checkSession = async () => {
    try {
      const res = await axios.get("/api/login/check", { withCredentials: true });
      if (res.data.isLogin && res.data.user) setUser(res.data.user);
      else setUser(null);
    } catch (err) {
      console.error("세션 확인 실패:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Effects ---
  useEffect(() => {
    checkSession();
    const handleLoginSuccess = () => setTimeout(() => checkSession(), 100);
    const handleLogoutSuccess = () => setTimeout(() => checkSession(), 100);
    window.addEventListener('loginSuccess', handleLoginSuccess);
    window.addEventListener('logoutSuccess', handleLogoutSuccess);
    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
      window.removeEventListener('logoutSuccess', handleLogoutSuccess);
    };
  }, []);

  useEffect(() => { checkSession(); }, [location.pathname]);

  useEffect(() => {
    if (isDarkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  // --- 핸들러 ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // 검색 실행
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      alert('검색어를 입력해 주세요.');
      return;
    }
    
    // 검색 기록 추가
    addSearchLog(searchQuery);
    
    setLoading(true);
    setIsSearched(true);

    try {
      const flFields = 'id,title,description,start_date,end_date,place,address';
      const query = `q=${encodeURIComponent(searchQuery)}&defType=edismax&qf=title^3+place+description&rows=10&wt=json&fl=${flFields}`;
      const url = `/solr/${SOLR_CORE_NAME}/select?${query}`;
      
      const response = await axios.get(url);
      setSearchResults(response.data.response.docs);
    } catch (err) {
      console.error('검색 실패:', err);
      setError('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색 기록 클릭 시 재검색
  const handleHistoryClick = (keyword: string) => {
    setSearchQuery(keyword);
    // 폼 제출과 동일한 로직 실행을 위해 별도 함수로 빼거나, 여기서 바로 axios 호출해도 됨.
    // 편의상 폼 제출 버튼을 클릭하게 하거나 상태 업데이트 후 useEffect로 처리할 수도 있지만,
    // 여기서는 간단히 검색어 세팅만 하고 사용자에게 검색 버튼을 누르게 하거나
    // 아래처럼 바로 검색 로직을 수행할 수도 있습니다.
  };

  return (
    <>
      <div className={`home-container ${isSearched ? 'results-mode' : ''}`}>
        <h1 className="home-title">KH.Solr AI 검색</h1>
        
        <form className="search-form" onSubmit={handleSubmit}>
          <div className="search-container">
            <div className="search-bar">
              <div className="search-icon"></div> 
              <input type="text" className="search-input" placeholder="가장 빠른 AI 검색" value={searchQuery} onChange={handleInputChange} />
              <button type="submit" className="search-button" disabled={loading}>
                <Search size={16} color="white" />
              </button>
            </div>
          </div>
          {loading && <p className="status-message">검색 중...</p>}
          {error && <p className="error-message">{error}</p>}
        </form>

        {/* 검색 결과 리스트 */}
        {isSearched && (
          <div className="search-results-list">
            {searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <div key={result.id || index} className="result-item" onClick={() => navigate(`/detail/${result.id}`)} style={{ cursor: 'pointer', position: 'relative' }}>
                  
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(result); }} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }}>
                    <Heart size={24} fill={isFavorite(result) ? "#ef4444" : "none"} color={isFavorite(result) ? "#ef4444" : "#ccc"} />
                  </button>

                  <div className="result-meta">
                    {(result.start_date || result.end_date) && <span className="result-date"><Calendar size={14} style={{marginRight:'4px'}}/> {formatDateRange(result.start_date, result.end_date)}</span>}
                    {result.place && <span className="result-place"><MapPin size={14} style={{marginRight:'4px'}}/> {result.place}</span>}
                  </div>
                  <h3 style={{ paddingRight: '30px' }}>{result.title}</h3>
                  {result.address && <p className="result-address">{result.address}</p>}
                  <p>{result.description || '내용 없음'}</p>
                </div>
              ))
            ) : (
              !loading && !error && <p className="no-results-message">검색 결과가 없습니다.</p>
            )}
          </div>
        )}
      </div>

      {/* 사이드바 토글 */}
      <button className='history-toggle-button' onClick={toggleSidebar}>
        <BookOpen size={24} color="#4a4a4a" />
      </button>

      {/* 사이드바 본체 */}
      <div className={`search-history-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        
        <div className="sidebar-header">
          <div className="sidebar-logo">KH.solr</div>
          <button className="close-sidebar-button" onClick={toggleSidebar}><X size={24} /></button>
        </div>

        {/* 탭 메뉴 */}
        <div className="sidebar-tabs" style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
          <button 
            onClick={() => setActiveTab('history')}
            style={{ 
              flex: 1, padding: '10px', background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: activeTab === 'history' ? 'bold' : 'normal',
              color: activeTab === 'history' ? '#8b5cf6' : '#666',
              borderBottom: activeTab === 'history' ? '2px solid #8b5cf6' : 'none'
            }}
          >
            최근검색 ({searchHistory.length})
          </button>
          <button 
            onClick={() => setActiveTab('favorites')}
            style={{ 
              flex: 1, padding: '10px', background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: activeTab === 'favorites' ? 'bold' : 'normal',
              color: activeTab === 'favorites' ? '#8b5cf6' : '#666',
              borderBottom: activeTab === 'favorites' ? '2px solid #8b5cf6' : 'none'
            }}
          >
            즐겨찾기 ({favorites.length})
          </button>
        </div>
        
        <div className="sidebar-content" style={{ display: 'block', overflowY: 'auto', textAlign: 'left', padding: '0', flex: 1 }}>
          
          {/* 탭 1: 검색 기록 */}
          {activeTab === 'history' && (
            searchHistory.length === 0 ? (
              <div className="no-history" style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
                <Search size={40} style={{ color: '#ddd', marginBottom: '10px' }} />
                <p style={{color:'#999'}}>최근 검색 기록이<br/>없습니다.</p>
              </div>
            ) : (
              <div className="search-history-list">
                <div className="history-header" style={{padding: '10px 15px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f9f9f9'}}>
                  <span style={{fontSize:'0.85rem', color:'#666'}}>전체 삭제</span>
                  <button onClick={clearAllSearchLogs} style={{background:'none', border:'none', fontSize:'0.8rem', color:'#999', cursor:'pointer'}}><Trash2 size={14}/></button>
                </div>
                {searchHistory.map((log) => (
                  <div key={log.logId} className="history-item" style={{ padding: '12px 15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span 
                      className="history-keyword" 
                      onClick={() => handleHistoryClick(log.keyword)}
                      style={{ cursor: 'pointer', flex: 1 }}
                    >
                      🔍 {log.keyword}
                    </span>
                    <button 
                      className="delete-btn"
                      onClick={(e) => { e.stopPropagation(); deleteSearchLog(log.logId); }}
                      style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {/* 탭 2: 즐겨찾기 목록 */}
          {activeTab === 'favorites' && (
            favorites.length === 0 ? (
              <div className="no-history" style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
                <Heart size={40} style={{ color: '#ddd', marginBottom: '10px' }} />
                <p style={{color:'#999'}}>관심있는 정보를<br/>담아보세요.</p>
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {favorites.map((fav) => (
                  <li key={fav.fav_id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, marginRight: '10px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer' }} onClick={() => navigate(`/detail/${fav.id}`)}>{fav.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '3px' }}>{fav.date}</div>
                    </div>
                    <button onClick={() => setFavorites(prev => prev.filter(f => f.fav_id !== fav.fav_id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc' }}><Trash2 size={18} /></button>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>

        <div className="sidebar-footer">
          {!isLoading && user ? (
            <div className="footer-actions">
              <div className="sync-prompt" style={{ flexGrow: 1, fontWeight: 'bold' }}>{user.accountName}님 환영합니다 👋</div>
              <button className="settings-button" onClick={openModal}><Settings size={20} /></button>
            </div>
          ) : (
            <>
              <div className="sync-prompt">로그인하고 기록을 동기화 해보세요</div>
              <div className="footer-actions">
                <Link to="/login" className="login-button"><LogIn size={16} style={{marginRight:'5px'}}/> 로그인</Link>
                <button className="settings-button" onClick={openModal}><Settings size={20} /></button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <Modal isOpen={isModalOpen} onClose={closeModal} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />

      {/* 챗봇 컴포넌트 */}
      <AIChatBot searchResults={searchResults} /> 
    </>
  );
};

export default Home;