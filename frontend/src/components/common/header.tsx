import React, { useState, useEffect } from "react";
import "./header.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

//TypeScript에서 객체의 타입(구조)를 정의하는 방법
interface User {
  accountId: string;
  accountName: string;
  email: string;
  phoneNumber: string;
  accountRole: string;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropDownOpen, setIsDropDownOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 세션 확인
  useEffect(() => {
    checkSession();

    // 로그인 성공 이벤트 리스너
    const handleLoginSuccess = () => {
      // 약간의 딜레이를 주어 세션이 완전히 설정되도록 함
      setTimeout(() => {
        checkSession();
      }, 100);
    };

    window.addEventListener('loginSuccess', handleLoginSuccess);

    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, []);

  // 페이지 이동 시 세션 확인
  useEffect(() => {
    checkSession();
  }, [location.pathname]);

  const checkSession = async () => {
    try {
      const res = await axios.get("/api/login/check", {
        withCredentials: true
      });

      if (res.data.isLogin && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("세션 확인 실패:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropDownOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/login/logout", {}, {
        withCredentials: true
      });
      setUser(null);
      setIsDropDownOpen(false);
      // 로그아웃 성공 이벤트 발생
      window.dispatchEvent(new Event('logoutSuccess'));
      navigate("/");
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
  };

  return (
    <header className="header">
  
      <Link to="/" className="logo">
        <div className="logo-circle"></div>
        <span className="logo-text">KH.Solr</span>
      </Link>

      <div className="header-right">
        {!isLoading && user && (
          <div className="user-welcome">
            {user.accountName}님 환영합니다
          </div>
        )}
      <button className="btn-dropdown" onClick={toggleDropdown}>
        =
      </button>
      </div>

    
      {isDropDownOpen && (
        <div className="dropdown-menu">
          {user ? (
            <>
              <div className="dropdown-item" onClick={handleLogout}>
                로그아웃
              </div>
            </>
          ) : (
          <Link
            to="/login"
            className="dropdown-item"
            onClick={() => setIsDropDownOpen(false)}
          >
            로그인
          </Link>
          )}

          {/* <Link
            to="/register"
            className="dropdown-item"
            onClick={() => setIsDropDownOpen(false)}
          >
            회원가입
          </Link> */}
        </div>
      )}
    </header>
  );
};

export default Header;
