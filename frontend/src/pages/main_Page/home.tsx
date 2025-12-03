import React, { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './home.css';
import Modal from '../../components/common/modal';
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  [key: string]: any; 
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
  // 기존 상태들...
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '안녕하세요! 축제에 대해 궁금한 점을 물어보세요. 🎪' }
  ]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  //검색 기록 추ㄱ ㅏ 
  const [searchHistory, setSearchHistory] = useState<SearchLog[]>([]);

  const location = useLocation();
  const SOLR_CORE_NAME = 'Search'; 

  // 헬퍼 함수 (기존 유지)
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

  // 검색 기록 관련 함수들 
  
  // 검색 기록 불러오기
  const fetchSearchHistory = async () => {
    try {
      console.log('검색 기록 불러오기 시도');
      const res = await axios.get('/api/search-log', { withCredentials: true });
      console.log('검색 기록 불러오기 성공:', res);
      console.log('전체 응답:', JSON.stringify(res.data, null, 2));
      console.log('데이터 타입:', Array.isArray(res.data) ? '배열' : typeof res.data);
      console.log('데이터 길이:', Array.isArray(res.data) ? res.data.length : '배열 아님');
      
      // 배열인지 확인하고 설정
      if (Array.isArray(res.data)) {
        console.log('검색 기록 배열 설정:', res.data);
        // 데이터 형식 확인 및 변환
        const formattedData = res.data.map((item: any) => ({
          logId: Number(item.logId) || item.logId,
          accountId: item.accountId,
          keyword: item.keyword,
          searchDate: item.searchDate
        }));
        console.log('포맷팅된 데이터:', formattedData);
        setSearchHistory(formattedData);
        console.log('searchHistory 상태 업데이트 완료');
      } else {
        console.warn('응답이 배열이 아닙니다:', res.data);
        setSearchHistory([]);
      }
    } catch (err: any) {
      console.error('검색 기록 불러오기 실패:', err);
      if (err.response) {
        console.error('응답 상태:', err.response.status);
        console.error('응답 데이터:', err.response.data);
      }
      setSearchHistory([]);
    }
  };

  // 검색 기록 저장
  const saveSearchLog = async (keyword: string) => {
    try {
      console.log('검색 기록 저장 시도:', keyword);
      const response = await axios.post('/api/search-log', 
        { keyword }, 
        { withCredentials: true }
      );
      console.log('검색 기록 저장 성공:', response);
      fetchSearchHistory(); // 저장 후 목록 갱신
    } catch (err: any) {
      console.error('검색 기록 저장 실패:', err);
      if (err.response) {
        console.error('응답 상태:', err.response.status);
        console.error('응답 데이터:', err.response.data);
      }
    }
  };

  // 검색 기록 개별 삭제
  const deleteSearchLog = async (logId: number) => {
    try {
      console.log('검색 기록 삭제 시도:', logId);
      console.log('logId 타입:', typeof logId);
      console.log('logId 값:', logId);
      
      const response = await axios.delete(`/api/search-log/${logId}`, { 
        withCredentials: true 
      });
      console.log('검색 기록 삭제 성공:', response);
      console.log('삭제 후 목록 갱신 시작');
      await fetchSearchHistory();
      console.log('목록 갱신 완료');
    } catch (err: any) {
      console.error('삭제 실패:', err);
      if (err.response) {
        console.error('응답 상태:', err.response.status);
        console.error('응답 데이터:', err.response.data);
        console.error('응답 헤더:', err.response.headers);
      }
      if (err.request) {
        console.error('요청 정보:', err.request);
      }
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 검색 기록 전체 삭제
  const clearAllSearchLogs = async () => {
    if (!confirm('모든 검색 기록을 삭제하시겠습니까?')) return;
    
    try {
      await axios.delete('/api/search-log/all', { withCredentials: true });
      fetchSearchHistory();
    } catch (err) {
      console.error('전체 삭제 실패:', err);
    }
  };

  // 세션 체크 (기존 유지)
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

  // useEffect들
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

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    }
  }, []);

  //로그인 시 검색 기록 불러오기
  useEffect(() => {
    console.log('user 상태 변경:', user);
    if (user) {
      console.log('사용자 로그인됨, 검색 기록 불러오기 시작 - accountId:', user.accountId);
      fetchSearchHistory();
    } else {
      console.log('사용자 로그아웃됨, 검색 기록 초기화');
      setSearchHistory([]); // 로그아웃 시 기록 초기화
    }
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

  // 이벤트 핸들러
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const toggleChat = () => setIsChatOpen(prev => !prev);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  //Solr 검색 요청 (검색 기록 저장 추가)
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

      //검색 성공 시 기록 저장 (로그인 상태일 때만)
      if (user) {
        console.log('사용자 로그인 상태 확인, 검색 기록 저장 시작');
        await saveSearchLog(searchQuery);
        // 저장 후 즉시 목록 갱신
        setTimeout(() => {
          fetchSearchHistory();
        }, 300);
      } else {
        console.log('사용자 미로그인 상태, 검색 기록 저장 안 함');
      }

    } catch (err) {
      console.error('검색 실패:', err);
      setError('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  //검색 기록 클릭 시 재검색
  const handleHistoryClick = async (keyword: string) => {
    setSearchQuery(keyword);
    setError(null);
    setSearchResults([]);
    setLoading(true);

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

  // 챗봇 전송 로직 (기존 유지)
  const handleSendChat = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsAiThinking(true);

    try {
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
      {/* 메인 화면 */}
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

      {/*사이드바 (검색 기록 표시) */}
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
        
        {/*검색 기록 영역 */}
        <div className="sidebar-content">
          {(() => {
            const hasUser = !!user;
            const hasHistory = searchHistory && searchHistory.length > 0;
            console.log('사이드바 렌더링:', { hasUser, hasHistory, historyLength: searchHistory?.length, history: searchHistory });
            
            if (hasUser && hasHistory) {
              return (
                <div className="search-history-list">
                  <div className="history-header">
                    <h3>최근 검색어</h3>
                    <button className="clear-all-btn" onClick={clearAllSearchLogs}>
                      전체 삭제
                    </button>
                  </div>
                  {searchHistory.map((log, index) => {
                    const logId = log.logId || index;
                    console.log('검색 기록 렌더링:', { logId, keyword: log.keyword, log, originalLogId: log.logId });
                    return (
                      <div key={logId} className="history-item">
                        <span 
                          className="history-keyword" 
                          onClick={() => handleHistoryClick(log.keyword)}
                        >
                          🔍 {log.keyword}
                        </span>
                        <button 
                          className="delete-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('삭제 버튼 클릭:', { logId, originalLogId: log.logId, log });
                            deleteSearchLog(Number(log.logId || logId));
                          }}
                          title="삭제"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            } else {
              return (
                <div className="no-history">
                  <p>아직 기록이 없어요.</p>
                  <p>새로운 검색을 해보세요.</p>
                </div>
              );
            }
          })()}
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* 챗봇 UI */}
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