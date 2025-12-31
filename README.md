<img width="794" height="1123" alt="1" src="https://github.com/user-attachments/assets/d2da18c9-c464-4476-8a54-b17cb1cf7fcc" />


# 🌊 Busan Go?


Busan Go?는 사용자의 여행 테마와 선호도를 기반으로 최적화된 로컬 여행 경험을 설계하는 **지능형 부산 관광 플랫폼**입니다. 
기존 플랫폼의 광고성 정보를 배제하고, AI 모델을 통해 신뢰도 높은 데이터를 분석하여 **사용자 맞춤형 여행 계획 및 동선 최적화 서비스**를 제공합니다.

<hr>

일반적인 포털이나 SNS의 정보는 광고성 게시글로 인해 정보의 왜곡이 발생하기 쉽습니다. 
**Busan Go?**는 이러한 문제를 해결하기 위해 공공데이터포털(data.go.kr) 및 한국관광공사(TourAPI)에서 제공하는 검증된 데이터를 활용합니다.

<hr>

**객관적 정보 제공:** 정부 및 지자체에서 직접 관리하는 데이터를 바탕으로 광고성을 배제한 순수 관광 정보 제공
**최신성 유지:** API 연동을 통해 축제 일정, 운영 시간 등 실시간으로 변동되는 정보를 정확하게 반영
**로컬 밀착형 데이터:** 부산광역시에서 보증하는 맛집, 숙소, 축제 데이터를 활용하여 여행의 질 향상

<hr>

### 🎯 Project Vision
**광고 없는 순수 정보:** 광고성 콘텐츠를 필터링하여 실거주 로컬이 인정하는 진정한 맛집과 명소 발굴
**AI 기반 여정 최적화:** 산재한 관광지 데이터를 결합하여 사용자 맞춤형 최단·최적 동선 설계
**통합 검색 엔진:** 부산 내 축제, 숙소, 명소를 한 번에 탐색할 수 있는 검색 환경 구축

<br>

## 🌊 부산 관광 가이드 프로젝트 기능개요 

<br>

## 🌟 주요 서비스 기능

<table>
  <thead>
    <tr>
      <th width="200">주요 기능</th>
      <th width="500">상세 설명</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>공공데이터 기반 <br>신뢰 큐레이션</b></td>
      <td><b>공공데이터포털</b>의 검증된 API를 활용하여 광고가 섞이지 않은 청정 맛집, 숙소, 축제 데이터 제공</td>
    </tr>
    <tr>
      <td><b>AI 기반 스마트 <br>여행 플래너</b></td>
      <td>산재한 관광 데이터를 결합하여 사용자 취향에 맞는 <b>최적의 시간대별 동선</b> 자동 생성</td>
    </tr>
    <tr>
      <td><b>통합 관광 <br>검색 엔진</b></td>
      <td>한국관광공사 <b>TourAPI</b>를 연동하여 부산 내 모든 관광 인프라를 한눈에 탐색하는 원스톱 시스템</td>
    </tr>
  </tbody>
</table>

<br>

<hr>
<h2>🛠️ 기술 스택</h2>

<h3>📌 Frontend</h3>
<ul>
  <li><b>React (TSX)</b>: 컴포넌트 기반 UI 설계 및 TypeScript를 통한 타입 안정성 확보</li>
  <li><b>CSS</b>: 사용자 친화적인 UI 및 반응형 레이아웃 구현</li>
</ul>
<p>
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TS">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS">
</p>

<br>

<h3>📌 Backend & Security</h3>
<ul>
  <li><b>Spring Boot & Security</b>: RESTful API 설계 및 권한 분리/사용자 인증 보안 강화</li>
  <li><b>Node.js</b>: 비동기 이벤트 처리 기반의 효율적인 서버 환경 구축</li>
  <li><b>Lombok</b>: 반복 코드 최소화로 코드 가독성 및 생산성 향상</li>
  <li><b>JWT (Authentication)</b>: 토큰 기반의 안전한 사용자 인증 시스템 구현</li>
</ul>
<p>
  <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat-square&logo=springboot&logoColor=white" alt="Spring Boot">
  <img src="https://img.shields.io/badge/Spring_Security-6DB33F?style=flat-square&logo=springsecurity&logoColor=white" alt="Spring Security">
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Nodejs">
  <img src="https://img.shields.io/badge/JSON_Web_Tokens-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" alt="JWT">
</p>

<br>

<h3>📌 Data, Search & External API</h3>
<ul>
  <li><b>MyBatis & Oracle SQL</b>: 데이터베이스 연동 및 쿼리 최적화</li>
  <li><b>Apache Solr</b>: 고성능 검색 엔진 인덱싱 및 전문(Full-text) 검색 구현</li>
  <li><b>External API</b>: 공공데이터포털, Toss 결제, Kakao Maps API 연동</li>
  <li><b>Social Login</b>: Naver, Google, Kakao OAuth 2.0 기반 간편 로그인</li>
</ul>
<p>
  <img src="https://img.shields.io/badge/Oracle-F80000?style=flat-square&logo=oracle&logoColor=white" alt="Oracle">
  <img src="https://img.shields.io/badge/Apache_Solr-D9411E?style=flat-square&logo=apachesolr&logoColor=white" alt="Solr">
  <img src="https://img.shields.io/badge/Google-4285F4?style=flat-square&logo=google&logoColor=white" alt="Google">
  <img src="https://img.shields.io/badge/Kakao-FFCD00?style=flat-square&logo=kakao&logoColor=black" alt="Kakao">
  <img src="https://img.shields.io/badge/Naver-03C75A?style=flat-square&logo=naver&logoColor=white" alt="Naver">
  <img src="https://img.shields.io/badge/Toss-0064FF?style=flat-square&logo=toss&logoColor=white" alt="Toss">
</p>

<br>

<h3>📌 Collaboration & Tools</h3>
<ul>
  <li><b>GitHub</b>: Git을 이용한 소스 코드 버전 관리 및 협업</li>
  <li><b>Jira</b>: 애자일 방법론 기반의 프로젝트 일정 및 태스크 관리</li>
  <li><b>SWT</b>: Java 기반 네이티브 인터페이스(GUI) 구현</li>
</ul>
<p>
  <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="Github">
  <img src="https://img.shields.io/badge/Jira-0052CC?style=flat-square&logo=jira&logoColor=white" alt="Jira">
</p>

<hr>
# ✨ UI / 기능 상세

---

<details>
<summary><strong>✨ UI/UX 테마 보기</strong></summary>

### ◈ 메인 페이지 구성
<img width="1896" height="887" alt="스크린샷 2025-12-31 092319" src="https://github.com/user-attachments/assets/94a0901f-3bfe-4537-9415-1a525466549a" />
<img width="1888" height="940" alt="스크린샷 2025-12-31 161237" src="https://github.com/user-attachments/assets/e9b57865-5110-4017-9235-e17781f5ae54" />
<img width="1898" height="942" alt="스크린샷 2025-12-31 092412" src="https://github.com/user-attachments/assets/321967f9-b585-4e48-8168-ff34e31a594b" />
<img width="1917" height="944" alt="스크린샷 2025-12-31 092431" src="https://github.com/user-attachments/assets/e27846cf-6813-4517-8262-a910a67a3771" />
<img width="284" height="942" alt="스크린샷 2025-12-31 161300" src="https://github.com/user-attachments/assets/52750718-4a51-471f-bfc4-ffe042ee6341" />

### ◈ 로그인/회원가입
<img width="726" height="667" alt="스크린샷 2025-12-31 092525" src="https://github.com/user-attachments/assets/ebaf84c6-6b9d-4fe4-b737-3a46f5243b8a" />
<img width="492" height="787" alt="관리자로그인" src="https://github.com/user-attachments/assets/dff98b53-83ef-4804-bfb9-d90a44c24be9" />
<img width="1840" height="911" alt="image" src="https://github.com/user-attachments/assets/766e801e-fe9f-4839-8114-ed2108662a84" />
<img width="1908" height="940" alt="image" src="https://github.com/user-attachments/assets/abb3dce7-b88c-4a41-9c52-8d4b0271ec19" />

### ◈ 아이디/비밀번호 찾기
<img width="1881" height="933" alt="스크린샷 2025-12-31 164903" src="https://github.com/user-attachments/assets/4f643638-4b62-4565-8136-1f2f28b7c6c7" />
<img width="1877" height="938" alt="스크린샷 2025-12-31 164911" src="https://github.com/user-attachments/assets/21038853-b081-406a-bb51-ca7e19c77110" />

### ◈ Footer
<img width="1894" height="358" alt="footer" src="https://github.com/user-attachments/assets/450400b7-ac46-41ae-95f9-e8735277c8fa" />

<details><summary>이용약관</summary>
<img width="1896" height="800" alt="이용약관" src="https://github.com/user-attachments/assets/ae896444-2f6f-48b0-bfab-5fd55f56b1f6" />
</details>

<details><summary>개인정보 처리방침</summary>
<img width="1897" height="866" alt="개인정보처리방침" src="https://github.com/user-attachments/assets/e8a6ab93-bb4d-4213-84c3-925d290a28bc" />
</details>

<details><summary>자주 묻는 질문</summary>
<img width="1894" height="943" alt="자주묻는질문1" src="https://github.com/user-attachments/assets/67346488-cd67-47ca-a3fd-03e242ffb094" />
<img width="1878" height="933" alt="자주묻는질문2" src="https://github.com/user-attachments/assets/10741788-4b76-4806-85af-abb2d3848649" />
</details>

</details>


---

<details>
<summary><strong>✨ 충전소 정보 보기</strong></summary>

### ◈ 충전소 목록
<img src="https://github.com/user-attachments/assets/96440a1c-b75e-459a-bd27-d1dd32039f47" alt="충전소 목록" width="100%"/>


### ◈ 충전소 상세 정보
<img src="https://github.com/user-attachments/assets/66695ca6-443d-44bc-be7c-3e804c8f9d77" alt="충전소 상세" width="100%"/>

### ◈ 충전소 주변 카페
<img src="https://github.com/user-attachments/assets/dbdadde8-b8c5-4eec-a10b-e340e66e82b9" alt="충전소 주변 카페" width="100%"/>
  
### ◈ 충전소 혼잡도
<img src="https://github.com/user-attachments/assets/b79696ac-5fd9-4a11-9432-e339e7a4c331" alt="충전소 혼잡도" width="100%"/>


### ◈ 즐겨찾기
<details><summary>즐겨찾기 UI</summary>
<img src="https://github.com/user-attachments/assets/b2a2fe1f-c2cd-485b-b712-f0f6c4aa4676"  alt="즐겨찾기 버튼" width="100%"/>
</details>

<details><summary>즐겨찾기 목록</summary>
<img src="" alt="즐겨찾기 목록" width="100%"/>
</details>

</details>

---

<details>
<summary><strong>✨ 마이페이지 보기</strong></summary>

### ◈ 마이페이지 메인
<img src="https://github.com/user-attachments/assets/d304245b-65b5-4fa2-97c4-1317e9b9fbc4" alt="마이페이지 메인" width="100%"/>

### ◈ 내 예약 취소 내역
<img src="https://github.com/user-attachments/assets/d345b8f9-4bfb-4609-862b-71b1026fe76a" alt="내 예약 취소 내역" width="100%"/>

### ◈ 고장 신고 내역
<img src="https://github.com/user-attachments/assets/9bfaf87d-6fa5-4963-a3d7-7c5a7424b499" alt="고장 신고 내역" width="100%"/>

</details>

---

<details>
<summary><strong>✨ 고장 신고 기능</strong></summary>

### ◈ 고장 신고 접수
<img src="https://github.com/user-attachments/assets/0816f1db-60f7-4eba-9c70-d924cdcef189" alt="고장 신고 접수" width="100%"/>

### ◈ 관리자 고장 신고 확인
<img src="https://github.com/user-attachments/assets/0537a5ab-2f48-41c3-aed9-0ffb07a5a614" alt="관리자 고장 신고 확인" width="100%"/>

### ◈ 고장신고 상세 보기
<img src="https://github.com/user-attachments/assets/b3387057-90f4-484c-82f1-fac675fb15c7" alt="고장신고 상세 보기" width="100%"/>

</details>

---

<details>
<summary><strong>✨ 예약 결제 기능</strong></summary>

### ◈ 예약 접수
<img src="https://github.com/user-attachments/assets/25e49347-116e-4ce1-bb60-4b2c9717b981" alt="예약 접수" width="100%"/>

### ◈ 예약 접수 방법
<img src="https://github.com/user-attachments/assets/0d124f0b-4f05-41c2-ad11-115f838879d3" alt="예약 접수 방법" width="100%"/>

### ◈ 결제 확인 기능
<img src="https://github.com/user-attachments/assets/e13a73af-bf95-4701-82a8-43dfa71552e0" alt="결제 확인 기능" width="100%"/>

</details>

---

<details>
<summary><strong>✨ 게시판 보기</strong></summary>

### ◈ 게시판
<img src="https://github.com/user-attachments/assets/cca601d6-b109-4a06-94ed-b90c4a7c3706" alt="게시판" width="100%"/>

</details>

---

<details>
<summary><strong>✨ 공지사항 보기</strong></summary>

### ◈ 공지사항
<img src="https://github.com/user-attachments/assets/56ea9b5c-9e2c-4dae-9eed-633dfb8eac61" alt="공지사항" width="100%"/>

</details>

---
<details>
<summary><strong>✨ 숙박 시설 탐색 및 예약 연동</strong></summary>

### ◈ 지역별 숙소 리스트
> 공공데이터를 기반으로 한 부산 전역의 숙박 시설 정보를 카테고리별로 제공합니다.
<img width="1913" height="944" alt="19" src="https://github.com/user-attachments/assets/e23ad24e-0374-4664-ad99-22ea73608a5d" />

### ◈ 숙소 상세 정보 및 시설 확인
> 공공데이터 API를 통해 수집된 상세 편의시설 정보를 확인합니다.
<img width="1902" height="943" alt="20" src="https://github.com/user-attachments/assets/e1cb55b0-b165-42f2-959f-d1e9c05c54f7" />
<img width="964" height="504" alt="56" src="https://github.com/user-attachments/assets/35801632-53ef-4dab-a922-8591d1479b3f" />

### ◈ 예약 로직 프로세스
> 예약 데이터의 무결성을 위해 중복 예약 방지 로직을 수행하며, 예약 번호 생성 및 상태 값(대기/완료)을 관리합니다.
<img width="1903" height="937" alt="21" src="https://github.com/user-attachments/assets/4a03c320-c27b-485a-bb8f-d389ab0eebfb" />
<img width="597" height="596" alt="스크린샷 2025-12-31 165025" src="https://github.com/user-attachments/assets/f09c1f3d-b40c-4190-a013-92b5f5dd8566" />
<img width="594" height="594" alt="스크린샷 2025-12-31 165017" src="https://github.com/user-attachments/assets/49c29e32-a2b5-46cf-a080-d5492b1ea691" />


### ◈ 결제 API 연동 및 확인
> TOSS 결제 API를 연동하여 실제 결제 프로세스를 구현하였으며, 결제 성공 시 DB의 예약 상태를 업데이트하고 사용자에게 최종 결제 확인 내역을 제공합니다.
<img width="643" height="196" alt="스크린샷 2025-12-31 164957" src="https://github.com/user-attachments/assets/bf1ba8b7-c89f-48f4-ac28-c5e5a5e62a58" />

</details>

---

<details>
<summary><strong>✨ 광고 없는 로컬 맛집 큐레이션</strong></summary>

### ◈ 신뢰 기반 맛집 검색
> 광고성 홍보 게시글을 배제하고 부산광역시에서 공식적으로 인증한 맛집 데이터를 조회합니다.
<img width="1906" height="946" alt="8" src="https://github.com/user-attachments/assets/5ad8e827-e223-4c29-8377-a6896ab337e4" />

### ◈ 테마별 맛집 검색 기능
> 로컬 노포, 바다 전망, 가성비, 원하는 메뉴 등 사용자가 원하는 테마에 맞는 식당을 빠르게 탐색합니다.
<img width="1911" height="945" alt="57" src="https://github.com/user-attachments/assets/a8ac81e7-80f6-4765-9485-c142cf60a614" />

### ◈ 맛집 상세 정보 및 시설 확인
> 공공데이터 API를 통해 수집된 식당의 상세 정보를 확인합니다.
<img width="1914" height="948" alt="9" src="https://github.com/user-attachments/assets/58db0563-4886-4972-a122-2060047fa476" />



</details>

---

## 🧬 ERD & 테이블 명세서

<details>
<summary><strong>테이블 세부 명세서</strong></summary>
<img width="838" height="625" alt="스크린샷 2025-12-31 150720" src="https://github.com/user-attachments/assets/75eedf87-c360-4873-93c1-f9f2e2722572" />
<img width="841" height="718" alt="스크린샷 2025-12-31 152716" src="https://github.com/user-attachments/assets/427c9409-513f-4480-9fa3-d792024046cb" />
<img width="842" height="720" alt="스크린샷 2025-12-31 152733" src="https://github.com/user-attachments/assets/b56dcfd6-32c3-4bd8-b011-946dfcd139e3" />
<img width="843" height="756" alt="스크린샷 2025-12-31 152746" src="https://github.com/user-attachments/assets/251fa2d4-fdab-4184-8aae-3d8a9290d643" />
<img width="841" height="688" alt="스크린샷 2025-12-31 152823" src="https://github.com/user-attachments/assets/a2b82b8a-a46c-4749-b32a-a5cbe44f6098" />
<img width="842" height="210" alt="스크린샷 2025-12-31 152839" src="https://github.com/user-attachments/assets/aeef753a-a4b5-4a03-ba1d-87b1102df2ed" />


</details>

---


<details>
  <summary><b>🔍 [클릭] 메인 시스템 설계도(ERD 1) 보기</b></summary>
  <p align="center">
    <img src="https://github.com/user-attachments/assets/588214e0-ef9f-4e24-95e0-5575b281d38b" width="100%" alt="Database ERD 1">
  </p>
</details>

<br>

<details>
  <summary><b>🔍 [클릭] 상세 정보 및 로그 테이블(ERD 2) 보기</b></summary>
  <p align="center">
    <img src="https://github.com/user-attachments/assets/4349e032-88da-4ac5-969d-b1167bd1db37" width="100%" alt="Database ERD 2">
  </p>
</details>

<hr>
