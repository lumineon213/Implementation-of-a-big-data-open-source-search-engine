import React, { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Search, Heart, Calendar, MapPin, Trash2, BookOpen, X, LogIn, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './home.css';
import Modal from '../../components/common/modal';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown'; 

// .env 키 사용
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
  fav_id: number;
  id: string;
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

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Props 정의
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  
  // 다크모드
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  // 챗봇
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '안녕하세요! 축제에 대해 궁금한 점을 물어보세요. 🎪' }
  ]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
      if(!isSidebarOpen) setIsSidebarOpen(true);
    }
  };

  const isFavorite = (item: SolrResultItem) => {
    return favorites.some(f => f.id === item.id);
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

  // --- 핸들러 ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
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
              
              {/* ▼▼▼ [수정됨] 초록색 동그라미(div)는 남기고, 내부 아이콘(Search)만 삭제함 ▼▼▼ */}
              <div className="search-icon">
                 {/* <Search size={20} />  <-- 돋보기 삭제됨! */}
              </div> 
              
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

      {/* 사이드바 */}
      <button className='history-toggle-button' onClick={toggleSidebar}>
        <BookOpen size={24} color="#4a4a4a" />
      </button>

      <div className={`search-history-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">KH.solr {favorites.length > 0 && <span style={{fontSize:'0.8em', marginLeft:'5px'}}>({favorites.length})</span>}</div>
          <button className="close-sidebar-button" onClick={toggleSidebar}><X size={24} /></button>
        </div>
        
        <div className="sidebar-content" style={{ display: 'block', overflowY: 'auto', textAlign: 'left', padding: '0' }}>
          {favorites.length === 0 ? (
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