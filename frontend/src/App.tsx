import { Routes, Route } from "react-router-dom";
import Login from "pages/login/login";
import Header from "components/common/header";
import Footer from "components/common/footer";
import MainPage from "pages/main_Page/main_page";
import MyPage from "pages/mypage/mypage";
import FoodList from "pages/foodList/foodList";
import MapPage from "pages/map/MapPage";
import FoodDetail from "pages/foodList/foodDetail";

import CourseHome from "pages/course/CourseHome";
import WalkCourseList from "pages/course/WalkCourseList";
import ThemeCourseList from "pages/course/ThemeCourseList";
import MarineCourseList from "pages/course/MarineCourseList";

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
                  //상세보기
                  <Route path="/food/:id" element={<FoodDetail />} />
                  //여행 코스
                  <Route path="/course" element={<CourseHome />} />
                  //여행 코스
                  <Route path="/course/walk" element={<WalkCourseList />} />
                  <Route path="/course/theme" element={<ThemeCourseList />} />
                  <Route path="/course/marine" element={<MarineCourseList />} />
                </Routes>
         
          <Footer />
              </>
          );
}
export default App;
