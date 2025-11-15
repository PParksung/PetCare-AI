// API_BASE_URL은 main.js에서 선언됨

document.addEventListener('DOMContentLoaded', async () => {
    // 선택된 반려동물 정보 로드
    await loadSelectedPet();
    
    const form = document.getElementById('symptomForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 선택한 증상 수집
        const selectedSymptoms = [];
        const symptomCheckboxes = document.querySelectorAll('input[name="symptoms"]:checked');
        symptomCheckboxes.forEach(checkbox => {
            selectedSymptoms.push(checkbox.value);
        });
        
        const formData = {
            petId: document.getElementById('petId').value,
            mainComplaint: document.getElementById('mainComplaint').value.trim(),
            onsetHoursAgo: parseInt(document.getElementById('onsetHoursAgo').value),
            selectedSymptoms: selectedSymptoms,
            emergencyFlags: {
                difficultyBreathing: document.getElementById('difficultyBreathing').checked,
                continuousVomiting: document.getElementById('continuousVomiting').checked,
                cannotStand: document.getElementById('cannotStand').checked,
                lossOfConsciousness: document.getElementById('lossOfConsciousness').checked,
                severeBleeding: document.getElementById('severeBleeding').checked,
            },
        };
        
        // 디버깅: 전송할 데이터 확인
        console.log('전송할 증상 데이터:', formData);
        console.log('선택한 증상 수:', selectedSymptoms.length);
        console.log('증상 상세 설명:', formData.mainComplaint);
        
        // 증상 상세 정보 저장 (분석 결과 페이지에서 표시용)
        localStorage.setItem('symptomDetail', JSON.stringify(formData));
        
        try {
            const response = await fetch(`${API_BASE_URL}/symptoms/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            if (response.ok) {
                const recommendation = await response.json();
                // 분석 결과를 로컬 스토리지에 저장
                localStorage.setItem('analysisResult', JSON.stringify(recommendation));
                // 분석 결과 페이지로 이동
                location.href = 'analysis-result.html';
            } else {
                const error = await response.text();
                alert('분석 요청에 실패했습니다: ' + error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('서버 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
        }
    });
});

async function loadSelectedPet() {
    const selectedPetId = localStorage.getItem('selectedPetId');
    const petInfoContainer = document.getElementById('selectedPetInfo');
    const petIdInput = document.getElementById('petId');
    
    if (!selectedPetId) {
        // 선택된 반려동물이 없으면 안내 메시지 표시
        petInfoContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🐾</div>
                <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">선택된 반려동물이 없습니다</h4>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                    반려동물을 선택하거나 등록해주세요.
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button type="button" class="btn btn-primary" onclick="location.href='index.html'">
                        반려동물 선택하기
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="location.href='pet-register.html'">
                        반려동물 등록하기
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    try {
        // 선택된 반려동물 정보 가져오기
        const response = await fetch(`${API_BASE_URL}/pets/${selectedPetId}`);
        if (response.ok) {
            const pet = await response.json();
            
            // petId input에 설정
            petIdInput.value = pet.id;
            
            // 반려동물 정보 표시
            const petTypeEmoji = getPetTypeEmoji(pet.type);
            const petTypeName = getPetTypeName(pet.type);
            const imageUrl = getImageUrl(pet.imagePath);
            
            let html = '<div style="display: flex; gap: 1.5rem; align-items: center;">';
            
            // 이미지 또는 이모지
            html += '<div style="flex-shrink: 0;">';
            if (imageUrl) {
                html += `<img src="${imageUrl}" alt="${pet.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid var(--primary-color);" onerror="this.parentElement.innerHTML='<div style=\\'width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; font-size: 3rem; background: var(--background); border-radius: 8px; border: 2px solid var(--primary-color);\\'>${petTypeEmoji}</div>'">`;
            } else {
                html += `<div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; font-size: 3rem; background: var(--background); border-radius: 8px; border: 2px solid var(--primary-color);">${petTypeEmoji}</div>`;
            }
            html += '</div>';
            
            // 정보
            html += '<div style="flex: 1;">';
            html += `<h4 style="margin: 0 0 0.5rem 0; color: var(--text-primary); font-size: 1.2rem;">${petTypeEmoji} ${pet.name}</h4>`;
            html += '<div style="display: flex; flex-wrap: wrap; gap: 1rem; color: var(--text-secondary); font-size: 0.9rem;">';
            html += `<span><strong>종류:</strong> ${petTypeName}</span>`;
            html += `<span><strong>나이:</strong> ${pet.ageYears}세</span>`;
            html += `<span><strong>몸무게:</strong> ${pet.weightKg}kg</span>`;
            html += `<span><strong>위치:</strong> ${pet.locationCity}</span>`;
            html += '</div>';
            html += '</div>';
            
            html += '</div>';
            
            petInfoContainer.innerHTML = html;
        } else {
            // 반려동물을 찾을 수 없음
            petInfoContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">반려동물 정보를 찾을 수 없습니다</h4>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                        선택된 반려동물이 삭제되었거나 존재하지 않습니다.
                    </p>
                    <button type="button" class="btn btn-primary" onclick="location.href='index.html'">
                        반려동물 선택하기
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading selected pet:', error);
        petInfoContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">서버 연결 실패</h4>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                    반려동물 정보를 불러올 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.
                </p>
                <button type="button" class="btn btn-secondary" onclick="location.reload()">
                    다시 시도
                </button>
            </div>
        `;
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

function changePet() {
    // 반려동물 선택 페이지로 이동
    location.href = 'index.html';
}

