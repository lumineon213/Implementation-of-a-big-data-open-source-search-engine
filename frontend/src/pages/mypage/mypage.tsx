import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./MyPage.css";

interface MyPageDTO {
  accountId: string;
  accountName: string;
  email: string;
  phoneNumber: string;
  accountRole: string;
  regDate: string;
}

interface ApiErrorResponse {
  msg?: string;
  success?: boolean;
}

type PageMode = 'view' | 'edit';

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<MyPageDTO | null>(null);
  const [editData, setEditData] = useState<MyPageDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<PageMode>('view');

  const token = localStorage.getItem("token");

  // 마이페이지 정보 로딩
  const loadMyPage = async () => {
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get("/api/mypage", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(res.data);
      setEditData(res.data);
    } catch (err) {
      console.error("마이페이지 로딩 실패:", err);
      alert("정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyPage();
  }, []);

  // 수정 모드 전환
  const handleEditMode = () => {
    setMode('edit');
    setEditData(user);
  };

  // 취소
  const handleCancel = () => {
    setMode('view');
    setEditData(user);
  };

  // 입력 변경
  const handleChange = (field: keyof MyPageDTO, value: string) => {
    setEditData((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  // 저장
  const handleSave = async () => {
    if (!editData) return;

    // 유효성 검사
    const nameRegex = /^[가-힣a-zA-Z]{2,20}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;

    if (!nameRegex.test(editData.accountName)) {
      alert("이름은 한글 또는 영문만 입력 가능합니다.");
      return;
    }

    if (!emailRegex.test(editData.email)) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }

    if (!phoneRegex.test(editData.phoneNumber)) {
      alert("전화번호 형식이 올바르지 않습니다. 예) 010-1234-5678");
      return;
    }

    setIsSaving(true);

    try {
      const res = await axios.put("/api/mypage", editData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data > 0) {
        alert("정보가 수정되었습니다.");
        setUser(editData);
        setMode('view');
      } else {
        alert("수정 실패");
      }
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      alert(error.response?.data?.msg || "저장에 실패했습니다.");
      console.error("저장 실패:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // 로그아웃
  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="mypage-container">
        <div className="background-gradient">
          <div className="gradient-circle gradient-circle-1"></div>
          <div className="gradient-circle gradient-circle-2"></div>
          <div className="gradient-circle gradient-circle-3"></div>
        </div>
        <div className="loading-container">
          <svg className="spinner" viewBox="0 0 24 24">
            <circle className="spinner-circle" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="spinner-path" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <p>로딩중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mypage-container">
        <div className="background-gradient">
          <div className="gradient-circle gradient-circle-1"></div>
          <div className="gradient-circle gradient-circle-2"></div>
          <div className="gradient-circle gradient-circle-3"></div>
        </div>
        <div className="error-container">
          <p>로그인이 필요합니다.</p>
          <Link to="/login" className="back-to-login">로그인하러 가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <div className="background-gradient">
        <div className="gradient-circle gradient-circle-1"></div>
        <div className="gradient-circle gradient-circle-2"></div>
        <div className="gradient-circle gradient-circle-3"></div>
      </div>

      <div className="mypage-content">
        <div className="mypage-header">
     
          <p className="tagline">내 정보 관리</p>
        </div>

        <div className="mypage-card">
          <div className="card-header">
            <h2 className="card-title">
              {mode === 'view' ? '프로필' : '프로필 수정'}
            </h2>
            {mode === 'view' && (
              <button onClick={handleEditMode} className="edit-button">
                수정하기
              </button>
            )}
          </div>

          {mode === 'view' ? (
            <div className="profile-view">
              <div className="profile-section">
                <div className="profile-item">
                  <span className="item-label">아이디</span>
                  <span className="item-value">{user.accountId}</span>
                </div>

                <div className="profile-item">
                  <span className="item-label">이름</span>
                  <span className="item-value">{user.accountName}</span>
                </div>

                <div className="profile-item">
                  <span className="item-label">이메일</span>
                  <span className="item-value">{user.email}</span>
                </div>

                <div className="profile-item">
                  <span className="item-label">전화번호</span>
                  <span className="item-value">{user.phoneNumber}</span>
                </div>

       

                <div className="profile-item">
                  <span className="item-label">가입일</span>
                  <span className="item-value">
                    {new Date(user.regDate).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>

              <div className="button-group">
                <button onClick={handleLogout} className="logout-button">
                  로그아웃
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-edit">
              <div className="input-group">
                <label className="input-label">아이디</label>
                <input
                  type="text"
                  value={editData?.accountId}
                  disabled
                  className="input-field disabled"
                />
                <span className="input-hint">아이디는 변경할 수 없습니다</span>
              </div>

              <div className="input-group">
                <label className="input-label">이름 *</label>
                <input
                  type="text"
                  value={editData?.accountName}
                  onChange={(e) => handleChange("accountName", e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label className="input-label">이메일 *</label>
                <input
                  type="email"
                  value={editData?.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="email@example.com"
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label className="input-label">전화번호 *</label>
                <input
                  type="tel"
                  value={editData?.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  placeholder="010-1234-5678"
                  className="input-field"
                />
              </div>

              <div className="button-group-edit">
                <button 
                  onClick={handleCancel} 
                  className="cancel-button"
                  disabled={isSaving}
                >
                  취소
                </button>
                <button 
                  onClick={handleSave} 
                  className="save-button"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <svg className="spinner-small" viewBox="0 0 24 24">
                        <circle className="spinner-circle" cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="spinner-path" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      저장 중...
                    </>
                  ) : '저장하기'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPage;