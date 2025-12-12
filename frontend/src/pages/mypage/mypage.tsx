import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MyPage.css";
import { api } from "../../api/axios";
import { useDarkMode } from "../../contexts/DarkModeContext";
import ReservationHistory from '../reservation/reservationHistory';

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
  const { isDarkMode } = useDarkMode();
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

  // 문의 관련 상태
  interface Inquiry {
    inquiryId: number;
    writerId: string;
    writerName?: string;
    title: string;
    content: string;
    answerContent?: string;
    answererId?: string;
    answererName?: string;
    status: string;
    createdDate: string;
    answeredDate?: string;
  }
  const [myInquiries, setMyInquiries] = useState<Inquiry[]>([]);
  const [inquiryPage, setInquiryPage] = useState(1);

  // ============== 데이터 로딩 ==============
  const loadMyPage = async () => {
    // 토큰 여부 확인 (JWT가 없으면 로그인 페이지로 이동)
    const token = localStorage.getItem('token');
    if (!token) {
      console.log("토큰이 없어서 로그인 페이지로 이동합니다.");
      navigate('/login');
      setLoading(false);
      return;
    }

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
        loadMyInquiries();
      }
    } catch (e) {
      console.error("마이페이지 로딩 실패:", e);
      alert("마이페이지 정보를 불러올 수 없습니다.");
      navigate('/login');
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
  
  // 내 문의 내역 로드
  const loadMyInquiries = async () => {
    try {
      const res = await api.get("/inquiries");
      if (res.data.success && res.data.inquiries) {
        console.log("문의 데이터:", res.data.inquiries);
        setMyInquiries(res.data.inquiries);
      } else {
        console.warn("문의 데이터 응답 형식 오류:", res.data);
        setMyInquiries([]);
      }
    } catch (e: any) {
      console.error("문의 내역 로딩 실패:", e);
      if (e.response) {
        console.error("에러 상세:", e.response.status, e.response.data);
        if (e.response.status === 405) {
          console.error("405 오류: 백엔드 서버를 재시작해주세요.");
        }
      }
      setMyInquiries([]);
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

  // 답변된 문의만 필터링
  const answeredInquiries = myInquiries.filter(inq => 
    inq.status === "ANSWERED" && inq.answerContent && inq.answerContent.trim() !== ""
  );

  // 문의 페이징 계산
  const totalInquiryPages = Math.ceil(answeredInquiries.length / itemsPerPage);
  const startInquiryIndex = (inquiryPage - 1) * itemsPerPage;
  const endInquiryIndex = startInquiryIndex + itemsPerPage;
  const paginatedInquiries = answeredInquiries.slice(startInquiryIndex, endInquiryIndex);
  
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

  // 다크모드 스타일 헬퍼
  const getDarkModeStyle = (lightStyle: React.CSSProperties): React.CSSProperties => {
    if (!isDarkMode) return lightStyle;
    
    const darkStyle: React.CSSProperties = { ...lightStyle };
    
    // background와 backgroundColor 충돌 방지
    if (lightStyle.background) {
      if (lightStyle.background === "#f9f9f9") {
        darkStyle.background = "var(--bg-tertiary)";
      } else if (lightStyle.background === "#fff") {
        darkStyle.background = "var(--bg-secondary)";
      } else if (lightStyle.background === "#f5f5f5") {
        darkStyle.background = "var(--bg-tertiary)";
      } else if (lightStyle.background === "#e8f5e9") {
        darkStyle.background = "rgba(76, 175, 80, 0.2)";
      } else if (lightStyle.background === "#eaf4ff") {
        darkStyle.background = "rgba(100, 181, 246, 0.2)";
      }
    } else if (lightStyle.backgroundColor) {
      if (lightStyle.backgroundColor === "#f9f9f9") {
        darkStyle.backgroundColor = "var(--bg-tertiary)";
      } else if (lightStyle.backgroundColor === "#fff") {
        darkStyle.backgroundColor = "var(--bg-secondary)";
      } else if (lightStyle.backgroundColor === "#f5f5f5") {
        darkStyle.backgroundColor = "var(--bg-tertiary)";
      }
    }
    
    // color 처리
    if (lightStyle.color === "#333" || lightStyle.color === "#222") {
      darkStyle.color = "var(--text-primary)";
    } else if (lightStyle.color === "#666" || lightStyle.color === "#555") {
      darkStyle.color = "var(--text-secondary)";
    } else if (lightStyle.color === "#999") {
      darkStyle.color = "var(--text-tertiary)";
    }
    
    // border와 borderColor 충돌 방지
    if (lightStyle.border) {
      // border는 그대로 유지하되 색상만 변경
      const borderValue = String(lightStyle.border);
      if (borderValue.includes("#eee") || borderValue.includes("#ddd")) {
        darkStyle.border = borderValue.replace(/#eee|#ddd/g, "var(--border-color)");
      }
    } else if (lightStyle.borderColor) {
      if (lightStyle.borderColor === "#eee" || lightStyle.borderColor === "#ddd") {
        darkStyle.borderColor = "var(--border-color)";
      }
    }
    
    // borderTopColor 처리
    if (lightStyle.borderTopColor === "#eee") {
      darkStyle.borderTopColor = "var(--border-color)";
    }
    
    return darkStyle;
  };

  useEffect(() => {
    loadMyPage();
  }, []);

  // ============== 공통 변경 함수 ==============
  const handleChange = (key: keyof MyPageDTO, value: any) => {
    setEditData((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  // ============== 프로필 이미지 업로드 (FormData 방식) ==============
  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 미리보기 설정 (즉시 UI 업데이트)
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 서버에 즉시 업로드
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('accountName', editData?.accountName || user?.accountName || '');
      formData.append('email', editData?.email || user?.email || '');
      formData.append('phoneNumber', editData?.phoneNumber || user?.phoneNumber || '');
      formData.append('profileImage', file);

      console.log('📤 FormData에 포함된 파일:', file.name, 'Size:', file.size);

      const response = await api.put('/mypage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('📸 이미지 업로드 응답:', response.data);

      if (response.data.success) {
        // 업로드된 이미지 URL로 상태 업데이트
        const uploadedImageUrl = response.data.data?.profileImage;
        console.log('✅ 업로드된 이미지 URL:', uploadedImageUrl);
        console.log('✅ response.data.data 전체:', response.data.data);
        
        if (uploadedImageUrl) {
          // ✅ 캐시 무효화를 위해 쿼리 파라미터 추가
          const urlWithTimestamp = `${uploadedImageUrl}?t=${Date.now()}`;
          
          console.log('🔄 상태 업데이트 시작');
          setUser((prev) => {
            const updated = prev ? { ...prev, profileImage: urlWithTimestamp } : prev;
            console.log('✅ setUser 실행:', updated);
            return updated;
          });
          
          setEditData((prev) => {
            const updated = prev ? { ...prev, profileImage: urlWithTimestamp } : prev;
            console.log('✅ setEditData 실행:', updated);
            return updated;
          });
          
          setProfilePreview(null);
          
          // ✅ 파일 input 초기화 (매우 중요!)
          const fileInput = document.getElementById("profileUpload") as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
          
          console.log('✅ 모든 상태 업데이트 완료, 최종 URL:', urlWithTimestamp);
          alert('프로필 이미지가 성공적으로 변경되었습니다.');
        } else {
          console.warn('⚠️ 응답에 profileImage URL이 없습니다');
          console.warn('⚠️ response.data.data:', response.data.data);
          alert('이미지 URL을 받지 못했습니다. 서버 응답을 확인하세요.');
        }
      } else {
        console.error('❌ success가 false:', response.data.message);
        alert('이미지 업로드에 실패했습니다: ' + response.data.message);
        setProfilePreview(null);
      }
    } catch (error: any) {
      console.error('❌ 이미지 업로드 실패:', error);
      console.error('응답 상태:', error.response?.status);
      console.error('응답 데이터:', error.response?.data);
      alert('이미지 업로드 중 오류가 발생했습니다: ' + (error.response?.data?.message || error.message));
      setProfilePreview(null);
    } finally {
      setIsSaving(false);
    }
  };

  // ============== 저장 (FormData 방식) ==============
  const handleSave = async () => {
    if (!editData) return;
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('accountName', editData.accountName);
      formData.append('email', editData.email);
      formData.append('phoneNumber', editData.phoneNumber);

      const response = await api.put('/mypage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setUser(editData);
        setMode("view");
        alert("정보가 수정되었습니다.");
      } else {
        alert("정보 수정에 실패했습니다: " + response.data.message);
      }
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
            <button
    className="profile-logout-btn"
    onClick={handleLogout}
    title="로그아웃"
  >
    로그아웃
  </button>
            {/* 프로필 이미지 */}
            <img
              key={profilePreview || user.profileImage}
              src={profilePreview || user.profileImage || "/default-profile.png"}
              className="profile-image"
              alt="프로필"
              crossOrigin="anonymous"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                console.error(' 이미지 로딩 실패:', img.src);
                // 만약 상대 경로였다면 절대 경로로 변경 시도
                if (!img.src.includes('://')) {
                  img.src = `http://localhost:8484${img.src}`;
                }
              }}
              onLoad={(e) => {
                console.log(' 이미지 로딩 성공:', (e.target as HTMLImageElement).src);
              }}
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
                  <div style={getDarkModeStyle({ 
                    display: "flex", 
                    gap: "8px", 
                    marginTop: "15px", 
                    marginBottom: "20px", 
                    borderBottom: "2px solid #eee", 
                    paddingBottom: "10px" 
                  })}>
                    <button
                      onClick={() => handleHistoryTabChange("all")}
                      style={{
                        padding: "8px 16px",
                        border: "none",
                        background: historyTab === "all" ? "#2196f3" : (isDarkMode ? "var(--bg-tertiary)" : "#f5f5f5"),
                        color: historyTab === "all" ? "#fff" : (isDarkMode ? "var(--text-secondary)" : "#666"),
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
                        background: historyTab === "stamp" ? "#ffc107" : (isDarkMode ? "var(--bg-tertiary)" : "#f5f5f5"),
                        color: historyTab === "stamp" ? "#fff" : (isDarkMode ? "var(--text-secondary)" : "#666"),
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
                        background: historyTab === "gift" ? "#dc3545" : (isDarkMode ? "var(--bg-tertiary)" : "#f5f5f5"),
                        color: historyTab === "gift" ? "#fff" : (isDarkMode ? "var(--text-secondary)" : "#666"),
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
                        background: historyTab === "badge" ? "#17a2b8" : (isDarkMode ? "var(--bg-tertiary)" : "#f5f5f5"),
                        color: historyTab === "badge" ? "#fff" : (isDarkMode ? "var(--text-secondary)" : "#666"),
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
                      <div style={{ textAlign: "center", padding: "40px 20px", color: isDarkMode ? "var(--text-tertiary)" : "#999" }}>
                        <div style={{ fontSize: "48px", marginBottom: "10px" }}>📭</div>
                        <p>이벤트 내역이 없습니다</p>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {paginatedHistory.map((item) => (
                          <div
                            key={item.historyId}
                            style={getDarkModeStyle({
                              padding: "15px",
                              background: "#f9f9f9",
                              borderRadius: "8px",
                              border: "1px solid #eee",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "12px"
                            })}
                          >
                            <div style={{ fontSize: "24px", flexShrink: 0 }}>
                              {getEventIcon(item.eventType)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: "bold", marginBottom: "4px", fontSize: "15px", color: isDarkMode ? "var(--text-primary)" : "#333" }}>
                                {item.eventName}
                              </div>
                              {item.description && (
                                <div style={{ fontSize: "13px", color: isDarkMode ? "var(--text-secondary)" : "#666", marginBottom: "6px" }}>
                                  {item.description}
                                </div>
                              )}
                              <div style={{ fontSize: "12px", color: isDarkMode ? "var(--text-tertiary)" : "#999", display: "flex", alignItems: "center", gap: "8px" }}>
                                <span>{formatDate(item.createdAt)}</span>
                                {item.count > 1 && (
                                  <span style={{ background: isDarkMode ? "rgba(100, 181, 246, 0.2)" : "#e3f2fd", padding: "2px 8px", borderRadius: "10px", color: isDarkMode ? "#64b5f6" : "#1976d2" }}>
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
                          <div style={getDarkModeStyle({ 
                            display: "flex", 
                            justifyContent: "center", 
                            alignItems: "center", 
                            gap: "10px", 
                            marginTop: "20px",
                            paddingTop: "15px",
                            borderTop: "1px solid #eee"
                          })}>
                            <button
                              onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                              disabled={historyPage === 1}
                              style={getDarkModeStyle({
                                padding: "6px 12px",
                                border: "1px solid #ddd",
                                background: historyPage === 1 ? (isDarkMode ? "var(--bg-tertiary)" : "#f5f5f5") : (isDarkMode ? "var(--bg-secondary)" : "#fff"),
                                color: historyPage === 1 ? (isDarkMode ? "var(--text-tertiary)" : "#999") : (isDarkMode ? "var(--text-primary)" : "#333"),
                                borderRadius: "4px",
                                cursor: historyPage === 1 ? "not-allowed" : "pointer",
                                fontSize: "13px"
                              })}
                            >
                              이전
                            </button>
                            <span style={{ fontSize: "13px", color: isDarkMode ? "var(--text-secondary)" : "#666" }}>
                              {historyPage} / {totalHistoryPages}
                            </span>
                            <button
                              onClick={() => setHistoryPage(prev => Math.min(totalHistoryPages, prev + 1))}
                              disabled={historyPage === totalHistoryPages}
                              style={getDarkModeStyle({
                                padding: "6px 12px",
                                border: "1px solid #ddd",
                                background: historyPage === totalHistoryPages ? (isDarkMode ? "var(--bg-tertiary)" : "#f5f5f5") : (isDarkMode ? "var(--bg-secondary)" : "#fff"),
                                color: historyPage === totalHistoryPages ? (isDarkMode ? "var(--text-tertiary)" : "#999") : (isDarkMode ? "var(--text-primary)" : "#333"),
                                borderRadius: "4px",
                                cursor: historyPage === totalHistoryPages ? "not-allowed" : "pointer",
                                fontSize: "13px"
                              })}
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

          {/* 예약 내역 패널 */}
          {mode === "view" && (
                <section className="benefit-card" style={{ marginBottom: "20px" }}>
                    {/* ReservationHistory 컴포넌트 호출 */}
                    <ReservationHistory /> 
                </section>
            )}
          {/* 리뷰 내역 패널 */}
          {mode === "view" && (
            <div className="benefit-card" style={{ marginBottom: "20px" }}>
              <h3>✍️ 내가 작성한 리뷰</h3>
                  
                  {/* 리뷰 리스트 */}
                  <div style={{ minHeight: "200px", marginTop: "15px" }}>
                    {myReviews.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: isDarkMode ? "var(--text-tertiary)" : "#999" }}>
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
                            style={getDarkModeStyle({
                              padding: "15px",
                              background: "#f9f9f9",
                              borderRadius: "8px",
                              border: "1px solid #eee",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            })}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = isDarkMode ? "var(--bg-secondary)" : "#f0f0f0";
                              e.currentTarget.style.borderColor = isDarkMode ? "var(--border-color)" : "#ddd";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = isDarkMode ? "var(--bg-tertiary)" : "#f9f9f9";
                              e.currentTarget.style.borderColor = isDarkMode ? "var(--border-color)" : "#eee";
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: "bold", marginBottom: "6px", fontSize: "15px", color: isDarkMode ? "var(--text-primary)" : "#333" }}>
                                  📍 {review.placeName || review.placeId}
                                </div>
                                <div style={{ fontSize: "14px", color: isDarkMode ? "var(--text-secondary)" : "#555", lineHeight: "1.5", marginBottom: "8px" }}>
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
                                          border: isDarkMode ? "1px solid var(--border-color)" : "1px solid #ddd"
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
                                        background: isDarkMode ? "var(--bg-tertiary)" : "#f0f0f0",
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                        color: isDarkMode ? "var(--text-secondary)" : "#666"
                                      }}>
                                        +{review.images.length - 3}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div style={{ fontSize: "12px", color: isDarkMode ? "var(--text-tertiary)" : "#999", marginTop: "8px" }}>
                              {formatDate(review.createdAt)}
                            </div>
                          </div>
                          ))}
                        </div>
                        
                        {/* 페이징 버튼 */}
                        {totalReviewPages > 1 && (
                          <div style={getDarkModeStyle({ 
                            display: "flex", 
                            justifyContent: "center", 
                            alignItems: "center", 
                            gap: "10px", 
                            marginTop: "20px",
                            paddingTop: "15px",
                            borderTop: "1px solid #eee"
                          })}>
                            <button
                              onClick={() => setReviewPage(prev => Math.max(1, prev - 1))}
                              disabled={reviewPage === 1}
                              style={getDarkModeStyle({
                                padding: "6px 12px",
                                border: "1px solid #ddd",
                                background: reviewPage === 1 ? (isDarkMode ? "var(--bg-tertiary)" : "#f5f5f5") : (isDarkMode ? "var(--bg-secondary)" : "#fff"),
                                color: reviewPage === 1 ? (isDarkMode ? "var(--text-tertiary)" : "#999") : (isDarkMode ? "var(--text-primary)" : "#333"),
                                borderRadius: "4px",
                                cursor: reviewPage === 1 ? "not-allowed" : "pointer",
                                fontSize: "13px"
                              })}
                            >
                              이전
                            </button>
                            <span style={{ fontSize: "13px", color: isDarkMode ? "var(--text-secondary)" : "#666" }}>
                              {reviewPage} / {totalReviewPages}
                            </span>
                            <button
                              onClick={() => setReviewPage(prev => Math.min(totalReviewPages, prev + 1))}
                              disabled={reviewPage === totalReviewPages}
                              style={getDarkModeStyle({
                                padding: "6px 12px",
                                border: "1px solid #ddd",
                                background: reviewPage === totalReviewPages ? (isDarkMode ? "var(--bg-tertiary)" : "#f5f5f5") : (isDarkMode ? "var(--bg-secondary)" : "#fff"),
                                color: reviewPage === totalReviewPages ? (isDarkMode ? "var(--text-tertiary)" : "#999") : (isDarkMode ? "var(--text-primary)" : "#333"),
                                borderRadius: "4px",
                                cursor: reviewPage === totalReviewPages ? "not-allowed" : "pointer",
                                fontSize: "13px"
                              })}
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
          
          {/* 문의 답변 패널 */}
          {mode === "view" && (
            <div className="benefit-card" style={{ marginBottom: "20px" }}>
              <h3>💬 문의사항 답변</h3>
                  
                  {/* 문의 리스트 */}
                  <div style={{ minHeight: "200px", marginTop: "15px" }}>
                    {answeredInquiries.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: isDarkMode ? "var(--text-tertiary)" : "#999" }}>
                        <div style={{ fontSize: "48px", marginBottom: "10px" }}>📭</div>
                        <p>답변된 문의가 없습니다</p>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {paginatedInquiries.map((inquiry) => (
                          <div
                            key={inquiry.inquiryId}
                            style={getDarkModeStyle({
                              padding: "12px",
                              background: "#f9f9f9",
                              borderRadius: "8px",
                              border: "1px solid #eee",
                              fontSize: "13px"
                            })}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: "bold", marginBottom: "4px", fontSize: "14px", color: isDarkMode ? "var(--text-primary)" : "#333" }}>
                                  {inquiry.title}
                                </div>
                                <div style={{ fontSize: "12px", color: isDarkMode ? "var(--text-secondary)" : "#666", marginBottom: "6px", lineHeight: "1.4" }}>
                                  {inquiry.content.length > 50 ? inquiry.content.substring(0, 50) + "..." : inquiry.content}
                                </div>
                                <div style={{ 
                                  padding: "8px", 
                                  background: isDarkMode ? "rgba(76, 175, 80, 0.2)" : "#e8f5e9", 
                                  borderRadius: "6px", 
                                  marginTop: "8px",
                                  fontSize: "12px",
                                  lineHeight: "1.5"
                                }}>
                                  <div style={{ fontWeight: "600", color: isDarkMode ? "#81c784" : "#2e7d32", marginBottom: "4px" }}>
                                    ✓ 답변:
                                  </div>
                                  <div style={{ color: isDarkMode ? "var(--text-secondary)" : "#555" }}>
                                    {inquiry.answerContent}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div style={{ fontSize: "11px", color: isDarkMode ? "var(--text-tertiary)" : "#999", marginTop: "8px", display: "flex", gap: "12px" }}>
                              <span>문의일: {inquiry.createdDate ? new Date(inquiry.createdDate).toLocaleDateString('ko-KR') : "-"}</span>
                              {inquiry.answeredDate && (
                                <span>답변일: {new Date(inquiry.answeredDate).toLocaleDateString('ko-KR')}</span>
                              )}
                            </div>
                          </div>
                          ))}
                        </div>
                        
                        {/* 페이징 버튼 */}
                        {totalInquiryPages > 1 && (
                          <div style={getDarkModeStyle({ 
                            display: "flex", 
                            justifyContent: "center", 
                            alignItems: "center", 
                            gap: "10px", 
                            marginTop: "20px",
                            paddingTop: "15px",
                            borderTop: "1px solid #eee"
                          })}>
                            <button
                              onClick={() => setInquiryPage(prev => Math.max(1, prev - 1))}
                              disabled={inquiryPage === 1}
                              style={getDarkModeStyle({
                                padding: "6px 12px",
                                border: "1px solid #ddd",
                                background: inquiryPage === 1 ? (isDarkMode ? "var(--bg-tertiary)" : "#f5f5f5") : (isDarkMode ? "var(--bg-secondary)" : "#fff"),
                                color: inquiryPage === 1 ? (isDarkMode ? "var(--text-tertiary)" : "#999") : (isDarkMode ? "var(--text-primary)" : "#333"),
                                borderRadius: "4px",
                                cursor: inquiryPage === 1 ? "not-allowed" : "pointer",
                                fontSize: "13px"
                              })}
                            >
                              이전
                            </button>
                            <span style={{ fontSize: "13px", color: isDarkMode ? "var(--text-secondary)" : "#666" }}>
                              {inquiryPage} / {totalInquiryPages}
                            </span>
                            <button
                              onClick={() => setInquiryPage(prev => Math.min(totalInquiryPages, prev + 1))}
                              disabled={inquiryPage === totalInquiryPages}
                              style={getDarkModeStyle({
                                padding: "6px 12px",
                                border: "1px solid #ddd",
                                background: inquiryPage === totalInquiryPages ? (isDarkMode ? "var(--bg-tertiary)" : "#f5f5f5") : (isDarkMode ? "var(--bg-secondary)" : "#fff"),
                                color: inquiryPage === totalInquiryPages ? (isDarkMode ? "var(--text-tertiary)" : "#999") : (isDarkMode ? "var(--text-primary)" : "#333"),
                                borderRadius: "4px",
                                cursor: inquiryPage === totalInquiryPages ? "not-allowed" : "pointer",
                                fontSize: "13px"
                              })}
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

       
        </div>
      </div>
    </div>
  );
};

export default MyPage;
