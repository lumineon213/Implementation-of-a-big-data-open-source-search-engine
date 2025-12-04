import React, { useState } from 'react';
import axios, { AxiosError } from "axios";
import './Login.css';
import { Link, useNavigate } from "react-router-dom";

type PageType = 'login' | 'signup';

interface ApiErrorResponse {
  msg?: string;
  success?: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState<PageType>('login');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 로그인 상태
  const [loginData, setLoginData] = useState({
    accountId: '',
    accountPw: ''
  });

  // 회원가입 상태
  const [signupData, setSignupData] = useState({
    accountId: '',
    accountPw: '',
    accountPwConfirm: '',
    accountName: '',
    email: '',
    phoneNumber: ''
  });

  /** ================================
   *  로그인 요청 (JWT 방식)
   *  ================================ */
  const handleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("/api/login/login", {
        accountId: loginData.accountId,
        accountPw: loginData.accountPw
      });

      if (res.data.success) {
        // ⭐ JWT 저장
        localStorage.setItem("token", res.data.token);

        alert("로그인 성공!");
        console.log("로그인 결과:", res.data.user);

        navigate("/"); 
      } else {
        alert(res.data.msg || "로그인 실패");
      }

    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      alert(error.response?.data?.msg || "로그인 실패 (아이디/비밀번호 확인)");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /** ================================
   *  회원가입 요청
   *  ================================ */
  const handleSignup = async (e: React.MouseEvent) => {
    e.preventDefault();

    const idRegex = /^[a-zA-Z0-9]{5,20}$/;
    const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
    const nameRegex = /^[가-힣a-zA-Z]{2,20}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;

    // 입력값 체크
    if (!signupData.accountId || !signupData.accountName || !signupData.email ||
        !signupData.phoneNumber || !signupData.accountPw) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    // 정규식 검증
    if (!idRegex.test(signupData.accountId)) {
      alert("아이디는 영문/숫자 조합 5~20자여야 합니다.");
      return;
    }

    if (!pwRegex.test(signupData.accountPw)) {
      alert("비밀번호는 영문/숫자/특수문자를 포함한 8~20자여야 합니다.");
      return;
    }

    if (signupData.accountPw !== signupData.accountPwConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!nameRegex.test(signupData.accountName)) {
      alert("이름은 한글 또는 영문만 입력 가능합니다.");
      return;
    }

    if (!emailRegex.test(signupData.email)) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }

    if (!phoneRegex.test(signupData.phoneNumber)) {
      alert("전화번호 형식이 올바르지 않습니다. 예) 010-1234-5678");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post("/api/login/signup", {
        accountId: signupData.accountId,
        accountPw: signupData.accountPw,
        accountName: signupData.accountName,
        email: signupData.email,
        phoneNumber: signupData.phoneNumber
      });

      if (res.data.success) {
        alert("회원가입 성공! 로그인해주세요.");
        setPage("login");

        setSignupData({
          accountId: '',
          accountPw: '',
          accountPwConfirm: '',
          accountName: '',
          email: '',
          phoneNumber: ''
        });
      } else {
        alert(res.data.msg || "회원가입 실패");
      }

    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      alert(error.response?.data?.msg || "회원가입 실패");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'kakao' | 'naver') => {
    alert(`${provider} 로그인은 아직 미구현`);
  };

  return (
    <div className="login-container">
      <div className="background-gradient">
        <div className="gradient-circle gradient-circle-1"></div>
        <div className="gradient-circle gradient-circle-2"></div>
        <div className="gradient-circle gradient-circle-3"></div>
      </div>

      <div className="login-content">
        <div className="login-header">
          <h1 className="logo">
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              kh<span className="logo-accent">.solr</span>
            </Link>
          </h1>
          <p className="tagline">가장 빠른 AI 검색을 경험하세요</p>
        </div>

        <div className="login-card">
          <div className="tab-container">
            <button onClick={() => setPage('login')} className={`tab-button ${page === 'login' ? 'tab-active' : ''}`}>
              로그인
            </button>
            <button onClick={() => setPage('signup')} className={`tab-button ${page === 'signup' ? 'tab-active' : ''}`}>
              회원가입
            </button>
          </div>

          {page === 'login' ? (
            <>
              <div className="form-section">
                <div className="input-group">
                  <label htmlFor="loginId" className="input-label">아이디</label>
                  <input
                    id="loginId"
                    type="text"
                    value={loginData.accountId}
                    onChange={(e) => setLoginData({...loginData, accountId: e.target.value})}
                    placeholder="아이디를 입력하세요"
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="loginPw" className="input-label">비밀번호</label>
                  <input
                    id="loginPw"
                    type="password"
                    value={loginData.accountPw}
                    onChange={(e) => setLoginData({...loginData, accountPw: e.target.value})}
                    placeholder="••••••••"
                    className="input-field"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLogin(e as unknown as React.MouseEvent);
                      }
                    }}
                  />
                </div>

                <div className="remember-forgot">
                  <label className="checkbox-label">
                    <input type="checkbox" className="checkbox-input"/>
                    로그인 유지
                  </label>
                  <button className="forgot-password">비밀번호 찾기</button>
                </div>

                <button onClick={handleLogin} disabled={isLoading} className="submit-button">
                  {isLoading ? (
                    <>
                      <svg className="spinner" viewBox="0 0 24 24">
                        <circle className="spinner-circle" cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="spinner-path" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      로그인 중...
                    </>
                  ) : '로그인'}
                </button>
              </div>

              <div className="divider"></div>

              <div className="social-buttons">
                <button onClick={() => handleSocialLogin('google')} className="social-button google">
                  Google로 계속하기
                </button>
                <button onClick={() => handleSocialLogin('kakao')} className="social-button kakao">
                  카카오로 계속하기
                </button>
                <button onClick={() => handleSocialLogin('naver')} className="social-button naver">
                  네이버로 계속하기
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="signup-form">
                <div className="input-group">
                  <label className="input-label">아이디 *</label>
                  <input
                    type="text"
                    value={signupData.accountId}
                    onChange={(e) => setSignupData({...signupData, accountId: e.target.value})}
                    placeholder="아이디를 입력하세요"
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">이름 *</label>
                  <input
                    type="text"
                    value={signupData.accountName}
                    onChange={(e) => setSignupData({...signupData, accountName: e.target.value})}
                    placeholder="이름을 입력하세요"
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">이메일 *</label>
                  <input
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                    placeholder="email@example.com"
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">전화번호 *</label>
                  <input
                    type="tel"
                    value={signupData.phoneNumber}
                    onChange={(e) => setSignupData({...signupData, phoneNumber: e.target.value})}
                    placeholder="010-1234-5678"
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">비밀번호 *</label>
                  <input
                    type="password"
                    value={signupData.accountPw}
                    onChange={(e) => setSignupData({...signupData, accountPw: e.target.value})}
                    placeholder="영문/숫자/특수문자 포함 8자 이상"
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">비밀번호 확인 *</label>
                  <input
                    type="password"
                    value={signupData.accountPwConfirm}
                    onChange={(e) => setSignupData({...signupData, accountPwConfirm: e.target.value})}
                    placeholder="다시 입력하세요"
                    className="input-field"
                  />
                </div>
              </div>

              <button onClick={handleSignup} disabled={isLoading} className="submit-button signup-submit">
                {isLoading ? "가입 중..." : "회원가입"}
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  );
};

export default Login;
