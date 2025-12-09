import React, { useState } from "react";
import axios from "axios";
import "./FindAccount.css";

const FindPassword: React.FC = () => {
  const [accountId, setAccountId] = useState("");
  const [email, setEmail] = useState("");

  const handleFindPw = async () => {
    try {
      const res = await axios.post("/api/login/findPw", {
        accountId,
        email,
      });

      if (res.data.success) {
        alert(
          "비밀번호 변경 링크가 이메일로 전송되었습니다!\n메일을 확인해주세요."
        );
      } else {
        alert(res.data.msg || "입력한 정보가 일치하지 않습니다.");
      }
    } catch {
      alert("비밀번호 찾기 실패");
    }
  };

  return (
    <div className="find-container">
      <div className="find-card">
        <h2 className="find-title">비밀번호 찾기</h2>

        <div className="input-wrap">
          <label className="find-label">아이디</label>
          <input
            className="find-input"
            placeholder="가입 아이디 입력"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          />
        </div>

        <div className="input-wrap">
          <label className="find-label">가입 이메일</label>
          <input
            className="find-input"
            placeholder="가입 이메일 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button className="find-btn" onClick={handleFindPw}>
          비밀번호 변경 링크 받기
        </button>
      </div>
    </div>
  );
};

export default FindPassword;
