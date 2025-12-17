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

<table>
  <thead>
    <tr>
      <th width="250">기능명</th>
      <th width="500">설명</th>
      <th width="100">기여도</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>명소 큐레이션 및 상세 페이지</b></td>
      <td>부산의 주요 명소(해운대, 광안리 등)를 테마별로 제공하며, 상세 정보 및 사진 확인 기능 구현</td>
      <td align="center">상<br>⭐</td>
    </tr>
    <tr>
      <td><b>구역별/카테고리 필터링</b></td>
      <td>해운대구, 수영구 등 지역별 및 맛집, 숙소 등 카테고리별 검색 기능 구현</td>
      <td align="center">중<br>★</td>
    </tr>
    <tr>
      <td><b>실시간 부산 날씨 정보</b></td>
      <td>OpenWeather API를 연동하여 현재 부산의 기상 상태 및 여행 적합도 제공</td>
      <td align="center">하<br>☆</td>
    </tr>
    <tr>
      <td><b>사용자 맞춤 경로 추천</b></td>
      <td>사용자의 취향(바다 위주, 맛집 위주)에 따른 AI 기반 1일 관광 코스 추천</td>
      <td align="center">상<br>⭐</td>
    </tr>
    <tr>
      <td><b>리뷰 및 평점 CRUD</b></td>
      <td>각 관광지에 대한 사용자 실시간 리뷰 작성, 수정, 삭제 기능 구현</td>
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
  <li><b>Toss Payments API</b>: 결제 시스템 연동 및 안정적인 결제 프로세스 구축</li>
  <li><b>Kakao Maps API</b>: 위치 기반 서비스 및 지도 시각화 구현</li>
  <li><b>Social Login API</b>: 네이버, 구글, 카카오 OAuth 2.0 기반 간편 로그인 구현</li>
</ul>
<p>
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TS">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS">
  <img src="https://img.shields.io/badge/Kakao-FFCD00?style=flat-square&logo=kakao&logoColor=black" alt="Kakao">
  <img src="https://img.shields.io/badge/Toss-0064FF?style=flat-square&logo=toss&logoColor=white" alt="Toss">
</p>

<br>

<h3>📌 Backend</h3>
<ul>
  <li><b>Spring Boot</b>: RESTful API 설계 및 비즈니스 로직의 모듈화</li>
  <li><b>Spring Security</b>: 권한 분리 및 사용자 인증 보안 강화</li>
  <li><b>Node.js</b>: 효율적인 비동기 이벤트 처리 환경 구축</li>
  <li><b>Lombok</b>: 반복 코드 최소화로 코드 가독성 및 생산성 향상</li>
  <li><b>SWT</b>: Java 기반 네이티브 인터페이스(GUI) 구현 및 활용</li>
</ul>
<p>
  <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat-square&logo=springboot&logoColor=white" alt="Spring Boot">
  <img src="https://img.shields.io/badge/Spring_Security-6DB33F?style=flat-square&logo=springsecurity&logoColor=white" alt="Spring Security">
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Nodejs">
  <img src="https://img.shields.io/badge/Java_SWT-007396?style=flat-square&logo=java&logoColor=white" alt="SWT">
</p>

<br>

<h3>📌 Data & Search</h3>
<ul>
  <li><b>MyBatis & Oracle SQL</b>: 데이터베이스 연동 및 쿼리 최적화</li>
  <li><b>Apache Solr</b>: 고성능 검색 엔진 인덱싱 및 전문(Full-text) 검색 구현</li>
  <li><b>공공데이터포털 API</b>: 외부 공공데이터 연동 및 실시간 데이터 활용</li>
</ul>
<p>
  <img src="https://img.shields.io/badge/Oracle-F80000?style=flat-square&logo=oracle&logoColor=white" alt="Oracle">
  <img src="https://img.shields.io/badge/MyBatis-000000?style=flat-square&logo=github&logoColor=white" alt="MyBatis">
  <img src="https://img.shields.io/badge/Apache_Solr-D9411E?style=flat-square&logo=apachesolr&logoColor=white" alt="Solr">
</p>

<hr>
