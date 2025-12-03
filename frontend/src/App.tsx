import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "pages/login/login";
import Header from "components/common/header";
import Footer from "components/common/footer";
import Home from "pages/main_Page/home";
import AIChatBot from 'pages/chatbot/chatbot';
import DetailView from "pages/detail_view/detailview";

// 타입 정의
export interface SolrResultItem {
  id: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  place?: string;
  address?: string;
  [key: string]: any;
}


function App() {
  const [searchResults, setSearchResults] = useState<SolrResultItem[]>([]);
  return (
          <>
          <Header />
                <Routes>                
                  <Route path="/" element={<Home searchResults={searchResults} setSearchResults={setSearchResults} />} />
                  
                  <Route path="/login" element={<Login />} />
                  
                  <Route path="/detail/:id" element={<DetailView />} />
                </Routes>
         
          <AIChatBot searchResults={searchResults} />
          <Footer />
              </>
          );
}

export default App;
