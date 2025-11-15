const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', async () => {
    const hospitalId = localStorage.getItem('selectedHospitalId');
    
    if (!hospitalId) {
        document.getElementById('hospitalDetail').innerHTML = 
            '<div class="alert alert-error">병원 정보를 찾을 수 없습니다.</div>';
        return;
    }
    
    await loadHospitalDetail(hospitalId);
    
    // 예약 버튼 이벤트
    document.getElementById('reserveBtn').addEventListener('click', () => {
        localStorage.setItem('reservationHospitalId', hospitalId);
        location.href = 'reservation.html';
    });
});

async function loadHospitalDetail(hospitalId) {
    try {
        const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}`);
        if (response.ok) {
            const hospital = await response.json();
            displayHospitalDetail(hospital);
        } else {
            document.getElementById('hospitalDetail').innerHTML = 
                '<div class="alert alert-error">병원 정보를 불러올 수 없습니다.</div>';
        }
    } catch (error) {
        console.error('Error loading hospital:', error);
        document.getElementById('hospitalDetail').innerHTML = 
            '<div class="alert alert-error">서버 연결에 실패했습니다.</div>';
    }
}

function displayHospitalDetail(hospital) {
    document.getElementById('hospitalName').textContent = hospital.name;
    
    const container = document.getElementById('hospitalDetail');
    
    let html = '<div class="detail-section">';
    html += '<h3>기본 정보</h3>';
    html += '<div class="detail-info">';
    html += `<div class="detail-item"><strong>주소</strong>${hospital.address}</div>`;
    html += `<div class="detail-item"><strong>전화번호</strong>${hospital.phone}</div>`;
    html += `<div class="detail-item"><strong>운영시간</strong>${hospital.operatingHours}</div>`;
    if (hospital.distanceKm) {
        html += `<div class="detail-item"><strong>거리</strong>${hospital.distanceKm.toFixed(1)}km</div>`;
    }
    html += '</div>';
    html += '</div>';
    
    if (hospital.departments && hospital.departments.length > 0) {
        html += '<div class="detail-section">';
        html += '<h3>진료과목</h3>';
        html += '<div class="departments">';
        hospital.departments.forEach(dept => {
            html += `<span class="department-badge">${dept}</span>`;
        });
        html += '</div>';
        html += '</div>';
    }
    
    if (hospital.description) {
        html += '<div class="detail-section">';
        html += '<h3>병원 소개</h3>';
        html += `<p>${hospital.description}</p>`;
        html += '</div>';
    }
    
    // 지도 표시 (카카오맵 API 키가 필요한 경우)
    if (hospital.latitude && hospital.longitude) {
        html += '<div class="detail-section">';
        html += '<h3>위치</h3>';
        
        // OpenStreetMap + Leaflet.js 지도 표시 (완전 무료!)
        if (hospital.latitude && hospital.longitude) {
            // Leaflet 지도 컨테이너 추가
            const mapId = 'hospital-detail-map';
            html += `<div style="margin-top: 1rem; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">`;
            html += `<div id="${mapId}" style="width: 100%; height: 400px; border-radius: 8px;"></div>`;
            html += `</div>`;
            
            // 지도 초기화는 displayHospitalDetail 함수 끝에서 실행
            setTimeout(() => {
                if (typeof L !== 'undefined') {
                    const map = L.map(mapId).setView([hospital.latitude, hospital.longitude], 17);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors',
                        maxZoom: 19
                    }).addTo(map);
                    
                    // 마커 추가
                    L.marker([hospital.latitude, hospital.longitude])
                        .addTo(map)
                        .bindPopup(hospital.name || '동물병원')
                        .openPopup();
                }
            }, 100);
        } else if (hospital.name) {
            // 좌표가 없으면 이름과 주소로 검색 링크 제공
            const hospitalName = encodeURIComponent(hospital.name);
            let searchUrl;
            if (hospital.address) {
                const hospitalAddress = encodeURIComponent(hospital.address);
                searchUrl = `https://www.openstreetmap.org/search?query=${hospitalName}+${hospitalAddress}`;
            } else {
                searchUrl = `https://www.openstreetmap.org/search?query=${hospitalName}`;
            }
            html += `<a href="${searchUrl}" target="_blank" class="btn btn-primary">🗺️ 지도에서 보기</a>`;
        }
        html += '</div>';
    }
    
    container.innerHTML = html;
}

