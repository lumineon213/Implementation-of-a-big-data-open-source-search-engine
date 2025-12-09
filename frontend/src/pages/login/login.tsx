import React, { useState, useEffect, useRef } from 'react';
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
  
  // 입력 필드 ref
  const loginIdRef = useRef<HTMLInputElement>(null);
  const signupIdRef = useRef<HTMLInputElement>(null);

  // 로그인 실패 횟수
  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockTime, setLockTime] = useState<number>(0);

  // ❌ 애니메이션 에러 상태 제거됨
  // const [shakeError, setShakeError] = useState<boolean>(false);

  const [loginData, setLoginData] = useState({
    accountId: '',
    accountPw: ''
  });

  // 로그인 편의 기능
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [saveId, setSaveId] = useState<boolean>(false);

  const [signupData, setSignupData] = useState({
    accountId: '',
    accountPw: '',
    accountPwConfirm: '',
    accountName: '',
    email: '',
    phoneNumber: ''
  });

  // 비밀번호 강도
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  // 인증 관련
  const [verifyCode, setVerifyCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  
  // 중복 체크
  const [idChecked, setIdChecked] = useState(false);
  const [idAvailable, setIdAvailable] = useState(false);
  
  // 비밀번호 표시
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  
  // 약관 동의 모달
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeLocation, setAgreeLocation] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  /* ======================================
    자동 포커스
  ======================================= */
  useEffect(() => {
    if (page === 'login' && loginIdRef.current) {
      loginIdRef.current.focus();
    } else if (page === 'signup' && signupIdRef.current) {
      signupIdRef.current.focus();
    }
  }, [page]);

  /* ======================================
    저장된 아이디 불러오기
  ======================================= */
  useEffect(() => {
    const savedId = localStorage.getItem('savedId');
    if (savedId) {
      setLoginData(prev => ({ ...prev, accountId: savedId }));
      setSaveId(true);
    }
  }, []);

  /* ======================================
    로그인 잠금 타이머
  ======================================= */
  useEffect(() => {
    if (isLocked && lockTime > 0) {
      const timer = setTimeout(() => {
        setLockTime(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (lockTime === 0 && isLocked) {
      setIsLocked(false);
      setLoginAttempts(0);
    }
  }, [isLocked, lockTime]);

  /* ======================================
    비밀번호 강도 체크
  ======================================= */
  const checkPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return Math.min(strength, 3); // 0: 약함, 1-2: 보통, 3: 강함
  };

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(signupData.accountPw));
  }, [signupData.accountPw]);

  /* ======================================
    흔들림 애니메이션 ❌ 함수 제거됨
  ======================================= */
  // const triggerShakeError = () => {
  //   setShakeError(true);
  //   setTimeout(() => setShakeError(false), 500);
  // };

  /* ======================================
    전체 동의 체크박스 핸들러
  ======================================= */
  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeLocation(checked);
  };

  /* ======================================
    약관 동의 모달 확인 버튼
  ======================================= */
  const handleTermsConfirm = () => {
    if (!agreeTerms || !agreePrivacy || !agreeLocation) {
      alert("필수 약관에 모두 동의해주세요");
      return;
    }
    setTermsAgreed(true);
    setShowTermsModal(false);
    setPage('signup');
  };

  /* ======================================
    회원가입 탭 클릭 시 약관 모달 먼저 표시
  ======================================= */
  const handleSignupTabClick = () => {
    if (!termsAgreed) {
      setShowTermsModal(true);
    } else {
      setPage('signup');
    }
  };

  /* ======================================
    아이디 중복 체크
  ======================================= */
  const checkAccountId = async () => {
    if (!signupData.accountId) {
      alert("아이디를 입력하세요");
      return;
    }
    
    if (signupData.accountId.length < 4) {
      alert("아이디는 4자 이상이어야 합니다");
      return;
    }

    try {
      const res = await axios.get(`/api/login/checkId?accountId=${signupData.accountId}`);
      
      if (res.data.available) {
        alert("✅ 사용 가능한 아이디입니다");
        setIdChecked(true);
        setIdAvailable(true);
      } else {
        alert("❌ 이미 사용 중인 아이디입니다");
        setIdChecked(true);
        setIdAvailable(false);
      }
    } catch {
      alert("서버 오류");
    }
  };

  /* ======================================
    전화번호 포맷팅 (숫자만 11자리)
  ======================================= */
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    
    if (value.length <= 11) {
      setSignupData({...signupData, phoneNumber: value});
    }
  };

  /* ======================================
    비밀번호 일치 여부 체크
  ======================================= */
  const passwordMatch = signupData.accountPw && signupData.accountPwConfirm && 
                        signupData.accountPw === signupData.accountPwConfirm;
  const passwordNotMatch = signupData.accountPw && signupData.accountPwConfirm && 
                             signupData.accountPw !== signupData.accountPwConfirm;

  /* ======================================
    이메일 인증번호 요청
  ======================================= */
  const sendEmailCode = async () => {
    if (!signupData.email) {
      alert("이메일을 입력하세요");
      return;
    }

    try {
      const res = await axios.post("/api/login/sendEmailCode", {
        email: signupData.email
      });

      if (res.data.success) {
        alert("인증번호가 전송되었습니다.");
      } else {
        alert(res.data.msg || "이메일 전송 실패");
      }
    } catch {
      alert("서버 오류");
    }
  };

  /* ======================================
    인증번호 검증
  ======================================= */
  const verifyEmailCodeCheck = async () => {
    if (!verifyCode) {
      alert("인증번호 입력하세요");
      return;
    }

    try {
      const res = await axios.post("/api/login/verifyEmailCode", {
        email: signupData.email,
        code: verifyCode
      });

      if (res.data.success) {
        alert("이메일 인증 완료!");
        setEmailVerified(true);
      } else {
        alert("인증번호가 일치하지 않습니다.");
      }
    } catch {
      alert("오류");
    }
  };

  /* ======================================
    로그인 요청
  ======================================= */
  const handleLogin = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();

    if (isLocked) {
      alert(`로그인이 일시적으로 차단되었습니다. ${lockTime}초 후에 다시 시도해주세요.`);

      return;
    }

    if (!loginData.accountId || !loginData.accountPw) {
      alert("아이디와 비밀번호를 입력하세요");
    
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post("/api/login/login", loginData);

      if (res.data.success) {
        // 로그인 성공 시
        setLoginAttempts(0);
        
        // 아이디 저장
        if (saveId) {
          localStorage.setItem('savedId', loginData.accountId);
        } else {
          localStorage.removeItem('savedId');
        }

        // 자동 로그인
        if (rememberMe) {
          localStorage.setItem("token", res.data.token);
        } else {
          sessionStorage.setItem("token", res.data.token);
        }

        alert("로그인 성공");
        navigate("/");
      } else {
        throw new Error(res.data.msg || "로그인 실패");
      }

    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      
      const msg = error.response?.data?.msg || "";

      // 1. 아이디 없음 → 실패 횟수 증가 ❌
      if (msg.includes("아이디") || msg.includes("존재하지")) {
        alert("❌ 존재하지 않는 아이디입니다.");
        return;
      }

      // 로그인 실패 횟수 증가
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      // ❌ 흔들림 애니메이션 호출 제거됨
      // triggerShakeError();


      if (newAttempts >= 5) {
        setIsLocked(true);
        setLockTime(30); // 30초 잠금
        alert("로그인 시도 횟수를 초과했습니다. 30초 후에 다시 시도해주세요.");
      } else {
        alert(error.response?.data?.msg || `로그인 실패 (${newAttempts}/5)`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ======================================
    Enter 키로 로그인
  ======================================= */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin(e);
    }
  };

  /* ======================================
    회원가입 요청
  ======================================= */
  const handleSignup = async (e: React.MouseEvent) => {
    e.preventDefault();

    // 비밀번호 강도 체크
    if (passwordStrength === 0) {
      alert("비밀번호가 너무 약합니다. 8자 이상, 영문+숫자+특수문자를 포함해주세요.");
 
      return;
    }

    // 아이디 중복 체크 확인
    if (!idChecked || !idAvailable) {
      alert("아이디 중복 체크를 완료해주세요");
     
      return;
    }

    // 이메일 인증 확인
    if (!emailVerified) {
      alert("이메일 인증을 완료해야 합니다.");
   
      return;
    }
    
    // 전화번호 길이 확인
    if (signupData.phoneNumber.length !== 11) {
      alert("전화번호는 11자리여야 합니다 (예: 01012345678)");
    
      return;
    }
    
    // 비밀번호 일치 확인
    if (!passwordMatch) {
      alert("비밀번호가 일치하지 않습니다");
      
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post("/api/login/signup", signupData);

      if (res.data.success) {
        alert("회원가입 성공!");
        setPage("login");
        
        // 폼 초기화
        setSignupData({
          accountId: '',
          accountPw: '',
          accountPwConfirm: '',
          accountName: '',
          email: '',
          phoneNumber: ''
        });
        setIdChecked(false);
        setIdAvailable(false);
        setEmailVerified(false);
        setVerifyCode("");
        setTermsAgreed(false);
        setAgreeAll(false);
        setAgreeTerms(false);
        setAgreePrivacy(false);
        setAgreeLocation(false);
      } else {
        alert(res.data.msg || "회원가입 실패");
      }

    } catch {
      alert("회원가입 실패");
  
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'kakao' | 'naver') => {

    if (provider === "google") {
      window.location.href =
        "https://accounts.google.com/o/oauth2/v2/auth?" +
        "client_id=702207143548-874896trotrrlmq7f6ujcag9m4c3oujv.apps.googleusercontent.com&" +
        "redirect_uri=http://localhost:8484/login/oauth2/code/google&" +
        "response_type=code&" +
        "scope=email%20profile";
    }

    if (provider === "naver") {
      window.location.href =
        "https://nid.naver.com/oauth2.0/authorize?" +
        "client_id=4J0_WLp1ESBS1kMGnjX9&" +
        "redirect_uri=http://localhost:8484/login/oauth2/code/naver&" +
        "response_type=code&" +
        "state=XYZ123ABC";
    }

    if (provider === "kakao") {
      window.location.href =
        "https://kauth.kakao.com/oauth/authorize?" +
        "client_id=b78f006042277f7decbde1f0f797012f&" +
        "redirect_uri=http://localhost:8484/oauth2/callback/kakao&" +
        "response_type=code";
    }
  };

  return (
    <div className="login-container">

      <div className="login-content">
        <div className="login-header">
          <h1 className="logo">
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              우리 <span className="logo-accent">부산 GO?</span>
            </Link>
          </h1>
        </div>

   
        <div className={`login-card`}> 
          <div className="tab-container">
            <button onClick={() => setPage('login')} className={`tab-button ${page === 'login' ? 'tab-active' : ''}`}>
              로그인
            </button>
            <button onClick={handleSignupTabClick} className={`tab-button ${page === 'signup' ? 'tab-active' : ''}`}>
              회원가입
            </button>
          </div>

          {page === 'login' ? (
            <>
              <div className="form-section">

                <div className="input-field-wrapper">
                  <input
                    ref={loginIdRef}
                    type="text"
                    placeholder="아이디"
                    value={loginData.accountId}
                    className="input-field"
                    onChange={e => setLoginData({...loginData, accountId: e.target.value})}
                    onKeyPress={handleKeyPress}
                  />
                </div>

                <div className="input-field-wrapper">
                  <input
                    type="password"
                    placeholder="비밀번호"
                    value={loginData.accountPw}
                    className="input-field"
                    onChange={e => setLoginData({...loginData, accountPw: e.target.value})}
                    onKeyPress={handleKeyPress}
                  />
                </div>

                {/* 로그인 옵션 */}
                <div className="login-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={saveId}
                      onChange={(e) => setSaveId(e.target.checked)}
                    />
                    <span>아이디 저장</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>로그인 상태 유지</span>
                  </label>
                </div>

                {isLocked && (
                  <div className="lock-message">
                    🔒 로그인이 일시 차단되었습니다. {lockTime}초 후 재시도 가능
                  </div>
                )}

                <button 
                  onClick={handleLogin} 
                  disabled={isLoading || isLocked} 
                  className="submit-button"
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      로그인
                    </>
                  ) : (
                    '로그인'
                  )}
                </button>

              </div>

              <div style={{marginTop:"10px", marginBottom:"10px", display:"flex", justifyContent:"right", gap:"10px"}}>
                <button className="forgot-password" onClick={() => navigate("/find-id")}>아이디 찾기</button>
                <button className="forgot-password" onClick={() => navigate("/find-password")}>비밀번호 찾기</button>
              </div>

            

              <div className="social-buttons">
                <button className="social-button google" onClick={() => handleSocialLogin("google")}>구글 로그인</button>
                <button className="social-button kakao"  onClick={() => handleSocialLogin("kakao")}>카카오 로그인</button>
                <button className="social-button naver"  onClick={() => handleSocialLogin("naver")}>네이버 로그인</button>
              </div>

            </>
          ) : (
            <>
              <div className="signup-form">

                {/* 아이디 + 중복체크 */}
                <div>
                  <div style={{display:"flex", gap:"8px"}}>
                    <div className="input-field-wrapper" style={{flex: 1}}>
                      <input
                        ref={signupIdRef}
                        className="input-field"
                        placeholder="아이디 (4자 이상)"
                        value={signupData.accountId}
                        onChange={e => {
                          setSignupData({...signupData, accountId: e.target.value});
                          setIdChecked(false);
                        }}
                        style={{
                          borderColor: idChecked ? (idAvailable ? '#28a745' : '#dc3545') : undefined
                        }}
                      />
                    </div>
                    <button className="verify-btn" onClick={checkAccountId}>중복확인</button>
                  </div>
                  {idChecked && (
                    <p style={{
                      margin: '5px 0 0 0',
                      fontSize: '12px',
                      color: idAvailable ? '#28a745' : '#dc3545'
                    }}>
                      {idAvailable ? '✅ 사용 가능한 아이디입니다' : '❌ 이미 사용 중인 아이디입니다'}
                    </p>
                  )}
                </div>

                {/* 이름 */}
                <div className="input-field-wrapper">
                  <input
                    className="input-field"
                    placeholder="이름"
                    value={signupData.accountName}
                    onChange={e => setSignupData({...signupData, accountName: e.target.value})}
                  />
                </div>

                {/* 이메일 + 인증 */}
                <div>
                  <div style={{display:"flex", gap:"8px"}}>
                    <div className="input-field-wrapper" style={{flex: 1}}>
                      <input
                        className="input-field"
                        placeholder="email@example.com"
                        value={signupData.email}
                        onChange={e => setSignupData({...signupData, email: e.target.value})}
                      />
                      </div>
                    <button className="verify-btn" onClick={sendEmailCode}>인증번호</button>
                  </div>

                  <div style={{display:"flex", gap:"8px", marginTop:"6px"}}>
                    <input
                      className="input-field"
                      placeholder="인증번호 입력"
                      value={verifyCode}
                      onChange={e => setVerifyCode(e.target.value)}
                    />
                    <button className="verify-btn" onClick={verifyEmailCodeCheck}>확인</button>
                  </div>

                  {emailVerified && <p className="verify-success">✔ 이메일 인증 완료</p>}
                </div>

                {/* 전화번호 (숫자만 11자리) */}
                <div>
                  <div className="input-field-wrapper">
                    <input
                      className="input-field"
                      placeholder="전화번호 (숫자만 11자리, 예: 01012345678)"
                      value={signupData.phoneNumber}
                      onChange={handlePhoneChange}
                      maxLength={11}
                      style={{
                        borderColor: signupData.phoneNumber.length === 11 ? '#28a745' : undefined
                      }}
                    />
                  </div>
                  <p style={{margin: '5px 0 0 5px', fontSize: '12px', color: '#666'}}>
                    {signupData.phoneNumber.length}/11 자리
                  </p>
                </div>

                {/* 비밀번호 (눈 버튼) */}
                <div>
                  <div style={{position: 'relative'}}>
                    <div className="input-field-wrapper">
                      <input
                        className="input-field"
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호"
                        value={signupData.accountPw}
                        onChange={e => setSignupData({...signupData, accountPw: e.target.value})}
                        style={{paddingRight: '75px'}}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px'
                      }}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>

                  {/* 비밀번호 강도 표시 */}
                  {signupData.accountPw && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div 
                          className={`strength-fill strength-${passwordStrength}`}
                          style={{width: `${(passwordStrength / 3) * 100}%`}}
                        ></div>
                      </div>
                      <span className={`strength-text strength-${passwordStrength}`}>
                        {passwordStrength === 0 && '약함'}
                        {passwordStrength === 1 && '보통'}
                        {passwordStrength === 2 && '좋음'}
                        {passwordStrength === 3 && '강함'}
                      </span>
                    </div>
                  )}
                  
                  <p className="password-rules">
                    ✓ 8자 이상 ✓ 영문 ✓ 숫자 ✓ 특수문자 포함 권장
                  </p>
                </div>

                {/* 비밀번호 확인 (눈 버튼 + 일치 여부) */}
                <div>
                  <div style={{position: 'relative'}}>
                    <input
                      className="input-field"
                      type={showPasswordConfirm ? "text" : "password"}
                      placeholder="비밀번호 확인"
                      value={signupData.accountPwConfirm}
                      onChange={e => setSignupData({...signupData, accountPwConfirm: e.target.value})}
                      style={{
                        paddingRight: '45px',
                        borderColor: passwordNotMatch ? '#dc3545' : passwordMatch ? '#28a745' : undefined
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px'
                      }}
                    >
                      {showPasswordConfirm ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {passwordMatch && (
                    <p style={{margin: '5px 0 0 5px', fontSize: '12px', color: '#28a745'}}>
                      ✅ 비밀번호가 일치합니다
                    </p>
                  )}
                  {passwordNotMatch && (
                    <p style={{margin: '5px 0 0 5px', fontSize: '12px', color: '#dc3545'}}>
                      ❌ 비밀번호가 일치하지 않습니다
                    </p>
                  )}
                </div>

              </div>

              <button 
                onClick={handleSignup} 
                disabled={isLoading}
                className="submit-button signup-submit"
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    회원가입 중...
                  </>
                ) : (
                  '회원가입'
                )}
              </button>
            </>
          )}

        </div>
      </div>

      {/* 약관 동의 모달 */}
      {showTermsModal && (
        <div className="modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>약관 동의</h2>
              <button className="modal-close" onClick={() => setShowTermsModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              
              {/* 전체 동의 */}
              <div className="terms-all-agree">
                <label className="terms-all-item">
                  <input
                    type="checkbox"
                    checked={agreeAll}
                    onChange={(e) => handleAgreeAll(e.target.checked)}
                  />
                  <span className="terms-all-title">전체 동의</span>
                </label>
              </div>

              <div className="terms-divider"></div>

              {/* 이용약관 */}
              <div className="terms-section">
                <label className="terms-item">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span className="terms-title">
                    <span className="required-mark">(필수)</span> 이용약관 동의
                  </span>
                </label>
                <div className="terms-content">
                  <p><strong>제1조 (목적)</strong></p>
                  <p>본 약관은 우리 부산 GO? 서비스의 이용조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.</p>
                  <br/>
                  <p><strong>제2조 (정의)</strong></p>
                  <p>1. "서비스"란 회원이 이용할 수 있는 우리 부산 GO?의 모든 서비스를 의미합니다.</p>
                  <p>2. "회원"이란 본 약관에 동의하고 서비스를 이용하는 자를 말합니다.</p>
                  <br/>
                  <p><strong>제3조 (약관의 효력 및 변경)</strong></p>
                  <p>본 약관은 서비스를 이용하고자 하는 모든 회원에 대하여 그 효력을 발생합니다.</p>
                </div>
              </div>

              {/* 개인정보처리방침 */}
              <div className="terms-section">
                <label className="terms-item">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                  />
                  <span className="terms-title">
                    <span className="required-mark">(필수)</span> 개인정보처리방침 동의
                  </span>
                </label>
                <div className="terms-content">
                  <p><strong>제1조 (개인정보의 수집 및 이용 목적)</strong></p>
                  <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다.</p>
                  <br/>
                  <p>1. 회원 가입 및 관리</p>
                  <p>- 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</p>
                  <br/>
                  <p>2. 민원사무 처리</p>
                  <p>- 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지</p>
                  <br/>
                  <p><strong>제2조 (개인정보의 처리 및 보유 기간)</strong></p>
                  <p>회사는 법령에 따른 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
                </div>
              </div>

              {/* 위치기반서비스 이용약관 */}
              <div className="terms-section">
                <label className="terms-item">
                  <input
                    type="checkbox"
                    checked={agreeLocation}
                    onChange={(e) => setAgreeLocation(e.target.checked)}
                  />
                  <span className="terms-title">
                    <span className="required-mark">(필수)</span> 위치기반서비스 이용약관 동의
                  </span>
                </label>
                <div className="terms-content">
                  <p><strong>제1조 (목적)</strong></p>
                  <p>본 약관은 우리 부산 GO?가 제공하는 위치기반서비스에 대해 회사와 이용자의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
                  <br/>
                  <p><strong>제2조 (위치정보의 수집 및 이용)</strong></p>
                  <p>1. 회사는 부산 지역 관광지, 맛집, 숙박시설 등의 추천 서비스를 제공하기 위해 이용자의 현재 위치정보를 수집합니다.</p>
                  <p>2. 수집된 위치정보는 서비스 제공 목적으로만 사용되며, 이용자의 동의 없이 제3자에게 제공되지 않습니다.</p>
                  <br/>
                  <p><strong>제3조 (위치정보의 보호)</strong></p>
                  <p>회사는 이용자의 위치정보를 안전하게 관리하며, 서비스 종료 시 즉시 파기합니다.</p>
                  <br/>
                  <p><strong>제4조 (서비스의 내용)</strong></p>
                  <p>1. 현재 위치 기반 주변 관광지 추천</p>
                  <p>2. 위치별 맞춤 여행 코스 제공</p>
                  <p>3. 실시간 거리 및 경로 안내</p>
                </div>
              </div>

            </div>

            <div className="modal-footer">
              <button 
                className="modal-confirm-btn"
                onClick={handleTermsConfirm}
              >
                동의하고 회원가입하기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;