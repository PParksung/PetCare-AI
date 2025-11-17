#!/bin/bash

# 백엔드 실행 스크립트
# 환경 변수를 설정하고 Spring Boot 애플리케이션을 실행합니다

# 환경 변수 로드 (우선순위: 1. 이미 설정된 환경변수, 2. .env 파일)
if [ -z "$GEMINI_API_KEY" ]; then
    # 프로젝트 루트의 .env 파일에서 로드 시도
    if [ -f ../.env ]; then
        export $(grep -v '^#' ../.env | grep GEMINI_API_KEY | xargs)
        echo "📝 .env 파일에서 API 키를 로드했습니다."
    fi
fi

# 환경 변수 확인
if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "발급받은-API-키-여기에-입력" ]; then
    echo "⚠️ 경고: GEMINI_API_KEY 환경 변수가 설정되지 않았습니다."
    echo "   다음 중 하나의 방법으로 설정하세요:"
    echo "   1. .env 파일 생성: cp .env.example .env (그리고 .env 파일 수정)"
    echo "   2. 환경변수로 설정: export GEMINI_API_KEY=your-key"
    echo "   3. IntelliJ Run Configuration에서 환경변수 설정 후 IntelliJ 실행 버튼 사용"
    exit 1
fi

echo "✅ GEMINI_API_KEY가 설정되었습니다."

# Spring Boot 실행
mvn spring-boot:run

