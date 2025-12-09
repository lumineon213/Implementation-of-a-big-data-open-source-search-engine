import React, { useState } from "react";
import "./inquiry.css";

interface FormData {
  name: string;
  email: string;
  phone: string;
  category: string;
  subject: string;
  message: string;
}

const Inquiry: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    category: "일반문의",
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
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    // 실제로는 백엔드 API 호출
    // await fetch('/api/inquiry', { method: 'POST', body: JSON.stringify(formData) });
    
    // 시뮬레이션
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // 3초 후 폼 초기화
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          phone: "",
          category: "일반문의",
          subject: "",
          message: ""
        });
        setSubmitSuccess(false);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="inquiry-page">
      <div className="inquiry-container">
        <div className="inquiry-header">
          <h1>문의하기</h1>
          <p>궁금하신 점이나 건의사항을 남겨주세요. 빠른 시일 내에 답변드리겠습니다.</p>
        </div>

        <div className="inquiry-content">
          <div className="inquiry-info">
            <div className="info-card">
              <div className="info-icon">📞</div>
              <h3>전화 문의</h3>
              <p>1588-0000</p>
              <span className="info-time">평일 09:00 - 18:00</span>
            </div>

            <div className="info-card">
              <div className="info-icon">✉️</div>
              <h3>이메일</h3>
              <p>info@busango.kr</p>
              <span className="info-time">24시간 접수 가능</span>
            </div>

            <div className="info-card">
              <div className="info-icon">📍</div>
              <h3>방문 상담</h3>
              <p>부산광역시 중구</p>
              <span className="info-time">사전 예약 필수</span>
            </div>

            <div className="info-notice">
              <h4>📋 문의 전 확인사항</h4>
              <ul>
                <li>FAQ에서 먼저 답변을 찾아보세요</li>
                <li>평일 접수 건은 1-2일 내 답변</li>
                <li>주말/공휴일 접수는 다음 영업일 처리</li>
                <li>급한 문의는 전화 상담을 이용해주세요</li>
              </ul>
            </div>
          </div>

          <div className="inquiry-form-wrapper">
            <form className="inquiry-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">이름 <span className="required">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="이름을 입력하세요"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">이메일 <span className="required">*</span></label>
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
                  <label htmlFor="phone">연락처</label>
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
                  <label htmlFor="category">문의 유형 <span className="required">*</span></label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="일반문의">일반문의</option>
                    <option value="서비스이용">서비스 이용</option>
                    <option value="기술지원">기술 지원</option>
                    <option value="제휴문의">제휴 문의</option>
                    <option value="불편신고">불편 신고</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">제목 <span className="required">*</span></label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="문의 제목을 입력하세요"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">문의 내용 <span className="required">*</span></label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="문의 내용을 자세히 입력해주세요"
                  rows={8}
                  required
                />
              </div>

              <div className="form-privacy">
                <label className="checkbox-label">
                  <input type="checkbox" required />
                  <span>개인정보 수집 및 이용에 동의합니다</span>
                </label>
                <a href="/footer_details/privacy" className="privacy-link">
                  개인정보 처리방침 보기
                </a>
              </div>

              <button 
                type="submit" 
                className={`submit-btn ${isSubmitting ? 'submitting' : ''} ${submitSuccess ? 'success' : ''}`}
                disabled={isSubmitting || submitSuccess}
              >
                {isSubmitting ? '전송 중...' : submitSuccess ? '✓ 전송 완료!' : '문의 접수하기'}
              </button>

              {submitSuccess && (
                <div className="success-message">
                  <p>문의가 성공적으로 접수되었습니다.</p>
                  <p>빠른 시일 내에 답변드리겠습니다.</p>
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
