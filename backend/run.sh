#!/bin/bash

# 백엔드 실행 스크립트
# 환경 변수를 설정하고 Spring Boot 애플리케이션을 실행합니다

# 환경 변수 설정 (여기에 API 키를 직접 입력하세요)
export GEMINI_API_KEY=AIzaSyC6VgP7CQM25ULOum2z6zAAcGwmTJh5r6Y

# 환경 변수 확인
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️ 경고: GEMINI_API_KEY 환경 변수가 설정되지 않았습니다."
    echo "   스크립트 상단의 export GEMINI_API_KEY=... 부분을 수정하세요."
    exit 1
fi

echo "✅ GEMINI_API_KEY가 설정되었습니다."

# Spring Boot 실행
mvn spring-boot:run

