#!/bin/bash

# 백엔드 실행 스크립트
# 환경 변수를 설정하고 Spring Boot 애플리케이션을 실행합니다
# 
# ⚠️ 이 스크립트는 환경 변수가 이미 설정되어 있다고 가정합니다.
# 환경 변수를 설정하려면:
#   export GEMINI_API_KEY=발급받은-키
#   export KAKAO_MAP_API_KEY=발급받은-키
#
# 또는 이 스크립트를 실행하기 전에 환경 변수를 설정하세요.

# 환경 변수 확인
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️ 경고: GEMINI_API_KEY 환경 변수가 설정되지 않았습니다."
    echo "   export GEMINI_API_KEY=발급받은-키 를 실행하세요."
fi

if [ -z "$KAKAO_MAP_API_KEY" ]; then
    echo "⚠️ 경고: KAKAO_MAP_API_KEY 환경 변수가 설정되지 않았습니다."
    echo "   export KAKAO_MAP_API_KEY=발급받은-키 를 실행하세요."
fi

# Spring Boot 실행
mvn spring-boot:run

