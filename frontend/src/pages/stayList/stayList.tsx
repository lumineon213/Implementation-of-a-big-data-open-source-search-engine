// StayList.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom'; // 📌 useSearchParams 추가
import './stayList.css'; 

// ------------------- 타입 정의 -------------------
interface StayItem {
    id: string;
    title: string;
    address: string;
    image_url: string;
    description: string;
    view_count: number;
}
// ------------------------------------------------

const StayList: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams(); // 📌 URL 파라미터 관리

    // 📌 URL에서 현재 상태 읽기
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const currentKeyword = searchParams.get('keyword') || "";
    const currentSort = searchParams.get('sort') || "view"; // 기본값: 조회순
    
    // 로컬 상태 (API 호출 결과 및 임시 입력값)
    const [list, setList] = useState<StayItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0); 
    const [searchInput, setSearchInput] = useState(currentKeyword); 
    const [inputPage, setInputPage] = useState("");   // 페이지 점프 입력값

    const size = 10;
    const pageGroupSize = 10; // 페이지 버튼을 5개씩 묶음

    // ------------------- 1. 데이터 불러오기 (URL 파라미터가 바뀌면 재실행) -------------------
    useEffect(() => {
        const fetchStayList = async () => {
            setLoading(true);
            try {
                const response = await axios.get("http://localhost:8484/api/stay/search", {
                    params: { 
                        page: currentPage, 
                        size: size,
                        keyword: currentKeyword,
                        sort: currentSort,
                    }
                });

                setList(response.data.list as StayItem[] || []);
                setTotal(response.data.total || 0);

            } catch (err) {
                console.error("숙소 리스트 로딩 실패:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStayList();
    }, [currentPage, currentKeyword, currentSort]); // URL 파라미터 변경 시 재실행

    // ------------------- 2. 핸들러 함수 -------------------
    
    // 📌 페이지 변경 처리 (URL 업데이트)
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setSearchParams(prev => {
                prev.set('page', newPage.toString());
                return prev;
            });
            window.scrollTo(0, 0);
        }
    };

    // 📌 검색 실행 처리 (URL 업데이트)
    const handleSearch = () => {
        setSearchParams(prev => {
            prev.set('keyword', searchInput);
            prev.set('page', '1'); // 검색 시 항상 1페이지로 이동
            return prev;
        });
    };
    
    // 📌 카드 클릭 (상세보기)
    const handleCardClick = (id: string) => {
        // 상세보기 클릭 시, 현재 URL의 모든 상태(페이지, 검색어 등)를 유지하여 이동
        const currentPath = `/info/stay/${id}?${searchParams.toString()}`;
        navigate(currentPath); 
    };

    // 📌 페이지 점프 처리
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

    // 📌 키보드 이벤트 처리
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: 'search' | 'jump') => {
        if (e.key === 'Enter') {
            if (type === 'search') handleSearch();
            else handleJumpToPage();
        }
    };

    // ------------------- 3. 페이징 로직 계산 -------------------
    const totalPages = total > 0 ? Math.ceil(total / size) : 1;
    // 현재 페이지 그룹의 시작과 끝 계산 (FoodList 방식)
    const startPage = Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1;
    const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

    if (loading) return <div style={{ padding:"100px", textAlign:"center", fontSize:"18px" }}>데이터를 불러오는 중입니다...</div>;

    // ------------------- 4. TSX 렌더링 -------------------
    return (
        <div className="stay-list-container">
            
            {/* 1. 상단 검색 배너 (헤더 잘림 방지 CSS 필요) */}
            <div className="search-filter-container">
                <h2 className="search-title">오션뷰, 감성 숙소! 부산의 쉼을 검색하세요 🏖️</h2>
                
                <div className="search-box-wrapper">
                    <input 
                        type="text" 
                        placeholder="숙소 이름 또는 주소 검색" 
                        className="main-search-input"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, 'search')}
                    />
                    <button className="main-search-btn" onClick={handleSearch}>검색</button>
                </div>
            </div>

            {/* 2. 리스트 정보 바 (총 개수) */}
            <div className="list-info-bar">
                <div className="total-count">
                    총 <b>{total.toLocaleString()}</b>개의 숙소가 검색되었습니다.
                </div>
                {/* 정렬 버튼은 현재 숙소 로직에서 제외되어 있습니다. */}
            </div>

            {/* 3. 숙소 리스트 영역 */}
            <div className="stay-list-wrapper">
                {list.length === 0 ? (
                    <div style={{ padding:"50px", textAlign:"center", width: "100%" }}>검색 결과가 없습니다.</div>
                ) : (
                    list.map((item: StayItem, index) => (
                        <div 
                            key={item.id || index} 
                            className="stay-card" 
                            onClick={() => handleCardClick(item.id)} 
                            style={{ cursor: "pointer" }}
                        >
                            <img 
                                src={item.image_url || "https://via.placeholder.com/200?text=No+Image"} 
                                alt={item.title} 
                                className="stay-card-image" 
                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { 
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null; 
                                    target.src="https://via.placeholder.com/400x220?text=Busan+Stay"; 
                                }}
                            />
                            <div className="stay-info-box">
                                <div>
                                    <h3 className="stay-title">{item.title}</h3>
                                    <p className="stay-address">{item.address}</p>
                                    <p className="stay-desc">
                                        {item.description || "상세 설명이 준비되지 않았습니다."}
                                    </p>
                                </div>
                                <p className="stay-views">조회수: {item.view_count || 0}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 4. 하단 페이징 영역 (숫자 + 점프) */}
            {total > 0 && (
        <div className="pagination-wrapper">
            
            {/* 숫자 페이징 영역 */}
            <div className="pagination-numbers">
                
                {/* 📌 이전 그룹 버튼 (<<) */}
                <button 
                    onClick={() => handlePageChange(startPage - pageGroupSize)} 
                    disabled={startPage === 1} 
                    className="page-btn prev-next group-prev"
                >
                    &lt;&lt; 
                </button>

                {/* 📌 개별 이전 페이지 버튼 (<) */}
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

                {/* 📌 개별 다음 페이지 버튼 (>) */}
                <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages} 
                    className="page-btn prev-next single-next"
                >
                    &gt;
                </button>

                {/* 📌 다음 그룹 버튼 (>>) */}
                <button 
                    onClick={() => handlePageChange(endPage + 1)} 
                    disabled={endPage === totalPages} 
                    className="page-btn prev-next group-next"
                >
                    &gt;&gt;
                </button>
            </div>

            {/* 페이지 점프 입력창 (유지) */}
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
    )}
        </div>
    );
};

export default StayList;