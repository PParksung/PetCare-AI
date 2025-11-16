#!/bin/bash

# Frontend 서버 시작 스크립트
cd "$(dirname "$0")"
python3 -m http.server 3000

