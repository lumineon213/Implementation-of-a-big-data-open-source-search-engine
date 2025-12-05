import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OauthRedirect.css';

const OauthRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await axios.get('/api/login/check', { withCredentials: true });
        if (res.data.isLogin) {
          window.dispatchEvent(new Event('loginSuccess'));
          navigate('/');
        } else {
          navigate('/login', { state: { error: '네이버 로그인에 실패했습니다.' } });
        }
      } catch (error) {
        console.error('로그인 상태 확인 중 오류 발생:', error);
        navigate('/login', { state: { error: '로그인 처리 중 오류가 발생했습니다.' } });
      }
    };

    checkLoginStatus();
  }, [navigate]);

  return (
    <div className="oauth-redirect">
      <div className="spinner"></div>
      <p>로그인 중입니다. 잠시만 기다려주세요...</p>
    </div>
  );
};

export default OauthRedirect;
