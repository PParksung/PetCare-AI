# AI-PetCare

AI 기반 반려동물 건강 설문 분석 및 동물병원 추천·예약 웹 서비스

## 만들고자 하는 프로젝트

**AI-PetCare**는 반려동물의 건강 상태를 AI로 분석하고 적절한 동물병원을 추천하는 통합 플랫폼입니다. 보호자가 반려동물의 증상을 자연어로 입력하면, AI가 증상을 분석하여 가능한 질환을 진단하고 긴급도를 평가합니다. 이를 바탕으로 사용자 위치 기반으로 최적의 동물병원을 추천하며, 병원 예약까지 원스톱으로 제공합니다.

**주요 기능:**
- 반려동물 정보 관리 및 이미지 업로드
- 자연어 기반 증상 입력 및 AI 분석
- 질환 후보 제시 및 긴급도 평가
- 위치 기반 동물병원 추천
- 병원 상세 정보 및 지도 표시
- 온라인 예약 및 예약 관리

## 활용 예정 주요 AI 도구

### Google Gemini API
**Google Gemini API (Gemini 2.5 Flash)**
- **증상 분석 및 질환 진단**: 사용자가 입력한 자연어 증상을 분석하여 가능한 질환 후보를 제시
- **긴급도 평가**: 증상의 심각도를 평가하여 응급 여부 판단
- **맞춤형 설명 생성**: 보호자에게 이해하기 쉬운 형태로 분석 결과 설명
- **병원 추천 로직**: 분석 결과와 사용자 위치를 종합하여 최적의 병원 추천

**AI 활용 방식:**
- **AI1 (증상 분석)**: 증상 입력 → 질환 후보, 긴급도, 추천 진료과 분석
- **AI2 (병원 추천)**: 분석 결과 + 위치 정보 → 맞춤형 병원 추천 및 안내 메시지 생성

### Cursor
**AI 기반 코드 에디터**
- 코드 작성 및 리팩토링 지원
- 버그 수정 및 디버깅 도움
- 코드 리뷰 및 최적화 제안

### ChatGPT
**AI 어시스턴트**
- 프로젝트 설계 및 기획 지원
- 기술 스택 선택 및 아키텍처 설계
- 문서 작성 및 설명 보완

## 📋 목차

- [만들고자 하는 프로젝트](#만들고자-하는-프로젝트)
- [활용 예정 주요 AI 도구](#활용-예정-주요-ai-도구)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
  - [필수 요구사항](#필수-요구사항)
  - [Google Gemini API 키 발급](#google-gemini-api-키-발급)
  - [API 키 설정 방법](#api-키-설정-방법)
  - [실행 방법](#실행-방법)
- [주요 기능](#주요-기능)
- [API 엔드포인트](#api-엔드포인트)
- [데이터 저장](#데이터-저장)
- [개발 참고사항](#개발-참고사항)

## 기술 스택

### 백엔드
- **Spring Boot 3.2.0**
- **Java 17**
- **Maven**
- **JSON 파일 기반 데이터 저장** (DB 없음)
- **Google Gemini API** (Gemini 2.5 Flash) 연동
- **OpenStreetMap + Leaflet.js** (무료 지도 서비스)

### 프론트엔드
- **HTML5, CSS3**
- **JavaScript (Vanilla JS)**
- **Fetch API**
- **OpenStreetMap + Leaflet.js** (지도 표시)

## 프로젝트 구조

```
프로젝트 루트/
├── backend/                    # Spring Boot 백엔드
│   ├── src/main/java/com/petcare/
│   │   ├── PetCareApplication.java
│   │   ├── config/             # CORS, Web 설정
│   │   ├── controller/         # REST API 컨트롤러
│   │   ├── model/              # 데이터 모델
│   │   ├── service/            # 비즈니스 로직, AI 서비스
│   │   └── util/               # 유틸리티 클래스
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── data/                   # JSON 데이터 저장 폴더
│   ├── uploads/images/         # 업로드된 이미지 저장 폴더
│   └── pom.xml
├── frontend/                   # 프론트엔드
│   ├── index.html              # 메인 페이지
│   ├── pet-register.html       # 반려동물 등록
│   ├── symptom-input.html      # 증상 입력
│   ├── analysis-result.html    # 분석 결과
│   ├── hospital-detail.html    # 병원 상세
│   ├── my-reservations.html    # 내 예약 관리
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── *.js
├── start-all.sh                # Backend + Frontend 동시 실행 스크립트
└── README.md
```

## 시작하기

### 필수 요구사항

- **Java 17 이상**
- **Maven 3.6 이상**
- **Python 3** (Frontend 서버 실행용, 또는 Node.js)
- **Google Gemini API 키** (무료)

### Google Gemini API 키 발급

#### ✅ Gemini API는 완전 무료입니다!

**무료 티어 제공:**
- ✅ **일일 1,500 요청 무료** (매우 넉넉함!)
- ✅ **월 15 RPM** (분당 15 요청)
- ✅ **결제 정보 등록 불필요!** (신용카드 등록 안 해도 됨)
- ✅ **Gemini 2.5 Flash 모델 사용 가능**

#### API 키 발급 방법 (단계별)

1. **Google AI Studio 접속**
   ```
   https://aistudio.google.com/app/apikey
   ```
   - Google 계정으로 로그인 (Gmail 계정 사용 가능)

2. **API 키 생성**
   - 페이지 중앙의 **"Create API Key"** 버튼 클릭
   - 팝업에서:
     - **"Create API key in new project"** 선택 (권장)
     - 또는 기존 Google Cloud 프로젝트 선택
   - **"Create API key"** 클릭

3. **API 키 복사 및 저장**
   - ⚠️ **중요**: 생성된 키를 즉시 복사하세요! (다시 볼 수 없습니다)
   - 키는 `AIza...`로 시작하는 긴 문자열입니다
   - 안전한 곳에 저장하세요

**예시 키 형식:**
```
AIzaSy... (39자 정도의 긴 문자열)
```

### API 키 설정 방법

#### 방법 1: IntelliJ 환경 변수 설정 (권장)

IntelliJ에서 실행할 때 사용하는 방법입니다.

1. **IntelliJ Run Configuration 설정**
   - `Run` → `Edit Configurations...`
   - Spring Boot 애플리케이션 선택 (`PetCareApplication`)
   - **Environment variables** 필드에 입력:
     ```
     GEMINI_API_KEY=발급받은-API-키-여기에-입력
     ```
     - ⚠️ 등호(`=`) 앞뒤에 **공백 없이** 입력
     - 전체 키를 정확히 입력
   - `Apply` → `OK` 클릭

2. **확인 방법**
   - IntelliJ에서 `PetCareApplication` 실행
   - 콘솔에서 다음 메시지 확인:
     ```
     ✅ Gemini API 키가 설정되었습니다.
     ```

#### 방법 2: 실행 스크립트 사용 (터미널 실행 시)

터미널에서 `mvn spring-boot:run` 또는 `./start-all.sh`로 실행할 때 사용합니다.

**`start-all.sh` 스크립트 수정:**
```bash
# start-all.sh 파일 열기
# 7번째 줄의 API 키를 발급받은 키로 수정:
export GEMINI_API_KEY=발급받은-API-키-여기에-입력
```

**또는 `backend/run.sh` 스크립트 수정:**
```bash
# backend/run.sh 파일 열기
# 7번째 줄의 API 키를 발급받은 키로 수정:
export GEMINI_API_KEY=발급받은-API-키-여기에-입력
```

#### 방법 3: 터미널에서 직접 설정

```bash
# 환경 변수 설정
export GEMINI_API_KEY=발급받은-API-키

# Backend 실행
cd backend
mvn spring-boot:run
```

### 실행 방법

#### 방법 1: 한 번에 실행 (권장) ⭐

프로젝트 루트에서 실행 스크립트 사용:

```bash
./start-all.sh
```

**실행 결과:**
- ✅ Backend가 `http://localhost:8080`에서 실행
- ✅ Frontend가 `http://localhost:3000`에서 실행
- ✅ API 키 연동 상태 확인 메시지 표시

**종료 방법:**
- `Ctrl + C` 후 다음 명령어 실행:
  ```bash
  kill [Backend PID] [Frontend PID]
  ```
  (PID는 스크립트 실행 시 표시됨)

#### 방법 2: IntelliJ에서 실행

1. **Backend 실행**
   - `PetCareApplication.java` 파일 열기
   - 상단 실행 버튼(▶️) 클릭
   - 또는 `Run` → `Run 'PetCareApplication'`
   - Environment variables 설정이 자동 적용됨

2. **Frontend 실행** (별도 터미널)
   ```bash
   cd frontend
   python3 -m http.server 3000
   ```

#### 방법 3: 수동 실행

**Backend:**
```bash
cd backend
export GEMINI_API_KEY=발급받은-API-키
mvn spring-boot:run
```

**Frontend** (새 터미널):
```bash
cd frontend
python3 -m http.server 3000
```

### 접속 주소

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api

## 주요 기능

1. **반려동물 등록**
   - 보호자 및 반려동물 정보 입력
   - 반려동물 이미지 업로드

2. **증상 입력**
   - 체크박스로 증상 선택
   - 자연어로 증상 상세 설명
   - 응급 상황 체크

3. **AI 증상 분석**
   - Google Gemini API를 사용한 증상 분석
   - 가능한 질환 후보 제시
   - 긴급도 평가
   - 추천 진료과 안내

4. **병원 추천**
   - 사용자 위치 기반 병원 필터링
   - 분석 결과에 맞는 병원 추천
   - 병원 상세 정보 및 지도 표시 (OpenStreetMap)

5. **예약 관리**
   - 병원 예약 생성
   - 내 예약 목록 조회
   - 예약 상세 정보 확인
   - 예약 취소

## API 엔드포인트

### 반려동물 관리
- `POST /api/pets` - 반려동물 등록
- `GET /api/pets` - 모든 반려동물 조회
- `GET /api/pets/{id}` - 특정 반려동물 조회

### 이미지 업로드
- `POST /api/images/upload` - 이미지 업로드
- `GET /api/images/{filename}` - 이미지 조회

### 증상 분석
- `POST /api/symptoms/analyze` - 증상 분석 요청

### 병원 관리
- `GET /api/hospitals` - 모든 병원 조회
- `GET /api/hospitals/{id}` - 특정 병원 조회

### 예약 관리
- `POST /api/reservations` - 예약 생성
- `GET /api/reservations/{id}` - 특정 예약 조회
- `GET /api/reservations/pet/{petId}` - 반려동물별 예약 조회
- `PUT /api/reservations/{id}/cancel` - 예약 취소

## 데이터 저장

모든 데이터는 JSON 파일로 저장됩니다:
- `backend/data/pets.json` - 반려동물 정보
- `backend/data/hospitals.json` - 병원 정보 (100개 이상의 샘플 데이터 포함)
- `backend/data/reservations.json` - 예약 정보
- `backend/uploads/images/` - 업로드된 이미지 파일

## 개발 참고사항

### 환경 변수
- `GEMINI_API_KEY`: Google Gemini API 키 (필수)
- 환경 변수는 `application.properties`에서 `${GEMINI_API_KEY:}` 형식으로 참조됩니다

### CORS 설정
- 개발 환경에서는 모든 origin을 허용하도록 설정되어 있습니다
- `application.properties`에서 CORS 설정 확인 가능

### 지도 서비스
- **OpenStreetMap + Leaflet.js** 사용 (완전 무료, API 키 불필요)
- Google Maps나 Kakao Map API 대신 사용
- 병원 상세 페이지와 분석 결과 페이지에서 지도 표시

### 로그 확인
- Backend 로그: `tail -f backend.log` (스크립트 실행 시)
- Frontend 로그: `tail -f frontend.log` (스크립트 실행 시)
- IntelliJ에서 실행 시: Run 탭에서 로그 확인

### 문제 해결

**API 키가 적용되지 않는 경우:**
1. IntelliJ에서 실행: Run Configuration의 Environment variables 확인
2. 터미널에서 실행: `start-all.sh` 또는 `backend/run.sh`의 API 키 확인
3. 백엔드 재시작 후 콘솔에서 "✅ Gemini API 키가 설정되었습니다." 메시지 확인

**Backend가 시작되지 않는 경우:**
- Java 17 이상 설치 확인: `java -version`
- Maven 설치 확인: `mvn -version`
- 포트 8080이 사용 중인지 확인

**Frontend가 시작되지 않는 경우:**
- Python 3 설치 확인: `python3 --version`
- 포트 3000이 사용 중인지 확인

## 팀 구성

- **박성민**: 팀장 및 풀스택 개발 담당
- **이상민**: 프론트엔드 담당
- **최윤지**: 보고서 및 PPT 담당
- **한승우**: AI 개발 담당
