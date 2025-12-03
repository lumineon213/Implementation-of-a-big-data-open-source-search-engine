import React, { useState, useRef, useEffect, type FormEvent } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import ReactMarkdown from 'react-markdown'; 
import "./chatbot.css"; // 👈 요청하신 파일명으로 수정 완료

// .env 파일에서 API 키 가져오기
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Solr 코어 이름 (Home.tsx와 동일하게)
const SOLR_CORE_NAME = 'Search'; 

// 데이터 타입 정의
interface SolrResultItem {
  id: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  place?: string;
  address?: string;
  [key: string]: any;
}

interface AIChatBotProps {
  searchResults: SolrResultItem[]; // (참고용)
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const AIChatBot: React.FC<AIChatBotProps> = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '안녕하세요! KH 축제 검색 엔진 AI 도우미입니다. 축제 정보나 사이트 이용법을 물어보세요! 🎪' }
  ]);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const toggleChat = () => setIsOpen(prev => !prev);

  // 🚀 메시지 전송 및 처리 로직
  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. 사용자 메시지 화면에 표시
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsThinking(true);

    try {
      if (!API_KEY) throw new Error("API Key가 없습니다.");

      // 2. 🔍 챗봇이 직접 Solr에 검색 요청 (RAG)
      let fetchedData: SolrResultItem[] = [];
      let contextText = "";
      let totalFound = 0; // 전체 검색 결과 개수

      try {
        // AI에게는 상위 5개만 전달 (토큰 절약 및 요약)
        // 질문을 검색어로 사용하여 관련 축제를 찾습니다.
        const query = `q=${encodeURIComponent(userMsg)}&defType=edismax&qf=title^3+place+description&rows=5&wt=json`;
        const solrUrl = `/solr/${SOLR_CORE_NAME}/select?${query}`;
        
        console.log("챗봇 Solr 검색:", solrUrl);

        const response = await axios.get(solrUrl);
        fetchedData = response.data.response.docs;
        totalFound = response.data.response.numFound; // ⭐ Solr가 찾은 전체 개수 저장

        if (fetchedData.length > 0) {
          // 검색된 데이터를 AI가 읽기 좋은 문자열로 변환
          contextText = JSON.stringify(fetchedData.map(d => ({
            축제명: d.title,
            장소: d.place,
            기간: `${d.start_date || '미정'} ~ ${d.end_date || '미정'}`,
            설명: d.description
          })), null, 2);
        }

      } catch (solrErr) {
        console.error("Solr 검색 실패:", solrErr);
        // Solr 검색 실패 시에도 사이트 안내는 가능하도록 에러를 던지지 않음
      }

      // 3. Gemini에게 질문 + 정보 전달
      const genAI = new GoogleGenerativeAI(API_KEY);
      // ⭐ 본인 계정에서 사용 가능한 모델명 (gemini-2.5-flash)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

      // ⭐ [핵심 1] 사이트 이용 안내 매뉴얼 (시스템 프롬프트)
      const systemGuide = `
        [사이트 이용 안내]
        1. 로그인 방법: 상단 메뉴의 '로그인' 버튼을 이용하거나, 채팅창에서 [로그인 페이지](/login) 링크를 안내해줘.
        2. 회원가입: 아직 계정이 없다면 로그인 페이지에서 회원가입을 할 수 있어.
        3. 사이트 소개: 우리는 공공데이터를 활용한 '전국 축제 검색 엔진'이야.
        
        [링크 제공 규칙]
        - 페이지 이동이 필요한 경우 반드시 마크다운 링크 형식 '[텍스트](주소)'를 사용해줘.
      `;

      // ⭐ [핵심 2] 프롬프트 조립 (안내 매뉴얼 + 축제 데이터 + 조건부 문구 지시)
      const prompt = `
        너는 'KH 축제 검색 엔진'의 친절한 AI 상담원이야.
        사용자의 질문에 따라 아래 [사이트 이용 안내] 혹은 [검색된 축제 정보]를 바탕으로 답변해줘.

        ${systemGuide}
        
        [검색 현황]
        - 검색된 전체 데이터 개수: ${totalFound}개
        - 너에게 제공된 데이터 개수: ${fetchedData.length}개 (상위 결과)

        [검색된 축제 정보 (참고용)]:
        ${contextText ? contextText : "관련된 축제 데이터 없음 (사이트 이용 질문일 수 있음)"}

        [사용자 질문]:
        ${userMsg}

        [답변 가이드]:
        1. 사용자가 '로그인', '회원가입' 등을 물어보면 [사이트 이용 안내]를 참고해.
        2. 사용자가 '축제'를 물어보면 [검색된 축제 정보]를 바탕으로 추천해줘.
        3. ⭐중요⭐: 만약 [검색된 전체 데이터 개수]가 [너에게 제공된 데이터 개수]보다 많다면, 답변 맨 마지막에 줄을 바꾸고 아래 문구를 그대로 적어줘:
           
           > 💡 리스트가 많아 간략하게 소개해드렸습니다. 자세한 내용은 검색창을 이용해주세요.
      `;

      // 4. AI 응답 생성
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: 'model', text: text }]);

    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMsg = "죄송해요, AI 연결에 문제가 생겼어요. 😢";
      
      if (error.message.includes("404")) errorMsg = "모델 이름을 찾을 수 없습니다.";
      else if (error.message.includes("API Key")) errorMsg = "API 키 설정을 확인해주세요.";
      
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      <button className="chat-toggle-button" onClick={toggleChat}>💬</button>
      
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <span>축제 AI 도우미</span>
            <button onClick={toggleChat}>&times;</button>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                {/* 마크다운 렌더링 적용 */}
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}
            {isThinking && <div className="message thinking">답변 생성 중...</div>}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
            />
            <button type="submit">전송</button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatBot;