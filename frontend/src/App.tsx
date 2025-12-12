import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import Login from "pages/login/login";
import Header from "components/common/header";
import Footer from "components/common/footer";
import MainPage from "pages/main_Page/main_page";
import MyPage from "pages/mypage/mypage";
import FoodList from "pages/foodList/foodList";
import TourPage from "pages/tourtheme/TourPage";

import TourDetail from "pages/tourtheme/TourDetail";

import MapPage from "pages/map/MapPage";
import FoodDetail from "pages/foodList/foodDetail";
import StayList from "pages/stayList/stayList";
import StayDetail from "pages/stayList/stayDetail";

import CourseHome from "pages/course/CourseHome";
import WalkCourseList from "pages/course/WalkCourseList";
import WalkDetail from "pages/course/WalkDetail";
import ThemeCourseList from "pages/course/ThemeCourseList";
import ThemeDetail from "pages/course/ThemeDetail";
import MarineCourseList from "pages/course/MarineCourseList";
import MarineDetail from "pages/course/MarineDetail";
import UrbanCourseList from "pages/course/UrbanCourseList";
import UrbanDetail from "pages/course/UrbanDetail";

import PrivacyPolicy from "pages/footer_details/PrivacyPolicy";
import Terms from "pages/footer_details/Terms";
import FAQpage from "pages/footer_details/FAQpage";
import Inquiry from "pages/footer_details/inquiry";
import Event from "pages/footer_details/Event";
import StampEvent from "pages/benefits/StampEvent";
import NoticeList from "pages/notice/NoticeList";
import NoticeDetail from "pages/notice/NoticeDetail";
import NoticeWrite from "pages/notice/NoticeWrite";
import AIPlannerPage from "pages/ai-planner/AIPlannerPage";
import ShoppingList from "pages/shopping/ShoppingList";
import ShoppingDetail from "pages/shopping/ShoppingDetail";
import BadgePad from "pages/benefits/BadgePad";
import GiftCard from "pages/benefits/GiftCard";
import BlogPage from "pages/blog";
import CafePage from "pages/cafe";
import SearchPage from "pages/search_Page/search_page";

import Festival from "pages/tourdata/festival";
import FestivalDetail from 'pages/tourdata/festivalDetail';

import FindId  from "pages/login/FindId";
import FindPassword  from "pages/login/FindPassword";
import ResetPassword from "pages/login/ResetPassword";
import AdminDashboard from "pages/admin/AdminDashboard";
import AdminUsers from "pages/admin/AdminUsers";
import AdminReviews from "pages/admin/AdminReviews";
import AdminInquiries from "pages/admin/AdminInquiries";
import AdminNotices from "pages/admin/AdminNotices";
import AdminEvents from "pages/admin/AdminEvents";

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
  const location = useLocation();
  const isMapPage = location.pathname === '/map';
  
  return (
          <div className={`app-wrapper ${isMapPage ? 'map-page-mode' : ''}`}>

          <Header />
                <Routes>
                  {/* 새로운 메인 페이지 */}
                  <Route path="/" element={<MainPage/>} />
                  {/* 검색 페이지 */}
                  <Route path="/search" element={<SearchPage />} />
                  {/* 로그인 */}
                  <Route path="/login" element={<Login />} />

                   {/* 아이디 찾기 */}
                  <Route path="/find-id" element={<FindId />} />
                  {/* 비밀번호 찾기 */}
                  <Route path="/find-password" element={<FindPassword />} />

                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* 마이페이지 */}
                   <Route path="/mypage" element={<MyPage />} />
                  {/* 맛집 리스트 */}
                  <Route path="/food" element={<FoodList />} />
                  {/* 지도 페이지 */}
                   <Route path="/map" element={<MapPage />} />

                  {/* 테마 페이지 */}
                  <Route path="/tour" element={<TourPage />} />
                  <Route path="/tour/view/:id" element={<TourDetail />} />

                  {/* 축제 페이지 */}
                  <Route path="/festival" element={<Festival />} />
                  <Route path="/festival/:id" element={<FestivalDetail />} />
                  {/* 상세보기 */}
                  <Route path="/food/:id" element={<FoodDetail />} />
                  {/* 여행 코스 */}
                  <Route path="/course" element={<CourseHome />} />
                  <Route path="/course/walk" element={<WalkCourseList />} />
                  <Route path="/course/walk/:id" element={<WalkDetail />} />
                  <Route path="/walk/:id" element={<WalkDetail />} />
                  <Route path="/course/theme" element={<ThemeCourseList />} />
                  <Route path="/course/theme/:id" element={<ThemeDetail />} />
                  <Route path="/course/marine" element={<MarineCourseList />} />
                  <Route path="/course/marine/:id" element={<MarineDetail />} />
                  <Route path="/course/urban" element={<UrbanCourseList />} />
                  <Route path="/course/urban/:id" element={<UrbanDetail />} />

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

                  <Route path="/benefits/stamp" element={<StampEvent />} />
                  <Route path="/benefits/badge" element={<BadgePad />} />
                  <Route path="/benefits/coupon" element={<GiftCard />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/cafe" element={<CafePage />} />
                  {/* 숙소 */}
                  <Route path="/info/stay" element={<StayList />} />
                  {/* 숙소 상세보기  */}
                  <Route path="/info/stay/:id" element={<StayDetail />} />
                  
                  {/* 관리자 페이지 */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/reviews" element={<AdminReviews />} />
                  <Route path="/admin/inquiries" element={<AdminInquiries />} />
                  <Route path="/admin/notices" element={<AdminNotices />} />
                  <Route path="/admin/events" element={<AdminEvents />} />
                </Routes>
         
          {!isMapPage && <Footer />}
              </div>
          );
}
export default App;
