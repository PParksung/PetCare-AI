const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', async () => {
    // 등록된 반려동물 목록 로드
    await loadPets();
    
    // 병원 ID가 있으면 표시
    const hospitalId = localStorage.getItem('reservationHospitalId');
    if (hospitalId) {
        // 병원 정보를 표시할 수 있음 (선택사항)
    }
    
    const form = document.getElementById('reservationForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const date = document.getElementById('reservationDate').value;
        const time = document.getElementById('reservationTime').value;
        const dateTime = `${date}T${time}:00`;
        
        const formData = {
            petId: document.getElementById('reservationPetId').value,
            hospitalId: hospitalId || '',
            reservationDateTime: dateTime,
            notes: document.getElementById('reservationNotes').value || '',
            ownerName: document.getElementById('reservationOwnerName').value,
            ownerPhone: document.getElementById('reservationOwnerPhone').value,
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            if (response.ok) {
                const reservation = await response.json();
                alert('예약이 완료되었습니다!');
                localStorage.removeItem('reservationHospitalId');
                location.href = 'index.html';
            } else {
                const error = await response.text();
                alert('예약에 실패했습니다: ' + error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('서버 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
        }
    });
    
    // 오늘 날짜를 최소 날짜로 설정
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reservationDate').setAttribute('min', today);
});

async function loadPets() {
    try {
        const response = await fetch(`${API_BASE_URL}/pets`);
        if (response.ok) {
            const pets = await response.json();
            const select = document.getElementById('reservationPetId');
            
            // 기존 옵션 제거 (첫 번째 옵션 제외)
            while (select.children.length > 1) {
                select.removeChild(select.lastChild);
            }
            
            pets.forEach(pet => {
                const option = document.createElement('option');
                option.value = pet.id;
                option.textContent = `${pet.name} (${pet.type === 'dog' ? '강아지' : pet.type === 'cat' ? '고양이' : '기타'})`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading pets:', error);
    }
}

