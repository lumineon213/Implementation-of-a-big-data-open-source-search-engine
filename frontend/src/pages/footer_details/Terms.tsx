import React from "react";

const Terms: React.FC = () => {
  return (
    <main
      style={{
        maxWidth: "960px",
        margin: "80px auto 0",
        padding: "40px 20px",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>이용약관</h1>
      <hr /><br /><br />
      <p style={{ marginBottom: "1rem", color: "#555" }}>
        이 이용약관은 우리 부산 GO? (이하 "서비스")가 제공하는 부산 관광 관련 정보 및 예약·문의 서비스
        이용과 관련하여, 서비스와 이용자 간의 권리, 의무 및 책임 사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>제1조(목적)</h2>
        <p>
          이 약관은 서비스가 운영하는 사이트를 통하여 제공하는 부산 관광 정보 서비스 및 관련 제반 서비스의 이용과
          관련하여 서비스와 이용자 간의 권리, 의무 및 책임 사항을 규정하는 것을 목적으로 합니다.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>제2조(정의)</h2>
        <ul style={{ marginTop: "0.5rem", marginLeft: "1.25rem", listStyle: "disc" }}>
          <li>"서비스"란 우리 부산 GO?가 제공하는 웹사이트 및 이에 부수되는 모든 서비스를 말합니다.</li>
          <li>"이용자"란 본 약관에 따라 서비스가 제공하는 콘텐츠를 이용하는 회원 및 비회원을 말합니다.</li>
          <li>"회원"이란 서비스에 회원 등록을 한 자로서, 지속적으로 서비스를 이용할 수 있는 자를 말합니다.</li>
          <li>"비회원"이란 회원으로 가입하지 않고 서비스를 이용하는 자를 말합니다.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>제3조(약관의 효력 및 변경)</h2>
        <ul style={{ marginTop: "0.5rem", marginLeft: "1.25rem", listStyle: "disc" }}>
          <li>이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
          <li>
            서비스는 관련 법령을 위배하지 않는 범위에서 약관을 개정할 수 있으며, 약관이 변경되는 경우 사전에 공지합니다.
          </li>
          <li>
            이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 회원 탈퇴를 요청할 수 있습니다. 변경된 약관의
            효력 발생일 이후에도 서비스를 계속 이용하는 경우, 변경된 약관에 동의한 것으로 간주됩니다.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>제4조(서비스의 제공 및 변경)</h2>
        <ul style={{ marginTop: "0.5rem", marginLeft: "1.25rem", listStyle: "disc" }}>
          <li>부산 지역 관광지, 축제, 행사, 맛집, 숙박, 여행코스 등 관광 정보 제공</li>
          <li>관광 상품, 체험 프로그램 등의 예약·문의 서비스</li>
          <li>기타 서비스가 정하는 관광 관련 부가 서비스</li>
          <li>
            서비스는 운영상 또는 기술상의 필요에 따라 제공 중인 서비스를 변경, 중단할 수 있으며, 중요한 변경의 경우 사전에
            공지합니다.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>제5조(이용자의 의무)</h2>
        <ul style={{ marginTop: "0.5rem", marginLeft: "1.25rem", listStyle: "disc" }}>
          <li>관계 법령, 약관, 이용 안내 및 서비스가 공지하는 사항을 준수할 의무</li>
          <li>타인의 개인정보를 도용하는 행위, 허위 정보 입력 행위의 금지</li>
          <li>서비스의 운영을 방해하거나 안정성을 해치는 행위의 금지</li>
          <li>서비스를 통하여 얻은 정보를 사전 동의 없이 무단 복제, 배포, 상업적으로 이용하는 행위의 금지</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>제6조(저작권 및 콘텐츠 이용)</h2>
        <p>
          서비스가 제공하는 텍스트, 이미지, 영상, 데이터 등 모든 콘텐츠에 대한 저작권 및 기타 지적재산권은 서비스 또는
          정당한 권리자에게 귀속합니다. 이용자는 서비스를 통해 제공되는 콘텐츠를 사전 허가 없이 복제, 전송, 배포, 판매,
          출판하여서는 아니 됩니다.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>제7조(책임의 한계)</h2>
        <p>
          서비스는 천재지변, 기술적 장애, 통신사 사정 등 불가항력적인 사유로 인하여 서비스를 제공할 수 없는 경우 그에
          대한 책임을 지지 않습니다. 또한, 서비스는 이용자 간 또는 이용자와 제3자 간에 발생한 분쟁에 대하여 원칙적으로
          개입하지 않으며, 이로 인한 손해에 대하여 책임을 지지 않습니다.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>제8조(준거법 및 관할)</h2>
        <p>
          이 약관의 해석 및 적용에 관하여는 대한민국 법령을 준거법으로 하며, 서비스 이용과 관련하여 분쟁이 발생하는 경우
          민사소송법 등 관련 법령에 따른 관할 법원을 전속 관할 법원으로 합니다.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>부칙</h2>
        <p style={{ marginBottom: "0.5rem" }}>본 약관은 2025년 12월 08일부터 시행합니다.</p>
      </section>
    </main>
  );
};

export default Terms;
