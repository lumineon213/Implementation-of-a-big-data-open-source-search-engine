import React, { useState } from 'react';
import './login.css';

type PageType = 'login' | 'signup';

const Login: React.FC = () => {
  const [page, setPage] = useState<PageType>('login');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 로그인 상태
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  
  // 회원가입 상태
  const [signupData, setSignupData] = useState({
    accountId: '',
    accountPw: '',
    accountPwConfirm: '',
    accountName: '',
    email: '',
    phoneNumber: ''
  });

  const handleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      console.log('Login attempt:', { loginEmail, loginPassword });
      alert('로그인 성공! (백엔드 연동 필요)');
      setIsLoading(false);
    }, 1500);
  };

  const handleSignup = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    if (signupData.accountPw !== signupData.accountPwConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (signupData.accountPw.length < 8) {
      alert('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      console.log('Signup attempt:', signupData);
      alert('회원가입 성공! (백엔드 연동 필요)');
      setIsLoading(false);
      setPage('login');
    }, 1500);
  };

  const handleSocialLogin = (provider: 'google' | 'kakao' | 'naver') => {
    console.log(`${provider} login clicked`);
    alert(`${provider} 로그인 (OAuth 연동 필요)`);
  };

  return (
    <div className="login-container">
      {/* 움직이는 보라색 그라데이션 배경 */}
      <div className="background-gradient">
        <div className="gradient-circle gradient-circle-1"></div>
        <div className="gradient-circle gradient-circle-2"></div>
        <div className="gradient-circle gradient-circle-3"></div>
      </div>

      <div className="login-content">
        {/* 로고 및 헤더 */}
        <div className="login-header">
          <h1 className="logo">
            kh<span className="logo-accent">.solr</span>
          </h1>
          <p className="tagline">가장 빠른 AI 검색을 경험하세요</p>
        </div>

        {/* 카드 */}
        <div className="login-card">
          {/* 탭 전환 */}
          <div className="tab-container">
            <button
              onClick={() => setPage('login')}
              className={`tab-button ${page === 'login' ? 'tab-active' : ''}`}
            >
              로그인
            </button>
            <button
              onClick={() => setPage('signup')}
              className={`tab-button ${page === 'signup' ? 'tab-active' : ''}`}
            >
              회원가입
            </button>
          </div>

          {page === 'login' ? (
            // 로그인 폼
            <>
              {/* 이메일 로그인 */}
              <div className="form-section">
                <div className="input-group">
                  <label htmlFor="email" className="input-label">
                    이메일
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="password" className="input-label">
                    비밀번호
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field"
                  />
                </div>

                <div className="remember-forgot">
                  <label className="checkbox-label">
                    <input type="checkbox" className="checkbox-input"/>
                    로그인 유지
                  </label>
                  <button className="forgot-password">
                    비밀번호 찾기
                  </button>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="submit-button"
                >
                  {isLoading ? (
                    <>
                      <svg className="spinner" viewBox="0 0 24 24">
                        <circle
                          className="spinner-circle"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="spinner-path"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      로그인 중...
                    </>
                  ) : '로그인'}
                </button>
              </div>

              {/* 구분선 */}
              <div className="divider">
              
              </div>

              {/* 소셜 로그인 버튼 */}
              <div className="social-buttons">
                <button
                  onClick={() => handleSocialLogin('google')}
                  className="social-button google"
                >
                  <svg className="social-icon" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google로 계속하기
                </button>

                <button
                  onClick={() => handleSocialLogin('kakao')}
                  className="social-button kakao"
                >
                  <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.8 1.8 5.2 4.5 6.6l-1.2 4.4c-.1.4.3.7.6.5l5.1-3.4c.3 0 .7.1 1 .1 5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/>
                  </svg>
                  카카오로 계속하기
                </button>

                <button
                  onClick={() => handleSocialLogin('naver')}
                  className="social-button naver"
                >
                  <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/>
                  </svg>
                  네이버로 계속하기
                </button>
              </div>
            </>
          ) : (
            // 회원가입 폼
            <>
              <div className="signup-form">
                <div className="input-group">
                  <label htmlFor="accountId" className="input-label">
                    아이디 <span className="required">*</span>
                  </label>
                  <input
                    id="accountId"
                    type="text"
                    value={signupData.accountId}
                    onChange={(e) => setSignupData({...signupData, accountId: e.target.value})}
                    placeholder="아이디를 입력하세요"
                    required
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="accountName" className="input-label">
                    이름 <span className="required">*</span>
                  </label>
                  <input
                    id="accountName"
                    type="text"
                    value={signupData.accountName}
                    onChange={(e) => setSignupData({...signupData, accountName: e.target.value})}
                    placeholder="이름을 입력하세요"
                    required
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="signupEmail" className="input-label">
                    이메일 <span className="required">*</span>
                  </label>
                  <input
                    id="signupEmail"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                    placeholder="your@email.com"
                    required
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="phoneNumber" className="input-label">
                    휴대폰 번호 <span className="required">*</span>
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={signupData.phoneNumber}
                    onChange={(e) => setSignupData({...signupData, phoneNumber: e.target.value})}
                    placeholder="010-1234-5678"
                    required
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="signupPw" className="input-label">
                    비밀번호 <span className="required">*</span>
                  </label>
                  <input
                    id="signupPw"
                    type="password"
                    value={signupData.accountPw}
                    onChange={(e) => setSignupData({...signupData, accountPw: e.target.value})}
                    placeholder="8자 이상 입력하세요"
                    required
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="signupPwConfirm" className="input-label">
                    비밀번호 확인 <span className="required">*</span>
                  </label>
                  <input
                    id="signupPwConfirm"
                    type="password"
                    value={signupData.accountPwConfirm}
                    onChange={(e) => setSignupData({...signupData, accountPwConfirm: e.target.value})}
                    placeholder="비밀번호를 다시 입력하세요"
                    required
                    className="input-field"
                  />
                </div>
              </div>

              <button
                onClick={handleSignup}
                disabled={isLoading}
                className="submit-button signup-submit"
              >
                {isLoading ? (
                  <>
                    <svg className="spinner" viewBox="0 0 24 24">
                      <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    가입 중...
                  </>
                ) : '회원가입'}
              </button>
            </>
          )}
        </div>

       
      </div>
    </div>
  );
};

export default Login;