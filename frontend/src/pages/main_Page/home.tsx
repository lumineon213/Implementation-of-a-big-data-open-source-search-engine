import React, { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Search, Heart, Calendar, MapPin, Trash2, BookOpen, X, LogIn, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './home.css';
import Modal from '../../components/common/modal';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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
  favId: number;
  accountId: string;
  newsId?: number;
  travelId?: number;
  regDate: string;
  title: string;
  date: string;
  type: string;
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

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface SearchLog {
  logId: number;
  accountId: string;
  keyword: string;
  searchDate: string;
}

const Home: React.FC<HomeProps> = ({ searchResults, setSearchResults }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const SOLR_CORE_NAME = 'Search';

  // 상태 관리
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearched, setIsSearched] = useState<boolean>(false);
  const [isFavoriteSidebarOpen, setIsFavoriteSidebarOpen] = useState<boolean>(false);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchLog[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '안녕하세요! 축제에 대해 궁금한 점을 물어보세요. 🎪' }
  ]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 헬퍼 함수
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

  // 즐겨찾기 관련 함수들
  const fetchFavorites = async () => {
    try {
      const res = await axios.get('/api/favorite', { withCredentials: true });
      if (Array.isArray(res.data)) {
        // DB에서 받은 데이터를 FavoriteItem 형식으로 변환
        const formattedFavorites = res.data.map((item: any) => ({
          favId: item.favId,
          accountId: item.accountId,
          newsId: item.newsId,
          travelId: item.travelId,
          regDate: item.regDate,
          title: item.title,
          date: item.date,
          type: item.type,
          // id는 travelId 또는 newsId를 문자열로 변환
          id: item.travelId ? String(item.travelId) : (item.newsId ? String(item.newsId) : '')
        }));
        setFavorites(formattedFavorites);
      } else {
        setFavorites([]);
      }
    } catch (err: any) {
      console.error('즐겨찾기 불러오기 실패:', err);
      setFavorites([]);
    }
  };

  const saveFavorite = async (item: SolrResultItem) => {
    try {
      // travelId 또는 newsId를 숫자로 변환
      const travelId = item.type === 'TRAVEL' ? parseInt(item.id) : null;
      const newsId = item.type === 'NEWS' ? parseInt(item.id) : null;

      const favoriteDTO = {
        accountId: user?.accountId || '',
        travelId: travelId,
        newsId: newsId
      };

      await axios.post('/api/favorite', favoriteDTO, { withCredentials: true });
      await fetchFavorites(); // 저장 후 목록 갱신
    } catch (err: any) {
      console.error('즐겨찾기 저장 실패:', err);
      alert('즐겨찾기 저장에 실패했습니다.');
    }
  };

  const deleteFavorite = async (favId: number) => {
    try {
      await axios.delete(`/api/favorite/${favId}`, { withCredentials: true });
      await fetchFavorites(); // 삭제 후 목록 갱신
    } catch (err: any) {
      console.error('즐겨찾기 삭제 실패:', err);
      alert('즐겨찾기 삭제에 실패했습니다.');
    }
  };

  const toggleFavorite = async (item: SolrResultItem) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    const existingFavorite = favorites.find(f => {
      if (item.type === 'TRAVEL') {
        return f.travelId === parseInt(item.id);
      } else {
        return f.newsId === parseInt(item.id);
      }
    });

    if (existingFavorite) {
      // 즐겨찾기 제거
      await deleteFavorite(existingFavorite.favId);
    } else {
      // 즐겨찾기 추가
      await saveFavorite(item);
      if (!isFavoriteSidebarOpen) setIsFavoriteSidebarOpen(true);
    }
  };

  const isFavorite = (item: SolrResultItem): boolean => {
    if (item.type === 'TRAVEL') {
      return favorites.some(f => f.travelId === parseInt(item.id));
    } else {
      return favorites.some(f => f.newsId === parseInt(item.id));
    }
  };

  // 검색 기록 관련 함수들
  const fetchSearchHistory = async () => {
    try {
      const res = await axios.get('/api/search-log', { withCredentials: true });
      if (Array.isArray(res.data)) {
        const formattedData = res.data.map((item: any) => ({
          logId: Number(item.logId) || item.logId,
          accountId: item.accountId,
          keyword: item.keyword,
          searchDate: item.searchDate
        }));
        setSearchHistory(formattedData);
      } else {
        setSearchHistory([]);
      }
    } catch (err: any) {
      console.error('검색 기록 불러오기 실패:', err);
      setSearchHistory([]);
    }
  };

  const saveSearchLog = async (keyword: string) => {
    try {
      await axios.post('/api/search-log', { keyword }, { withCredentials: true });
      await fetchSearchHistory(); // 저장 후 목록 갱신
    } catch (err: any) {
      console.error('검색 기록 저장 실패:', err);
    }
  };

  const deleteSearchLog = async (logId: number) => {
    try {
      await axios.delete(`/api/search-log/${logId}`, { withCredentials: true });
      await fetchSearchHistory();
    } catch (err: any) {
      console.error('삭제 실패:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const clearAllSearchLogs = async () => {
    if (!confirm('모든 검색 기록을 삭제하시겠습니까?')) return;
    try {
      await axios.delete('/api/search-log/all', { withCredentials: true });
      await fetchSearchHistory();
    } catch (err) {
      console.error('전체 삭제 실패:', err);
    }
  };

  const handleHistoryClick = async (keyword: string) => {
    setSearchQuery(keyword);
    setError(null);
    setSearchResults([]);
    setLoading(true);
    setIsSearched(true);

    try {
      const flFields = 'id,title,description,start_date,end_date,place,address';
      const query = `q=${encodeURIComponent(keyword)}&defType=edismax&qf=title^3+place+description&rows=10&wt=json&fl=${flFields}`;
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

  // 세션 체크
  const checkSession = async () => {
    try {
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

  // Effects
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

  useEffect(() => {
    checkSession();
  }, [location.pathname]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  // 로그인 시 즐겨찾기와 검색 기록 불러오기
  useEffect(() => {
    if (user) {
      fetchFavorites();
      fetchSearchHistory();
    } else {
      setFavorites([]);
      setSearchHistory([]);
    }
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

  // 핸들러
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);
  const toggleFavoriteSidebar = () => {
    setIsFavoriteSidebarOpen(prev => !prev);
    if (isHistorySidebarOpen) setIsHistorySidebarOpen(false);
  };
  const toggleHistorySidebar = () => {
    setIsHistorySidebarOpen(prev => !prev);
    if (isFavoriteSidebarOpen) setIsFavoriteSidebarOpen(false);
  };
  const toggleChat = () => setIsChatOpen(prev => !prev);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // 검색
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      alert('검색어를 입력해 주세요.');
      return;
    }
    setLoading(true);
    setIsSearched(true);
    setError(null);

    try {
      const flFields = 'id,title,description,start_date,end_date,place,address';
      const query = `q=${encodeURIComponent(searchQuery)}&defType=edismax&qf=title^3+place+description&rows=10&wt=json&fl=${flFields}`;
      const url = `/solr/${SOLR_CORE_NAME}/select?${query}`;
      
      const response = await axios.get(url);
      setSearchResults(response.data.response.docs);

      // 검색 성공 시 기록 저장 (로그인 상태일 때만)
      if (user) {
        await saveSearchLog(searchQuery);
      }
    } catch (err) {
      console.error('검색 실패:', err);
      setError('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 챗봇 (RAG)
  const handleSendChat = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsAiThinking(true);

    try {
      const solrQuery = `q=${encodeURIComponent(userMsg)}&defType=edismax&qf=title^3+description&rows=5&wt=json`;
      const solrUrl = `/solr/${SOLR_CORE_NAME}/select?${solrQuery}`;
      
      let contextText = "";
      let totalFound = 0;

      try {
        const response = await axios.get(solrUrl);
        const docs = response.data.response.docs;
        totalFound = response.data.response.numFound;

        if (docs.length > 0) {
          contextText = JSON.stringify(docs.map((d: any) => ({
            축제명: d.title, 장소: d.place, 설명: d.description
          })));
        }
      } catch (err) { console.error(err); }

      if (!API_KEY) throw new Error("API Key가 없습니다.");
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        너는 한국 축제 전문가 AI야.
        [검색된 전체 데이터 개수]: ${totalFound}
        [제공된 정보]: ${contextText || "정보 없음"}
        [질문]: ${userMsg}
        
        위 정보를 바탕으로 답변해줘.
        만약 [검색된 전체 데이터 개수]가 제공된 정보보다 많다면, 답변 끝에 
        "> 💡 리스트가 많아 간략하게 소개해드렸습니다. 자세한 내용은 검색창을 이용해주세요." 
        라는 문구를 줄바꿈 후 추가해줘.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setMessages(prev => [...prev, { role: 'model', text: response.text() }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "오류가 발생했습니다." }]);
    } finally {
      setIsAiThinking(false);
    }
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
                  {/* 즐겨찾기 버튼 */}
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      toggleFavorite(result); 
                    }} 
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }}
                  >
                    <Heart size={24} fill={isFavorite(result) ? "#ef4444" : "none"} color={isFavorite(result) ? "#ef4444" : "#ccc"} />
                  </button>

                  <div className="result-meta">
                    {(result.start_date || result.end_date) && (
                      <span className="result-date">
                        <Calendar size={14} style={{marginRight:'4px'}}/> 
                        {formatDateRange(result.start_date, result.end_date)}
                      </span>
                    )}
                    {result.place && (
                      <span className="result-place">
                        <MapPin size={14} style={{marginRight:'4px'}}/> 
                        {result.place}
                      </span>
                    )}
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

      {/* 즐겨찾기 사이드바 버튼 */}
      <button className='favorite-toggle-button' onClick={toggleFavoriteSidebar}>
        <Heart size={24} color="#4a4a4a" fill={favorites.length > 0 ? "#ef4444" : "none"} />
      </button>

      {/* 검색 기록 사이드바 버튼 */}
      <button className='history-toggle-button' onClick={toggleHistorySidebar}>
        <BookOpen size={24} color="#4a4a4a" />
      </button>

      {/* 즐겨찾기 사이드바 */}
      <div className={`search-history-sidebar ${isFavoriteSidebarOpen ? 'is-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            즐겨찾기
            {user && favorites.length > 0 && (
              <span style={{fontSize:'0.8em', marginLeft:'5px'}}>
                ({favorites.length})
              </span>
            )}
          </div>
          <button className="close-sidebar-button" onClick={toggleFavoriteSidebar}><X size={24} /></button>
        </div>
        
        <div className="sidebar-content" style={{ display: 'block', overflowY: 'auto', textAlign: 'left', padding: '0' }}>
          {user ? (
            favorites.length > 0 ? (
              <div style={{ padding: '15px' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {favorites.map((fav) => (
                    <li key={fav.favId} style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1, marginRight: '10px' }}>
                        <div 
                          style={{ fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer' }} 
                          onClick={() => navigate(`/detail/${fav.travelId || fav.newsId}`)}
                        >
                          {fav.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '3px' }}>{fav.date}</div>
                      </div>
                      <button 
                        onClick={() => deleteFavorite(fav.favId)} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="no-history" style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
                <Heart size={40} style={{ color: '#ddd', marginBottom: '10px' }} />
                <p style={{color:'#999'}}>관심있는 정보를<br/>담아보세요.</p>
              </div>
            )
          ) : (
            <div className="no-history" style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
              <p>로그인하고 즐겨찾기를 저장해보세요</p>
            </div>
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

      {/* 검색 기록 사이드바 */}
      <div className={`search-history-sidebar ${isHistorySidebarOpen ? 'is-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            최근 검색어
            {user && searchHistory.length > 0 && (
              <span style={{fontSize:'0.8em', marginLeft:'5px'}}>
                ({searchHistory.length})
              </span>
            )}
          </div>
          <button className="close-sidebar-button" onClick={toggleHistorySidebar}><X size={24} /></button>
        </div>
        
        <div className="sidebar-content" style={{ display: 'block', overflowY: 'auto', textAlign: 'left', padding: '0' }}>
          {user ? (
            searchHistory.length > 0 ? (
              <div style={{ padding: '15px' }}>
                <div className="history-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>최근 검색어</h3>
                  <button className="clear-all-btn" onClick={clearAllSearchLogs}>
                    전체 삭제
                  </button>
                </div>
                <div className="search-history-list">
                  {searchHistory.map((log) => (
                    <div key={log.logId} className="history-item">
                      <span 
                        className="history-keyword" 
                        onClick={() => handleHistoryClick(log.keyword)}
                      >
                        🔍 {log.keyword}
                      </span>
                      <button 
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSearchLog(log.logId);
                        }}
                        title="삭제"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-history" style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
                <BookOpen size={40} style={{ color: '#ddd', marginBottom: '10px' }} />
                <p style={{color:'#999'}}>아직 기록이 없어요.<br/>새로운 검색을 해보세요.</p>
              </div>
            )
          ) : (
            <div className="no-history" style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
              <p>로그인하고 검색 기록을 저장해보세요</p>
            </div>
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
      
      {(isFavoriteSidebarOpen || isHistorySidebarOpen) && (
        <div 
          className="sidebar-overlay" 
          onClick={() => {
            setIsFavoriteSidebarOpen(false);
            setIsHistorySidebarOpen(false);
          }}
        ></div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />

      {/* 챗봇 */}
      <button className="chat-toggle-button" onClick={toggleChat}>💬</button>
      {isChatOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <span>축제 AI 도우미</span>
            <button onClick={toggleChat}><X size={20} color="white"/></button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}
            {isAiThinking && <div className="message thinking">답변 생성 중...</div>}
            <div ref={chatEndRef} />
          </div>
          <form className="chat-input-area" onSubmit={handleSendChat}>
            <input type="text" placeholder="질문을 입력하세요..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
            <button type="submit">전송</button>
          </form>
        </div>
      )}
    </>
  );
};

export default Home;
