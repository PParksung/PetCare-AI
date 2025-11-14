// API_BASE_URL은 main.js에서 선언됨
let currentPetId = null;

document.addEventListener('DOMContentLoaded', async () => {
    // URL 파라미터에서 petId 확인 (수정 후 돌아올 때)
    const urlParams = new URLSearchParams(window.location.search);
    const petIdFromUrl = urlParams.get('petId');
    const isRefresh = urlParams.get('refresh') === 'true';
    
    const petId = petIdFromUrl || localStorage.getItem('selectedPetId');
    
    if (!petId) {
        document.getElementById('petDetail').innerHTML = 
            '<div class="alert alert-error">반려동물 정보를 찾을 수 없습니다.</div>';
        return;
    }
    
    // URL 파라미터 제거
    if (petIdFromUrl || isRefresh) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    currentPetId = petId;
    await loadPetDetail(petId);
    await loadReservations(petId);
});

async function loadPetDetail(petId) {
    try {
        const response = await fetch(`${API_BASE_URL}/pets/${petId}`);
        if (response.ok) {
            const pet = await response.json();
            displayPetDetail(pet);
        } else {
            document.getElementById('petDetail').innerHTML = 
                '<div class="alert alert-error">반려동물 정보를 불러올 수 없습니다.</div>';
        }
    } catch (error) {
        console.error('Error loading pet:', error);
        document.getElementById('petDetail').innerHTML = 
            '<div class="alert alert-error">서버 연결에 실패했습니다.</div>';
    }
}

function displayPetDetail(pet) {
    const container = document.getElementById('petDetail');
    
    const petTypeEmoji = getPetTypeEmoji(pet.type);
    const petTypeName = getPetTypeName(pet.type);
    const imageUrl = getImageUrl(pet.imagePath);
    
    let html = '<div class="pet-detail-card">';
    
    // 이미지 섹션
    html += '<div class="pet-detail-image-section">';
    if (imageUrl) {
        html += `<img src="${imageUrl}" alt="${pet.name}" class="pet-detail-image" onerror="this.parentElement.innerHTML='<div class=\\'pet-detail-image-placeholder\\'>${petTypeEmoji}</div>'">`;
    } else {
        html += `<div class="pet-detail-image-placeholder">${petTypeEmoji}</div>`;
    }
    html += '</div>';
    
    // 정보 섹션
    html += '<div class="pet-detail-info-section">';
    html += `<h2 class="pet-detail-name">${petTypeEmoji} ${pet.name}</h2>`;
    
    html += '<div class="pet-detail-info-grid">';
    html += '<div class="detail-info-item">';
    html += '<div class="detail-info-label">종류</div>';
    html += `<div class="detail-info-value">${petTypeName}</div>`;
    html += '</div>';
    
    html += '<div class="detail-info-item">';
    html += '<div class="detail-info-label">나이</div>';
    html += `<div class="detail-info-value">${pet.ageYears}세</div>`;
    html += '</div>';
    
    html += '<div class="detail-info-item">';
    html += '<div class="detail-info-label">몸무게</div>';
    html += `<div class="detail-info-value">${pet.weightKg}kg</div>`;
    html += '</div>';
    
    html += '<div class="detail-info-item">';
    html += '<div class="detail-info-label">위치</div>';
    html += `<div class="detail-info-value">${pet.locationCity}</div>`;
    html += '</div>';
    
    html += '</div>'; // pet-detail-info-grid
    
    // 보호자 정보
    html += '<div class="pet-detail-owner-section">';
    html += '<h3>보호자 정보</h3>';
    html += '<div class="pet-detail-owner-info">';
    html += `<div><strong>이름:</strong> ${pet.ownerName}</div>`;
    html += `<div><strong>전화번호:</strong> ${pet.ownerPhone}</div>`;
    html += '</div>';
    html += '</div>';
    
    html += '</div>'; // pet-detail-info-section
    html += '</div>'; // pet-detail-card
    
    container.innerHTML = html;
}

async function loadReservations(petId) {
    try {
        const response = await fetch(`${API_BASE_URL}/reservations/pet/${petId}`);
        if (response.ok) {
            const reservations = await response.json();
            displayReservations(reservations);
        }
    } catch (error) {
        console.error('Error loading reservations:', error);
    }
}

function displayReservations(reservations) {
    const container = document.getElementById('reservationsList');
    
    if (reservations.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding: 2rem; text-align: center;"><p style="color: var(--text-secondary);">예약 내역이 없습니다.</p></div>';
        return;
    }
    
    let html = '';
    reservations.forEach(reservation => {
        const date = new Date(reservation.reservationDateTime);
        const dateStr = date.toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'short'
        });
        const timeStr = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        
        html += '<div class="reservation-item">';
        html += '<div style="flex: 1;">';
        html += `<div class="reservation-date">📅 ${dateStr} ${timeStr}</div>`;
        if (reservation.notes) {
            html += `<div class="reservation-notes">${reservation.notes}</div>`;
        }
        html += '</div>';
        html += `<div class="reservation-status status-${reservation.status}">${getStatusText(reservation.status)}</div>`;
        html += '</div>';
    });
    
    container.innerHTML = html;
}

function getStatusText(status) {
    switch(status) {
        case 'pending': return '대기중';
        case 'confirmed': return '확정';
        case 'cancelled': return '취소됨';
        default: return status;
    }
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

function goToSymptomInput() {
    localStorage.setItem('selectedPetId', currentPetId);
    location.href = 'symptom-input.html';
}

function editPet() {
    localStorage.setItem('editPetId', currentPetId);
    location.href = 'pet-register.html';
}

async function deletePet() {
    if (!confirm('정말로 이 반려동물 정보를 삭제하시겠습니까?\n삭제된 정보는 복구할 수 없습니다.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/pets/${currentPetId}`, {
            method: 'DELETE'
        });
        
        if (response.ok || response.status === 204) {
            alert('반려동물 정보가 삭제되었습니다.');
            location.href = 'index.html';
        } else {
            alert('삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error deleting pet:', error);
        alert('삭제 중 오류가 발생했습니다.');
    }
}

