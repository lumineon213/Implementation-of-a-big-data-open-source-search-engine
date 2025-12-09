import React, { useState } from "react";
import axios from "axios";
import "./FindAccount.css";

const FindId: React.FC = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleFindId = async () => {
    try {
      const res = await axios.post("/api/login/findId", {
        email,
        phoneNumber: phone,
      });

      if (res.data.success) {
        alert(`회원님의 아이디는 [ ${res.data.accountId} ] 입니다`);
      } else {
        alert(res.data.msg || "일치하는 회원 정보가 없습니다.");
      }
    } catch (e) {
      alert("조회 실패");
    }
  };

  return (
    <div className="find-container">
      <div className="find-card">
        <h2 className="find-title">아이디 찾기</h2>

        <div className="input-wrap">
          <label className="find-label">가입 이메일</label>
          <input
            className="find-input"
            placeholder="가입 이메일 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-wrap">
          <label className="find-label">가입 전화번호</label>
          <input
            className="find-input"
            placeholder="전화번호 입력"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <button className="find-btn" onClick={handleFindId}>
          아이디 조회하기
        </button>
      </div>
    </div>
  );
};

export default FindId;
