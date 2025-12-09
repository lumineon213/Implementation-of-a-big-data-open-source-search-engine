import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "pages/login/login";
import Header from "components/common/header";
import Footer from "components/common/footer";
import MainPage from "pages/main_Page/main_page";
import MyPage from "pages/mypage/mypage";
import FoodList from "pages/foodList/foodList";
import MapPage from "pages/map/MapPage";
import FoodDetail from "pages/foodList/foodDetail";
import FindId  from "pages/login/FindId";
import FindPassword  from "pages/login/FindPassword";
import ResetPassword from "pages/login/ResetPassword";

import CourseHome from "pages/course/CourseHome";
import WalkCourseList from "pages/course/WalkCourseList";

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
   useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      // URL에 남은 ?token= 제거
      window.history.replaceState({}, "", "/");
    }
  }, []);
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
                  //도보여행
                  <Route path="/course/walk" element={<WalkCourseList />} />
                  // 아이디 찾기
                  <Route path="/find-id" element={<FindId />} />
                  //비밀번호 찾기
                  <Route path="/find-password" element={<FindPassword />} />

                  <Route path="/reset-password" element={<ResetPassword />} />



                </Routes>
         
          <Footer />
              </>
          );
}
export default App;
