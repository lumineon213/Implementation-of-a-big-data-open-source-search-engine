import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import './home.css'; 

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('검색어:', searchQuery);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
  };

  return (
    <>
      <div className="home-container"> 
        <h1 className="home-title">KH.Solr AI 검색</h1>
        
        <form className="search-form" onSubmit={handleSubmit}>
          <div className="search-bar">
            <div className="search-icon"></div>
            
            <input
              type="text"
              className="search-input"
              placeholder="가장 빠른 AI 검색"
              value={searchQuery}
              onChange={handleInputChange}
            />
            
            <button type="submit" className="search-button">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 11L10 6M10 6L6 6M10 6L10 10"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>

      <button className='history-toggle-button' onClick={toggleSidebar}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="book-icon">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </button>

      <div className={`search-history-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">KH.solr</div>
          <button className="close-sidebar-button" onClick={toggleSidebar}>
            &times; 
          </button>
        </div>
        
        <div className="sidebar-content">
          <div className="no-history">
            
            <p>아직 기록이 없어요.</p>
            <p>새로운 검색을 해보세요.</p>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="sync-prompt">
            로그인하고 기록을 동기화 해보세요
          </div>
          <div className="footer-actions">
            <Link to="/login" className="login-button">
              로그인
            </Link>
            <button className="settings-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.74a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.74a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.74a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.74a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
          </div>
        </div>
      </div>
     
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Home;