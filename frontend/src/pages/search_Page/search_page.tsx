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
  image_url?: string;
  _core?: string;  // 백엔드에서 전달되는 코어 이름
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 3열 * 4행 = 12개

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
      setCurrentPage(1); // 검색 시 첫 페이지로 리셋
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

  // 카테고리별 상세 페이지 경로 생성
  const getDetailPath = (result: SearchResult): string => {
    const core = result._core || '';
    const category = result.category || '';

    // 코어 이름에 따라 경로 결정
    switch (core) {
      case 'Search':
        return `/tour/view/${result.id}`;
      case 'stay_core':
        return `/info/stay/${result.id}`;
      case 'food_core':
        return `/food/${result.id}`;
      case 'shopping_core':
        return `/shopping/${result.id}`;
      case 'marine_core':
        return `/course/marine/${result.id}`;
      case 'urban_core':
        return `/course/urban/${result.id}`;
      case 'walk_core':
        return `/course/walk/${result.id}`;
      case 'festival_core':
        return `/festival/${result.id}`;
      case 'theme_core':
        return `/course/theme/${result.id}`;
      default:
        // 카테고리로 대체 시도
        switch (category) {
          case '관광지':
            return `/tour/view/${result.id}`;
          case '숙박':
            return `/info/stay/${result.id}`;
          case '맛집':
            return `/food/${result.id}`;
          case '쇼핑':
            return `/shopping/${result.id}`;
          case '해양':
            return `/course/marine/${result.id}`;
          case '도시':
            return `/course/urban/${result.id}`;
          case '걷기':
            return `/course/walk/${result.id}`;
          case '축제':
            return `/festival/${result.id}`;
          case '테마':
            return `/course/theme/${result.id}`;
          default:
            // 기본값: 관광지로 가정
            return `/tour/view/${result.id}`;
        }
    }
  };

  // 페이징 계산
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResults = results.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
            {['전체', '관광지', '숙박', '맛집', '쇼핑', '해양', '도시', '걷기', '축제', '테마'].map((cat) => (
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
          <>
            <div className="results-grid">
              {currentResults.map((result) => (
                <div
                  key={result.id}
                  className="result-card"
                  onClick={() => navigate(getDetailPath(result))}
                >
                  {/* 이미지 */}
                  {result.image_url && (
                    <div className="result-image-container">
                      <img 
                        src={result.image_url} 
                        alt={result.title}
                        className="result-image"
                        onError={(e) => {
                          // 이미지 로드 실패 시 기본 이미지로 대체
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="result-card-content">
                    <div className="result-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        {result.category && (
                          <span style={{
                            backgroundColor: '#f0f0f0',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#666'
                          }}>
                            {result.category}
                          </span>
                        )}
                      </div>
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
                </div>
              ))}
            </div>

            {/* 페이징 */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  이전
                </button>
                
                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // 현재 페이지 기준 앞뒤 2페이지씩만 표시
                      return page === 1 || 
                             page === totalPages || 
                             (page >= currentPage - 2 && page <= currentPage + 2);
                    })
                    .map((page, index, array) => {
                      // 중간 생략 표시
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && <span className="pagination-ellipsis">...</span>}
                          <button
                            className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  다음
                </button>
              </div>
            )}
          </>
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
