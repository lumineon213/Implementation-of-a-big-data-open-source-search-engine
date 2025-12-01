🛠️ Solr 기반 검색 엔진 환경 설정 가이드
이 가이드는 Apache Solr 9.10.0, Java 11+, 그리고 Spring Boot를 연동하기 위한 필수 단계를 설명합니다.

1. ☕ Java 환경 준비 (Solr 실행 필수)
Solr는 Java로 만들어졌기 때문에, Solr를 실행하기 위해 Java 11 버전 이상이 시스템에 설치되어 있어야 합니다.

Java 설치 확인: 터미널에서 아래 명령어를 실행합니다.

Bash

java -version
확인 사항: 출력된 버전이 11.x.x 이상인지 확인합니다. (예: openjdk version "17.0.x")

미설치 시: OpenJDK (Adoptium Temurin 등)를 다운로드하여 설치합니다.

2. 🔍 Apache Solr 엔진 세팅
검색 엔진 서버를 설치하고 실행하는 단계입니다. Solr의 바이너리 릴리스를 사용합니다.

Solr 다운로드:

공식 릴리스 페이지에서 **solr-9.10.0.tgz**를 다운로드합니다.

압축 해제: 원하는 설치 경로(예: /opt/solr 또는 ~/tools)에 파일을 옮기고 압축을 해제합니다.

Bash

tar xzf solr-9.10.0.tgz
cd solr-9.10.0
Solr 서버 시작:

Solr를 기본 포트인 8983으로 시작합니다.

Bash

bin/solr start -p 8983
Tip: Solr가 성공적으로 시작되면 터미널에 상태 정보가 출력됩니다.

관리 UI 접속 확인:

웹 브라우저에서 http://localhost:8983/solr/ 에 접속하여 Solr 관리 화면이 뜨는지 확인합니다.

3. 💾 검색 코어(Core) 생성
Solr에서 데이터베이스의 테이블과 유사한 역할을 하는 **코어(Core)**를 생성하여 데이터를 저장할 공간을 만듭니다.

코어 생성 명령어:

board_collection이라는 이름으로 코어를 생성하고, Solr가 기본 제공하는 설정(basic_configs)을 사용합니다.

Bash

bin/solr create -c board_collection -d basic_configs
코어 생성 확인:

Solr 관리 UI (http://localhost:8983/solr/) 왼쪽 메뉴에서 생성한 board_collection이 보이는지 확인합니다.

4. 🔗 Spring Boot 연동 준비
Spring Boot 백엔드 애플리케이션이 Solr 서버에 연결하여 검색 및 색인 요청을 보낼 수 있도록 설정합니다.

의존성 추가:

pom.xml (Maven) 또는 build.gradle (Gradle) 파일에 Spring Data Solr 의존성을 추가합니다.

XML

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-solr</artifactId>
</dependency>
연결 정보 설정 (application.yml):

Spring Boot의 설정 파일에 Solr 서버의 주소와 사용할 코어 이름을 명시합니다.

YAML

# src/main/resources/application.yml
spring:
  data:
    solr:
      # Solr 서버가 실행 중인 주소와 포트
      host: http://localhost:8983/solr
      # 사용할 코어 이름
      core: board_collection
확인: 이제 Spring Boot 애플리케이션을 실행하면 Solr 서버에 연결되어 데이터 색인 및 검색을 위한 API 개발을 시작할 수 있습니다.
