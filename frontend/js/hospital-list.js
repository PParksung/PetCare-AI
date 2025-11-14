const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', async () => {
    // 분석 결과에서 추천 메시지 표시
    const recommendationData = localStorage.getItem('hospitalRecommendation');
    if (recommendationData) {
        const recommendation = JSON.parse(recommendationData);
        if (recommendation.userFriendlyMessage) {
            document.getElementById('recommendationMessage').textContent = recommendation.userFriendlyMessage;
        }
    }
    
    await loadHospitals();
});

async function loadHospitals() {
    try {
        const response = await fetch(`${API_BASE_URL}/hospitals`);
        if (response.ok) {
            const hospitals = await response.json();
            displayHospitals(hospitals);
        } else {
            document.getElementById('hospitalList').innerHTML = 
                '<div class="alert alert-error">병원 목록을 불러올 수 없습니다.</div>';
        }
    } catch (error) {
        console.error('Error loading hospitals:', error);
        document.getElementById('hospitalList').innerHTML = 
            '<div class="alert alert-error">서버 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.</div>';
    }
}

function displayHospitals(hospitals) {
    const container = document.getElementById('hospitalList');
    
    if (hospitals.length === 0) {
        container.innerHTML = '<div class="alert">등록된 병원이 없습니다.</div>';
        return;
    }
    
    let html = '';
    hospitals.forEach(hospital => {
        html += '<div class="hospital-card" onclick="viewHospitalDetail(\'' + hospital.id + '\')">';
        html += `<h3>${hospital.name}</h3>`;
        html += '<div class="hospital-info">';
        html += `<span>📍 ${hospital.address}</span>`;
        html += `<span>📞 ${hospital.phone}</span>`;
        html += `<span>⏰ ${hospital.operatingHours}</span>`;
        if (hospital.distanceKm) {
            html += `<span>📏 거리: ${hospital.distanceKm.toFixed(1)}km</span>`;
        }
        html += '</div>';
        if (hospital.departments && hospital.departments.length > 0) {
            html += '<div class="departments">';
            hospital.departments.forEach(dept => {
                html += `<span class="department-badge">${dept}</span>`;
            });
            html += '</div>';
        }
        if (hospital.description) {
            html += `<p style="margin-top: 1rem; color: #666;">${hospital.description}</p>`;
        }
        html += '</div>';
    });
    
    container.innerHTML = html;
}

function viewHospitalDetail(hospitalId) {
    localStorage.setItem('selectedHospitalId', hospitalId);
    location.href = 'hospital-detail.html';
}

