import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import "./AIPlannerPage.css";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ROBOT_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnkOCaG5RI3Li3rk0iDD4PDkr9HL1sM7LcKA&s";

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const AIPlannerPage: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'model', 
      text: '안녕하세요! 부산 여행 AI 플래너입니다. 🏖️\n\n원하시는 여행 스타일, 기간, 관심사를 알려주시면 맞춤 여행 계획을 추천해드릴게요!\n\n예시:\n- "2박 3일 부산 여행 계획 짜줘"\n- "해운대 근처 맛집 추천해줘"\n- "가족과 함께 갈만한 부산 명소 알려줘"' 
    }
  ]);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsThinking(true);

    try {
      if (!API_KEY) {
        console.error('API 키가 없습니다.');
        throw new Error("Gemini API 키가 설정되지 않았습니다.");
      }

      console.log('API 키 확인:', API_KEY ? '존재함' : '없음');
      console.log('사용자 질문:', userMsg);

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const systemPrompt = `당신은 부산 여행 전문 AI 플래너입니다. 
사용자의 질문에 대해 친절하고 상세하게 부산 여행 계획을 추천해주세요.

응답 시 다음 사항을 고려하세요:
- 부산의 주요 관광지, 맛집, 해변, 문화시설 등을 추천
- 여행 일정, 예산, 동선을 고려한 실용적인 계획
- 계절과 날씨에 맞는 추천
- 교통편, 소요시간, 예상 비용 등 구체적인 정보 제공
- 한국어로 자연스럽고 친근하게 대화
- 마크다운 형식으로 보기 좋게 정리

사용자 질문: ${userMsg}`;

      console.log('Gemini API 호출 시작...');
      const result = await model.generateContent(systemPrompt);
      console.log('Gemini API 응답 받음:', result);
      
      const aiResponse = result.response.text();
      console.log('AI 응답:', aiResponse);

      setMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
    } catch (error: any) {
      console.error('=== Gemini API 상세 오류 ===');
      console.error('오류 메시지:', error.message);
      console.error('오류 상세:', error);
      console.error('오류 응답:', error.response?.data);
      
      let errorMessage = '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.';
      
      if (error.message?.includes('API key')) {
        errorMessage = 'API 키가 올바르지 않습니다. 관리자에게 문의하세요.';
      } else if (error.message?.includes('quota')) {
        errorMessage = 'API 사용량을 초과했습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message?.includes('SAFETY')) {
        errorMessage = '안전 필터에 의해 차단되었습니다. 다른 질문을 시도해주세요.';
      }
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: `${errorMessage}\n\n기술 정보: ${error.message}` 
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  const handleShareText = () => {
    // 대화 내용을 텍스트로 변환
    const conversationText = messages
      .filter(msg => msg.role !== 'model' || !msg.text.includes('안녕하세요! 부산 여행 AI 플래너입니다'))
      .map(msg => {
        const role = msg.role === 'user' ? '👤 사용자' : '🤖 AI';
        return `${role}:\n${msg.text}\n`;
      })
      .join('\n---\n\n');

    const fullText = `부산 여행 AI 플래너 대화 내용\n\n${conversationText}`;

    // 클립보드에 복사
    navigator.clipboard.writeText(fullText).then(() => {
      alert('대화 내용이 클립보드에 복사되었습니다!');
    }).catch(() => {
      alert('복사에 실패했습니다. 다시 시도해주세요.');
    });
  };

  const handleDownloadText = () => {
    // 대화 내용을 텍스트 파일로 다운로드
    const conversationText = messages
      .filter(msg => msg.role !== 'model' || !msg.text.includes('안녕하세요! 부산 여행 AI 플래너입니다'))
      .map(msg => {
        const role = msg.role === 'user' ? '👤 사용자' : '🤖 AI';
        return `${role}:\n${msg.text}\n`;
      })
      .join('\n---\n\n');

    const fullText = `부산 여행 AI 플래너 대화 내용\n생성 시간: ${new Date().toLocaleString('ko-KR')}\n\n${conversationText}`;

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `부산여행계획_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ai-planner-container">
      <div className="ai-planner-header">
        
        <h1> <img 
                  src={ROBOT_IMAGE} 
                  alt="AI Robot" 
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                /> AI 여행 계획
                 <img 
                  src={ROBOT_IMAGE} 
                  alt="AI Robot" 
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                /></h1>
        <p>AI가 추천하는 부산 맞춤 여행 플랜</p>
        
        {messages.length > 1 && (
          <div className="share-buttons">
            <button onClick={handleShareText} className="share-btn">
              📋 복사하기
            </button>
            <button onClick={handleDownloadText} className="share-btn">
              💾 저장하기
            </button>
          </div>
        )}
      </div>


      <div className="quick-questions">
        <button onClick={() => handleQuickQuestion('2박 3일 부산 여행 계획 짜줘')}>
          📅 2박 3일 여행
        </button>
        <button onClick={() => handleQuickQuestion('해운대 주변 맛집 추천해줘')}>
          🍽️ 해운대 맛집
        </button>
        <button onClick={() => handleQuickQuestion('가족과 함께 갈만한 부산 명소')}>
          👨‍👩‍👧‍👦 가족 여행
        </button>
        <button onClick={() => handleQuickQuestion('부산 야경 명소 알려줘')}>
          🌃 야경 명소
        </button>
        <button onClick={() => handleQuickQuestion('쇼핑 명소 포함 부산 여행 코스 추천해줘')}>
          🛍️ 쇼핑 명소 포함 AI 코스
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? (
                '👤'
              ) : (
                <img 
                  src={ROBOT_IMAGE} 
                  alt="AI Robot" 
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
              )}
            </div>
            <div className="message-content">
              {msg.role === 'model' ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="message model">
            <div className="message-avatar">
              <img 
                src={ROBOT_IMAGE} 
                alt="AI Robot" 
                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
              />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="여행 계획에 대해 물어보세요..."
          disabled={isThinking}
        />
        <button type="submit" disabled={isThinking || !input.trim()}>
          전송
        </button>
      </form>
    </div>
  );
};

export default AIPlannerPage;
