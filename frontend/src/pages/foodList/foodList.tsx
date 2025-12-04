import React, { useState, useEffect } from "react";
import axios from "axios";
import "./foodList.css"; // 스타일 파일 import

interface FoodData {
  id: string;
  title: string;
  address: string;
  menu_t: string; // 대표 메뉴 or 태그
  image_url: string;
  description: string;
}

const FoodList: React.FC = () => {
  const [foods, setFoods] = useState<FoodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 백엔드(Spring Boot)에서 데이터 가져오기
    const fetchFoods = async () => {
      try {
        // 검색어 없이 요청하면 전체 리스트 반환 (foodService 로직 덕분)
        const response = await axios.get("http://localhost:8484/api/food/search");
        setFoods(response.data); // Solr에서 받은 데이터 저장
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);

  if (loading) return <div className="loading">맛있는 정보를 불러오는 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="food-list-container">
      <h2 className="page-title">부산 맛집 리스트 ({foods.length}건)</h2>
      
      <div className="food-list-wrapper">
        {foods.map((food) => (
          <div key={food.id} className="food-card">
            {/* 1. 왼쪽 이미지 영역 */}
            <div className="food-image-box">
              <img 
                src={food.image_url || "https://via.placeholder.com/200?text=No+Image"} 
                alt={food.title} 
                onError={(e) => {
                    // 이미지 로딩 실패 시 기본 이미지로 대체
                    e.currentTarget.src = "https://via.placeholder.com/200?text=Busan+Food";
                }}
              />
            </div>

            {/* 2. 오른쪽 텍스트 영역 */}
            <div className="food-info-box">
              <div className="food-header">
                <h3 className="food-title">{food.title}</h3>
                <button className="more-btn">⋮</button>
              </div>
              
              <p className="food-address">{food.address}</p>
              
              {/* 설명이 너무 길면 잘라서 보여주기 */}
              <p className="food-desc">
                {food.description.length > 50 
                  ? food.description.substring(0, 50) + "..." 
                  : food.description}
              </p>

              {/* 해시태그 스타일로 메뉴 보여주기 */}
              <div className="food-tags">
                {food.menu_t && food.menu_t.split(",").map((tag, index) => (
                  <span key={index} className="tag">#{tag.trim()}</span>
                ))}
                <span className="tag">#부산맛집</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodList;