// src/pages/info/NewsSearch.tsx

import React, { useState } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify'; 
import './newsSearch.css'; 

interface NewsItem {
    title: string;
    originallink: string;
    description: string;
    pubDate: string; 
}

interface NewsResponse {
    items: NewsItem[];
    total: number;
    lastBuildDate: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8484"; 

const NewsSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [newsData, setNewsData] = useState<NewsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [currentPage, setCurrentPage] = useState(1); 
    const [total, setTotal] = useState(0); 
    const [searchInput, setSearchInput] = useState("");
    const [inputPage, setInputPage] = useState("");

    const [sort, setSort] = useState('date');
    // 🚨 dateFilter 상태 제거

    const itemsPerPage = 10;
    const pageGroupSize = 10;

    const cleanHtml = (html: string) => {
        if (!html) return '';
        let cleaned = html.replace(/<\/?b>/g, '');
        cleaned = cleaned.replace(/&quot;/g, '"');
        cleaned = cleaned.replace(/&apos;/g, "'");
        return DOMPurify.sanitize(cleaned, {ALLOWED_TAGS: []});
    };

    const formatPubDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('ko-KR', { 
                year: 'numeric', month: '2-digit', day: '2-digit', 
                hour: '2-digit', minute: '2-digit' 
            });
        } catch {
            return dateString;
        }
    };
    
    // --- API 호출 로직 (filter 파라미터 제거) ---
    const fetchNews = async (searchQuery: string, page: number, currentSort: string) => { // 🚨 filter 제거
        if (searchQuery.trim() === '') {
            setNewsData(null);
            setTotal(0);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get<NewsResponse>(
                `${API_BASE_URL}/api/naver/news`,
                { params: { 
                    query: searchQuery, 
                    display: itemsPerPage,
                    page: page, 
                    sort: currentSort,
                } } // 🚨 dateFilter 제거
            );
            
            setNewsData(response.data);
            setTotal(response.data.total || 0);
            setCurrentPage(page);
            
        } catch (err) {
            console.error("뉴스 검색 실패:", err);
            setError("뉴스 데이터를 불러오는 데 실패했습니다. 서버 상태를 확인해주세요.");
            setNewsData({ items: [], total: 0, lastBuildDate: '' });
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    // --- 핸들러 및 로직 ---
    
    const totalPages = total > 0 ? Math.ceil(Math.min(total, 1000) / itemsPerPage) : 1;
    
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchNews(query, newPage, sort); // 🚨 filter 제거
            window.scrollTo(0, 0); 
        }
    };

    const handleSearch = (e: React.FormEvent | null) => {
        if(e) e.preventDefault(); 
        
        if (searchInput.trim() !== "") {
            setQuery(searchInput);
            fetchNews(searchInput, 1, sort); // 🚨 filter 제거
        } else if (query !== "" && searchInput.trim() === "") {
            setQuery("");
            setSearchInput("");
            setNewsData(null);
            setTotal(0);
        } else {
             fetchNews(query, 1, sort); // 🚨 filter 제거
        }
    };
    
    // 🚨 [수정] newFilter 관련 파라미터 및 로직 제거
    const handleSortChange = (newSort: string) => {
        setSort(newSort);
        
        if (query.trim() !== "") {
            fetchNews(query, 1, newSort); 
        }
    }
    
    const handleJumpToPage = () => {
        const pageNum = Number(inputPage);
        if (!inputPage || isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
            alert(`1부터 ${totalPages} 사이의 페이지를 입력해주세요.`);
            return;
        }
        fetchNews(query, pageNum, sort); // 🚨 filter 제거
        setInputPage("");
        window.scrollTo(0, 0);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: 'search' | 'jump') => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            if (type === 'search') handleSearch(null); 
            else handleJumpToPage();
        }
    };
    
    const startPage = Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1;
    const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

    if (loading && total === 0) return <div style={{padding: '100px', textAlign: 'center'}}>뉴스 데이터를 불러오는 중입니다...</div>;

    // --- 렌더링 시작 ---
    const renderPagination = () => {
        // ... (페이징 UI 렌더링 로직은 이전과 동일)
        if (!newsData || newsData.total === 0) return null;

        const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

        return (
            <div className="pagination-wrapper">
                
                <div className="pagination-numbers">
                    
                    <button 
                        onClick={() => handlePageChange(startPage - pageGroupSize)} 
                        disabled={startPage === 1} 
                        className="page-btn prev-next group-prev"
                    >
                        {'<<'}
                    </button>

                    <button 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1} 
                        className="page-btn prev-next single-prev"
                    >
                        {'<'}
                    </button>

                    {pages.map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`page-btn ${currentPage === pageNum ? "active" : ""}`}
                        >
                            {pageNum}
                        </button>
                    ))}

                    <button 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages} 
                        className="page-btn prev-next single-next"
                    >
                        {'>'}
                    </button>

                    <button 
                        onClick={() => handlePageChange(endPage + 1)} 
                        disabled={endPage === totalPages} 
                        className="page-btn prev-next group-next"
                    >
                        {'>>'}
                    </button>
                </div>

                <div className="pagination-jump">
                    <input 
                    type="number" 
                    value={inputPage}
                    onChange={(e) => setInputPage(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'jump')}
                    placeholder={`1 ~ ${totalPages}`}
                    className="jump-input"
                    />
                    <button 
                        onClick={handleJumpToPage} 
                        className="jump-btn"
                    >
                        이동
                    </button>
                </div>

            </div>
        );
    };

    return (
        <div className="news-search-container">
            <h2 className="page-title">
                📰 Naver 뉴스 검색
            </h2>
            
            <div className="search-guide-text">
                부산 여행에 관련된 기사를 찾아보세요
            </div>
            
            <form onSubmit={handleSearch}>
                <div className="search-box-wrapper">
                    <input 
                        type="text" 
                        placeholder="검색할 키워드를 입력하세요" 
                        className="main-search-input"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, 'search')}
                    />
                    <button 
                        type="submit" 
                        className="main-search-btn" 
                        disabled={loading}
                    >
                        {loading ? '검색 중...' : '검색'}
                    </button>
                </div>
            </form>

            {/* 🚨 [수정] filter-options-container에서 날짜 필터 옵션 제거 */}
            <div className="filter-options-container">
                
                {/* 정렬 옵션만 유지 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label>정렬:</label>
                    <select 
                        value={sort} 
                        onChange={(e) => handleSortChange(e.target.value)} // 🚨 handleSortChange로 변경
                        disabled={loading}
                    >
                        <option value="date">최신순</option>
                        <option value="sim">관련성순</option>
                    </select>
                </div>
            </div>
            
            {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>{error}</div>}

            {total === 0 && query ? (
                <div className="no-result" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                    '{query}'에 대한 검색 결과가 없거나, 필터링되었습니다.
                </div>
            ) : newsData && newsData.items.length > 0 ? (
                <>
                    <div className="total-count">
                        '{query}' 검색 결과 총 <b>{newsData.total.toLocaleString()}</b>건 
                        <span>
                            (현재 {currentPage} 페이지 / 총 {totalPages} 페이지)
                        </span>
                    </div>
                    
                    <div className="news-results-list">
                        {newsData.items.map((item, index) => (
                            <div key={index} className="news-item">
                                <h3>
                                    <a 
                                        href={item.originallink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        dangerouslySetInnerHTML={{ __html: cleanHtml(item.title) }}
                                    ></a>
                                </h3>
                                <p 
                                    dangerouslySetInnerHTML={{ __html: cleanHtml(item.description) }}
                                />
                                <div className="news-item-info">
                                    <span>원본 링크: <a href={item.originallink} target="_blank" rel="noopener noreferrer">{item.originallink.split('/')[2]}</a></span>
                                    <span>게시일: {formatPubDate(item.pubDate)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {renderPagination()} 
                </>
            ) : null}
        </div>
    );
};

export default NewsSearch;