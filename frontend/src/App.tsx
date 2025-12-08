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
import PrivacyPolicy from "pages/footer_details/PrivacyPolicy";
import Terms from "pages/footer_details/Terms";
import NoticeList from "pages/notice/NoticeList";
import NoticeDetail from "pages/notice/NoticeDetail";
import NoticeWrite from "pages/notice/NoticeWrite";
import TravelInfoHome from "pages/travel/TravelInfoHome";
import TravelFestival from "pages/travel/TravelFestival";
import TravelFestivalDetail from "pages/travel/TravelFestivalDetail";
import TravelShopping from "pages/travel/TravelShopping";
import TravelParking from "pages/travel/TravelParking";
import TravelAccessible from "pages/travel/TravelAccessible";
import TravelTouristCenter from "pages/travel/TravelTouristCenter";
import TravelHospital from "pages/travel/TravelHospital";

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
                  {/* 새로운 메인 페이지 */}
                  <Route path="/" element={<MainPage/>} />                   
                  {/* 로그인 */}
                  <Route path="/login" element={<Login />} />
                  {/* 마이페이지 */}
                   <Route path="/mypage" element={<MyPage />} />
                  {/* 맛집 리스트 */}
                  <Route path="/food" element={<FoodList />} />
                  {/* 지도 페이지 */}
                   <Route path="/map" element={<MapPage />} />
                  {/* 상세보기 */}
                  <Route path="/food/:id" element={<FoodDetail />} />
                  {/* 여행 코스 */}
                  <Route path="/course" element={<CourseHome />} />
                  {/* 도보여행 */}
                  <Route path="/course/walk" element={<WalkCourseList />} />
                  {/* 여행정보 메인 및 하위 카테고리 */}
                  <Route path="/info" element={<TravelInfoHome />} />
                  <Route path="/info/festival" element={<TravelFestival />} />
                  <Route path="/info/festival/:id" element={<TravelFestivalDetail />} />
                  <Route path="/info/shopping" element={<TravelShopping />} />
                  <Route path="/info/parking" element={<TravelParking />} />
                  <Route path="/info/accessible" element={<TravelAccessible />} />
                  <Route path="/info/tourist-center" element={<TravelTouristCenter />} />
                  <Route path="/info/hospital" element={<TravelHospital />} />
                  {/* 공지사항 */}
                  <Route path="/notice" element={<NoticeList />} />
                  <Route path="/notice/:id" element={<NoticeDetail />} />
                  <Route path="/notice/write" element={<NoticeWrite />} />
                  {/* 개인정보 처리방침 */}
                  <Route path="/footer_details/privacy" element={<PrivacyPolicy />} />
                  {/* 이용약관 */}
                  <Route path="/footer_details/terms" element={<Terms />} />
                </Routes>
         
          <Footer />
              </>
          );
}
export default App;
