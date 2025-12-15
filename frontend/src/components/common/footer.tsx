import React from "react";
import { useTranslation } from "react-i18next";
import "./footer.css";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-section">
            <h3 className="footer-title">{t('footer.title')}</h3>
            <p className="footer-desc">
              {t('footer.description')}<br />
              {t('footer.descriptionSub')}
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label={t('footer.facebook')}>📘</a>
              <a href="#" className="social-link" aria-label={t('footer.instagram')}>📷</a>
              <a href="#" className="social-link" aria-label={t('footer.youtube')}>📺</a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">{t('footer.travelInfo')}</h4>
            <ul className="footer-links">
              <li><a href="/theme">{t('footer.recommendedSpot')}</a></li>
              <li><a href="/food">{t('footer.foodInfo')}</a></li>
              <li><a href="/course">{t('footer.travelCourse')}</a></li>
              <li><a href="/info">{t('footer.travelInformation')}</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">{t('footer.customerSupport')}</h4>
            <ul className="footer-links">
              <li><a href="/notice">{t('footer.notice')}</a></li>
              <li><a href="/footer_details/faq">{t('footer.faq')}</a></li>
              <li><a href="/footer_details/inquiry">{t('footer.inquiry')}</a></li>
              <li><a href="/footer_details/event">{t('footer.event')}</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">{t('footer.contact')}</h4>
            <ul className="footer-contact">
              <li>📞 {t('footer.customerCenter')}</li>
              <li>✉️ {t('footer.email')}</li>
              <li>🕐 {t('footer.hours')}</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <a href="/footer_details/privacy" className="footer-legal">{t('footer.privacyPolicy')}</a>
            <span className="footer-divider">|</span>
            <a href="/footer_details/terms" className="footer-legal">{t('footer.terms')}</a>
            <span className="footer-divider">|</span>
            <a href="#" className="footer-legal">{t('footer.sitemap')}</a>
          </div>
          <div className="footer-bottom-right">
            <p className="footer-copyright">
              {t('footer.copyright', { year: currentYear })}
            </p>
            <p className="footer-org">
              {t('footer.orgInfo')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
