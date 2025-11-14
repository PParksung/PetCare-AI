# AI-PetCare

AI 기반 반려동물 건강 설문 분석 및 동물병원 추천·예약 웹 서비스

## 프로젝트 개요

반려동물 보호자가 설문과 자연어로 증상을 입력하면, AI가 증상을 분석하고 정리하며, 이를 바탕으로 병원 추천과 예약 안내까지 제공하는 웹 서비스입니다.

## 기술 스택

### 백엔드
- Spring Boot 3.2.0
- Java 17
- Maven
- JSON 파일 기반 데이터 저장 (DB 없음)
- OpenAI API (GPT-4o-mini) 연동

### 프론트엔드
- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Fetch API

## 프로젝트 구조

```
프로젝트 루트/
├── backend/                    # Spring Boot 백엔드
│   ├── src/
│   │   └── main/
│   │       ├── java/com/petcare/
│   │       │   ├── PetCareApplication.java
│   │       │   ├── config/     # CORS, Web 설정
│   │       │   ├── controller/ # REST API 컨트롤러
│   │       │   ├── model/      # 데이터 모델
│   │       │   ├── service/    # 비즈니스 로직, AI 서비스
│   │       │   └── util/       # 유틸리티 클래스
│   │       └── resources/
│   │           └── application.properties
│   ├── data/                    # JSON 데이터 저장 폴더
│   ├── uploads/images/          # 업로드된 이미지 저장 폴더
│   └── pom.xml
├── frontend/                    # 프론트엔드
│   ├── index.html              # 메인 페이지 (반려동물 리스트)
│   ├── pet-register.html       # 반려동물 등록 (이미지 업로드 포함)
│   ├── symptom-input.html      # 증상 입력
│   ├── analysis-result.html    # 분석 결과 (증상 상세 + 병원 추천)
│   ├── hospital-list.html      # 병원 목록
│   ├── hospital-detail.html    # 병원 상세
│   ├── reservation.html        # 예약
│   ├── css/
│   │   └── style.css           # Wayopet 스타일 참고 디자인
│   └── js/
│       ├── main.js
│       ├── index.js            # 메인 페이지 로직
│       ├── pet-register.js     # 이미지 업로드 포함
│       ├── symptom-input.js
│       ├── analysis-result.js  # 증상 상세 설명 강조
│       ├── hospital-list.js
│       ├── hospital-detail.js
│       └── reservation.js
└── README.md
```

## 실행 방법

### 1. Google Gemini API 키 발급 및 설정

#### ✅ Gemini API는 무료입니다!

**무료 티어 제공:**
- **일일 1,500 요청 무료** (매우 넉넉함!)
- **월 15 RPM** (분당 15 요청)
- **결제 정보 등록 불필요!** (OpenAI와 달리 신용카드 등록 안 해도 됨)
- 💡 **장점**: 개발/테스트에 충분한 무료 사용량 제공

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
   - ⚠️ **중요**: 생성된 키를 즉시 복사하세요! (다시 볼 수 없습니다)
   - 키는 `AIza...`로 시작하는 긴 문자열입니다

3. **API 키 확인**
   - 생성된 키가 화면에 표시됩니다
   - 복사 버튼을 클릭하여 키를 복사하세요
   - 안전한 곳에 저장하세요 (나중에 다시 볼 수 없음)

#### API 키 설정 방법

**방법 1: IntelliJ 환경 변수 설정**

⚠️ **주의**: IntelliJ의 환경 변수 설정이 제대로 작동하지 않을 수 있습니다. 아래 방법을 시도해보세요.

1. **IntelliJ에서 설정 (방법 A: 테이블 형식)**
   - 상단 메뉴: `Run` → `Edit Configurations...`
   - 왼쪽에서 Spring Boot 애플리케이션 선택 (또는 `PetCareApplication` 선택)
   - 오른쪽 패널에서 `Environment variables` 섹션 찾기
   - `+` 버튼 클릭하여 테이블에 추가:
     - **Name**: `GEMINI_API_KEY` (정확히 이 이름, 대소문자 구분)
     - **Value**: `AIzaSyACTHrxQnjLd5EOqimW3XdrD1CRcmjDpkM` (전체 키)
   - `Apply` → `OK` 클릭
   - ⚠️ **중요**: 백엔드 완전히 중지 후 재시작

2. **IntelliJ에서 설정 (방법 B: 한 줄 입력)**
   - `Environment variables` 필드에 직접 입력:
   - `GEMINI_API_KEY=AIzaSyACTHrxQnjLd5EOqimW3XdrD1CRcmjDpkM`
   - ⚠️ 등호(`=`) 앞뒤에 **공백 없이** 입력
   - ⚠️ 키가 잘리지 않도록 전체를 입력
   - `Apply` → `OK` 클릭
   - ⚠️ **중요**: 백엔드 완전히 중지 후 재시작

3. **확인 방법**
   - 백엔드 재시작 후 콘솔 확인:
   - `환경 변수 GEMINI_API_KEY: AIzaSyACTHrxQnjLd5E...` → 정상
   - `환경 변수 GEMINI_API_KEY: null` → 환경 변수 미적용

💡 **팁**: IntelliJ 환경 변수가 작동하지 않으면, 아래 "방법 2"를 사용하세요.

**방법 2: application.properties에 기본값 설정 (임시 해결책)**

IntelliJ 환경 변수가 작동하지 않을 때 사용:

`backend/src/main/resources/application.properties` 파일을 열고:
```properties
ai.gemini.api.key=${GEMINI_API_KEY:AIzaSyACTHrxQnjLd5EOqimW3XdrD1CRcmjDpkM}
```

이렇게 하면:
- 환경 변수 `GEMINI_API_KEY`가 있으면 환경 변수 사용
- 환경 변수가 없으면 기본값(위의 키) 사용
- ⚠️ **주의**: Git에 커밋될 위험이 있으므로, `.gitignore`에 `application.properties`가 포함되어 있는지 확인하세요!

**방법 3: 터미널에서 설정 (Maven으로 실행하는 경우)**
```bash
export GEMINI_API_KEY=AIzaSyACTHrxQnjLd5EOqimW3XdrD1CRcmjDpkM
cd backend
mvn spring-boot:run
```

⚠️ **보안 주의사항**:
- API 키는 절대 Git에 커밋하지 마세요!
- `.gitignore`에 `application.properties`가 포함되어 있는지 확인하세요
- **환경 변수 사용을 강력히 권장합니다** (보안상 가장 안전)

#### 요금 정보

**무료 티어 (기본 제공):**
- ✅ **일일 1,500 요청 무료** (매우 넉넉함!)
- ✅ **월 15 RPM** (분당 15 요청)
- ✅ **결제 정보 등록 불필요!** (신용카드 등록 안 해도 됨)
- ✅ **Gemini 1.5 Flash 모델 사용 가능**

**유료 요금** (무료 한도 초과 시 - 거의 발생하지 않음):
- Gemini 1.5 Flash: 매우 저렴
  - 입력: $0.075 / 1M 토큰
  - 출력: $0.30 / 1M 토큰
- 예상 사용량: 증상 분석 1회당 약 1,000-2,000 토큰
- **일일 1,500 요청이면 약 1,500-3,000회 분석 가능** (무료!)

💡 **팁**: 
- Gemini는 OpenAI보다 **빠르고 무료 티어가 넉넉**합니다!
- 개발/테스트에는 무료 티어로 충분합니다!
- 결제 정보 등록 없이 바로 사용 가능합니다!

### 2. 백엔드 실행

1. Java 17 이상이 설치되어 있어야 합니다.
2. Maven이 설치되어 있어야 합니다.
3. 백엔드 디렉토리로 이동:
   ```bash
   cd backend
   ```
4. Maven으로 프로젝트 빌드 및 실행:
   ```bash
   mvn spring-boot:run
   ```
   또는
   ```bash
   mvn clean install
   java -jar target/petcare-ai-1.0.0.jar
   ```
5. 백엔드 서버가 `http://localhost:8080`에서 실행됩니다.

### 3. 프론트엔드 실행

1. 프론트엔드 디렉토리로 이동:
   ```bash
   cd frontend
   ```
2. 로컬 웹 서버 실행 (예: Python):
   ```bash
   # Python 3
   python -m http.server 3000
   
   # 또는 Node.js http-server
   npx http-server -p 3000
   ```
3. 브라우저에서 `http://localhost:3000` 접속

**참고**: 프론트엔드를 직접 파일로 열면 CORS 오류가 발생할 수 있습니다. 반드시 웹 서버를 통해 실행하세요.

## API 엔드포인트

### 반려동물 관리
- `POST /api/pets` - 반려동물 등록
- `GET /api/pets` - 모든 반려동물 조회
- `GET /api/pets/{id}` - 특정 반려동물 조회

### 이미지 업로드
- `POST /api/images/upload` - 이미지 업로드
- `GET /api/images/{filename}` - 이미지 조회

### 증상 분석
- `POST /api/symptoms/analyze` - 증상 분석 요청 (AI1, AI2 호출)

### 병원 관리
- `GET /api/hospitals` - 모든 병원 조회
- `GET /api/hospitals?city={city}` - 도시별 병원 조회
- `GET /api/hospitals?department={dept}` - 진료과별 병원 조회
- `GET /api/hospitals/{id}` - 특정 병원 조회

### 예약 관리
- `POST /api/reservations` - 예약 생성
- `GET /api/reservations/{id}` - 특정 예약 조회
- `GET /api/reservations/pet/{petId}` - 반려동물별 예약 조회

## AI 기능

### AI1: 증상 분석 및 구조화
- 입력: 증상 요청 정보 + 반려동물 정보
- 출력: 질환 후보, 긴급도, 추천 진료과
- 구현 위치: `AIService.analyzeSymptoms()`

### AI2: 맞춤형 설명 및 병원 추천
- 입력: AI1 분석 결과 + 사용자 위치 + 병원 목록
- 출력: 보호자 안내 메시지 + 추천 병원 목록
- 구현 위치: `AIService.recommendHospitals()`

## 데이터 저장

모든 데이터는 파일로 저장됩니다:
- `backend/data/pets.json` - 반려동물 정보
- `backend/data/hospitals.json` - 병원 정보 (초기 샘플 데이터 포함)
- `backend/data/reservations.json` - 예약 정보
- `backend/uploads/images/` - 업로드된 이미지 파일

## 주요 기능

1. **반려동물 등록**: 보호자 및 반려동물 정보 입력 + 이미지 업로드
2. **메인 페이지**: 등록된 반려동물 리스트 표시 (이미지 포함)
3. **증상 입력**: 자연어로 증상 설명 및 응급 상황 체크
4. **AI 분석**: 증상 분석 및 가능한 질환 후보 제시
5. **증상 상세 설명**: 입력한 증상을 상세히 표시
6. **병원 추천**: 위치 및 진료과 기반 병원 추천 (분석 결과 페이지에 바로 표시)
7. **병원 상세**: 병원 정보 및 지도 표시
8. **예약 관리**: 병원 예약 생성 및 조회

## 디자인

프론트엔드 디자인은 [Wayopet](https://wayopet.com/)을 참고하여 제작되었습니다:
- 깔끔하고 모던한 UI
- 카드 기반 레이아웃
- 부드러운 색상과 여백
- 반응형 디자인

## 개발 참고사항

- CORS는 모든 origin을 허용하도록 설정되어 있습니다 (개발 환경)
- OpenAI API 키가 설정되지 않으면 Mock 데이터를 반환합니다
- 카카오맵 API를 사용하려면 `hospital-detail.html`의 API 키를 설정해야 합니다
- 백엔드 서버가 실행 중이어야 프론트엔드가 정상 작동합니다

## 팀 구성

- **박성민**: 팀장 및 풀스택 개발 담당
- **이상민**: 프론트엔드 담당
- **최윤지**: 보고서 및 PPT 담당
- **한승우**: AI 개발 담당

## 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.
