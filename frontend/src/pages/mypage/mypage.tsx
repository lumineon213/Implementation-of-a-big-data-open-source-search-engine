import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MyPage.css";
import { api } from "../../api/axios";

interface MyPageDTO {
  accountId: string;
  accountName: string;
  email: string;
  phoneNumber: string;
  accountRole: string;
  regDate: string;
  profileImage?: string;
}

interface EventHistoryDTO {
  historyId: number;
  eventType: string;
  eventName: string;
  actionType?: string;
  description?: string;
  count: number;
  createdAt: string;
}

type PageMode = "view" | "edit";
type HistoryTab = "all" | "stamp" | "gift" | "badge";

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<MyPageDTO | null>(null);
  const [editData, setEditData] = useState<MyPageDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<PageMode>("view");

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  
  // 이벤트 히스토리 관련 상태
  const [eventHistory, setEventHistory] = useState<EventHistoryDTO[]>([]);
  const [historyTab, setHistoryTab] = useState<HistoryTab>("all");
  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 5; // 페이지당 항목 수
  
  // 리뷰 관련 상태
  interface Review {
    reviewId: number;
    placeId: string;
    placeName?: string;
    placeType?: string;
    content: string;
    images?: string[];
    createdAt: string;
    accountName?: string;
  }
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [reviewPage, setReviewPage] = useState(1);

  // ============== 데이터 로딩 ==============
  const loadMyPage = async () => {
    try {
      const res = await api.get("/mypage");

      const userInfo = res.data.userInfo || res.data;
      const data: MyPageDTO = {
        accountId: userInfo.accountId,
        accountName: userInfo.accountName,
        email: userInfo.email,
        phoneNumber: userInfo.phoneNumber,
        accountRole: userInfo.accountRole,
        regDate: userInfo.regDate,
        profileImage: userInfo.profileImage || null,
      };

      setUser(data);
      setEditData(data);
      
      // 이벤트 정보는 더 이상 사용하지 않지만 API 호환성을 위해 유지
      // 필요시 주석 처리 가능
      
      // 이벤트 히스토리 로드
      loadEventHistory();
      
      // 리뷰 내역 로드
      if (data.accountId) {
        loadMyReviews(data.accountId);
      }
    } catch (e) {
      console.error("마이페이지 로딩 실패:", e);
      alert("마이페이지 정보를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 이벤트 히스토리 로드
  const loadEventHistory = async () => {
    try {
      const res = await api.get("/events/history");
      if (res.data.success && res.data.history) {
        setEventHistory(res.data.history);
      }
    } catch (e) {
      console.error("이벤트 히스토리 로딩 실패:", e);
    }
  };
  
  // 내 리뷰 로드
  const loadMyReviews = async (accountId: string) => {
    try {
      const res = await api.get(`/reviews/user/${accountId}`);
      if (res.data.success && res.data.reviews) {
        console.log("리뷰 데이터:", res.data.reviews); // 디버깅용
        setMyReviews(res.data.reviews);
      }
    } catch (e) {
      console.error("리뷰 내역 로딩 실패:", e);
    }
  };
  
  // 리뷰 클릭 시 맵 디테일 열기
  const handleReviewClick = async (review: Review) => {
    try {
      let placeData: any = null;
      
      // placeType에 따라 다른 API 호출
      if (review.placeType === 'FOOD') {
        const res = await api.get(`/food/${review.placeId}`);
        placeData = res.data;
      } else if (review.placeType === 'STAY') {
        const res = await api.get(`/stay/view/${review.placeId}`);
        placeData = res.data;
      } else if (review.placeType === 'URBAN' || review.placeType === 'WALK') {
        const res = await api.get(`/urban/${review.placeId}`);
        placeData = res.data;
      } else if (review.placeType === 'TOUR') {
        // TOUR 타입은 별도 처리 필요
        console.log('TOUR 타입은 아직 지원하지 않습니다.');
        return;
      }
      
      if (placeData) {
        // 맵 페이지로 이동하면서 장소 정보 전달
        navigate('/map', {
          state: {
            placeId: review.placeId,
            placeType: review.placeType,
            placeData: placeData
          }
        });
      }
    } catch (error) {
      console.error('장소 정보 로딩 실패:', error);
      alert('장소 정보를 불러올 수 없습니다.');
    }
  };
  
  // 탭별 필터링된 히스토리
  const filteredHistory = eventHistory.filter((item) => {
    if (historyTab === "all") return true;
    return item.eventType === historyTab.toUpperCase();
  });
  
  // 이벤트 내역 페이징 계산
  const totalHistoryPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startHistoryIndex = (historyPage - 1) * itemsPerPage;
  const endHistoryIndex = startHistoryIndex + itemsPerPage;
  const paginatedHistory = filteredHistory.slice(startHistoryIndex, endHistoryIndex);
  
  // 리뷰 페이징 계산
  const totalReviewPages = Math.ceil(myReviews.length / itemsPerPage);
  const startReviewIndex = (reviewPage - 1) * itemsPerPage;
  const endReviewIndex = startReviewIndex + itemsPerPage;
  const paginatedReviews = myReviews.slice(startReviewIndex, endReviewIndex);
  
  // 탭 변경 시 페이지 초기화
  const handleHistoryTabChange = (tab: HistoryTab) => {
    setHistoryTab(tab);
    setHistoryPage(1);
  };
  
  // 이벤트 타입별 아이콘
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "STAMP": return "✉️";
      case "GIFT": return "🎁";
      case "BADGE": return "🏅";
      default: return "📌";
    }
  };
  
  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? "방금 전" : `${minutes}분 전`;
      }
      return `${hours}시간 전`;
    } else if (days === 1) {
      return "어제";
    } else if (days < 7) {
      return `${days}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
  };

  useEffect(() => {
    loadMyPage();
  }, []);

  // ============== 공통 변경 함수 ==============
  const handleChange = (key: keyof MyPageDTO, value: any) => {
    setEditData((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  // ============== 프로필 이미지 업로드 ==============
  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfilePreview(reader.result as string);
      setEditData((prev) => (prev ? { ...prev, profileImage: reader.result as string } : prev));
    };
    reader.readAsDataURL(file);
  };

  // ============== 저장 ==============
  const handleSave = async () => {
    if (!editData) return;
    setIsSaving(true);

    try {
      await api.put("/mypage", editData);
      setUser(editData);
      setMode("view");
      alert("정보가 수정되었습니다.");
    } catch (error: any) {
      console.error("저장 실패:", error);
      alert("정보 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // ============== 취소 ==============
  const handleCancel = () => {
    if (!user) return;
    setEditData(user);
    setProfilePreview(null);
    setMode("view");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) return <div style={{ padding: "50px", textAlign: "center" }}>로딩중...</div>;

  if (!user)
    return (
      <div className="mypage-nologin">
        <p>로그인이 필요합니다.</p>
        <Link to="/login">로그인</Link>
      </div>
    );

  return (
    <div className="mypage-layout">
      <h2 className="mypage-title">마이페이지</h2>

      <div className="mypage-main">
        {/* LEFT - 프로필 */}
        <div className="mypage-left">
          <div className="profile-card">
            {/* 프로필 이미지 */}
            <img
              src={profilePreview || user.profileImage || "/default-profile.png"}
              className="profile-image"
              alt="프로필"
            />

            {/* 숨겨진 파일 입력 */}
            <input
              id="profileUpload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleProfileUpload}
            />

            <h3 className="profile-name">{user.accountName} 님</h3>

            <button
              className="profile-edit-btn"
              onClick={() => document.getElementById("profileUpload")?.click()}
            >
              프로필 이미지 변경
            </button>
          </div>

          {/* 회원 정보 카드 */}
          <div className="benefit-card">
            <h3>회원 정보</h3>
            <ul>
              <li><strong>아이디:</strong> {user.accountId}</li>
              <li><strong>이름:</strong> {user.accountName}</li>
              <li><strong>이메일:</strong> {user.email}</li>
              <li><strong>전화번호:</strong> {user.phoneNumber || "미등록"}</li>
              <li><strong>가입일:</strong> {user.regDate ? new Date(user.regDate).toLocaleDateString('ko-KR') : "-"}</li>
            </ul>
            
            {mode === "view" && (
              <button 
                className="edit-profile-btn" 
                onClick={() => setMode("edit")}
                style={{ marginTop: "15px" }}
              >
                정보 수정
              </button>
            )}
          </div>
        </div>

        {/* RIGHT - 이벤트 및 활동 */}
        <div className="mypage-right">

          {/* 수정 모드 */}
          {mode === "edit" && (
            <div className="profile-edit-box">
              <h4>회원 정보 수정</h4>
              <label>이름</label>
              <input
                type="text"
                value={editData?.accountName || ""}
                onChange={(e) => handleChange("accountName", e.target.value)}
              />

              <label>이메일</label>
              <input
                type="email"
                value={editData?.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
              />

              <label>전화번호</label>
              <input
                type="tel"
                value={editData?.phoneNumber || ""}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
              />

              <div className="edit-btn-row">
                <button onClick={handleCancel}>취소</button>
                <button disabled={isSaving} onClick={handleSave}>
                  {isSaving ? "저장중..." : "저장하기"}
                </button>
              </div>
            </div>
          )}

          {/* 이벤트 내역 패널 */}
          {mode === "view" && (
            <div className="benefit-card" style={{ marginBottom: "20px" }}>
              <h3>📋 이벤트 내역</h3>
                  
                  {/* 탭 메뉴 */}
                  <div style={{ display: "flex", gap: "8px", marginTop: "15px", marginBottom: "20px", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
                    <button
                      onClick={() => handleHistoryTabChange("all")}
                      style={{
                        padding: "8px 16px",
                        border: "none",
                        background: historyTab === "all" ? "#2196f3" : "#f5f5f5",
                        color: historyTab === "all" ? "#fff" : "#666",
                        borderRadius: "20px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "500"
                      }}
                    >
                      전체
                    </button>
                    <button
                      onClick={() => handleHistoryTabChange("stamp")}
                      style={{
                        padding: "8px 16px",
                        border: "none",
                        background: historyTab === "stamp" ? "#ffc107" : "#f5f5f5",
                        color: historyTab === "stamp" ? "#fff" : "#666",
                        borderRadius: "20px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "500"
                      }}
                    >
                      ✉️ 스템프
                    </button>
                    <button
                      onClick={() => handleHistoryTabChange("gift")}
                      style={{
                        padding: "8px 16px",
                        border: "none",
                        background: historyTab === "gift" ? "#dc3545" : "#f5f5f5",
                        color: historyTab === "gift" ? "#fff" : "#666",
                        borderRadius: "20px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "500"
                      }}
                    >
                      🎁 쿠폰
                    </button>
                    <button
                      onClick={() => handleHistoryTabChange("badge")}
                      style={{
                        padding: "8px 16px",
                        border: "none",
                        background: historyTab === "badge" ? "#17a2b8" : "#f5f5f5",
                        color: historyTab === "badge" ? "#fff" : "#666",
                        borderRadius: "20px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "500"
                      }}
                    >
                      🏅 배지
                    </button>
                  </div>
                  
                  {/* 내역 리스트 */}
                  <div style={{ minHeight: "200px" }}>
                    {filteredHistory.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
                        <div style={{ fontSize: "48px", marginBottom: "10px" }}>📭</div>
                        <p>이벤트 내역이 없습니다</p>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {paginatedHistory.map((item) => (
                          <div
                            key={item.historyId}
                            style={{
                              padding: "15px",
                              background: "#f9f9f9",
                              borderRadius: "8px",
                              border: "1px solid #eee",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "12px"
                            }}
                          >
                            <div style={{ fontSize: "24px", flexShrink: 0 }}>
                              {getEventIcon(item.eventType)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: "bold", marginBottom: "4px", fontSize: "15px" }}>
                                {item.eventName}
                              </div>
                              {item.description && (
                                <div style={{ fontSize: "13px", color: "#666", marginBottom: "6px" }}>
                                  {item.description}
                                </div>
                              )}
                              <div style={{ fontSize: "12px", color: "#999", display: "flex", alignItems: "center", gap: "8px" }}>
                                <span>{formatDate(item.createdAt)}</span>
                                {item.count > 1 && (
                                  <span style={{ background: "#e3f2fd", padding: "2px 8px", borderRadius: "10px" }}>
                                    +{item.count}개
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          ))}
                        </div>
                        
                        {/* 페이징 버튼 */}
                        {totalHistoryPages > 1 && (
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
                              onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                              disabled={historyPage === 1}
                              style={{
                                padding: "6px 12px",
                                border: "1px solid #ddd",
                                background: historyPage === 1 ? "#f5f5f5" : "#fff",
                                color: historyPage === 1 ? "#999" : "#333",
                                borderRadius: "4px",
                                cursor: historyPage === 1 ? "not-allowed" : "pointer",
                                fontSize: "13px"
                              }}
                            >
                              이전
                            </button>
                            <span style={{ fontSize: "13px", color: "#666" }}>
                              {historyPage} / {totalHistoryPages}
                            </span>
                            <button
                              onClick={() => setHistoryPage(prev => Math.min(totalHistoryPages, prev + 1))}
                              disabled={historyPage === totalHistoryPages}
                              style={{
                                padding: "6px 12px",
                                border: "1px solid #ddd",
                                background: historyPage === totalHistoryPages ? "#f5f5f5" : "#fff",
                                color: historyPage === totalHistoryPages ? "#999" : "#333",
                                borderRadius: "4px",
                                cursor: historyPage === totalHistoryPages ? "not-allowed" : "pointer",
                                fontSize: "13px"
                              }}
                            >
                              다음
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
            </div>
          )}
          
          {/* 리뷰 내역 패널 */}
          {mode === "view" && (
            <div className="benefit-card" style={{ marginBottom: "20px" }}>
              <h3>✍️ 내가 작성한 리뷰</h3>
                  
                  {/* 리뷰 리스트 */}
                  <div style={{ minHeight: "200px", marginTop: "15px" }}>
                    {myReviews.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
                        <div style={{ fontSize: "48px", marginBottom: "10px" }}>📝</div>
                        <p>작성한 리뷰가 없습니다</p>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {paginatedReviews.map((review) => (
                          <div
                            key={review.reviewId}
                            onClick={() => handleReviewClick(review)}
                            style={{
                              padding: "15px",
                              background: "#f9f9f9",
                              borderRadius: "8px",
                              border: "1px solid #eee",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f0f0f0";
                              e.currentTarget.style.borderColor = "#ddd";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#f9f9f9";
                              e.currentTarget.style.borderColor = "#eee";
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: "bold", marginBottom: "6px", fontSize: "15px", color: "#333" }}>
                                  📍 {review.placeName || review.placeId}
                                </div>
                                <div style={{ fontSize: "14px", color: "#555", lineHeight: "1.5", marginBottom: "8px" }}>
                                  {review.content}
                                </div>
                                {review.images && review.images.length > 0 && (
                                  <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                                    {review.images.slice(0, 3).map((img, idx) => (
                                      <img
                                        key={idx}
                                        src={img}
                                        alt={`리뷰 이미지 ${idx + 1}`}
                                        style={{
                                          width: "60px",
                                          height: "60px",
                                          objectFit: "cover",
                                          borderRadius: "6px",
                                          border: "1px solid #ddd"
                                        }}
                                      />
                                    ))}
                                    {review.images.length > 3 && (
                                      <div style={{
                                        width: "60px",
                                        height: "60px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "#f0f0f0",
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                        color: "#666"
                                      }}>
                                        +{review.images.length - 3}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
                              {formatDate(review.createdAt)}
                            </div>
                          </div>
                          ))}
                        </div>
                        
                        {/* 페이징 버튼 */}
                        {totalReviewPages > 1 && (
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
                              {reviewPage} / {totalReviewPages}
                            </span>
                            <button
                              onClick={() => setReviewPage(prev => Math.min(totalReviewPages, prev + 1))}
                              disabled={reviewPage === totalReviewPages}
                              style={{
                                padding: "6px 12px",
                                border: "1px solid #ddd",
                                background: reviewPage === totalReviewPages ? "#f5f5f5" : "#fff",
                                color: reviewPage === totalReviewPages ? "#999" : "#333",
                                borderRadius: "4px",
                                cursor: reviewPage === totalReviewPages ? "not-allowed" : "pointer",
                                fontSize: "13px"
                              }}
                            >
                              다음
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
            </div>
          )}
          
          {/* 로그아웃 버튼 */}
          {mode === "view" && (
            <button onClick={handleLogout} className="logout-button">
              로그아웃
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPage;
