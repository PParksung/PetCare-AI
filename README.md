# AI-PetCare

AI 기반 반려동물 건강 설문 분석 및 동물병원 추천·예약 웹 서비스

## 📖 프로젝트 소개

**AI-PetCare**는 반려동물의 건강 상태를 AI로 분석하고 적절한 동물병원을 추천하는 통합 플랫폼입니다. 

보호자가 반려동물의 증상을 자연어로 입력하면, Google Gemini API를 활용한 AI가 증상을 분석하여 가능한 질환을 진단하고 긴급도를 평가합니다. 이를 바탕으로 사용자 위치 기반으로 최적의 동물병원을 추천하며, 병원 예약까지 원스톱으로 제공합니다.

### 주요 기능

- 🐾 **반려동물 정보 관리**: 반려동물 등록 및 이미지 업로드
- 🤖 **AI 증상 분석**: 자연어 증상 입력 → 질환 후보 제시 및 긴급도 평가
- 🏥 **병원 추천**: 위치 기반 동물병원 추천 및 상세 정보 제공
- 🗺️ **지도 표시**: OpenStreetMap을 활용한 병원 위치 표시
- 📅 **예약 관리**: 병원 예약 생성, 조회, 취소

## 🛠️ 기술 스택

### 백엔드
- Spring Boot 3.2.0, Java 17, Maven
- Google Gemini API (Gemini 2.5 Flash)
- JSON 파일 기반 데이터 저장

### 프론트엔드
- HTML5, CSS3, JavaScript (Vanilla JS)
- OpenStreetMap + Leaflet.js (지도 표시)

## 🚀 시작하기

### 필수 요구사항

- **Java 17 이상**
- **Maven 3.6 이상**
- **Python 3** (Frontend 서버 실행용)
- **Google Gemini API 키** (무료)

### 1. Google Gemini API 키 발급

1. [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
2. Google 계정으로 로그인
3. **"Create API Key"** 버튼 클릭
4. 생성된 API 키 복사 (다시 볼 수 없으므로 즉시 저장)

**무료 티어 제공:**
- 일일 1,500 요청 무료
- 결제 정보 등록 불필요

### 2. API 키 설정

#### 방법 1: .env 파일 사용 (권장) ⭐

1. 프로젝트 루트에서 `.env` 파일 생성:
   ```bash
   cp .env.example .env
   ```

2. `.env` 파일을 열어서 API 키 입력:
   ```bash
   GEMINI_API_KEY=발급받은-API-키-여기에-입력
   ```
   - 실제 API 키로 교체 (예: `GEMINI_API_KEY=AIzaSy...`)
   - 등호(`=`) 앞뒤에 공백 없이 입력

#### 방법 2: IntelliJ 환경 변수 설정

1. `Run` → `Edit Configurations...`
2. Spring Boot 애플리케이션 선택 (`PetCareApplication`)
3. **Environment variables** 필드에 입력:
   ```
   GEMINI_API_KEY=발급받은-API-키
   ```
4. `Apply` → `OK`

### 3. 실행

#### 방법 1: 스크립트 실행 (권장) ⭐

```bash
./start-all.sh
```

**실행 결과:**
- Backend: `http://localhost:8080`
- Frontend: `http://localhost:3000`

**종료:**
- `Ctrl + C` 후 표시된 PID로 프로세스 종료

#### 방법 2: IntelliJ에서 실행

1. **Backend 실행**
   - `PetCareApplication.java` 파일 열기
   - 상단 실행 버튼(▶️) 클릭

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

## 📁 프로젝트 구조

```
프로젝트 루트/
├── backend/                    # Spring Boot 백엔드
│   ├── src/main/java/com/petcare/
│   ├── data/                  # JSON 데이터 저장
│   └── uploads/images/        # 업로드된 이미지
├── frontend/                  # 프론트엔드
│   ├── *.html                 # 각 페이지
│   ├── css/
│   └── js/
├── start-all.sh               # 실행 스크립트
└── README.md
```

## 🔧 문제 해결

### API 키가 적용되지 않는 경우

1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. `.env` 파일의 API 키 형식 확인 (공백 없이)
3. Backend 재시작 후 콘솔에서 "✅ Gemini API 키가 설정되었습니다." 메시지 확인

### Backend가 시작되지 않는 경우

- Java 17 이상 설치 확인: `java -version`
- Maven 설치 확인: `mvn -version`
- 포트 8080이 사용 중인지 확인: `lsof -i :8080`

### Frontend가 시작되지 않는 경우

- Python 3 설치 확인: `python3 --version`
- 포트 3000이 사용 중인지 확인

## 📝 데이터 저장

모든 데이터는 JSON 파일로 저장됩니다:
- `backend/data/pets.json` - 반려동물 정보
- `backend/data/hospitals.json` - 병원 정보 (100개 이상의 샘플 데이터 포함)
- `backend/data/reservations.json` - 예약 정보
- `backend/uploads/images/` - 업로드된 이미지 파일
