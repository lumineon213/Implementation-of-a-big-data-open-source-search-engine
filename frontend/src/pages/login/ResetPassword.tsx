import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [valid, setValid] = useState(false);
  const [newPw, setNewPw] = useState("");

useEffect(() => {
  if (!token) return;

  axios.get(`/api/login/verifyResetToken?token=${token}`)
    .then(res => setValid(res.data.valid));
}, [token]);

const handleUpdatePw = async () => {

  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(newPw)) {
    alert("비밀번호는 8자 이상, 영문 + 숫자 + 특수문자를 포함해야 합니다.");
    return;
  }

  const res = await axios.post("/api/login/updatePw", {
    token,
    newPw,
  });

  if (res.data.success) {
    alert("비밀번호 변경 완료! 로그인하세요.");
    window.location.href = "/login";
  }
};


  if (!valid) return <h2>잘못된 또는 만료된 링크입니다❌</h2>;

  return (
    <div>
      <h1>새 비밀번호 설정</h1>
      <input
        type="password"
        placeholder="새 비밀번호 입력"
        value={newPw}
        onChange={e => setNewPw(e.target.value)}
      />
      <button onClick={handleUpdatePw}>변경하기</button>
    </div>
  );
}