import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import Login from "pages/login/login";
import Header from "components/common/header";
import Footer from "components/common/footer";
import MainPage from "pages/main_Page/main_page";
import MyPage from "pages/mypage/mypage";
import FoodList from "pages/foodList/foodList";
import ThemePage from "pages/tourtheme/ThemePage";
import MapPage from "pages/map/MapPage";
import FoodDetail from "pages/foodList/foodDetail";

import CourseHome from "pages/course/CourseHome";
import WalkCourseList from "pages/course/WalkCourseList";
import ThemeCourseList from "pages/course/ThemeCourseList";
import MarineCourseList from "pages/course/MarineCourseList";
import UrbanCourseList from "pages/course/UrbanCourseList";

import PrivacyPolicy from "pages/footer_details/PrivacyPolicy";
import Terms from "pages/footer_details/Terms";
import FAQpage from "pages/footer_details/FAQpage";
import Inquiry from "pages/footer_details/inquiry";
import Event from "pages/footer_details/Event";
import NoticeList from "pages/notice/NoticeList";
import NoticeDetail from "pages/notice/NoticeDetail";
import NoticeWrite from "pages/notice/NoticeWrite";
import AIPlannerPage from "pages/ai-planner/AIPlannerPage";
import ShoppingList from "pages/shopping/ShoppingList";
import ShoppingDetail from "pages/shopping/ShoppingDetail";

import Festival from "pages/tourdata/festival";
import FestivalDetail from 'pages/tourdata/FestivalDetail';

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
  const location = useLocation();
  const isMapPage = location.pathname === '/map';
  
  return (
          <div className={`app-wrapper ${isMapPage ? 'map-page-mode' : ''}`}>
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
                  //여행 페이지
                  <Route path="/theme" element={<ThemePage />} />
                  {/* 축제 페이지 */}
                  <Route path="/festival" element={<Festival />} />
                  <Route path="/festival/:id" element={<FestivalDetail />} />
                  {/* 상세보기 */}
                  <Route path="/food/:id" element={<FoodDetail />} />
                  {/* 여행 코스 */}
                  <Route path="/course" element={<CourseHome />} />
                  <Route path="/course/walk" element={<WalkCourseList />} />
                  <Route path="/course/theme" element={<ThemeCourseList />} />
                  <Route path="/course/marine" element={<MarineCourseList />} />
                  <Route path="/course/urban" element={<UrbanCourseList />} />

                  {/* AI 여행 계획 */}
                  <Route path="/ai-planner" element={<AIPlannerPage />} />

                  {/* 쇼핑·기념품 */}
                  <Route path="/shopping" element={<ShoppingList />} />
                  <Route path="/shopping/:id" element={<ShoppingDetail />} />

                  {/* 공지사항 */}
                  <Route path="/notice" element={<NoticeList />} />
                  <Route path="/notice/:id" element={<NoticeDetail />} />
                  <Route path="/notice/write" element={<NoticeWrite />} />
                  {/* 개인정보 처리방침 */}
                  <Route path="/footer_details/privacy" element={<PrivacyPolicy />} />
                  {/* 이용약관 */}
                  <Route path="/footer_details/terms" element={<Terms />} />
                  {/* FAQ */}
                  <Route path="/footer_details/faq" element={<FAQpage />} />
                  {/* 문의하기 */}
                  <Route path="/footer_details/inquiry" element={<Inquiry />} />
                  {/* 이벤트 */}
                  <Route path="/footer_details/event" element={<Event />} />
                </Routes>
         
          {!isMapPage && <Footer />}
              </div>
          );
}
export default App;
