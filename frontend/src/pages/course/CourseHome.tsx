import { Link } from "react-router-dom";
import "./CourseHome.css";

const CourseHome = () => {
  return (
    <div className="course-home">
      <h2>여행 코스</h2>
      <p>부산의 다양한 여행 테마를 선택해보세요!</p>

      <div className="course-category-list">
        <Link to="/course/walk" className="category-card">
          <img src="/icons/walk.png" alt="도보여행" />
          <h3>도보 여행</h3>
          <p>부산을 걸으며 즐기는 여행 코스</p>
        </Link>

        <Link to="/course/food" className="category-card">
          <img src="/icons/food.png" alt="맛집여행" />
          <h3>맛집 코스</h3>
          <p>부산의 맛을 따라가는 여행</p>
        </Link>

        <Link to="/course/theme" className="category-card">
          <img src="/icons/theme.png" alt="테마여행" />
          <h3>테마 여행</h3>
          <p>힐링 · 바다 · 감성 루트</p>
        </Link>
      </div>
    </div>
  );
};

export default CourseHome;
