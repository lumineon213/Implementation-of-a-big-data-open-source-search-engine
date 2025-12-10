import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';
import "./stayList.css"; // 파일명에 맞춰 CSS 경로 확인

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
  const [spots, setSpots] = useState<StaySpot[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  const keyword = searchParams.get('keyword');
  
  // 📌 API 호출은 /api/stay/search 로 변경
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = keyword 
          ? `http://localhost:8484/api/stay/search?keyword=${encodeURIComponent(keyword)}&page=${currentPage}&size=${itemsPerPage}`
          : `http://localhost:8484/api/stay/search?page=${currentPage}&size=${itemsPerPage}`;

        // 📌 백엔드 응답 타입 SearchResponse 사용
        const response = await axios.get<SearchResponse>(url);
        
        setSpots(response.data.list); 
        setTotal(response.data.total);
      } catch (error) {
        console.error("숙소 데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [keyword, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(total / itemsPerPage);
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  if (loading) return <div style={{padding: '100px', textAlign: 'center'}}>데이터를 불러오는 중입니다...</div>;

  return (
    <div className="info-container">
      <h2 className="page-title">
        {keyword ? `'${keyword}' 검색 결과 (${total}개)` : '부산 숙소 검색'}
      </h2>
      
      {total === 0 ? (
        <div className="no-result">검색 결과가 없습니다.</div>
      ) : (
        <>
          <div className="card-grid">
            {spots.map((spot) => (
              // 📌 content_id를 key와 Link 경로에 사용
              <Link to={`/info/stay/${spot.content_id}`} key={spot.content_id} className="tour-card">
                <div className="card-image">
                  {/* 📌 firstimage 필드 사용 및 유효성 체크 */}
                  {spot.firstimage && spot.firstimage.startsWith('http') ? (
                    <img 
                        src={spot.firstimage} 
                        alt={spot.title} 
                        // 로드 실패 시 숨기고 CSS로 대체
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
              </Link>
            ))}
          </div>

          {/* 페이지네이션 버튼 영역 */}
          <div className="pagination">
             {/* 이전 버튼 */}
             <button 
               onClick={() => handlePageChange(currentPage - 1)} 
               disabled={currentPage === 1}
               className="page-btn prev-btn"
             >
               &lt;
             </button>

             {/* 숫자 버튼들 */}
             {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
               <button
                 key={number}
                 onClick={() => handlePageChange(number)}
                 className={`page-btn ${currentPage === number ? 'active' : ''}`}
               >
                 {number}
               </button>
             ))}

             {/* 다음 버튼 */}
             <button 
               onClick={() => handlePageChange(currentPage + 1)} 
               disabled={currentPage === totalPages}
               className="page-btn next-btn"
             >
               &gt;
             </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StayList;