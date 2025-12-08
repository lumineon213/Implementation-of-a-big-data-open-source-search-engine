import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <main
      style={{
        maxWidth: "960px",
        margin: "80px auto 0", // 상단 여백 추가로 헤더에 가리지 않도록 조정
        padding: "40px 20px",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>개인정보 처리방침</h1>
      <hr /><br /><br />
      <p style={{ marginBottom: "1rem", color: "#555" }}>
        우리 부산 GO?(이하 "서비스")는 「개인정보 보호법」 등 관련 법령을 준수하며,
        부산 관광 정보 제공 및 예약·문의 서비스 제공과 관련하여 이용자의 개인정보를 안전하게 보호하기 위해
        다음과 같이 개인정보 처리방침을 수립·운영합니다.
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>제1조(수집하는 개인정보의 항목 및 수집 방법)</h2>
        <p>
          서비스는 회원가입, 예약, 문의·상담, 이벤트 참여 등 과정에서 아래와 같은 개인정보를 수집할 수 있습니다.
        </p>
        <ul style={{ marginTop: "0.5rem", marginLeft: "1.25rem", listStyle: "disc" }}>
          <li>회원가입 시: 이름, 이메일 주소, 비밀번호, 휴대전화번호</li>
          <li>예약/문의 시: 이름, 연락처, 이메일, 예약 또는 문의 내용</li>
          <li>서비스 이용 시 자동 수집: 접속 IP, 쿠키, 방문 일시, 이용 기록, 브라우저/기기 정보 등</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>제2조(개인정보의 수집 및 이용 목적)</h2>
        <ul style={{ marginTop: "0.5rem", marginLeft: "1.25rem", listStyle: "disc" }}>
          <li>부산 지역 관광지, 축제, 맛집, 여행코스 등 정보 제공 및 맞춤형 콘텐츠 추천</li>
          <li>관광 상품, 체험 프로그램 등의 예약 접수·변경·취소 및 이용 안내</li>
          <li>이용자 문의 및 민원 처리, 공지사항 전달</li>
          <li>서비스 이용 통계·분석을 통한 서비스 품질 개선 및 신규 관광 콘텐츠 개발</li>
          <li>보안, 부정 이용 방지 및 서비스 안정성 확보</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>제3조(개인정보의 보유 및 이용 기간)</h2>
        <p>
          서비스는 관련 법령에서 정한 기간 또는 이용자의 동의 범위 내에서 개인정보를 보유·이용하며,
          원칙적으로 수집 및 이용 목적이 달성되면 지체 없이 파기합니다.
        </p>
        <ul style={{ marginTop: "0.5rem", marginLeft: "1.25rem", listStyle: "disc" }}>
          <li>회원 정보: 회원 탈퇴 시까지 보관</li>
          <li>예약 및 결제 관련 기록: 전자상거래 관련 법령에 따라 5년간 보관</li>
          <li>소비자 불만 또는 분쟁 처리 기록: 3년간 보관</li>
          <li>접속 로그 등 서비스 이용 기록: 통신비밀보호법에 따라 3개월 이상 보관</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>제4조(개인정보의 제3자 제공 및 처리 위탁)</h2>
        <p>
          서비스는 이용자의 동의 없이는 개인정보를 외부에 제공하지 않으며, 법령에 근거가 있는 경우에만 예외적으로 제공할 수 있습니다.
          또한 서비스 제공을 위하여 필요한 경우, 개인정보 처리 업무를 신뢰할 수 있는 외부 업체에 위탁할 수 있으며,
          이 경우 위탁받는 자와 업무 내용, 보유 기간 등을 이용자에게 고지합니다.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>제5조(이용자의 권리와 행사 방법)</h2>
        <ul style={{ marginTop: "0.5rem", marginLeft: "1.25rem", listStyle: "disc" }}>
          <li>이용자는 언제든지 자신의 개인정보에 대한 열람, 정정, 삭제, 처리정지 등을 요청할 수 있습니다.</li>
          <li>회원 탈퇴를 통하여 개인정보 삭제를 요청할 수 있습니다.</li>
          <li>서비스는 본인 확인 후 지체 없이 필요한 조치를 취합니다.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>제6조(개인정보의 파기)</h2>
        <p>
          서비스는 개인정보의 보유 기간이 경과하거나 처리 목적이 달성된 경우, 지체 없이 해당 정보를 복구가 불가능한 방법으로 파기합니다.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>제7조(개인정보 보호를 위한 안전성 확보조치)</h2>
        <p>
          서비스는 개인정보의 안전한 처리를 위하여 접근 권한 관리, 암호화, 보안 프로그램 설치, 접속 기록 보관 등
          필요한 기술적·관리적 보호조치를 시행합니다.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>제8조(개인정보 보호책임자)</h2>
        <p>
          이용자는 개인정보 보호와 관련한 문의, 불만 처리, 피해 구제 등을 아래 연락처로 요청할 수 있습니다.
        </p>
        <ul style={{ marginTop: "0.5rem", marginLeft: "1.25rem", listStyle: "disc" }}>
          <li>개인정보 보호책임자: [이름]</li>
          <li>이메일: [이메일 주소]</li>
          <li>연락처: [전화번호]</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>제9조(개인정보 처리방침의 변경)</h2>
        <p>
          본 개인정보 처리방침은 관련 법령, 정책 또는 서비스 내용의 변경에 따라 수정될 수 있으며,
          중요한 변경 사항이 있을 경우 서비스 내 공지사항을 통하여 사전에 안내합니다.
        </p>
        <p style={{ marginTop: "0.5rem", color: "#777", fontSize: "0.9rem" }}>
          공고일자: [2025.12.08] / 시행일자: [2025.12.08]
        </p>
      </section>
    </main>
  );
};

export default PrivacyPolicy;
