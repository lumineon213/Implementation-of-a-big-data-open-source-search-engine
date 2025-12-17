# 🌊 Busan Go?

Busan Go?는 사용자의 여행 테마와 선호도를 기반으로 최적화된 로컬 여행 경험을 설계하는 **지능형 부산 관광 플랫폼**입니다. 
기존 플랫폼의 광고성 정보를 배제하고, AI 모델을 통해 신뢰도 높은 데이터를 분석하여 **사용자 맞춤형 여행 계획 및 동선 최적화 서비스**를 제공합니다.

<hr>

### 🎯 Project Vision
**광고 없는 순수 정보:** 광고성 콘텐츠를 필터링하여 실거주 로컬이 인정하는 진정한 맛집과 명소 발굴
**AI 기반 여정 최적화:** 산재한 관광지 데이터를 결합하여 사용자 맞춤형 최단·최적 동선 설계
**통합 검색 엔진:** 부산 내 축제, 숙소, 명소를 한 번에 탐색할 수 있는 검색 환경 구축

<br>

## 🌊 부산 관광 가이드 프로젝트 기능개요 (기여도: 상: ⭐ / 중: ★ / 하: ☆)

<br>

## 🌟 주요 기능 (Key Features)

<table>
  <thead>
    <tr>
      <th width="200">기능명</th>
      <th width="500">상세 설명</th>
      <th width="100">기여도</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>지능형 동선 추천</b></td>
      <td>사용자의 여행 테마(식도락, 힐링, 익스트림 등)에 맞춰 <b>최적의 이동 동선</b>을 시각화하여 제공</td>
      <td align="center">상<br>⭐</td>
    </tr>
    <tr>
      <td><b>로컬 데이터 분석</b></td>
      <td>광고성 글을 배제하기 위한 필터링 로직을 거친 <b>신뢰도 높은 부산 관광 데이터셋</b> 활용</td>
      <td align="center">중<br>★</td>
    </tr>
    <tr>
      <td><b>통합 검색 엔진</b></td>
      <td>명소부터 숙박, 지역 축제까지 <b>Open API 연동</b>을 통한 실시간 정보 통합 검색 기능</td>
      <td align="center">상<br>⭐</td>
    </tr>
    <tr>
      <td><b>사용자 맞춤 플래너</b></td>
      <td>AI 기반으로 개인별 일정과 선호 장소를 조합하여 <b>나만의 부산 여행 일정표</b> 자동 생성</td>
      <td align="center">중<br>★</td>
    </tr>
  </tbody>
</table>

<br>

<hr>
<h2>🛠️ 기술 스택</h2>

<hr>

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
