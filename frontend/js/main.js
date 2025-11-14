// API 기본 URL
const API_BASE_URL = 'http://localhost:8080/api';

// 이미지 URL 변환 함수 (CORB 문제 해결을 위해 API 엔드포인트 사용)
function getImageUrl(imagePath) {
    if (!imagePath || imagePath === 'null' || imagePath.trim() === '') {
        return null;
    }
    
    // /uploads/images/ 형식의 경로를 /api/images/ 형식으로 변환
    if (imagePath.startsWith('/uploads/images/')) {
        const filename = imagePath.replace('/uploads/images/', '');
        return `${API_BASE_URL}/images/${filename}`;
    }
    
    // 이미 /api/images/ 형식이면 그대로 사용
    if (imagePath.startsWith('/api/images/')) {
        return `http://localhost:8080${imagePath}`;
    }
    
    // 그 외의 경우는 그대로 사용
    return `http://localhost:8080${imagePath}`;
}

// 공통 유틸리티 함수
const api = {
    async get(url) {
        const response = await fetch(`${API_BASE_URL}${url}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },

    async post(url, data) {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },
};

// 로컬 스토리지 관리
const storage = {
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    get(key) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },
    remove(key) {
        localStorage.removeItem(key);
    },
};

