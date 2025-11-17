#!/bin/bash

# Backend와 Frontend를 동시에 실행하는 스크립트

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Backend와 Frontend를 시작합니다...${NC}"

# 환경 변수 로드 (우선순위: 1. 이미 설정된 환경변수, 2. .env 파일, 3. 없으면 경고)
if [ -z "$GEMINI_API_KEY" ]; then
    # .env 파일에서 로드 시도
    if [ -f .env ]; then
        # .env 파일에서 GEMINI_API_KEY 추출 (주석 제외)
        export $(grep -v '^#' .env | grep GEMINI_API_KEY | xargs)
        echo -e "${BLUE}📝 .env 파일에서 API 키를 로드했습니다.${NC}"
    fi
fi

# API 키 확인
if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "발급받은-API-키-여기에-입력" ]; then
    echo -e "${YELLOW}⚠️  경고: GEMINI_API_KEY가 설정되지 않았습니다!${NC}"
    echo -e "${YELLOW}   다음 중 하나의 방법으로 설정하세요:${NC}"
    echo -e "${YELLOW}   1. .env 파일 생성: cp .env.example .env (그리고 .env 파일 수정)${NC}"
    echo -e "${YELLOW}   2. 환경변수로 설정: export GEMINI_API_KEY=your-key${NC}"
    echo -e "${YELLOW}   3. IntelliJ Run Configuration에서 환경변수 설정 후 IntelliJ 실행 버튼 사용${NC}"
    echo ""
fi

# Backend 실행 (백그라운드)
echo -e "${BLUE}📦 Backend 시작 중...${NC}"
cd backend
mvn spring-boot:run > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Frontend 실행 (백그라운드)
echo -e "${BLUE}🌐 Frontend 시작 중...${NC}"
cd frontend
python3 -m http.server 3000 > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}✅ Backend와 Frontend가 시작되었습니다!${NC}"
echo -e "${YELLOW}Backend PID: $BACKEND_PID${NC}"
echo -e "${YELLOW}Frontend PID: $FRONTEND_PID${NC}"
echo ""

# Backend가 시작될 때까지 대기 (최대 30초)
echo -e "${BLUE}⏳ Backend 초기화 대기 중...${NC}"
for i in {1..30}; do
    if grep -q "Started PetCareApplication" backend.log 2>/dev/null; then
        echo -e "${GREEN}✅ Backend가 시작되었습니다!${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠️  Backend 시작 확인 시간 초과 (30초)${NC}"
    fi
done

# API 키 연동 확인
echo ""
echo -e "${BLUE}🔍 API 키 연동 확인 중...${NC}"
sleep 2

if grep -q "✅ Gemini API 키가 설정되었습니다" backend.log 2>/dev/null; then
    API_KEY_INFO=$(grep "✅ Gemini API 키가 설정되었습니다" backend.log | tail -1)
    echo -e "${GREEN}✅ API 키 연동 성공!${NC}"
    echo -e "${GREEN}   $API_KEY_INFO${NC}"
elif grep -q "⚠️ 경고: Gemini API 키가 설정되지 않았습니다" backend.log 2>/dev/null; then
    echo -e "${YELLOW}⚠️  API 키가 설정되지 않았습니다!${NC}"
    echo -e "${YELLOW}   backend.log를 확인하세요.${NC}"
else
    echo -e "${YELLOW}⚠️  API 키 상태를 확인할 수 없습니다.${NC}"
    echo -e "${YELLOW}   backend.log를 확인하세요.${NC}"
fi

echo ""
echo -e "${GREEN}📝 로그 확인:${NC}"
echo -e "  Backend: tail -f backend.log"
echo -e "  Frontend: tail -f frontend.log"
echo ""
echo -e "${GREEN}🌐 접속 주소:${NC}"
echo -e "  Frontend: http://localhost:3000"
echo -e "  Backend: http://localhost:8080"
echo ""
echo -e "${YELLOW}⚠️  종료하려면 Ctrl+C를 누르고 다음 명령어를 실행하세요:${NC}"
echo -e "  kill $BACKEND_PID $FRONTEND_PID"

# 종료 시그널 처리
trap "echo -e '\n${YELLOW}종료 중...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# 프로세스가 종료될 때까지 대기
wait

