import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import axios from 'axios';
import './Home.css';

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

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SolrResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Solr 코어 이름
  const SOLR_CORE_NAME = 'Search'; 

  // Solr 날짜 형식을 YYYY-MM-DD로 변환
  const formatDate = (isoDate: string | undefined): string => {
  if (!isoDate) return '날짜 미정';
  try {
    const date = new Date(isoDate); // 날짜 객체로 변환
    
    // 유효하지 않은 날짜면 원래 문자열 반환
    if (isNaN(date.getTime())) return isoDate; 

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월 (0부터 시작하므로 +1)
    const day = String(date.getDate()).padStart(2, '0'); // 일

    return `${year}.${month}.${day}`; // 2025.06.27 형식
     } catch {
      return isoDate;
    }
  };

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
      // Solr이 반환해야 할 필드 목록 (title, date, place, address 포함)
      const flFields = 'id,title,description,start_date,place,address'; 
      
      const query = 
        `q=${encodeURIComponent(searchQuery)}` + 
        `&defType=edismax` + 
        `&qf=title^3+place+description` + 
        `&rows=10` + 
        `&wt=json` +
        `&fl=${flFields}`;
        
      // ⭐️ 최적화된 Solr 요청 URL: /solr 프록시 + 코어 이름 + 핸들러
      const url = `/solr/${SOLR_CORE_NAME}/select?${query}`; 
      
      console.log('Solr 요청 URL:', url);

      const response = await axios.get(url);
      
      const docs = response.data.response.docs as SolrResultItem[];
      setSearchResults(docs);
      
      console.log('검색 성공:', docs);

    } catch (err) {
      console.error('검색 실패:', err);
      if (axios.isAxiosError(err) && err.response) {
          setError(`검색 실패: ${err.response.status} (${err.response.statusText}). 서버 및 Solr 경로를 확인해 주세요.`);
      } else {
          setError('검색 중 오류가 발생했습니다. 서버 상태를 확인해 주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
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
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 11L10 6M10 6L6 6M10 6L10 10"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
        {/* 상태 및 오류 메시지 출력 */}
        {loading && <p className="status-message">검색 중...</p>}
        {error && <p className="error-message">{error}</p>}
      </form>

      <div className="search-results-list">
        {searchResults.length > 0 ? (
          searchResults.map((result, index) => (
            <div key={index} className="result-item">
              
              <div className="result-meta">
                {result.start_date && <span className="result-date">📅 {formatDate(result.start_date)}</span>}
                {result.place && <span className="result-place">📍 {result.place}</span>}
              </div>
              
              <h3>{result.title}</h3>
              
              {/* 주소 정보 출력 */}
              {result.address && <p className="result-address">{result.address}</p>} 
              
              <p>{result.description || '내용 없음'}</p>
            </div>
          ))
        ) : (
          !loading && !error && searchQuery.trim() && (
            <p className="no-results-message">검색 결과가 없습니다.</p>
          )
        )}
      </div>

    </div>
  );
};

export default Home;