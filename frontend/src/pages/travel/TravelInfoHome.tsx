import React from "react";
import { useNavigate } from "react-router-dom";
import "./TravelInfo.css";

const TravelInfoHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="travel-info-container">
      <h1 className="travel-info-title">부산 여행정보</h1>
      <p className="travel-info-subtitle">원하는 정보를 선택해 자세한 내용을 확인해 보세요.</p>
      <div className="travel-info-grid">
        <button className="travel-info-card" onClick={() => navigate("/info/festival")}>
          <h2>부산축제 정보</h2>
          <p>부산축제 이름, 기간, 좌표, 상세정보, 이미지 등 국문 정보 조회</p>
        </button>
        <button className="travel-info-card" onClick={() => navigate("/info/shopping")}>
          <h2>부산 쇼핑정보</h2>
          <p>부산 관광 쇼핑 이름, 좌표, 상세정보, 이미지 등 국문 정보 조회</p>
        </button>
        <button className="travel-info-card" onClick={() => navigate("/info/parking")}>
          <h2>공영 주차장 정보</h2>
          <p>주차장명, 유형, 주소, 주차구획수, 급지구분 등 조회</p>
        </button>
        <button className="travel-info-card" onClick={() => navigate("/info/accessible")}>
          <h2>장애인 편의시설 업소</h2>
          <p>상호, 상세정보, 위치구분명, 편의시설 종류, 이미지 등 조회</p>
        </button>
        <button className="travel-info-card" onClick={() => navigate("/info/tourist-center")}>
          <h2>관광 안내소 정보</h2>
          <p>부산 관광 안내소 이름, 좌표, 상세정보, 이미지 등 조회</p>
        </button>
        <button className="travel-info-card" onClick={() => navigate("/info/hospital")}>
          <h2>의료기관/약국 정보</h2>
          <p>기관명, 진료과목, 대표전화, 요일별 운영시간 등 조회</p>
        </button>
      </div>
    </div>
  );
};

export default TravelInfoHome;
