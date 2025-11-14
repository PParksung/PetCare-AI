const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', async () => {
    // 등록된 반려동물 목록 로드
    await loadPets();
    
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

async function loadPets() {
    try {
        const response = await fetch(`${API_BASE_URL}/pets`);
        if (response.ok) {
            const pets = await response.json();
            const select = document.getElementById('petId');
            
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

