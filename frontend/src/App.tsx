import { Routes, Route } from "react-router-dom";
import Login from "pages/login/login";
import Header from "components/common/header";
import Footer from "components/common/footer";
import MainPage from "pages/main_Page/main_page";
import MyPage from "pages/mypage/mypage";
import FoodList from "pages/foodList/foodList";
import ThemePage from "pages/tourtheme/ThemePage";

import MapPage from "pages/map/MapPage";
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
                  //새로운 메인 페이지
                  <Route path="/" element={<MainPage/>} />                   
                  //로그인
                  <Route path="/login" element={<Login />} />
                  //마이페이지
                   <Route path="/mypage" element={<MyPage />} />
                  //맛집 리스트
                  <Route path="/food" element={<FoodList />} />
                  //지도 페이지
                   <Route path="/map" element={<MapPage />} />
                  //여행 페이지
                  <Route path="/theme" element={<ThemePage />} />

                </Routes>
         
          <Footer />
              </>
          );
}
export default App;
