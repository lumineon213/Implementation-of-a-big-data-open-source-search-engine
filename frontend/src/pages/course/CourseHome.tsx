import { Link } from "react-router-dom";
import "./CourseHome.css";

import walk from '../../components/common/img/walk.png'; 
import theme from '../../components/common/img/theme.png';
import marine from '../../components/common/img/marine.png';


const CourseHome = () => {
  return (
    <div className="course-home">
      <h2>여행 코스</h2>
      <p>부산의 다양한 여행 테마를 선택해보세요!</p>

      <div className="course-category-list">
        <Link to="/course/walk" className="category-card">
          <img src={walk} alt="도보여행" />
          <h3>도보 여행</h3>
          <p>부산을 걸으며 즐기는 여행 코스</p>
        </Link>

        <Link to="/course/theme" className="category-card">
          <img src={theme} alt="테마여행" />
          <h3>테마 여행</h3>
          <p>힐링 · 바다 · 감성 루트</p>
        </Link>
        
        <Link to="/course/marine" className="category-card">
          <img src={marine} alt="해양여행" />
          <h3>해양 여행</h3>
          <p>바다를 즐기는 특별한 코스</p>
        </Link>
      </div>
    </div>
  );
};

export default CourseHome;
