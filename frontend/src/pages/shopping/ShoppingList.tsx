import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ShoppingList.css';

interface ShoppingItem {
  id: string;
  uc_seq: string;
  main_title: string;
  title: string;
  subtitle?: string;
  gugun_nm: string;
  place: string;
  addr1: string;
  addr2?: string;
  cntct_tel_s?: string;
  homepage_url?: string;
  usage_day_week_and_time?: string;
  main_img_normal?: string;
  main_img_thumb?: string;
  itemcntnts?: string;
  lat?: string;
  lng?: string;
}

const ShoppingList: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedGugun, setSelectedGugun] = useState('전체');
  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const gugunList = ['전체', '중구', '서구', '동구', '영도구', '부산진구', '동래구', '남구', '북구', '해운대구', '사하구', '금정구', '강서구', '연제구', '수영구', '사상구', '기장군'];

  useEffect(() => {
    fetchShoppingData();
  }, [keyword, page]);

  const fetchShoppingData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8484/api/shopping/search', {
        params: {
          keyword: keyword,
          page: page,
          size: 12
        }
      });
      setItems(response.data.items);
      setTotal(response.data.total);
    } catch (error) {
      console.error('쇼핑 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setKeyword(searchInput);
    setPage(1);
  };

  const handleGugunClick = (gugun: string) => {
    setSelectedGugun(gugun);
    if (gugun === '전체') {
      setKeyword('');
      setSearchInput('');
    } else {
      setKeyword(gugun);
      setSearchInput(gugun);
    }
    setPage(1);
  };

  const filteredItems = selectedGugun === '전체' 
    ? items 
    : items.filter(item => item.gugun_nm?.includes(selectedGugun));

  return (
    <div className="shopping-container">
      <div className="shopping-header">
        <h1>🛍️ 부산 쇼핑·기념품</h1>
        <p>부산의 특산품과 쇼핑 명소를 만나보세요</p>
      </div>

      {/* 검색 */}
      <div className="shopping-search">
        <input
          type="text"
          placeholder="쇼핑 명소, 시장, 지역 검색..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>검색</button>
      </div>

      {/* 구군 필터 */}
      <div className="gugun-filter">
        {gugunList.map((gugun) => (
          <button
            key={gugun}
            className={selectedGugun === gugun ? 'active' : ''}
            onClick={() => handleGugunClick(gugun)}
          >
            {gugun}
          </button>
        ))}
      </div>

      {/* 결과 개수 */}
      <div className="shopping-count">
        총 <strong>{filteredItems.length}</strong>개의 쇼핑 명소
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="shopping-loading">
          <div className="spinner"></div>
          <p>쇼핑 정보를 불러오는 중...</p>
        </div>
      )}



      {/* 쇼핑 리스트 */}
      {!loading && (
        <div className="shopping-grid">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="shopping-card"
              onClick={() => {
                setSelectedItem(item);
                setIsModalOpen(true);
              }}
            >
              <div className="shopping-image">
                <img
                  src={item.main_img_thumb || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={item.main_title}
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Shopping';
                  }}
                />
                <div className="shopping-badge">{item.gugun_nm}</div>
              </div>
              <div className="shopping-content">
                <h3 className="shopping-title">{item.main_title || item.title}</h3>
                <p className="shopping-place">📍 {item.place || item.addr1}</p>
                {item.cntct_tel_s && (
                  <p className="shopping-tel">📞 {item.cntct_tel_s}</p>
                )}
                {item.itemcntnts && (
                  <p className="shopping-desc">
                    {item.itemcntnts.length > 50
                      ? item.itemcntnts.substring(0, 50) + '...'
                      : item.itemcntnts}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 데이터 없음 */}
      {!loading && filteredItems.length === 0 && (
        <div className="shopping-empty">
          <p>😢 검색 결과가 없습니다.</p>
          <p>다른 키워드로 검색해보세요.</p>
        </div>
      )}


      {/* 페이지네이션 (Notice 스타일) */}
      {total > 12 && (
        <div className="notice-pagination">
          <button
            className="page-btn prev-next"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            &lt;
          </button>

          {Array.from({ length: Math.ceil(total / 12) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`page-btn${page === p ? " active" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}

          <button
            className="page-btn prev-next"
            onClick={() => setPage(page + 1)}
            disabled={page === Math.ceil(total / 12)}
          >
            &gt;
          </button>
        </div>
      )}

      {/* 모달 */}
      {isModalOpen && selectedItem && (
        <div className="shopping-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="shopping-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            
            <div className="modal-image">
              <img
                src={selectedItem.main_img_normal || selectedItem.main_img_thumb || 'https://via.placeholder.com/800x500?text=No+Image'}
                alt={selectedItem.main_title}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/800x500?text=Shopping';
                }}
              />
              <div className="modal-badge">{selectedItem.gugun_nm}</div>
            </div>

            <div className="modal-body">
              <h2 className="modal-title">{selectedItem.main_title || selectedItem.title}</h2>
              {selectedItem.subtitle && <p className="modal-subtitle">{selectedItem.subtitle}</p>}

              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <span className="modal-icon">📍</span>
                  <div>
                    <strong>위치</strong>
                    <p>{selectedItem.place}</p>
                  </div>
                </div>

                <div className="modal-info-item">
                  <span className="modal-icon">🏠</span>
                  <div>
                    <strong>주소</strong>
                    <p>{selectedItem.addr1}</p>
                    {selectedItem.addr2 && <p className="modal-addr2">{selectedItem.addr2}</p>}
                  </div>
                </div>

                {selectedItem.cntct_tel_s && (
                  <div className="modal-info-item">
                    <span className="modal-icon">📞</span>
                    <div>
                      <strong>전화번호</strong>
                      <p>
                        <a href={`tel:${selectedItem.cntct_tel_s}`}>{selectedItem.cntct_tel_s}</a>
                      </p>
                    </div>
                  </div>
                )}

                {selectedItem.homepage_url && (
                  <div className="modal-info-item">
                    <span className="modal-icon">🌐</span>
                    <div>
                      <strong>홈페이지</strong>
                      <p>
                        <a href={selectedItem.homepage_url} target="_blank" rel="noopener noreferrer">
                          바로가기
                        </a>
                      </p>
                    </div>
                  </div>
                )}

                {selectedItem.usage_day_week_and_time && (
                  <div className="modal-info-item modal-full-width">
                    <span className="modal-icon">🕐</span>
                    <div>
                      <strong>이용시간</strong>
                      <p>{selectedItem.usage_day_week_and_time}</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedItem.itemcntnts && (
                <div className="modal-description">
                  <h3>📝 상세 정보</h3>
                  <p>{selectedItem.itemcntnts}</p>
                </div>
              )}

              {selectedItem.lat && selectedItem.lng && (
                <button
                  className="modal-map-button"
                  onClick={() => {
                    navigate('/map', {
                      state: {
                        lat: parseFloat(selectedItem.lat!),
                        lng: parseFloat(selectedItem.lng!),
                        title: selectedItem.main_title || selectedItem.title
                      }
                    });
                  }}
                >
                  🗺️ 지도에서 보기
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
