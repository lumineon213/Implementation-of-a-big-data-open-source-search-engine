import React, { useState } from "react";
import "./Header.css";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  const [isDropDownOpen, setIsDropDownOpen] = useState<boolean>(false);

  const toggleDropdown = () => {
    setIsDropDownOpen((prev) => !prev);
  };

  return (
    <header className="header">
  
      <div className="logo">
        <div className="logo-circle"></div>
        <span className="logo-text">KH.Solr</span>
      </div>

     
      <button className="btn-dropdown" onClick={toggleDropdown}>
        =
      </button>

    
      {isDropDownOpen && (
        <div className="dropdown-menu">
          <Link
            to="/login"
            className="dropdown-item"
            onClick={() => setIsDropDownOpen(false)}
          >
            로그인
          </Link>

          <Link
            to="/register"
            className="dropdown-item"
            onClick={() => setIsDropDownOpen(false)}
          >
            회원가입
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
