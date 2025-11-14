// 페이지 로드 시 반려동물 목록 로드
// API_BASE_URL은 main.js에서 선언됨
document.addEventListener('DOMContentLoaded', async () => {
    console.log('페이지 로드 완료, 반려동물 목록 로드 시작');
    
    // URL 파라미터 확인 (등록 후 새로고침)
    const urlParams = new URLSearchParams(window.location.search);
    const isRefresh = urlParams.get('refresh') === 'true';
    
    if (isRefresh) {
        // URL에서 파라미터 제거
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // 반려동물 목록 로드
    await loadPets();
    
    // 등록 후 새로고침이면 반려동물 섹션으로 스크롤
    if (isRefresh) {
        setTimeout(() => {
            scrollToPets();
        }, 500);
    }
});

async function loadPets() {
    const petsListContainer = document.getElementById('petsList');
    
    try {
        console.log('반려동물 목록 로드 시작...');
        const response = await fetch(`${API_BASE_URL}/pets`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('API 응답 상태:', response.status);
        
        if (response.ok) {
            const pets = await response.json();
            console.log('로드된 반려동물 수:', pets.length);
            console.log('반려동물 데이터:', pets);
            displayPets(pets);
        } else {
            console.error('API 응답 오류:', response.status, response.statusText);
            showServerError();
        }
    } catch (error) {
        console.error('반려동물 목록 로드 오류:', error);
        if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
            showServerError();
        } else {
            showEmptyState();
        }
    }
}

function showServerError() {
    const container = document.getElementById('petsList');
    const viewPetsBtn = document.getElementById('viewPetsBtn');
    
    if (viewPetsBtn) {
        viewPetsBtn.style.display = 'none';
    }
    
    container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">⚠️</div>
            <h3>서버 연결 실패</h3>
            <p>백엔드 서버가 실행되지 않았습니다.</p>
            <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 1rem;">
                백엔드 서버를 실행하려면:<br>
                <code style="background: var(--background); padding: 0.5rem; border-radius: 4px; display: inline-block; margin-top: 0.5rem;">
                    cd backend && mvn spring-boot:run
                </code>
            </p>
            <button class="btn btn-secondary" onclick="location.reload()" style="margin-top: 1rem;">
                다시 시도
            </button>
        </div>
    `;
}

function displayPets(pets) {
    const container = document.getElementById('petsList');
    const viewPetsBtn = document.getElementById('viewPetsBtn');
    
    if (!container) {
        console.error('petsList 컨테이너를 찾을 수 없습니다.');
        return;
    }
    
    if (!pets || pets.length === 0) {
        console.log('등록된 반려동물이 없습니다.');
        showEmptyState();
        if (viewPetsBtn) {
            viewPetsBtn.style.display = 'none';
        }
        return;
    }
    
    console.log('반려동물 표시 시작:', pets.length, '개');
    
    // 반려동물이 있으면 "등록된 반려동물 보기" 버튼 표시
    if (viewPetsBtn) {
        viewPetsBtn.style.display = 'inline-flex';
    }
    
    let html = '';
    pets.forEach(pet => {
        const petTypeEmoji = getPetTypeEmoji(pet.type);
        const imageUrl = getImageUrl(pet.imagePath);
        
        console.log(`반려동물 ${pet.name}:`, {
            imagePath: pet.imagePath,
            imageUrl: imageUrl,
            hasImage: !!pet.imagePath
        });
        
        html += '<div class="pet-card" onclick="viewPetDetail(\'' + pet.id + '\')">';
        html += '<div class="pet-card-image">';
        if (imageUrl) {
            // imagePath가 있으면 이미지 표시 (API 엔드포인트 사용)
            html += `<img src="${imageUrl}" alt="${pet.name}" class="pet-card-img" onerror="handleImageError(this, '${petTypeEmoji}')" onload="console.log('이미지 로드 성공:', '${imageUrl}')">`;
        } else {
            // imagePath가 없으면 이모지 표시
            html += `<div style="font-size: 4rem; display: flex; align-items: center; justify-content: center; height: 100%;">${petTypeEmoji}</div>`;
        }
        html += '</div>';
        html += '<div class="pet-card-content">';
        html += `<div class="pet-card-name">${petTypeEmoji} ${pet.name}</div>`;
        html += '<div class="pet-card-info">';
        html += `<span>${getPetTypeName(pet.type)}</span>`;
        html += `<span>나이: ${pet.ageYears}세</span>`;
        html += `<span>몸무게: ${pet.weightKg}kg</span>`;
        html += `<span>위치: ${pet.locationCity}</span>`;
        html += '</div>';
        html += '</div>';
        html += '</div>';
    });
    
    container.innerHTML = html;
}

function showEmptyState() {
    const container = document.getElementById('petsList');
    container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">🐾</div>
            <h3>등록된 반려동물이 없습니다</h3>
            <p>반려동물을 등록하고 건강 관리를 시작해보세요</p>
            <button class="btn btn-primary" onclick="location.href='pet-register.html'">
                반려동물 등록하기
            </button>
        </div>
    `;
}

function getPetTypeEmoji(type) {
    switch(type) {
        case 'dog': return '🐕';
        case 'cat': return '🐱';
        default: return '🐾';
    }
}

function getPetTypeName(type) {
    switch(type) {
        case 'dog': return '강아지';
        case 'cat': return '고양이';
        default: return '기타';
    }
}

function viewPetDetail(petId) {
    localStorage.setItem('selectedPetId', petId);
    location.href = 'pet-detail.html';
}

function scrollToPets() {
    const petsSection = document.getElementById('petsSection');
    if (petsSection) {
        petsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function handleImageError(img, emoji) {
    img.onerror = null;
    img.parentElement.innerHTML = `<div style="font-size: 4rem; display: flex; align-items: center; justify-content: center; height: 100%;">${emoji}</div>`;
}
