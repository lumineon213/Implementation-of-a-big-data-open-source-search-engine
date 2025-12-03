import React, { useState, useEffect } from "react";
import "./header.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

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

  // ============================================
  //  기존 세션 검사 로직 로그
  // ============================================
  /*
  useEffect(() => {
    checkSession();

    const handleLoginSuccess = () => {
      setTimeout(() => {
        checkSession();
      }, 100);
    };

    window.addEventListener("loginSuccess", handleLoginSuccess);

    return () => {
      window.removeEventListener("loginSuccess", handleLoginSuccess);
    };
  }, []);

  useEffect(() => {
    checkSession();
  }, [location.pathname]);

  const checkSession = async () => {
    try {
      const res = await axios.get("/api/login/check", {
        withCredentials: true,
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
  */

  // ======================================================
  // 새로운 JWT 인증 방식 — checkAuth() 
  // ======================================================
  const checkAuth = async () => {
    const token = localStorage.getItem("token");

    //  토큰 없으면 로그인 안 한 상태
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.get("/api/mypage", {
        headers: {
          Authorization: `Bearer ${token}`, //  JWT 인증 헤더
        },
      });

     
      setUser(res.data);
    } catch (err) {
      console.error("JWT 인증 실패:", err);
      localStorage.removeItem("token"); // 잘못된 토큰 제거
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 최초 로드시 JWT 검사
  useEffect(() => {
    checkAuth();
  }, []);

  // 페이지 이동 시마다 확인
  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  // ======================================================
  //  JWT 방식 로그아웃 — 토큰 제거
  // ======================================================
  const handleLogout = () => {
    localStorage.removeItem("token"); // JWT 삭제
    setUser(null);
    setIsDropDownOpen(false);
    navigate("/");
  };

  const toggleDropdown = () => {
    setIsDropDownOpen((prev) => !prev);
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

        {/* ###########################마이페이지 버튼 ####################### */}

         <Link
                to="/mypage"
                className="dropdown-item"
                onClick={() => setIsDropDownOpen(false)}
              >
                마이페이지
              </Link>
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
        </div>
      )}
    </header>
  );
};

export default Header;
