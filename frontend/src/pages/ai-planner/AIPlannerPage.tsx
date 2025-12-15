import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState<string>('');
  
  const initialMessage = t('aiPlanner.initialMessage');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'model', 
      text: initialMessage
    }
  ]);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 언어 변경 시 초기 메시지 업데이트
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'model') {
      setMessages([{ role: 'model', text: t('aiPlanner.initialMessage') }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language, t]);

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
        throw new Error(t('aiPlanner.errors.apiKeyNotSet'));
      }

      console.log('API 키 확인:', API_KEY ? '존재함' : '없음');
      console.log('사용자 질문:', userMsg);

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const systemPromptTemplate = t('aiPlanner.systemPrompt');
      const systemPrompt = systemPromptTemplate.replace('{{userMsg}}', userMsg);

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
      
      let errorMessage = t('aiPlanner.errors.default');
      
      if (error.message?.includes('API key')) {
        errorMessage = t('aiPlanner.errors.invalidApiKey');
      } else if (error.message?.includes('quota')) {
        errorMessage = t('aiPlanner.errors.quotaExceeded');
      } else if (error.message?.includes('SAFETY')) {
        errorMessage = t('aiPlanner.errors.safetyFilter');
      }
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: `${errorMessage}\n\n${t('aiPlanner.errors.technicalInfo')}: ${error.message}` 
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
    const initialMessageText = t('aiPlanner.initialMessage').split('\n')[0];
    const conversationText = messages
      .filter(msg => msg.role !== 'model' || !msg.text.includes(initialMessageText))
      .map(msg => {
        const role = msg.role === 'user' ? `👤 ${t('aiPlanner.user')}` : `🤖 ${t('aiPlanner.ai')}`;
        return `${role}:\n${msg.text}\n`;
      })
      .join('\n---\n\n');

    const fullText = `${t('aiPlanner.conversationTitle')}\n\n${conversationText}`;

    // 클립보드에 복사
    navigator.clipboard.writeText(fullText).then(() => {
      alert(t('aiPlanner.copySuccess'));
    }).catch(() => {
      alert(t('aiPlanner.copyFailed'));
    });
  };

  const handleDownloadText = () => {
    // 대화 내용을 텍스트 파일로 다운로드
    const initialMessageText = t('aiPlanner.initialMessage').split('\n')[0];
    const conversationText = messages
      .filter(msg => msg.role !== 'model' || !msg.text.includes(initialMessageText))
      .map(msg => {
        const role = msg.role === 'user' ? `👤 ${t('aiPlanner.user')}` : `🤖 ${t('aiPlanner.ai')}`;
        return `${role}:\n${msg.text}\n`;
      })
      .join('\n---\n\n');

    const fullText = `${t('aiPlanner.conversationTitle')}\n${t('aiPlanner.createdAt')}: ${new Date().toLocaleString(i18n.language === 'en' ? 'en-US' : 'ko-KR')}\n\n${conversationText}`;

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${t('aiPlanner.downloadFileName')}_${new Date().toISOString().split('T')[0]}.txt`;
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
                /> {t('aiPlanner.title')}
                 <img 
                  src={ROBOT_IMAGE} 
                  alt="AI Robot" 
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                /></h1>
        <p>{t('aiPlanner.subtitle')}</p>
        
        {messages.length > 1 && (
          <div className="share-buttons">
            <button onClick={handleShareText} className="share-btn">
              📋 {t('aiPlanner.copy')}
            </button>
            <button onClick={handleDownloadText} className="share-btn">
              💾 {t('aiPlanner.save')}
            </button>
          </div>
        )}
      </div>


      <div className="quick-questions">
        <button onClick={() => handleQuickQuestion(t('aiPlanner.quickQuestions.threeDays.question'))}>
          📅 {t('aiPlanner.quickQuestions.threeDays.label')}
        </button>
        <button onClick={() => handleQuickQuestion(t('aiPlanner.quickQuestions.haeundaeRestaurant.question'))}>
          🍽️ {t('aiPlanner.quickQuestions.haeundaeRestaurant.label')}
        </button>
        <button onClick={() => handleQuickQuestion(t('aiPlanner.quickQuestions.family.question'))}>
          👨‍👩‍👧‍👦 {t('aiPlanner.quickQuestions.family.label')}
        </button>
        <button onClick={() => handleQuickQuestion(t('aiPlanner.quickQuestions.nightView.question'))}>
          🌃 {t('aiPlanner.quickQuestions.nightView.label')}
        </button>
        <button onClick={() => handleQuickQuestion(t('aiPlanner.quickQuestions.shopping.question'))}>
          🛍️ {t('aiPlanner.quickQuestions.shopping.label')}
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
          placeholder={t('aiPlanner.inputPlaceholder')}
          disabled={isThinking}
        />
        <button type="submit" disabled={isThinking || !input.trim()}>
          {t('aiPlanner.send')}
        </button>
      </form>
    </div>
  );
};

export default AIPlannerPage;
