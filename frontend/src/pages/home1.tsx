import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <h1>홈 페이지입니다</h1>
      
    
      <Link 
        to="/login" 
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          borderRadius: "5px",
          textDecoration: "none"
        }}
      >
        로그인
      </Link>
    </div>
  );
}