import React from "react";
import "./footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-section">
            <h3 className="footer-title">우리 부산 GO?</h3>
            <p className="footer-desc">
              부산의 모든 여행 정보를 한눈에!<br />
              명소, 맛집, 여행코스까지
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="페이스북">📘</a>
              <a href="#" className="social-link" aria-label="인스타그램">📷</a>
              <a href="#" className="social-link" aria-label="유튜브">📺</a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">여행 정보</h4>
            <ul className="footer-links">
              <li><a href="/theme">추천 명소</a></li>
              <li><a href="/food">맛집 정보</a></li>
              <li><a href="/course">여행 코스</a></li>
              <li><a href="/info">여행 정보</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">고객 지원</h4>
            <ul className="footer-links">
              <li><a href="/notice">공지사항</a></li>
              <li><a href="/footer_details/faq">자주 묻는 질문</a></li>
              <li><a href="/footer_details/inquiry">문의하기</a></li>
              <li><a href="/footer_details/event">이벤트</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">연락처</h4>
            <ul className="footer-contact">
              <li>📞 고객센터: 1588-0000</li>
              <li>✉️ 이메일: info@busango.kr</li>
              <li>🕐 운영시간: 평일 09:00 - 18:00</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <a href="/footer_details/privacy" className="footer-legal">개인정보 처리방침</a>
            <span className="footer-divider">|</span>
            <a href="/footer_details/terms" className="footer-legal">이용약관</a>
            <span className="footer-divider">|</span>
            <a href="#" className="footer-legal">사이트맵</a>
          </div>
          <div className="footer-bottom-right">
            <p className="footer-copyright">
              © {new Date().getFullYear()} 우리 부산 GO? All rights reserved.
            </p>
            <p className="footer-org">
              본 사이트는 부산광역시 관광 정보를 제공합니다.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
