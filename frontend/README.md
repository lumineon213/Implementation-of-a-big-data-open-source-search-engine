# Frontend - React + TypeScript + Vite

이 프로젝트의 프론트엔드는 **React + TypeScript + Vite** 기반이며  
백엔드(Spring Boot)와는 완전히 분리되어 독립적으로 동작합니다.  
프론트 작업은 반드시 **VSCode**로 진행해야 합니다.

---

## 1. 프로젝트 구조 (통합 아키텍처)

[React (Vite + TS, 5173)] → (proxy /api) → [Spring Boot (8484)] → [Oracle/DB]


프론트와 백엔드는 서로 다른 서버에서 개발되며  
Vite proxy를 통해 `/api` 요청이 Spring Boot로 전달됩니다.

---

## 2. 개발 환경 열기

반드시 VSCode에서 `frontend` 폴더만 열어 작업합니다.  
Spring Boot IDE(STS/IntelliJ)는 프론트 파일(TSX)을 정상 인식하지 못합니다.

---

## 3. 설치 및 실행

프로젝트 루트의 frontend 경로로 들어간 다음
npm install
npm run dev


개발 서버:  
http://localhost:5173/

Spring 서버는 http://localhost:8484/

---

## 4. 폴더 구조 설명

### 🔹 public 폴더
HTML과 기본 이미지가 들어있는 폴더입니다.  
건드릴 일이 거의 없습니다.

---

### 🔹 src 폴더
프로젝트의 실제 코드가 모두 들어 있습니다.

#### ✔ api — 백엔드(Spring) API 통신  
axios.ts가 있으며, 모든 API 요청을 여기서 작성합니다.

#### ✔ assets — 이미지/아이콘/폰트 보관  
정적 리소스 저장 용도입니다.

#### ✔ components — 반복 UI 컴포넌트  
예: Header, Footer, SearchBar  
페이지 전체가 아니라 "조각 UI"를 넣습니다.

#### ✔ hooks — 재사용 가능한 로직(커스텀 훅)  
예: useFetch(), useInput()  
초보는 건드릴 필요 없습니다.

#### ✔ layouts — 공통 레이아웃 템플릿  
예: Header + Footer + Outlet 구성.

#### ✔ pages — 실제 화면 페이지  
예: Home.tsx, Login.tsx, Search.tsx, MyPage.tsx  
라우터는 pages 기준으로 구성됩니다.

#### ✔ styles — 전역 스타일 및 CSS  
global.css 등, 전체 페이지 공통 디자인 적용.

---

### ✔ App.tsx  
전체 라우터를 관리하는 파일입니다.

### ✔ main.tsx  
프로젝트의 시작점(엔트리)입니다.  
여기서 `<App />`이 실제 화면에 렌더링됩니다.

---

## 5. VSCode 자동 설정

프로젝트에는 아래 파일들이 이미 포함되어 있습니다:

.vscode/settings.json
.eslintrc.json
.prettierrc


해당 설정으로 VSCode는 다음을 자동 적용합니다:

- 저장 시 자동 정렬(Prettier)
- 코드 검사 및 자동 수정(ESLint)
- 공통 코드 스타일 유지

팀원이 따로 설정할 필요 없습니다.

---

## 6. API 호출 방법

axios 인스턴스는 `src/api/axios.ts`에 있습니다.

예시:

ts
import { api } from "../api/axios";

const data = await api.get("/api/search?keyword=test");

Vite proxy가 이미 설정되어 있으므로
/api로 시작하는 모든 요청은 Spring Boot(8484)로 자동 전달됩니다.

---

## 7. 페이지 생성 규칙

화면 단위 파일은 src/pages에 만든다.

파일명은 PascalCase를 사용한다.
예: Home.tsx, Login.tsx

라우터는 App.tsx에서 등록한다.

---

## 8. 컴포넌트 제작 규칙

반복되는 UI는 반드시 components 폴더로 분리한다.

파일명은 PascalCase로 만든다.
예: Header.tsx, SearchBar.tsx

props가 많아지면 interface로 타입을 분리한다.

---

## 9. Git 협업 규칙
main      → 최종 배포용
develop   → 통합 개발 브랜치
feature/frontend-기능명 → 프론트 작업 브랜치
feature/backend-기능명 → 백엔드 작업 브랜치


PR은 항상 develop으로 보낸다.

pages/components 파일은 리뷰 후 병합한다.

---

## 10. 환경 변수 (.env)

API 주소나 KEY가 필요할 경우 사용합니다.

프로젝트 루트에 .env 파일 생성:

VITE_API_URL=http://localhost:8484


코드에서 사용:

import.meta.env.VITE_API_URL

---

## 11. 빌드 및 배포 방법
✔ 개발용

npm run dev

✔ 빌드

npm run build

dist/ 폴더가 생성되며,
배포는 아래 방식 중 하나로 진행합니다:

Spring Boot 정적 리소스(src/main/resources/static/)로 이동

Nginx로 별도 정적 호스팅

Vercel, Netlify 등 프론트 전용 배포 서비스 활용

---

## 12. 30초 요약
1. VSCode로 frontend 폴더만 연다.
2. npm install → npm run dev 실행.
3. pages에서 화면 만들고 components로 UI 조각 만든다.
4. API는 api 폴더의 axios로만 호출.
5. 저장하면 자동 포맷, 코드 정리됨.
6. 나머지는 설정 파일이라 건드릴 필요 없음.

---
## 13. 초보용 안내: 건드리는 폴더

프론트엔드 폴더에는 여러 설정 파일이 있지만  
**실제로 만져야 할 폴더는 딱 4개뿐입니다.**

### ✅ 반드시 건드리는 폴더
- **src/pages/**  
  화면을 만드는 곳  
  예: Home.tsx, Login.tsx, Search.tsx

- **src/components/**  
  화면에 들어가는 공통 UI 조각  
  예: Header.tsx, Footer.tsx, SearchBar.tsx

- **src/api/**  
  백엔드(Spring Boot)와 통신하는 axios 함수  
  예: api.get("/api/search")

- **src/styles/**  
  필요한 경우 CSS를 작성하는 곳  
  예: global.css, page별 CSS

---

### 🟦 조건부로 건드릴 수 있는 곳 (조금 이해 필요)
- **src/layouts/**  
  여러 페이지에 공통으로 들어가는 레이아웃  
  예: Header + Footer + Outlet 구조

- **src/hooks/**  
  재사용 로직을 넣는 곳  
  이 부분은 잘 모르겠으면 건드리지 않아도 됨

---

### ❌ 건드리면 안 되는 파일들 (설정파일)
초보자가 절대 수정하면 안 되는 파일입니다.

- `.vscode/**`  
  (자동 포맷, ESLint 설정 포함)

- `.eslintrc.json`  
- `.prettierrc`  
- `tsconfig.json`  
- `vite.config.ts`  
- `package.json`  
- `node_modules/`  
- `public/`의 대부분 파일  

이 파일들은 프로젝트 전체 규칙을 결정하므로  
수정 시 오류가 날 가능성이 큼.


## 🔑 api키 설정

본 프로젝트는 보안을 위해 API 키가 포함된 환경 변수 파일을 Git에 업로드하지 않습니다. (`.gitignore` 처리됨)
프로젝트를 실행하기 위해서는 **개별적으로 Google Gemini API 키를 발급받아 설정**해야 합니다.

### 설정 방법
1. **Google Gemini API 키 발급** (링크 하단 참조)
2. `frontend` 폴더 최상위 경로에 **`.env`** 파일을 생성합니다.
3. 생성한 파일에 아래 내용을 복사하고, `YOUR_API_KEY` 부분에 본인의 키를 입력합니다.

   ```env
   VITE_GEMINI_API_KEY=본인의_API_키_입력

### 🔗 챗봇 API 키 발급 링크 (Google Gemini)

팀원들에게 공유해주실 링크입니다.

* **사이트:** **[Google AI Studio](https://aistudio.google.com/)**
* **발급 방법:**
    1.  위 링크 접속 후 Google 계정으로 로그인
    2.  왼쪽 상단 **[Get API key]** 클릭
    3.  **[Create API key]** 버튼 클릭
    4.  생성된 `AIza`로 시작하는 키 복사

---

### 🔗 KOKAO MAP API 발급

* **사이트:** **[Google AI Studio](https://apis.map.kakao.com/)**
* **발급 방법:**
    1. 위 링크 접속 후 Kakao 계정으로 로그인
    2. 우측 상단 APP KEY 발급 클릭
    3. 클릭 후 다시 우측 상단에 앱 생성 클릭
    4. 생성한 앱 클릭 후 좌측 상단 메뉴->카카오맵(제품 설정 아래)
    5. 사용 설정 상태 on으로 변경
    6. 좌측 상단 메뉴->앱->플랫폼 키->JavaScript 키->Default JS Key
    7. JavaScript 키 수정창으로 넘어감 http://localhost:5173으로 도메인 등록
    8. 이후는 .env 파일에 VITE_KAKAO_MAP_KEY=본인의_API_키_입력

### 공공 데이터 API
* **아래 경로에서 api 활용신청** **
https://www.data.go.kr/data/15063472/openapi.do

https://www.data.go.kr/data/15063454/openapi.do - 도보여행정보 api
walk.api.key="본인 키"

* **API키 위치** **
스프링 부트에서 src/main/resources 바로 아래
secret.properties에 food.api.key="본인 인증 키"
gitignore에 secret.properties가 들어가있으나 인식을 못하는지
깃허브 데스크 탑에 남아있었음
같은 문제 발생시 깃허브 데스크 탑에서 secret.properties 우클릭 후
ignore file 클릭

* **solr에 데이터 넣는 방법**
1. solr에 코어 생성
solr create -c food_core

2. 스프링 부트 실행 후 
http://localhost:8484/api/food/save-data 
접속 후 solr가서 확인하기



