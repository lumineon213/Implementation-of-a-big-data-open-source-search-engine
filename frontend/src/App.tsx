import { Routes, Route } from "react-router-dom";
import Login from "pages/login/login";
import Header from "components/common/header";
import Footer from "components/common/footer";
import DetailView from "pages/detail_view/detailview";
import MainPage from "pages/main_Page/main_page";
import MyPage from "pages/mypage/mypage";
import FoodList from "pages/foodList/foodList"; // 방금 만든 파일 import

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
  return (
          <>
          <Header />
                <Routes>                
                  <Route path="/" element={<MainPage/>} />                   
                  
                  <Route path="/login" element={<Login />} />
                  
                   <Route path="/mypage" element={<MyPage />} />
                  
                  <Route path="/detail/:id" element={<DetailView />} />

                  <Route path="/food" element={<FoodList />} />
                </Routes>
         
          <Footer />
              </>
          );
}
export default App;
