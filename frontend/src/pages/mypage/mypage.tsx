import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./MyPage.css";

interface MyPageDTO {
  accountId: string;
  accountName: string;
  email: string;
  phoneNumber: string;
  accountRole: string;
  regDate: string;

  travelThemes?: string[];
  transportType?: string;
  budgetLevel?: string;
  travelStyle?: string;

  preferredArea?: string;
  foodPreference?: string;
  nightLifeLevel?: string;
  walkingLevel?: string;
  ageGroup?: string;

  profileImage?: string;
}

type PageMode = "view" | "edit";

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<MyPageDTO | null>(null);
  const [editData, setEditData] = useState<MyPageDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<PageMode>("view");

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const token = localStorage.getItem("token");

  const [currentDate] = useState(new Date());

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const prev = new Date(year, month, 0);

    const firstDay = first.getDay();
    const lastDate = last.getDate();
    const prevLast = prev.getDate();

    const grid: any[] = [];

    for (let i = firstDay - 1; i >= 0; i--) grid.push({ date: prevLast - i, isCurrentMonth: false });
    for (let i = 1; i <= lastDate; i++) grid.push({ date: i, isCurrentMonth: true });

    while (grid.length < 42) grid.push({ date: grid.length, isCurrentMonth: false });
    return grid;
  };

  const isToday = (date: number) => {
    const now = new Date();
    return (
      now.getDate() === date &&
      now.getMonth() === currentDate.getMonth() &&
      now.getFullYear() === currentDate.getFullYear()
    );
  };

  // ============== 데이터 로딩 ==============
  const loadMyPage = async () => {
    try {
      const res = await axios.get("/api/mypage", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: MyPageDTO = {
        ...res.data,
        travelThemes: res.data.travelThemes || [],
        transportType: res.data.transportType || "walk",
        budgetLevel: res.data.budgetLevel || "mid",
        travelStyle: res.data.travelStyle || "slow",
        preferredArea: res.data.preferredArea || "해운대",
        foodPreference: res.data.foodPreference || "seafood",
        nightLifeLevel: res.data.nightLifeLevel || "low",
        walkingLevel: res.data.walkingLevel || "mid",
        ageGroup: res.data.ageGroup || "20",
        profileImage: res.data.profileImage || null,
      };

      setUser(data);
      setEditData(data);
    } catch (e) {
      alert("마이페이지 정보를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyPage();
  }, []);

  // ============== 공통 변경 함수 ==============
  const handleChange = (key: keyof MyPageDTO, value: any) => {
    setEditData((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const toggleTheme = (theme: string) => {
    setEditData((prev) => {
      if (!prev) return prev;
      const list = prev.travelThemes || [];

      return list.includes(theme)
        ? { ...prev, travelThemes: list.filter((t) => t !== theme) }
        : { ...prev, travelThemes: [...list, theme] };
    });
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
      await axios.put("/api/mypage", editData, { headers: { Authorization: `Bearer ${token}` } });
      setUser(editData);
      setMode("view");
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

  if (loading) return <>로딩중...</>;

  if (!user)
    return (
      <div className="mypage-nologin">
        <p>로그인이 필요합니다.</p>
        <Link to="/login">로그인</Link>
      </div>
    );

  const cal = generateCalendar();

  return (
    <div className="mypage-layout">
      <h2 className="mypage-title">마이페이지</h2>

      <div className="mypage-main">
        {/* LEFT */}
        <div className="mypage-left">
          <div className="profile-card">
     
            {/* 프로필 이미지 */}
            <img
              src={profilePreview || user.profileImage || "/default-profile.png"}
              className="profile-image"
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
              프로필 이미지 설정
            </button>
          </div>

          <div className="calendar-box">
            <p className="calendar-title">
              📅 {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
            </p>

            <div className="calendar-grid">
              {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                <div key={d} className="calendar-weekday">
                  {d}
                </div>
              ))}

              {cal.map((c, i) => (
                <div
                  key={i}
                  className={`calendar-date 
                    ${c.isCurrentMonth ? "" : "other-month"}
                    ${isToday(c.date) ? "today" : ""}`}
                >
                  {c.date}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="mypage-right">
          <div className="benefit-card">
            <h3>나의 여행 취향</h3>
            <ul>
              <li>선호 테마: {user.travelThemes?.join(", ") || "미설정"}</li>
              <li>선호 지역: {user.preferredArea}</li>
              <li>음식 취향: {user.foodPreference}</li>
              <li>이동 방식: {user.transportType}</li>
              <li>예산: {user.budgetLevel}</li>
              <li>여행 스타일: {user.travelStyle}</li>
              <li>도보 가능도: {user.walkingLevel}</li>
              <li>밤문화 선호도: {user.nightLifeLevel}</li>
              <li>연령대: {user.ageGroup}</li>
            </ul>
          </div>

          <div className="activity-card">
            <div className="activity-title-row">
              <h3>부산 여행 활동</h3>

              {mode === "view" && (
                <button className="edit-profile-btn" onClick={() => setMode("edit")}>
                  수정
                </button>
              )}
            </div>

            {/* VIEW MODE */}
            {mode === "view" ? (
              <>
                <div className="activity-grid">
                  <div className="activity-item">📍 추천 명소</div>
                  <div className="activity-item">🍜 맛집 기록</div>
                  <div className="activity-item">🗺 나만의 동선</div>
                  <div className="activity-item">🚶 뚜벅이 코스</div>
                  <div className="activity-item">🎆 밤문화 코스</div>
                  <div className="activity-item">📸 사진 명소</div>
                </div>

                <button onClick={handleLogout} className="logout-button">
                  로그아웃
                </button>
              </>
            ) : (
              // EDIT MODE
              <div className="profile-edit-box">
                <h4>회원 정보 + 여행 취향 수정</h4>

                {/* 회원 정보 */}
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

                {/* 여행 테마 */}
                <label>여행 테마</label>
                <div className="theme-options">
                  {["힐링", "맛집", "뚜벅이", "밤문화", "사진명소", "자연", "문화"].map(
                    (theme) => (
                      <button
                        key={theme}
                        className={
                          editData?.travelThemes?.includes(theme)
                            ? "theme-btn selected"
                            : "theme-btn"
                        }
                        onClick={() => toggleTheme(theme)}
                        type="button"
                      >
                        {theme}
                      </button>
                    )
                  )}
                </div>

                <label>선호 지역</label>
                <select
                  value={editData?.preferredArea}
                  onChange={(e) => handleChange("preferredArea", e.target.value)}
                >
                  <option value="해운대">해운대</option>
                  <option value="광안리">광안리</option>
                  <option value="남포동">남포동</option>
                  <option value="서면">서면</option>
                </select>

                <label>음식 취향</label>
                <select
                  value={editData?.foodPreference}
                  onChange={(e) => handleChange("foodPreference", e.target.value)}
                >
                  <option value="seafood">해산물</option>
                  <option value="meat">고기</option>
                  <option value="dessert">디저트</option>
                  <option value="local">부산 전통 음식</option>
                </select>

                <label>이동 방식</label>
                <select
                  value={editData?.transportType}
                  onChange={(e) => handleChange("transportType", e.target.value)}
                >
                  <option value="walk">도보</option>
                  <option value="public">대중교통</option>
                  <option value="car">자차</option>
                </select>

                <label>예산</label>
                <select
                  value={editData?.budgetLevel}
                  onChange={(e) => handleChange("budgetLevel", e.target.value)}
                >
                  <option value="low">저가</option>
                  <option value="mid">중간</option>
                  <option value="high">고급</option>
                </select>

                <label>여행 스타일</label>
                <select
                  value={editData?.travelStyle}
                  onChange={(e) => handleChange("travelStyle", e.target.value)}
                >
                  <option value="slow">여유롭게</option>
                  <option value="fast">빠르게</option>
                </select>

                <label>도보 가능도</label>
                <select
                  value={editData?.walkingLevel}
                  onChange={(e) => handleChange("walkingLevel", e.target.value)}
                >
                  <option value="low">짧게만</option>
                  <option value="mid">적당히</option>
                  <option value="high">많이 걷기</option>
                </select>

                <label>밤문화 선호도</label>
                <select
                  value={editData?.nightLifeLevel}
                  onChange={(e) => handleChange("nightLifeLevel", e.target.value)}
                >
                  <option value="none">없음</option>
                  <option value="low">조금</option>
                  <option value="mid">보통</option>
                  <option value="high">많음</option>
                </select>

                <label>연령대</label>
                <select
                  value={editData?.ageGroup}
                  onChange={(e) => handleChange("ageGroup", e.target.value)}
                >
                  <option value="10">10대</option>
                  <option value="20">20대</option>
                  <option value="30">30대</option>
                  <option value="40">40대</option>
                  <option value="50">50대 이상</option>
                </select>

                <div className="edit-btn-row">
                  <button onClick={handleCancel}>취소</button>
                  <button disabled={isSaving} onClick={handleSave}>
                    {isSaving ? "저장중..." : "저장하기"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
