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
<h2>📊 핵심 세부기능 설명</h2>
<ul>
  <li></li>
  <li></li>
  <li></li>
</ul>

<hr>
<h2>🎬 전체 보기(자세히)</h2>
<ul>
  <li></li>
  <li></li>
  <li></li>
</ul>

<hr>
<h2>🧬 테이블 명세서 및 ERD</h2>
