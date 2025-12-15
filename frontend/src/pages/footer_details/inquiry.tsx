import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import "./inquiry.css";
import { api } from "../../api/axios";

interface FormData {
  name: string;
  email: string;
  phone: string;
  category: string;
  subject: string;
  message: string;
}

const Inquiry: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    category: t('inquiry.categories.general'),
    subject: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 필수 항목 검증
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert(t('inquiry.validation.required'));
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert(t('inquiry.validation.email'));
      return;
    }

    setIsSubmitting(true);

    try {
      const combinedContent = [
        `${t('inquiry.form.category')}: ${formData.category}`,
        `${t('inquiry.form.name')}: ${formData.name}`,
        `${t('inquiry.form.email')}: ${formData.email}`,
        formData.phone ? `${t('inquiry.form.phone')}: ${formData.phone}` : null,
        "",
        formData.message
      ].filter(Boolean).join("\n");

      const res = await api.post("/inquiries", {
        title: formData.subject,
        content: combinedContent
      });

      if (res.data?.success) {
        setSubmitSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          category: t('inquiry.categories.general'),
          subject: "",
          message: ""
        });
      } else {
        alert(res.data?.msg || t('inquiry.error.submitFailed'));
      }
    } catch (error: any) {
      console.error("문의 전송 실패:", error);
      alert(error?.response?.data?.msg || t('inquiry.error.submitFailed'));
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitSuccess(false), 2500);
    }
  };

  return (
    <div className="inquiry-page">
      <div className="inquiry-container">
        <div className="inquiry-header">
          <h1>{t('inquiry.title')}</h1>
          <p>{t('inquiry.subtitle')}</p>
        </div>

        <div className="inquiry-content">
          <div className="inquiry-info">
            <div className="info-card">
              <div className="info-icon">📞</div>
              <h3>{t('inquiry.info.phone.title')}</h3>
              <p>1588-0000</p>
              <span className="info-time">{t('inquiry.info.phone.hours')}</span>
            </div>

            <div className="info-card">
              <div className="info-icon">✉️</div>
              <h3>{t('inquiry.info.email.title')}</h3>
              <p>info@busango.kr</p>
              <span className="info-time">{t('inquiry.info.email.hours')}</span>
            </div>

            <div className="info-card">
              <div className="info-icon">📍</div>
              <h3>{t('inquiry.info.visit.title')}</h3>
              <p>{t('inquiry.info.visit.address')}</p>
              <span className="info-time">{t('inquiry.info.visit.note')}</span>
            </div>

            <div className="info-notice">
              <h4>📋 {t('inquiry.info.notice.title')}</h4>
              <ul>
                <li>{t('inquiry.info.notice.item1')}</li>
                <li>{t('inquiry.info.notice.item2')}</li>
                <li>{t('inquiry.info.notice.item3')}</li>
                <li>{t('inquiry.info.notice.item4')}</li>
              </ul>
            </div>
          </div>

          <div className="inquiry-form-wrapper">
            <form className="inquiry-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">{t('inquiry.form.name')} <span className="required">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('inquiry.form.namePlaceholder')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">{t('inquiry.form.email')} <span className="required">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">{t('inquiry.form.phone')}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="010-1234-5678"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">{t('inquiry.form.category')} <span className="required">*</span></label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value={t('inquiry.categories.general')}>{t('inquiry.categories.general')}</option>
                    <option value={t('inquiry.categories.service')}>{t('inquiry.categories.service')}</option>
                    <option value={t('inquiry.categories.technical')}>{t('inquiry.categories.technical')}</option>
                    <option value={t('inquiry.categories.partnership')}>{t('inquiry.categories.partnership')}</option>
                    <option value={t('inquiry.categories.complaint')}>{t('inquiry.categories.complaint')}</option>
                    <option value={t('inquiry.categories.other')}>{t('inquiry.categories.other')}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">{t('inquiry.form.subject')} <span className="required">*</span></label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={t('inquiry.form.subjectPlaceholder')}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">{t('inquiry.form.message')} <span className="required">*</span></label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t('inquiry.form.messagePlaceholder')}
                  rows={8}
                  required
                />
              </div>

              <div className="form-privacy">
                <label className="checkbox-label">
                  <input type="checkbox" required />
                  <span>{t('inquiry.form.privacyConsent')}</span>
                </label>
                <a href="/footer_details/privacy" className="privacy-link">
                  {t('inquiry.form.privacyLink')}
                </a>
              </div>

              <button 
                type="submit" 
                className={`submit-btn ${isSubmitting ? 'submitting' : ''} ${submitSuccess ? 'success' : ''}`}
                disabled={isSubmitting || submitSuccess}
              >
                {isSubmitting ? t('inquiry.form.submitting') : submitSuccess ? t('inquiry.form.submitSuccess') : t('inquiry.form.submit')}
              </button>

              {submitSuccess && (
                <div className="success-message">
                  <p>{t('inquiry.success.message1')}</p>
                  <p>{t('inquiry.success.message2')}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inquiry;
