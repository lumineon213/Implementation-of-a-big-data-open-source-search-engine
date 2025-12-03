import React, { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './home.css';
import Modal from '../../components/common/modal';

import { GoogleGenerativeAI } from "@google/generative-ai"; // 챗봇용


// .env 키 사용
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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

// Props 정의 (App.tsx에서 받아옴)
interface HomeProps {
  searchResults: SolrResultItem[];
  setSearchResults: React.Dispatch<React.SetStateAction<SolrResultItem[]>>;
}

// 챗봇 메시지 타입
interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const Home: React.FC<HomeProps> = ({ searchResults, setSearchResults }) => {
  // --- 상태 관리 ---
  
  // 1) 검색 관련 (기존 유지)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 2) UI 및 세션 관련 (기존 유지)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // 세션 로딩 상태
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // localStorage에서 다크모드 설정 읽기
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  // 3) 🤖 챗봇 관련 (새로 추가됨)
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '안녕하세요! 축제에 대해 궁금한 점을 물어보세요. 🎪' }
  ]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const SOLR_CORE_NAME = 'Search'; 

  // --- 헬퍼 함수 (기존 유지) ---
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

  const formatDateRange = (start?: string, end?: string): string => {
    if (!start) return '날짜 미정';
    const startStr = formatDate(start);
    if (!end) return startStr;
    const endStr = formatDate(end);
    return `${startStr} ~ ${endStr}`;
  };

  // --- 세션(로그인) 관리 로직 (팀원 코드 100% 유지) ---
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

  // 다크모드 적용
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    // localStorage에 저장
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  // 컴포넌트 마운트 시 다크모드 적용
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    }
  }, []);
  // 챗봇 자동 스크롤 (새로 추가됨)
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);


  // --- 이벤트 핸들러 ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const toggleChat = () => setIsChatOpen(prev => !prev); // 챗봇 토글

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Solr 검색 요청
  // Solr 검색 요청 (기존 유지)
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

  // 🤖 챗봇 전송 로직 (새로 추가됨 - RAG)
  const handleSendChat = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsAiThinking(true);

    try {
      // 1. Solr RAG 검색 (챗봇이 참고할 정보 찾기)
      const solrQuery = `q=${encodeURIComponent(userMsg)}&defType=edismax&qf=title^3+description&rows=3&wt=json`;
      const solrUrl = `/solr/${SOLR_CORE_NAME}/select?${solrQuery}`;
      
      let contextText = "";
      try {
        const response = await axios.get(solrUrl);
        const docs = response.data.response.docs;
        if (docs.length > 0) {
          contextText = JSON.stringify(docs.map((d: any) => ({
            축제명: d.title,
            장소: d.place,
            설명: d.description
          })));
        }
      } catch (err) {
        console.error("챗봇 검색 실패:", err);
      }

      // 2. Gemini 호출
      if (!API_KEY) throw new Error("API Key가 없습니다.");
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        [축제 정보]: ${contextText ? contextText : "정보 없음"}
        [질문]: ${userMsg}
        위 정보를 바탕으로 친절하게 답변해줘.
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
      {/* 1. 메인 화면 (기존 유지) */}
      <div className={`home-container ${searchResults.length > 0 ? 'results-mode' : ''}`}>
        <h1 className="home-title">KH.Solr AI 검색</h1>
        
        <form className="search-form" onSubmit={handleSubmit}>
          <div className="search-container">
            <div className="search-bar">
              <div className="search-icon"></div>
              <input type="text" className="search-input" placeholder="가장 빠른 AI 검색" value={searchQuery} onChange={handleInputChange} />
              <button type="submit" className="search-button" disabled={loading}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 11L10 6M10 6L6 6M10 6L10 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
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
                    <span className="result-date">📅 {formatDateRange(result.start_date, result.end_date)}</span>
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

      {/* 2. 사이드바 (팀원 코드 100% 유지) */}
      <button className='history-toggle-button' onClick={toggleSidebar}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="book-icon">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </button>

      <div className={`search-history-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">KH.solr</div>
          <button className="close-sidebar-button" onClick={toggleSidebar}>&times;</button>
        </div>
        <div className="sidebar-content">
          <div className="no-history"><p>아직 기록이 없어요.</p><p>새로운 검색을 해보세요.</p></div>
        </div>
        <div className="sidebar-footer">
          {!isLoading && user ? (
            <div className="footer-actions">
              <div className="sync-prompt" style={{ flexGrow: 1, fontWeight: 'bold' }}>
                {user.accountName}님 환영합니다 👋
              </div>
              <button className="settings-button" onClick={openModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.74a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.74a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.74a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.74a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </button>
            </div>
          ) : (
            <>
              <div className="sync-prompt">로그인하고 기록을 동기화 해보세요</div>
              <div className="footer-actions">
                <Link to="/login" className="login-button">
                  로그인
                </Link>
                <button className="settings-button" onClick={openModal}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.74a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.74a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.74a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.74a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      {/* 모달 */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />
      {/* 3. 챗봇 UI (새로 추가됨) */}
      <button className="chat-toggle-button" onClick={toggleChat}>
        💬
      </button>

      {isChatOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <span>축제 AI 도우미</span>
            <button onClick={toggleChat}>&times;</button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {isAiThinking && <div className="message model thinking">답변 생성 중...</div>}
            <div ref={chatEndRef} />
          </div>
          <form className="chat-input-area" onSubmit={handleSendChat}>
            <input 
              type="text" 
              placeholder="질문을 입력하세요..." 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
            />
            <button type="submit">전송</button>
          </form>
        </div>
      )}
    </>
  );
};

export default Home;