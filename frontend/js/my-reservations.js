// API_BASE_URL은 main.js에서 선언됨
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllReservations();
});

async function loadAllReservations() {
    const container = document.getElementById('reservationsList');
    
    try {
        console.log('예약 목록 로드 시작...');
        
        // 1. 모든 반려동물 조회
        console.log('반려동물 목록 조회 중...');
        const petsResponse = await fetch(`${API_BASE_URL}/pets`);
        console.log('반려동물 응답 상태:', petsResponse.status);
        
        if (!petsResponse.ok) {
            if (petsResponse.status === 0 || petsResponse.status === 500) {
                throw new Error('서버 연결 실패. 백엔드 서버가 실행 중인지 확인해주세요.');
            }
            throw new Error(`반려동물 정보를 불러올 수 없습니다. (상태 코드: ${petsResponse.status})`);
        }
        
        const pets = await petsResponse.json();
        console.log('반려동물 수:', pets.length);
        
        if (pets.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info" style="text-align: center; padding: 2rem;">
                    <p>등록된 반려동물이 없습니다.</p>
                    <button class="btn btn-primary" onclick="location.href='pet-register.html'" style="margin-top: 1rem;">
                        반려동물 등록하기
                    </button>
                </div>
            `;
            return;
        }
        
        // 2. 각 반려동물의 예약 조회
        console.log('각 반려동물의 예약 조회 중...');
        const allReservations = [];
        for (const pet of pets) {
            try {
                console.log(`반려동물 ${pet.name} (${pet.id})의 예약 조회 중...`);
                const reservationsResponse = await fetch(`${API_BASE_URL}/reservations/pet/${pet.id}`);
                
                if (reservationsResponse.ok) {
                    const reservations = await reservationsResponse.json();
                    console.log(`반려동물 ${pet.name}의 예약 수:`, reservations.length);
                    
                    // 예약에 반려동물 정보 추가
                    reservations.forEach(reservation => {
                        reservation.pet = pet;
                        allReservations.push(reservation);
                    });
                } else {
                    console.warn(`반려동물 ${pet.name}의 예약 조회 실패:`, reservationsResponse.status);
                }
            } catch (error) {
                console.error(`반려동물 ${pet.id}의 예약 조회 실패:`, error);
            }
        }
        
        console.log('전체 예약 수:', allReservations.length);
        
        // 3. 예약 목록 표시
        if (allReservations.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info" style="text-align: center; padding: 2rem;">
                    <p>예약 내역이 없습니다.</p>
                    <p style="margin-top: 1rem; color: var(--text-secondary);">병원 상세 페이지에서 예약을 진행하세요.</p>
                </div>
            `;
            return;
        }
        
        // 예약 날짜순으로 정렬 (최신순)
        allReservations.sort((a, b) => {
            return new Date(b.reservationDateTime) - new Date(a.reservationDateTime);
        });
        
        console.log('예약 목록 표시 중...');
        displayReservations(allReservations);
        
    } catch (error) {
        console.error('Error loading reservations:', error);
        container.innerHTML = `
            <div class="alert alert-error">
                <p>예약 내역을 불러오는 중 오류가 발생했습니다.</p>
                <p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">
                    ${error.message || '백엔드 서버가 실행 중인지 확인해주세요.'}
                </p>
                <button class="btn btn-secondary" onclick="location.reload()" style="margin-top: 1rem;">
                    다시 시도
                </button>
            </div>
        `;
    }
}

function displayReservations(reservations) {
    const container = document.getElementById('reservationsList');
    
    let html = '<div class="reservations-grid">';
    
    reservations.forEach(reservation => {
        const reservationDate = new Date(reservation.reservationDateTime);
        const formattedDate = reservationDate.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        });
        const formattedTime = reservationDate.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const statusClass = getStatusClass(reservation.status);
        const statusText = getStatusText(reservation.status);
        
        html += `
            <div class="reservation-card">
                <div class="reservation-header">
                    <h3>${reservation.pet ? reservation.pet.name : '반려동물'}</h3>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                
                <div class="reservation-info">
                    <div class="info-item">
                        <strong>📅 예약 일시</strong>
                        <span>${formattedDate} ${formattedTime}</span>
                    </div>
                    
                    ${reservation.pet ? `
                    <div class="info-item">
                        <strong>🐾 반려동물</strong>
                        <span>${reservation.pet.name} (${getPetTypeName(reservation.pet.type)})</span>
                    </div>
                    ` : ''}
                    
                    <div class="info-item">
                        <strong>🏥 병원</strong>
                        <span id="hospital-name-${reservation.id}">불러오는 중...</span>
                    </div>
                    
                    ${reservation.ownerName ? `
                    <div class="info-item">
                        <strong>👤 예약자</strong>
                        <span>${reservation.ownerName}</span>
                    </div>
                    ` : ''}
                    
                    ${reservation.ownerPhone ? `
                    <div class="info-item">
                        <strong>📞 연락처</strong>
                        <span>${reservation.ownerPhone}</span>
                    </div>
                    ` : ''}
                    
                    ${reservation.notes ? `
                    <div class="info-item">
                        <strong>📝 특이사항</strong>
                        <span>${reservation.notes}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="reservation-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary" onclick="viewReservationDetail('${reservation.id}')" style="flex: 1;">
                        상세 보기
                    </button>
                    ${reservation.status === 'pending' || reservation.status === 'confirmed' ? `
                    <button class="btn btn-danger" onclick="cancelReservation('${reservation.id}')" style="flex: 1;">
                        예약 취소
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        // 병원 정보 비동기 로드
        loadHospitalName(reservation.hospitalId, reservation.id);
    });
    
    html += '</div>';
    container.innerHTML = html;
}

async function loadHospitalName(hospitalId, reservationId) {
    try {
        const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}`);
        if (response.ok) {
            const hospital = await response.json();
            const element = document.getElementById(`hospital-name-${reservationId}`);
            if (element) {
                element.textContent = hospital.name || '병원 정보 없음';
            }
        } else {
            const element = document.getElementById(`hospital-name-${reservationId}`);
            if (element) {
                element.textContent = '병원 정보 없음';
            }
        }
    } catch (error) {
        console.error('Error loading hospital:', error);
        const element = document.getElementById(`hospital-name-${reservationId}`);
        if (element) {
            element.textContent = '병원 정보 없음';
        }
    }
}

function getStatusClass(status) {
    switch(status?.toLowerCase()) {
        case 'pending': return 'status-pending';
        case 'confirmed': return 'status-confirmed';
        case 'cancelled': return 'status-cancelled';
        default: return 'status-pending';
    }
}

function getStatusText(status) {
    switch(status?.toLowerCase()) {
        case 'pending': return '대기중';
        case 'confirmed': return '확정';
        case 'cancelled': return '취소됨';
        default: return '대기중';
    }
}

function getPetTypeName(type) {
    const typeMap = {
        'dog': '강아지',
        'cat': '고양이',
        'bird': '새',
        'rabbit': '토끼',
        'hamster': '햄스터',
        'other': '기타'
    };
    return typeMap[type] || type;
}

function viewReservationDetail(reservationId) {
    localStorage.setItem('selectedReservationId', reservationId);
    location.href = 'reservation-detail.html';
}

async function cancelReservation(reservationId) {
    if (!confirm('정말 예약을 취소하시겠습니까?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/cancel`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            alert('예약이 취소되었습니다.');
            location.reload();
        } else {
            const errorText = await response.text();
            alert('예약 취소에 실패했습니다: ' + errorText);
        }
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        alert('예약 취소 중 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    }
}

