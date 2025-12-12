import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Star } from 'lucide-react';
import './search_page.css';

// Solr 검색 결과 타입
interface SearchResult {
  id: string;
  title: string;
  description?: string;
  place?: string;
  address?: string;
  category?: string;
  [key: string]: any;
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const SOLR_CORE_NAME = 'Search';

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '전체');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  // 검색 실행
  useEffect(() => {
    const searchQuery = searchParams.get('q');
    const searchCategory = searchParams.get('category');

    // 검색어나 카테고리가 있으면 검색, 없으면 전체 데이터 표시
    performSearch(searchQuery || '', searchCategory || '전체');
  }, [searchParams]);

  const performSearch = async (searchText: string, searchCategory: string) => {
    try {
      setLoading(true);

      // 검색 쿼리 설정
      let query = searchText && searchText.trim() ? searchText : '*:*';

      console.log('검색 요청:', { query, category: searchCategory });

      const response = await axios.get('/api/solr/search', {
        params: {
          query: query,
          rows: 100
        }
      });

      console.log('Solr 전체 응답:', response);
      console.log('Solr 데이터:', response.data);

      // API 응답 형식 확인
      let docs = [];
      if (response.data && response.data.list) {
        docs = response.data.list;
      } else if (response.data && Array.isArray(response.data)) {
        docs = response.data;
      } else if (response.data && response.data.response && response.data.response.docs) {
        docs = response.data.response.docs;
      }

      console.log('검색 결과:', docs);
      console.log('결과 수:', docs.length);

      // 카테고리 필터링 (전체가 아닌 경우)
      let filteredDocs = docs;
      if (searchCategory && searchCategory !== '전체') {
        filteredDocs = docs.filter((doc: any) =>
          doc.category && doc.category.includes(searchCategory)
        );
      }

      setResults(filteredDocs);
      setTotalResults(filteredDocs.length);
    } catch (error: any) {
      console.error('검색 실패:', error);
      console.error('에러 상세:', error.response?.data || error.message);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
    }
  };

  const handleCategoryClick = (cat: string) => {
    setCategory(cat);
    if (cat === '전체') {
      setSearchParams({ q: query });
    } else {
      setSearchParams({ q: query, category: cat });
    }
  };

  return (
    <div className="search-page">
      {/* 검색창 */}
      <div className="search-header">
        <div className="search-container">
          <h1 className="search-title">부산 여행지 검색</h1>

          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="여행지, 맛집, 관광지를 검색해보세요..."
                className="search-input"
              />
              <button type="submit" className="search-button">검색</button>
            </div>
          </form>

          {/* 카테고리 필터 */}
          <div className="category-filters">
            {['전체', '가족여행', '커플데이트', '맛집투어', '액티비티', '힐링', '문화예술'].map((cat) => (
              <button
                key={cat}
                className={`category-filter ${category === cat ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="search-results-container">
        <div className="results-header">
          {loading ? (
            <p>검색 중...</p>
          ) : (
            <p className="results-count">
              {query && <span className="search-keyword">"{query}"</span>}
              {totalResults > 0 ? (
                <> 검색 결과 <strong>{totalResults}</strong>개</>
              ) : (
                ' 검색 결과가 없습니다'
              )}
            </p>
          )}
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="results-grid">
            {results.map((result) => (
              <div
                key={result.id}
                className="result-card"
                onClick={() => navigate(`/detail/${result.id}`)}
              >
                <div className="result-card-header">
                  <h3 className="result-title">{result.title}</h3>
                  {result.place && (
                    <span className="result-place">
                      <MapPin size={14} />
                      {result.place}
                    </span>
                  )}
                </div>

                {result.address && (
                  <p className="result-address">{result.address}</p>
                )}

                {result.description && (
                  <p className="result-description">
                    {result.description.length > 150
                      ? result.description.substring(0, 150) + '...'
                      : result.description}
                  </p>
                )}

                <div className="result-footer">
                  <span className="view-detail">자세히 보기 →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="no-results">
            <p>검색 결과가 없습니다.</p>
            <p className="no-results-hint">다른 키워드로 검색해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
