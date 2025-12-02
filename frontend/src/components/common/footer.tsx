import React from "react";
import "./footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-left">
          <h2 className="footer-logo">KH.Solr</h2>
          <p className="footer-desc">
            Open Source Search Engine for Big Data
          </p>
        </div>

        <div className="footer-right">
          <a href="#" className="footer-link">개인정보 처리방침</a>
          <a href="#" className="footer-link">이용약관</a>
          <a href="#" className="footer-link">고객센터</a>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} KH.Solr. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
