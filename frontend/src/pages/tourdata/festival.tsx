import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';   // 돋보기 아이콘
import './festival.css';

// 백엔드에서 오는 실제 데이터 타입
interface FestivalFromAPI {
  ucSeq: string;
  mainTitle: string;
  gugunNm: string;
  place: string;
  title?: string;
  addr1?: string;
  mainImgNormal?: string;
  itemCntnts?: string;
  usageDay?: string;        // 예: "20250401~20250410"
  usagePeriod?: string;
}

interface Festival {
  id: string;
  title: string;
  period: string;
  location: string;
  description: string;
  image: string;          // 이모지 or 실제 이미지 URL
  category: string;
  status: 'upcoming' | 'ongoing' | 'ended';
}

const Festival: React.FC = () => {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const size = 12;

  // 날짜 기반으로 상태 계산
  const getStatusFromPeriod = (period: string): 'upcoming' | 'ongoing' | 'ended' => {
    if (!period) return 'upcoming';

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const match = period.match(/(\d{8})[~～-]\s*(\d{8})/);
    if (!match) return 'upcoming';

    const start = match[1];
    const end = match[2];

    if (todayStr < start) return 'upcoming';
    if (todayStr >= start && todayStr <= end) return 'ongoing';
    return 'ended';
  };

  // 카테고리 매핑
const getCategory = (title: string | null | undefined): string => {
  // title이 없거나 null이면 빈 문자열로 처리
  const str = title ? String(title).trim() : '';
  const lower = str.toLowerCase();

  if (lower.includes('영화')) return '문화';
  if (lower.includes('불꽃') || lower.includes('축제')) return '문화';
  if (lower.includes('먹거리') || lower.includes('자갈치') || lower.includes('맛집')) return '먹거리';
  if (lower.includes('모래') || lower.includes('체험')) return '체험';
  if (lower.includes('벚꽃') || lower.includes('단풍')) return '자연';
  return '문화';
};

  // API 호출
  const fetchFestivals = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        keyword: searchTerm,
        page: page.toString(),
        size: size.toString(),
      });

      const res = await fetch(`/api/festival/search?${params}`);
      if (!res.ok) throw new Error('데이터를 불러오지 못했습니다.');

      const data = await res.json();
      const list: FestivalFromAPI[] = data.list || [];
      setTotal(data.total || 0);

      const converted: Festival[] = list.map((item) => {
        const period = item.usageDay || item.usagePeriod || '20250101~20251231';
        const title = item.mainTitle || item.title || '제목 없음';
        const location = item.place || item.addr1 || item.gugunNm || '부산';

        return {
          id: item.ucSeq,
          title,
          period: period.replace(/(\d{4})(\d{2})(\d{2})/g, '$1.$2.$3').replace('~', ' - '),
          location,
          description: item.itemCntnts?.slice(0, 100) + '...' || '부산의 멋진 축제입니다.',
          image: item.mainImgNormal ? item.mainImgNormal : '축제', // 실제 이미지 있으면 사용
          category: getCategory(title, item.gugunNm || ''),
          status: getStatusFromPeriod(period),
        };
      });

      setFestivals(converted);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류 발생');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchFestivals();
  }, [searchTerm, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchFestivals();
  }, [page]);

  const filteredFestivals = festivals.filter(festival => {
    const matchesCategory = selectedCategory === 'all' || festival.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || festival.status === selectedStatus;
    return matchesCategory && matchesStatus;
  });

  const categories = ['all', '문화', '먹거리', '체험', '자연'];
  const statuses = [
    { value: 'all', label: '전체' },
    { value: 'upcoming', label: '예정' },
    { value: 'ongoing', label: '진행중' },
    { value: 'ended', label: '종료' }
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: { text: '예정', class: 'status-upcoming' },
      ongoing: { text: '진행중', class: 'status-ongoing' },
      ended: { text: '종료', class: 'status-ended' }
    };
    return badges[status as keyof typeof badges];
  };

const handleDetailClick = (id: string) => {
  // alert 대신 페이지 이동!
  window.location.href = `/festival/${id}`;
  // 또는 navigate 쓰고 싶으면 useNavigate 훅 쓰기
};

  return (
    <div className="festival-container">
      {/* 헤더 */}
      <div className="festival-header">
        <h1>부산 축제</h1>
        <p>부산에서 열리는 다양한 축제를 만나보세요</p>
      </div>

      {/* 검색 & 필터 */}
      <div className="festival-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="축제명 또는 장소로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FiSearch className="search-icon" />   {/* 돋보기 아이콘으로 변경 완료! */}
        </div>

        <div className="filter-group">
          <div className="filter-section">
            <label>카테고리</label>
            <div className="filter-buttons">
              {categories.map(category => (
                <button
                  key={category}
                  className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? '전체' : category}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <label>진행상태</label>
            <div className="filter-buttons">
              {statuses.map(status => (
                <button
                  key={status.value}
                  className={`filter-btn ${selectedStatus === status.value ? 'active' : ''}`}
                  onClick={() => setSelectedStatus(status.value)}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 결과 카운트 */}
      <div className="result-count">
        <span>총 {total}개의 축제 ({filteredFestivals.length}개 표시중)</span>
      </div>

      {/* 로딩 상태 */}
      {loading ? (
        <div className="no-results">
          <p>축제를 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="no-results">
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      ) : (
        <div className="festival-grid">
          {filteredFestivals.length > 0 ? (
            filteredFestivals.map(festival => (
              <div key={festival.id} className="festival-card" onClick={() => handleDetailClick(festival.id)}>
                <div className="festival-image">
                  {festival.image.startsWith('http') ? (
                    <img src={festival.image} alt={festival.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span className="festival-emoji">{festival.image}</span>
                  )}
                  <span className={`status-badge ${getStatusBadge(festival.status).class}`}>
                    {getStatusBadge(festival.status).text}
                  </span>
                </div>

                <div className="festival-content">
                  <div className="festival-category">{festival.category}</div>
                  <h3 className="festival-title">{festival.title}</h3>

                  <div className="festival-info">
                    <div className="info-item">
                      <span className="info-icon">날짜</span>
                      <span>{festival.period}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">장소</span>
                      <span>{festival.location}</span>
                    </div>
                  </div>

                  <p className="festival-description">{festival.description}</p>

                  <button
                    className="detail-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDetailClick(festival.id);
                    }}
                  >
                    자세히 보기
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <span className="no-results-icon">???</span>
              <p>검색 조건에 맞는 축제가 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {/* 페이징 */}
      {total > size && (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>이전</button>
          <span style={{ margin: '0 20px' }}>페이지 {page}</span>
          <button disabled={page * size >= total} onClick={() => setPage(p => p + 1)}>다음</button>
        </div>
      )}

      {/* 안내사항 */}
      <div className="festival-notice">
        <h3>안내사항</h3>
        <ul>
          <li>축제 일정은 주최 측 사정에 따라 변경될 수 있습니다.</li>
          <li>날씨나 기타 사유로 축제가 취소될 수 있으니 방문 전 확인해주세요.</li>
          <li>자세한 정보는 각 축제 공식 홈페이지를 참고해주세요.</li>
        </ul>
      </div>
    </div>
  );
};

export default Festival;