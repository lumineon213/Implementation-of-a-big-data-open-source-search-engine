import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import './Home.css'; 
const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('검색어:', searchQuery);
    
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
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
  );
};

export default Home;