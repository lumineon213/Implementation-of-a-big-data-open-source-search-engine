import React, { useState } from 'react';
import { Search, Heart, Calendar, MapPin, Trash2, BookOpen, X, LogIn, Settings } from 'lucide-react';
import './home.css'; // CSS 파일 임포트 필수

// --- [1] 데이터 타입 정의 ---
interface SearchResult {
  id: number;
  title: string;
  place?: string;
  date: string;
  desc: string;
  type: 'NEWS' | 'TRAVEL';
}

interface FavoriteItem {
  fav_id: number;
  id: number;
  title: string;
  date: string;
  type: 'NEWS' | 'TRAVEL';
}

const Home: React.FC = () => {
  
  // --- [2] 상태 관리 ---
  const [keyword, setKeyword] = useState<string>('');
  const [isSearched, setIsSearched] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  
  // 사이드바 토글 상태 (CSS에 정의된 사이드바 활용)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // --- [3] 검색 실행 함수 ---
  const handleSearch = () => {
    if (keyword.trim() === '') {
      alert('검색어를 입력해주세요.');
      return;
    }

    setIsSearched(true);
    
    // 더미 데이터 로직
    const isWinter = keyword.includes('겨울');
    const mockData: SearchResult[] = isWinter ? [
      { id: 201, title: '대관령 눈꽃 축제', place: '강원도 평창', date: '2025.12.15', desc: '하얀 눈과 함께하는 환상의 겨울 축제', type: 'TRAVEL' },
      { id: 202, title: '전국 스키장 개장 일정', place: '전국', date: '2025.11.20', desc: '올해 스키 시즌, 예년보다 1주 일찍 시작', type: 'NEWS' }
    ] : [
      { id: 101, title: '도구로 가을 축제', place: '도구머리공원', date: '2025.10.25', desc: '단풍길 스케치북 및 포토존 + 문화공연 운영', type: 'TRAVEL' },
      { id: 102, title: '오목공원 가을축제', place: '오목공원', date: '2025.09.20', desc: '가을 영화상영 및 체험부스 운영', type: 'TRAVEL' },
      { id: 501, title: '[뉴스] 설악산 단풍 절정 시기', place: '기상청', date: '2025.10.15', desc: '올해 단풍은 평년보다 늦어질 전망입니다.', type: 'NEWS' },
      { id: 103, title: '용마폭포 문화예술축제', place: '용마폭포공원', date: '2025.09.27', desc: '가을 분위기에 어울리는 고품격 공연', type: 'TRAVEL' }
    ];
    setSearchResults(mockData);
  };

  // --- [4] 즐겨찾기 추가/삭제 로직 ---
  const toggleFavorite = (item: SearchResult) => {
    const existingIndex = favorites.findIndex(f => f.id === item.id && f.type === item.type);

    if (existingIndex !== -1) {
      const newFavorites = favorites.filter((_, index) => index !== existingIndex);
      setFavorites(newFavorites);
    } else {
      const newFav: FavoriteItem = {
        fav_id: Date.now(),
        id: item.id,
        title: item.title,
        date: item.date,
        type: item.type
      };
      // 즐겨찾기 추가 시 사이드바가 열려있지 않다면 알림 효과를 줄 수도 있음
      setFavorites(prev => [...prev, newFav]);
      if(!isSidebarOpen) setIsSidebarOpen(true); // 편의상 추가 시 사이드바 오픈
    }
  };

  // 하트 색칠 여부
  const isFavorite = (item: SearchResult) => {
    return favorites.some(f => f.id === item.id && f.type === item.type);
  };

  return (
    // [CSS] home-container: 기본 레이아웃
    // [CSS] results-mode: 검색 후 상단 정렬 모드
    <div className={`home-container ${isSearched ? 'results-mode' : ''}`}>
      
      {/* === [A] 타이틀 === */}
      {/* 검색 결과 화면에서는 타이틀이 작아짐 (.results-mode .home-title 적용됨) */}
      <h1 className="home-title" onClick={() => window.location.reload()} style={{cursor: 'pointer'}}>
        KH.Solr
      </h1>

      {/* === [B] 검색창 영역 === */}
      <div className="search-form">
        <div className="search-container">
          <div className="search-bar">
            {/* [CSS] search-icon: 초록색 원형 장식 */}
            <div className="search-icon"></div>
            
            <input
              type="text"
              className="search-input"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="검색어를 입력하세요 (예: 가을, 축제)"
            />
            
            <button className="search-button" onClick={handleSearch}>
              <Search size={18} color="white" />
            </button>
          </div>
        </div>
      </div>

      {/* === [C] 검색 결과 리스트 === */}
      {isSearched && (
        <div className="search-results-list">
           {searchResults.length === 0 ? (
             <div className="no-results-message">
               <p>검색 결과가 없습니다.</p>
             </div>
           ) : (
             searchResults.map((item) => (
               <div key={`${item.type}-${item.id}`} className="result-item">
                 
                 {/* 메타 정보 (태그, 날짜) */}
                 <div className="result-meta">
                   <span style={{ color: item.type === 'NEWS' ? '#16a34a' : '#9333ea' }}>
                     [{item.type === 'NEWS' ? '뉴스' : '관광'}]
                   </span>
                   <span className="result-date">
                     <Calendar size={14} style={{ marginRight: '4px' }} />
                     {item.date}
                   </span>
                 </div>

                 {/* 제목 및 즐겨찾기 버튼 */}
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3>{item.title}</h3>
                    <button 
                      onClick={() => toggleFavorite(item)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Heart 
                        size={24} 
                        fill={isFavorite(item) ? "#ef4444" : "none"} 
                        color={isFavorite(item) ? "#ef4444" : "#ccc"} 
                      />
                    </button>
                 </div>

                 {/* 주소 (관광지인 경우만) */}
                 {item.place && (
                   <div className="result-address">
                     {item.place}
                   </div>
                 )}

                 {/* 설명 */}
                 <p>{item.desc}</p>
               </div>
             ))
           )}
        </div>
      )}

      {/* === [D] 사이드바 (즐겨찾기/히스토리) === */}
      
      {/* 1. 사이드바 토글 버튼 (화면 왼쪽 하단 고정) */}
      <button className="history-toggle-button" onClick={() => setIsSidebarOpen(true)}>
        <BookOpen size={24} className="book-icon" />
      </button>

      {/* 2. 사이드바 본체 */}
      <div className={`search-history-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        
        {/* 헤더 */}
        <div className="sidebar-header">
          <span className="sidebar-logo">나의 찜 목록 ({favorites.length})</span>
          <button className="close-sidebar-button" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* 컨텐츠 (즐겨찾기 목록) */}
        <div className="sidebar-content" style={{ display: 'block', overflowY: 'auto', textAlign: 'left' }}>
          {favorites.length === 0 ? (
            <div className="no-history" style={{ textAlign: 'center', marginTop: '50px' }}>
              <Heart size={40} style={{ color: '#ddd', marginBottom: '10px' }} />
              <p>관심있는 정보를<br/>담아보세요.</p>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {favorites.map((fav) => (
                <li key={fav.fav_id} style={{ 
                    padding: '10px', 
                    borderBottom: '1px solid #eee', 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center' 
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: fav.type === 'NEWS' ? 'green' : 'purple' }}>
                      {fav.type === 'NEWS' ? '뉴스' : '관광'}
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{fav.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>{fav.date}</div>
                  </div>
                  <button 
                    onClick={() => setFavorites(prev => prev.filter(f => f.fav_id !== fav.fav_id))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 푸터 (로그인/설정) */}
        <div className="sidebar-footer">
          <div className="footer-actions">
            <button className="login-button">
              <LogIn size={16} style={{ display: 'inline', marginRight: '5px' }} />
              로그인
            </button>
            <button className="settings-button">
              <Settings size={18} color="#666" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. 사이드바 오버레이 (바깥 클릭 시 닫힘) */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

    </div>
  );
};

export default Home;