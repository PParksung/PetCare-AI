// API_BASE_URL은 main.js에서 선언됨
document.addEventListener('DOMContentLoaded', async () => {
    const reservationId = localStorage.getItem('selectedReservationId');
    
    if (!reservationId) {
        document.getElementById('reservationDetail').innerHTML = 
            '<div class="alert alert-error">예약 정보를 찾을 수 없습니다.</div>';
        return;
    }
    
    await loadReservationDetail(reservationId);
});

async function loadReservationDetail(reservationId) {
    const container = document.getElementById('reservationDetail');
    
    try {
        // 예약 정보 조회
        const reservationResponse = await fetch(`${API_BASE_URL}/reservations/${reservationId}`);
        if (!reservationResponse.ok) {
            throw new Error('예약 정보를 불러올 수 없습니다.');
        }
        const reservation = await reservationResponse.json();
        
        // 반려동물 정보 조회
        let pet = null;
        if (reservation.petId) {
            try {
                const petResponse = await fetch(`${API_BASE_URL}/pets/${reservation.petId}`);
                if (petResponse.ok) {
                    pet = await petResponse.json();
                }
            } catch (error) {
                console.error('Error loading pet:', error);
            }
        }
        
        // 병원 정보 조회
        let hospital = null;
        if (reservation.hospitalId) {
            try {
                const hospitalResponse = await fetch(`${API_BASE_URL}/hospitals/${reservation.hospitalId}`);
                if (hospitalResponse.ok) {
                    hospital = await hospitalResponse.json();
                }
            } catch (error) {
                console.error('Error loading hospital:', error);
            }
        }
        
        displayReservationDetail(reservation, pet, hospital);
        
    } catch (error) {
        console.error('Error loading reservation:', error);
        container.innerHTML = `
            <div class="alert alert-error">
                <p>예약 정보를 불러오는 중 오류가 발생했습니다.</p>
                <p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">
                    백엔드 서버가 실행 중인지 확인해주세요.
                </p>
                <button class="btn btn-secondary" onclick="location.reload()" style="margin-top: 1rem;">
                    다시 시도
                </button>
            </div>
        `;
    }
}

function displayReservationDetail(reservation, pet, hospital) {
    const container = document.getElementById('reservationDetail');
    
    const reservationDate = new Date(reservation.reservationDateTime);
    const formattedDate = reservationDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    const formattedTime = reservationDate.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const statusClass = getStatusClass(reservation.status);
    const statusText = getStatusText(reservation.status);
    
    let html = `
        <div class="reservation-detail-card">
            <div class="detail-header">
                <h3>예약 정보</h3>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            
            <div class="detail-section">
                <h4>📅 예약 일시</h4>
                <p class="detail-value">${formattedDate} ${formattedTime}</p>
            </div>
            
            ${pet ? `
            <div class="detail-section">
                <h4>🐾 반려동물</h4>
                <div class="pet-info-card" style="margin-top: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        ${pet.imagePath ? `
                        <img src="${getImageUrl(pet.imagePath)}" alt="${pet.name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
                        ` : `
                        <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--primary-color); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                            ${getPetTypeEmoji(pet.type)}
                        </div>
                        `}
                        <div>
                            <p style="font-weight: 600; font-size: 1.1rem;">${pet.name}</p>
                            <p style="color: var(--text-secondary); font-size: 0.9rem;">
                                ${getPetTypeName(pet.type)} · ${pet.age}살 · ${pet.weight}kg
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            ${hospital ? `
            <div class="detail-section">
                <h4>🏥 병원</h4>
                <div class="hospital-info-card" style="margin-top: 0.5rem; padding: 1rem; background: var(--white); border-radius: 8px; border: 1px solid var(--border-color);">
                    <p style="font-weight: 600; font-size: 1.1rem; margin-bottom: 0.5rem;">${hospital.name}</p>
                    <p style="color: var(--text-secondary); margin-bottom: 0.3rem;">📍 ${hospital.address}</p>
                    <p style="color: var(--text-secondary); margin-bottom: 0.3rem;">📞 ${hospital.phone}</p>
                    <p style="color: var(--text-secondary);">⏰ ${hospital.operatingHours}</p>
                    <button class="btn btn-secondary" onclick="viewHospital('${hospital.id}')" style="margin-top: 0.5rem; padding: 0.5rem 1rem; font-size: 0.9rem;">
                        병원 상세 보기
                    </button>
                </div>
            </div>
            ` : ''}
            
            ${reservation.ownerName ? `
            <div class="detail-section">
                <h4>👤 예약자</h4>
                <p class="detail-value">${reservation.ownerName}</p>
            </div>
            ` : ''}
            
            ${reservation.ownerPhone ? `
            <div class="detail-section">
                <h4>📞 연락처</h4>
                <p class="detail-value">${reservation.ownerPhone}</p>
            </div>
            ` : ''}
            
            ${reservation.notes ? `
            <div class="detail-section">
                <h4>📝 특이사항</h4>
                <p class="detail-value">${reservation.notes}</p>
            </div>
            ` : ''}
            
            <div class="detail-section">
                <h4>🆔 예약 번호</h4>
                <p class="detail-value" style="font-family: monospace; font-size: 0.9rem;">${reservation.id}</p>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
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

function getPetTypeEmoji(type) {
    const emojiMap = {
        'dog': '🐕',
        'cat': '🐱',
        'bird': '🐦',
        'rabbit': '🐰',
        'hamster': '🐹',
        'other': '🐾'
    };
    return emojiMap[type] || '🐾';
}

function viewHospital(hospitalId) {
    localStorage.setItem('selectedHospitalId', hospitalId);
    location.href = 'hospital-detail.html';
}

