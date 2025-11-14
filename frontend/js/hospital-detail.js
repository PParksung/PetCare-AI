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
        html += `<div id="map"></div>`;
        html += '</div>';
        
        // 카카오맵 초기화 (API 키가 설정되어 있는 경우)
        if (typeof kakao !== 'undefined' && kakao.maps) {
            const mapContainer = document.getElementById('map');
            const mapOption = {
                center: new kakao.maps.LatLng(hospital.latitude, hospital.longitude),
                level: 3
            };
            const map = new kakao.maps.Map(mapContainer, mapOption);
            
            const markerPosition = new kakao.maps.LatLng(hospital.latitude, hospital.longitude);
            const marker = new kakao.maps.Marker({
                position: markerPosition
            });
            marker.setMap(map);
        } else {
            // 카카오맵 API 키가 없는 경우 구글맵 링크 표시
            // 위도/경도가 있으면 사용하고, 없으면 병원 이름+주소 사용
            let googleMapsUrl;
            if (hospital.latitude && hospital.longitude) {
                // 위도/경도가 있으면 더 정확하게 특정 위치로 이동
                googleMapsUrl = `https://www.google.com/maps?q=${hospital.latitude},${hospital.longitude}&ll=${hospital.latitude},${hospital.longitude}&z=17`;
            } else {
                // 위도/경도가 없으면 병원 이름과 주소로 검색
                const hospitalName = encodeURIComponent(hospital.name);
                const hospitalAddress = encodeURIComponent(hospital.address);
                googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${hospitalName}+${hospitalAddress}`;
            }
            html = html.replace('<div id="map"></div>', 
                `<a href="${googleMapsUrl}" target="_blank" class="btn btn-primary">지도에서 보기</a>`);
        }
    }
    
    container.innerHTML = html;
}

