import React, { useState, useEffect } from "react";
import "./map_detail.css";
import { api } from '../../api/axios';

interface Review {
  reviewId: number;
  userId?: number;
  userName?: string;
  accountName?: string; // 백엔드에서 반환하는 필드명
  accountId?: string; // 작성자 ID
  content: string;
  images?: string[];
  createdAt: string;
  isOwner?: boolean;
  owner?: boolean; // Lombok이 boolean 필드를 owner로 직렬화할 수 있음
}

interface MapDetailProps {
  restaurant: any | null;
  onClose: () => void;
  currentLocation: { lat: number; lng: number } | null;
}

const MapDetail: React.FC<MapDetailProps> = ({ restaurant, onClose, currentLocation }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const itemsPerPage = 5; // 페이지당 리뷰 수

  useEffect(() => {
    // 로그인 상태 체크 (토큰 존재 여부)
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    if (restaurant) {
      loadReviews();
    }
  }, [restaurant]);

  // 토큰 변경 감지 (다른 탭에서 로그아웃한 경우 등)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        setIsLoggedIn(!!e.newValue);
        if (!e.newValue && showReviewForm) {
          setShowReviewForm(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [showReviewForm]);

  const loadReviews = async () => {
    try {
      const placeId = restaurant.id || restaurant.place_id;
      if (!placeId) {
        setReviews([]);
        return;
      }

      // GET 요청은 인증이 필요 없으므로 axios 인터셉터가 자동으로 토큰을 추가
      // 토큰이 없어도 정상 작동하고, 토큰이 있으면 isOwner 정보를 받을 수 있음
      const response = await api.get(`/reviews/place/${placeId}`);
      
      console.log('리뷰 응답 데이터:', response.data); // 디버깅용
      
      // 응답 구조 확인 후 적절히 파싱
      let reviewsData: Review[] = [];
      
      if (response.data.success && Array.isArray(response.data.reviews)) {
        reviewsData = response.data.reviews;
      } else if (Array.isArray(response.data)) {
        // 배열이 직접 반환되는 경우
        reviewsData = response.data;
      } else {
        console.warn('예상하지 못한 응답 구조:', response.data);
        setReviews([]);
        return;
      }

      // accountName을 userName으로 매핑 (백엔드에서 accountName을 반환하므로)
      // isOwner 플래그도 명확히 설정 (Lombok은 boolean 필드를 owner로 직렬화할 수 있음)
      const mappedReviews = reviewsData.map((review: any) => {
        // isOwner 확인 (여러 형태 지원: isOwner, owner)
        const isOwnerFlag = review.isOwner === true || review.owner === true || review.isOwner === 'true' || review.owner === 'true';
        
        return {
          ...review,
          userName: review.accountName || review.userName || '익명',
          isOwner: isOwnerFlag,
        };
      });

      console.log('매핑된 리뷰 데이터:', mappedReviews); // 디버깅용
      console.log('isOwner 확인:', mappedReviews.map(r => ({ reviewId: r.reviewId, isOwner: r.isOwner }))); // 디버깅용
      setReviews(mappedReviews);
    } catch (error: any) {
      // 모든 에러를 조용히 처리 (401 포함)
      // GET 요청은 인증이 필요 없으므로 에러가 발생해도 빈 배열로 처리
      console.log('리뷰 조회 실패 (조용히 처리):', error.response?.status || error.message);
      setReviews([]);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const selectedFiles = Array.from(files).slice(0, 3); // 최대 3장
    setReviewImages(selectedFiles);

    // 미리보기 URL 생성
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeImage = (index: number) => {
    const newImages = reviewImages.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    
    // 이전 URL 메모리 해제
    URL.revokeObjectURL(previewUrls[index]);
    
    setReviewImages(newImages);
    setPreviewUrls(newUrls);
  };

  const handleSubmitReview = async () => {
    if (!reviewContent.trim()) {
      alert('후기 내용을 입력해주세요.');
      return;
    }

    // 토큰 확인
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?');
      // 필요시 로그인 페이지로 리다이렉트
      // window.location.href = '/login';
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      const placeId = restaurant.id || restaurant.place_id;
      
      if (!placeId) {
        alert('장소 정보가 없습니다.');
        setIsSubmitting(false);
        return;
      }
      
      formData.append('placeId', placeId);
      formData.append('content', reviewContent);
      
      // 이미지 추가
      reviewImages.forEach((image) => {
        formData.append('images', image);
      });

      const response = await api.post('/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('후기 작성 응답:', response.data); // 디버깅용

      // 응답 확인
      if (response.data.success) {
        // 성공 후 초기화
        setReviewContent("");
        setReviewImages([]);
        setPreviewUrls([]);
        setShowReviewForm(false);
        
        // 리뷰 목록 새로고침
        await loadReviews();
        setReviewPage(1); // 새 리뷰 작성 후 첫 페이지로 이동
        alert('후기가 등록되었습니다!');
      } else {
        alert(response.data.msg || '후기 등록에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      if (error.response?.status === 401) {
        alert('로그인이 필요하거나 토큰이 만료되었습니다. 다시 로그인해주세요.');
        // 토큰 제거 및 로그인 상태 업데이트
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setShowReviewForm(false);
      } else if (error.response?.status === 403) {
        alert('권한이 없습니다.');
      } else if (error.response?.data?.msg) {
        alert(error.response.data.msg);
      } else {
        alert('후기 등록에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('후기를 삭제하시겠습니까?')) return;

    // 토큰 확인
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      await api.delete(`/reviews/${reviewId}`);
      await loadReviews();
      // 삭제 후 현재 페이지에 리뷰가 없으면 이전 페이지로 이동
      const totalPages = Math.ceil((reviews.length - 1) / itemsPerPage);
      if (reviewPage > totalPages && totalPages > 0) {
        setReviewPage(totalPages);
      }
      alert('후기가 삭제되었습니다.');
    } catch (error: any) {
      console.error('Failed to delete review:', error);
      if (error.response?.status === 401) {
        alert('로그인이 필요하거나 토큰이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      } else if (error.response?.status === 403) {
        alert('삭제 권한이 없습니다.');
      } else if (error.response?.data?.msg) {
        alert(error.response.data.msg);
      } else {
        alert('후기 삭제에 실패했습니다.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '오늘';
    if (days === 1) return '어제';
    if (days < 7) return `${days}일 전`;
    if (days < 30) return `${Math.floor(days / 7)}주 전`;
    if (days < 365) return `${Math.floor(days / 30)}개월 전`;
    return `${Math.floor(days / 365)}년 전`;
  };

  if (!restaurant) return null;

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
  };

  const handleFindRoute = (routeType: string) => {
    if (!restaurant.latitude || !restaurant.longitude) {
      alert("목적지 좌표 정보가 없습니다.");
      return;
    }

    const destLat = Array.isArray(restaurant.latitude) ? restaurant.latitude[0] : restaurant.latitude;
    const destLng = Array.isArray(restaurant.longitude) ? restaurant.longitude[0] : restaurant.longitude;
    const destName = getValue(restaurant.title);

    let kakaoUrl = "";

    if (currentLocation) {
      kakaoUrl = `https://map.kakao.com/link/to/${encodeURIComponent(destName)},${destLat},${destLng}/from/현재위치,${currentLocation.lat},${currentLocation.lng}`;
    } else {
      kakaoUrl = `https://map.kakao.com/link/to/${encodeURIComponent(destName)},${destLat},${destLng}`;
    }

    window.open(kakaoUrl, "_blank");
  };

  const handleOpenInKakaoMap = () => {
    if (!restaurant.latitude || !restaurant.longitude) {
      alert("좌표 정보가 없습니다.");
      return;
    }

    const lat = Array.isArray(restaurant.latitude) ? restaurant.latitude[0] : restaurant.latitude;
    const lng = Array.isArray(restaurant.longitude) ? restaurant.longitude[0] : restaurant.longitude;
    const name = getValue(restaurant.title);

    const kakaoUrl = `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;
    window.open(kakaoUrl, "_blank");
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleCopyLink = async () => {
    const lat = Array.isArray(restaurant.latitude) ? restaurant.latitude[0] : restaurant.latitude;
    const lng = Array.isArray(restaurant.longitude) ? restaurant.longitude[0] : restaurant.longitude;
    const name = getValue(restaurant.title);
    
    const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;
    
    try {
      await navigator.clipboard.writeText(kakaoMapUrl);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareMenu(false);
      }, 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = kakaoMapUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
          setShowShareMenu(false);
        }, 2000);
      } catch (err2) {
        alert("링크 복사에 실패했습니다.");
      }
      document.body.removeChild(textArea);
    }
  };

  const handleKakaoShare = () => {
    if (!restaurant.latitude || !restaurant.longitude) {
      alert("좌표 정보가 없습니다.");
      return;
    }

    const lat = Array.isArray(restaurant.latitude) ? restaurant.latitude[0] : restaurant.latitude;
    const lng = Array.isArray(restaurant.longitude) ? restaurant.longitude[0] : restaurant.longitude;
    const name = getValue(restaurant.title);
    
    const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;
    
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      const kakaoTalkUrl = `kakaotalk://share?text=${encodeURIComponent(name + '\n' + kakaoMapUrl)}`;
      window.location.href = kakaoTalkUrl;
      
      setTimeout(() => {
        if (confirm('카카오톡 앱이 설치되어 있지 않습니다.\n링크를 복사하시겠습니까?')) {
          handleCopyLink();
        }
      }, 1500);
    } else {
      navigator.clipboard.writeText(kakaoMapUrl).then(() => {
        alert('링크가 복사되었습니다!\n카카오톡에서 붙여넣기 하세요.');
        setShowShareMenu(false);
      }).catch(() => {
        alert('링크 복사에 실패했습니다.');
      });
    }
  };

  const getValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value[0] || "";
    }
    return value || "";
  };

  const title = getValue(restaurant.title);
  const subtitle = getValue(restaurant.subtitle);
  const address = getValue(restaurant.address);
  const description = getValue(restaurant.description || restaurant.overview);
  const imageUrl = getValue(restaurant.image || restaurant.image_url || restaurant.firstimage);
  const menu = restaurant.menu || restaurant.menu_t || "";
  const openTime = restaurant.opentime_t || "";
  const tags = getValue(restaurant.tags);
  const type = getValue(restaurant.type);
  const distance = restaurant.distance ? restaurant.distance.toFixed(2) : "";
  
  const isWalk = type === "WALK";

  return (
    <div className="map-detail-panel">
      <div className="map-detail-container">
        <button className="map-detail-close" onClick={onClose}>
          ✕
        </button>

        <div className="map-detail-header">
          <div className="map-detail-image">
            <img
              src={imageUrl || "https://via.placeholder.com/300?text=No+Image"}
              alt={title}
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/300?text=Food";
              }}
            />
          </div>
          <div className="map-detail-title-wrapper">
            <h2 className="map-detail-title">{title}</h2>
            <button 
              className={`map-detail-favorite ${isFavorite ? 'active' : ''}`}
              onClick={handleFavoriteClick}
              aria-label="즐겨찾기"
            >
              {isFavorite ? '★' : '☆'}
            </button>
          </div>
        </div>

        <div className="map-detail-content">
          {distance && (
            <div className="map-detail-item">
              <span className="map-detail-label">📍 거리</span>
              <span className="map-detail-value">{distance}km</span>
            </div>
          )}

          {isWalk && subtitle && (
            <div className="map-detail-item">
              <span className="map-detail-label">💬 부제</span>
              <span className="map-detail-value">{subtitle}</span>
            </div>
          )}

          {address && (
            <div className="map-detail-item">
              <span className="map-detail-label">📍 주소</span>
              <span className="map-detail-value">{address}</span>
            </div>
          )}

          {isWalk && tags && (
            <div className="map-detail-item">
              <span className="map-detail-label">🚌 교통정보</span>
              <span className="map-detail-value" style={{ whiteSpace: 'pre-line' }}>{tags}</span>
            </div>
          )}

          {!isWalk && menu && (
            <div className="map-detail-item">
              <span className="map-detail-label">🍽️ 대표 메뉴</span>
              <div className="map-detail-menu">
                {menu.split(",").map((item: string, idx: number) => (
                  <span key={idx} className="menu-badge">
                    {item.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!isWalk && openTime && (
            <div className="map-detail-item">
              <span className="map-detail-label">🕐 영업시간</span>
              <span className="map-detail-value">{openTime.replace(/\n/g, " ")}</span>
            </div>
          )}

          {description && (
            <div className="map-detail-item">
              <span className="map-detail-label">📝 설명</span>
              <p className="map-detail-description">{description}</p>
            </div>
          )}

          <div className="map-detail-actions">
            <button 
              className="map-detail-button primary"
              onClick={() => handleFindRoute("default")}
              title="카카오맵에서 길찾기"
            >
              🚗 길찾기
            </button>
            <button 
              className="map-detail-button secondary"
              onClick={handleOpenInKakaoMap}
              title="카카오맵에서 보기"
            >
              🗺️ 카카오맵
            </button>
          </div>

          <div className="map-detail-share-section">
            <button 
              className="map-detail-share-button"
              onClick={handleShare}
              title="공유하기"
            >
              <span className="share-icon">🔗</span>
              <span>공유하기</span>
            </button>

            {showShareMenu && (
              <div className="share-menu">
                <button 
                  className="share-menu-item"
                  onClick={handleCopyLink}
                >
                  <span className="share-menu-icon">📋</span>
                  <span>{copySuccess ? "복사완료! ✓" : "링크 복사"}</span>
                </button>
                <button 
                  className="share-menu-item"
                  onClick={handleKakaoShare}
                >
                  <span className="share-menu-icon">💬</span>
                  <span>카카오톡</span>
                </button>
              </div>
            )}
          </div>

          {/* 후기 섹션 */}
          <div className="review-section">
            <div className="review-header">
              <h3 className="review-title">
                💬 방문 후기 <span className="review-count">({reviews.length})</span>
              </h3>
              {isLoggedIn && !showReviewForm && (
                <button 
                  className="write-review-button"
                  onClick={() => setShowReviewForm(true)}
                >
                  후기 작성
                </button>
              )}
            </div>

            {/* 후기 작성 폼 */}
            {showReviewForm && (
              <div className="review-form">
                <textarea
                  className="review-textarea"
                  placeholder="이곳에 대한 후기를 남겨주세요&#10;(예: 분위기 좋았어요, 음식이 맛있었어요 등)"
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  maxLength={500}
                />
                <div className="review-form-footer">
                  <div className="image-upload-section">
                    <label className="image-upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        style={{ display: 'none' }}
                      />
                      📷 사진 추가 (최대 3장)
                    </label>
                    {previewUrls.length > 0 && (
                      <div className="image-preview-list">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="image-preview-item">
                            <img src={url} alt={`preview ${index + 1}`} />
                            <button
                              className="image-remove-button"
                              onClick={() => removeImage(index)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="review-form-actions">
                    <button
                      className="review-cancel-button"
                      onClick={() => {
                        setShowReviewForm(false);
                        setReviewContent("");
                        setReviewImages([]);
                        setPreviewUrls([]);
                      }}
                    >
                      취소
                    </button>
                    <button
                      className="review-submit-button"
                      onClick={handleSubmitReview}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? '등록중...' : '등록'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 로그인 안내 */}
            {!isLoggedIn && (
              <div className="review-login-notice">
                <p>🔒 후기를 작성하려면 로그인이 필요합니다</p>
              </div>
            )}

            {/* 후기 목록 */}
            <div className="review-list">
              {reviews.length === 0 ? (
                <div className="empty-reviews">
                  <p>아직 작성된 후기가 없습니다</p>
                  <p className="empty-reviews-sub">첫 번째 후기를 남겨보세요!</p>
                </div>
              ) : (
                <>
                  {/* 페이징된 리뷰 표시 */}
                  {(() => {
                    const totalPages = Math.ceil(reviews.length / itemsPerPage);
                    const startIndex = (reviewPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedReviews = reviews.slice(startIndex, endIndex);
                    
                    return (
                      <>
                        {paginatedReviews.map((review) => (
                  <div key={review.reviewId} className="review-item">
                    <div className="review-item-header">
                      <div className="review-user-info">
                        <span className="review-user-name">
                          {review.userName || review.accountName || '익명'}
                        </span>
                        <span className="review-date">{formatDate(review.createdAt)}</span>
                      </div>
                      {(review.isOwner === true || (review as any).owner === true) && isLoggedIn && (
                        <button
                          className="review-delete-button"
                          onClick={() => handleDeleteReview(review.reviewId)}
                          title="후기 삭제"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                    <p className="review-content">{review.content}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="review-images">
                        {review.images.map((imageUrl, idx) => (
                          <img
                            key={idx}
                            src={imageUrl}
                            alt={`review image ${idx + 1}`}
                            className="review-image"
                            onClick={() => window.open(imageUrl, '_blank')}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                        ))}
                        
                        {/* 페이징 버튼 */}
                        {totalPages > 1 && (
                          <div style={{ 
                            display: "flex", 
                            justifyContent: "center", 
                            alignItems: "center", 
                            gap: "10px", 
                            marginTop: "20px",
                            paddingTop: "15px",
                            borderTop: "1px solid #eee"
                          }}>
                            <button
                              onClick={() => setReviewPage(prev => Math.max(1, prev - 1))}
                              disabled={reviewPage === 1}
                              style={{
                                padding: "6px 12px",
                                border: "1px solid #ddd",
                                background: reviewPage === 1 ? "#f5f5f5" : "#fff",
                                color: reviewPage === 1 ? "#999" : "#333",
                                borderRadius: "4px",
                                cursor: reviewPage === 1 ? "not-allowed" : "pointer",
                                fontSize: "13px"
                              }}
                            >
                              이전
                            </button>
                            <span style={{ fontSize: "13px", color: "#666" }}>
                              {reviewPage} / {totalPages}
                            </span>
                            <button
                              onClick={() => setReviewPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={reviewPage === totalPages}
                              style={{
                                padding: "6px 12px",
                                border: "1px solid #ddd",
                                background: reviewPage === totalPages ? "#f5f5f5" : "#fff",
                                color: reviewPage === totalPages ? "#999" : "#333",
                                borderRadius: "4px",
                                cursor: reviewPage === totalPages ? "not-allowed" : "pointer",
                                fontSize: "13px"
                              }}
                            >
                              다음
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapDetail;