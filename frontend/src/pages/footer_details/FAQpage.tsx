import React, { useState } from "react";
import "./FAQpage.css";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const FAQpage: React.FC = () => {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");

  const faqData: FAQItem[] = [
    {
      id: 1,
      category: "일반",
      question: "우리 부산 GO?는 어떤 서비스인가요?",
      answer: "우리 부산 GO?는 부산의 모든 여행 정보를 한눈에 볼 수 있는 종합 여행 정보 플랫폼입니다. 부산의 명소, 맛집, 도보여행 코스, 숙박 등 다양한 여행 정보를 제공하며, 지도 기반 검색으로 주변 관광지를 쉽게 찾을 수 있습니다."
    },
    {
      id: 2,
      category: "일반",
      question: "회원가입을 해야 이용할 수 있나요?",
      answer: "기본적인 여행 정보 검색과 조회는 회원가입 없이도 이용 가능합니다. 다만, 여행지 즐겨찾기, 나만의 여행 코스 만들기, 리뷰 작성 등의 기능은 회원가입 후 이용하실 수 있습니다."
    },
    {
      id: 3,
      category: "일반",
      question: "서비스 이용 요금이 있나요?",
      answer: "우리 부산 GO?는 완전 무료 서비스입니다. 모든 여행 정보와 기능을 무료로 이용하실 수 있습니다."
    },
    {
      id: 4,
      category: "검색/이용",
      question: "지도에서 맛집이나 관광지를 어떻게 검색하나요?",
      answer: "1) 지도 페이지로 이동합니다.\n2) '현재 위치에서 검색' 버튼을 클릭하여 위치를 설정합니다.\n3) 사이드바에서 원하는 카테고리(음식점, 도보여행 등)를 선택합니다.\n4) 검색창에 키워드를 입력하여 원하는 장소를 검색할 수 있습니다.\n5) 지도의 마커를 클릭하면 상세 정보를 확인할 수 있습니다."
    },
    {
      id: 5,
      category: "검색/이용",
      question: "검색 반경을 조절할 수 있나요?",
      answer: "네, 가능합니다. 지도 화면 우측의 필터 버튼(슬라이더 아이콘)을 클릭하면 검색 반경을 1km부터 50km까지 조절할 수 있습니다. 설정한 반경 내의 장소들만 표시됩니다."
    },
    {
      id: 6,
      category: "검색/이용",
      question: "도보여행 코스는 어떻게 확인하나요?",
      answer: "지도 페이지의 사이드바에서 '여행코스 도보여행' 카테고리를 선택하면 주변의 도보여행 코스들이 파란색 마커로 표시됩니다. 마커를 클릭하면 코스의 상세 정보, 교통 정보, 소요 시간 등을 확인할 수 있습니다."
    },
    {
      id: 7,
      category: "검색/이용",
      question: "맛집 정보에는 어떤 내용이 포함되나요?",
      answer: "맛집 정보에는 식당명, 위치, 대표 메뉴, 영업시간, 현재 위치로부터의 거리, 식당 설명 등이 포함됩니다. 지도 마커 클릭 시 상세 정보 패널에서 모든 정보를 확인할 수 있습니다."
    },
    {
      id: 8,
      category: "기술지원",
      question: "지도가 표시되지 않아요.",
      answer: "다음 사항을 확인해주세요:\n1) 브라우저의 위치 권한이 허용되어 있는지 확인\n2) 페이지 새로고침 시도\n3) 브라우저 캐시 삭제 후 재접속\n4) 다른 브라우저에서 시도\n5) 문제가 지속되면 고객센터로 문의해주세요."
    },
    {
      id: 9,
      category: "기술지원",
      question: "현재 위치가 정확하지 않아요.",
      answer: "브라우저의 위치 서비스 권한을 확인해주세요. 브라우저 설정에서 위치 권한이 '허용'으로 설정되어 있어야 정확한 위치를 표시할 수 있습니다. 또한 GPS가 켜져 있는지 확인해주세요."
    },
    {
      id: 10,
      category: "기술지원",
      question: "모바일에서도 이용할 수 있나요?",
      answer: "네, 우리 부산 GO?는 반응형 웹으로 제작되어 PC, 태블릿, 모바일 등 모든 기기에서 원활하게 이용하실 수 있습니다."
    },
    {
      id: 11,
      category: "계정/기능",
      question: "즐겨찾기한 장소는 어디서 확인하나요?",
      answer: "로그인 후 마이페이지로 이동하시면 즐겨찾기한 모든 장소를 확인하고 관리할 수 있습니다. 지도에서 즐겨찾기 버튼(별 아이콘)을 클릭하여 장소를 저장할 수 있습니다."
    },
    {
      id: 12,
      category: "계정/기능",
      question: "나만의 여행 코스를 만들 수 있나요?",
      answer: "네, 로그인 후 '나의여행' 메뉴에서 여러 장소를 선택하여 나만의 여행 코스를 만들고 저장할 수 있습니다. 저장된 코스는 언제든지 다시 확인하고 수정할 수 있습니다."
    },
    {
      id: 13,
      category: "계정/기능",
      question: "비밀번호를 잊어버렸어요.",
      answer: "로그인 페이지에서 '비밀번호 찾기'를 클릭하신 후, 가입 시 등록한 이메일 주소를 입력하시면 비밀번호 재설정 링크가 전송됩니다."
    },
    {
      id: 14,
      category: "공지/이벤트",
      question: "공지사항은 어디서 확인하나요?",
      answer: "상단 메뉴의 '공지사항' 또는 푸터의 '고객 지원 > 공지사항'을 통해 확인하실 수 있습니다. 중요 공지는 메인 페이지 상단에도 표시됩니다."
    },
    {
      id: 15,
      category: "공지/이벤트",
      question: "여행 정보는 얼마나 자주 업데이트되나요?",
      answer: "부산시 공공데이터와 연동하여 실시간으로 최신 정보를 제공하고 있습니다. 새로운 맛집, 관광지 정보는 수시로 업데이트됩니다."
    }
  ];

  const categories = ["전체", "일반", "검색/이용", "기술지원", "계정/기능", "공지/이벤트"];

  const filteredFAQs = selectedCategory === "전체" 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (id: number) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <div className="faq-page">
      <div className="faq-container">
        <div className="faq-header">
          <h1>자주 묻는 질문</h1>
          <p>궁금하신 내용을 빠르게 찾아보세요</p>
        </div>

        <div className="faq-category-tabs">
          {categories.map(category => (
            <button
              key={category}
              className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="faq-list">
          {filteredFAQs.map((faq) => (
            <div 
              key={faq.id} 
              className={`faq-item ${activeId === faq.id ? 'active' : ''}`}
            >
              <div 
                className="faq-question"
                onClick={() => toggleFAQ(faq.id)}
              >
                <div className="question-content">
                  <span className="category-badge">{faq.category}</span>
                  <h3>{faq.question}</h3>
                </div>
                <span className="toggle-icon">
                  {activeId === faq.id ? '−' : '+'}
                </span>
              </div>
              
              {activeId === faq.id && (
                <div className="faq-answer">
                  <p style={{ whiteSpace: 'pre-line' }}>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="faq-contact">
          <h3>더 궁금하신 내용이 있으신가요?</h3>
          <p>찾으시는 답변이 없다면 고객센터로 문의해주세요.</p>
          <div className="contact-buttons">
            <a href="tel:1588-0000" className="contact-btn">
              📞 고객센터: 1588-0000
            </a>
            <a href="mailto:info@busango.kr" className="contact-btn">
              ✉️ 이메일 문의
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQpage;
