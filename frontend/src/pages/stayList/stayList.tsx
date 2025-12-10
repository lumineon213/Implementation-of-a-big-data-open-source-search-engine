import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import "./stayList.css"; 

// 데이터 타입 정의 (백엔드 DTO 필드명과 일치)
interface StaySpot {
    content_id: string; // DTO 필드명
    title: string;
    address: string;
    firstimage: string; // DTO 필드명
    view_count: number; 
}

interface SearchResponse {
    list: StaySpot[];
    total: number;
}

const StayList: React.FC = () => {
    const navigate = useNavigate(); // 상세보기 이동을 위해 추가
    const [searchParams, setSearchParams] = useSearchParams();
    
    // URL에서 현재 상태 읽기
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const currentKeyword = searchParams.get('keyword') || "";
    
    // 로컬 상태 (API 호출 결과 및 임시 입력값)
    const [spots, setSpots] = useState<StaySpot[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0); 
    const [searchInput, setSearchInput] = useState(currentKeyword); 
    const [inputPage, setInputPage] = useState("");  

    const itemsPerPage = 10;
    const pageGroupSize = 10; // 페이지 그룹 크기 설정

    // 2. 데이터 불러오기 (URL 파라미터가 바뀌면 재실행)
    useEffect(() => {
        const fetchFoods = async () => {
            setLoading(true);
            try {
                // 백엔드 API 호출 URL 구성
                const url = currentKeyword 
                    ? `http://localhost:8484/api/stay/search?keyword=${encodeURIComponent(currentKeyword)}&page=${currentPage}&size=${itemsPerPage}`
                    : `http://localhost:8484/api/stay/search?page=${currentPage}&size=${itemsPerPage}`;

                const response = await axios.get<SearchResponse>(url);

                setSpots(response.data.list || []);
                setTotal(response.data.total || 0);

            } catch (err) {
                console.error("숙소 데이터 로딩 실패:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFoods();
    }, [currentPage, currentKeyword]); 

    // 3. 핸들러 및 로직
    
    // 페이지 변경 핸들러
    const totalPages = total > 0 ? Math.ceil(total / itemsPerPage) : 1;
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setSearchParams(prev => {
                prev.set('page', newPage.toString());
                return prev;
            });
            window.scrollTo(0, 0); 
        }
    };

    // 검색 핸들러
    const handleSearch = () => {
        setSearchParams(prev => {
            prev.set('keyword', searchInput);
            prev.set('page', '1'); // 검색 시 1페이지로 이동
            return prev;
        });
    };

    // 페이지 점프 핸들러
    const handleJumpToPage = () => {
        const pageNum = Number(inputPage);
        if (!inputPage || isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
            alert(`1부터 ${totalPages} 사이의 페이지를 입력해주세요.`);
            return;
        }
        setSearchParams(prev => {
            prev.set('page', pageNum.toString());
            return prev;
        });
        setInputPage("");
        window.scrollTo(0, 0);
    };
    
    // 엔터 키 처리 핸들러
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: 'search' | 'jump') => {
        if (e.key === 'Enter') {
            if (type === 'search') handleSearch();
            else handleJumpToPage();
        }
    };
    
    // 카드 클릭 시 상세 보기 이동 (URL 파라미터 유지)
    const handleCardClick = (id: string) => {
        // 상세보기 클릭 시, 현재 URL의 모든 상태(페이지, 검색어 등)를 유지하며 이동
        const currentPath = `/info/stay/${id}?${searchParams.toString()}`;
        navigate(currentPath); 
    };

    // 페이징 그룹 계산
    const startPage = Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1;
    const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

    if (loading) return <div style={{padding: '100px', textAlign: 'center'}}>데이터를 불러오는 중입니다...</div>;

    return (
        <div className="info-container">
            <h2 className="page-title">
                {currentKeyword ? `'${currentKeyword}' 검색 결과 (${total}개)` : '부산 숙소 검색'}
            </h2>

            {/* 1. 상단 검색 배너 */}
            <div className="search-filter-container">
                <div className="search-box-wrapper">
                    <input 
                        type="text" 
                        placeholder="숙소명 또는 지역(예: 해운대) 검색" 
                        className="main-search-input"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, 'search')}
                    />
                    <button className="main-search-btn" onClick={handleSearch}>검색</button>
                </div>
            </div>

            {total === 0 ? (
                <div className="no-result">검색 결과가 없습니다.</div>
            ) : (
                <>
                    <div className="total-count" style={{ marginBottom: "20px" }}>
                        총 <b>{total.toLocaleString()}</b>개의 숙소가 검색되었습니다.
                    </div>
                    
                    <div className="card-grid">
                        {spots.map((spot) => (
                            <div 
                                key={spot.content_id} 
                                className="tour-card"
                                onClick={() => handleCardClick(spot.content_id)} 
                                style={{ cursor: "pointer" }}
                            >
                                <div className="card-image">
                                    {spot.firstimage && spot.firstimage.startsWith('http') ? (
                                        <img 
                                            src={spot.firstimage} 
                                            alt={spot.title} 
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                                        />
                                    ) : (
                                        <div className="no-image">이미지 없음</div>
                                    )}
                                </div>
                                <div className="card-content">
                                    <h3>{spot.title}</h3>
                                    <p>📍 {spot.address}</p>
                                    <p>👀 조회수: {spot.view_count}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 4. 하단 페이징 영역 */}
                    <div className="pagination-wrapper">
                        
                        {/* 숫자 페이징 */}
                        <div className="pagination-numbers">
                            
                            {/* 이전 그룹 버튼 (<<) */}
                            <button 
                                onClick={() => handlePageChange(startPage - pageGroupSize)} 
                                disabled={startPage === 1} 
                                className="page-btn prev-next group-prev"
                            >
                                &lt;&lt; 
                            </button>

                            {/* 개별 이전 페이지 버튼 (<) */}
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)} 
                                disabled={currentPage === 1} 
                                className="page-btn prev-next single-prev"
                            >
                                &lt;
                            </button>

                            {/* 개별 페이지 버튼 (1, 2, 3...) */}
                            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`page-btn ${currentPage === pageNum ? "active" : ""}`}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            {/* 개별 다음 페이지 버튼 (>) */}
                            <button 
                                onClick={() => handlePageChange(currentPage + 1)} 
                                disabled={currentPage === totalPages} 
                                className="page-btn prev-next single-next"
                            >
                                &gt;
                            </button>

                            {/* 다음 그룹 버튼 (>>) */}
                            <button 
                                onClick={() => handlePageChange(endPage + 1)} 
                                disabled={endPage === totalPages} 
                                className="page-btn prev-next group-next"
                            >
                                &gt;&gt;
                            </button>
                        </div>

                       {/* 페이지 점프 입력창 */}
                        <div className="pagination-jump">
                            <input 
                            type="number" 
                            value={inputPage}
                            onChange={(e) => setInputPage(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, 'jump')}
                            placeholder="Go"
                            className="jump-input"
                            />
                            <button onClick={handleJumpToPage} className="jump-btn">이동</button>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
};

export default StayList;