const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', () => {
    const resultData = localStorage.getItem('analysisResult');
    
    if (!resultData) {
        document.getElementById('analysisResult').innerHTML = 
            '<div class="alert alert-error">분석 결과를 찾을 수 없습니다. 증상 입력 페이지로 돌아가주세요.</div>';
        return;
    }
    
    const recommendation = JSON.parse(resultData);
    displayAnalysisResult(recommendation);
});

function displayAnalysisResult(recommendation) {
    const container = document.getElementById('analysisResult');
    const analysis = recommendation.analysisResult;
    
    // 증상 상세 설명 섹션 추가
    const symptomDetail = localStorage.getItem('symptomDetail');
    
    let html = '';
    
    // 증상 상세 설명 (가장 위에 표시)
    if (symptomDetail) {
        const symptom = JSON.parse(symptomDetail);
        html += '<div class="symptom-detail">';
        html += '<h4>📋 입력하신 증상</h4>';
        
        // 선택한 증상 표시
        if (symptom.selectedSymptoms && symptom.selectedSymptoms.length > 0) {
            html += `<p><strong>선택한 증상:</strong> <span style="color: var(--primary-color); font-weight: 600;">${symptom.selectedSymptoms.join(', ')}</span></p>`;
        }
        
        html += `<p><strong>증상 상세 설명:</strong> ${symptom.mainComplaint}</p>`;
        html += `<p><strong>증상 시작 후 경과 시간:</strong> ${symptom.onsetHoursAgo}시간</p>`;
        if (symptom.emergencyFlags) {
            const emergencyList = [];
            if (symptom.emergencyFlags.difficultyBreathing) emergencyList.push('호흡 곤란');
            if (symptom.emergencyFlags.continuousVomiting) emergencyList.push('지속적인 구토');
            if (symptom.emergencyFlags.cannotStand) emergencyList.push('일어설 수 없음');
            if (symptom.emergencyFlags.lossOfConsciousness) emergencyList.push('의식 잃음');
            if (symptom.emergencyFlags.severeBleeding) emergencyList.push('심한 출혈');
            if (emergencyList.length > 0) {
                html += `<p><strong>응급 상황:</strong> <span style="color: var(--danger); font-weight: 600;">${emergencyList.join(', ')}</span></p>`;
            }
        }
        html += '</div>';
    }
    
    // 분석 요약
    html += '<div class="analysis-summary">';
    html += '<h3>📊 AI 분석 결과</h3>';
    
    // 긴급도 표시
    const urgencyClass = getUrgencyClass(analysis.urgencyLevel);
    html += `<div class="urgency-badge ${urgencyClass}">긴급도: ${getUrgencyText(analysis.urgencyLevel)}</div>`;
    
    html += `<p><strong>증상 카테고리:</strong> ${analysis.category || '미분류'}</p>`;
    html += `<p><strong>추천 진료과:</strong> ${analysis.recommendedDepartment || '미정'}</p>`;
    
    // 상세 분석 설명
    if (analysis.detailedAnalysis) {
        html += '<div class="detailed-analysis" style="margin-top: 1.5rem; padding: 1.5rem; background: var(--background); border-radius: 8px; border-left: 4px solid var(--primary-color);">';
        html += '<h4 style="margin-bottom: 1rem; color: var(--text-primary);">🔬 종합 분석</h4>';
        html += `<p style="line-height: 1.8; color: var(--text-secondary);">${analysis.detailedAnalysis}</p>`;
        html += '</div>';
    }
    
    html += '</div>';
    
    // 질환 후보 표시
    if (analysis.diseaseCandidates && analysis.diseaseCandidates.length > 0) {
        html += '<div class="disease-section"><h3 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1.5rem;">🔍 가능한 질환 후보</h3>';
        analysis.diseaseCandidates.forEach((disease, index) => {
            html += '<div class="disease-candidate" style="margin-bottom: 2rem; padding: 1.5rem; background: var(--white); border-radius: 12px; box-shadow: var(--shadow);">';
            html += `<h4 style="font-size: 1.3rem; margin-bottom: 1rem; color: var(--primary-color);">${index + 1}. ${disease.name}</h4>`;
            
            if (disease.probability) {
                const probabilityPercent = (disease.probability * 100).toFixed(1);
                html += `<div style="margin-bottom: 1rem;"><strong>가능성:</strong> <span style="color: var(--primary-color); font-weight: 700; font-size: 1.1rem;">${probabilityPercent}%</span></div>`;
            }
            
            // 질환 정보를 간단하게 표시 (접기/펼치기 기능 추가)
            html += '<div style="margin-top: 1rem;">';
            html += `<button class="disease-detail-toggle" onclick="toggleDiseaseDetail(${index})" style="background: var(--primary-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">📋 상세 정보 보기</button>`;
            html += `<div id="disease-detail-${index}" style="display: none; margin-top: 1rem;">`;
            
            if (disease.description) {
                html += '<div style="margin-bottom: 0.8rem; padding: 0.8rem; background: var(--background); border-radius: 6px;">';
                html += `<p style="line-height: 1.6; color: var(--text-secondary); font-size: 0.95rem;"><strong>📖 설명:</strong> ${disease.description}</p>`;
                html += '</div>';
            }
            
            if (disease.symptoms) {
                html += '<div style="margin-bottom: 0.8rem; padding: 0.8rem; background: var(--background); border-radius: 6px;">';
                html += `<p style="line-height: 1.6; color: var(--text-secondary); font-size: 0.95rem;"><strong>🩺 증상:</strong> ${disease.symptoms}</p>`;
                html += '</div>';
            }
            
            if (disease.cause) {
                html += '<div style="margin-bottom: 0.8rem; padding: 0.8rem; background: var(--background); border-radius: 6px;">';
                html += `<p style="line-height: 1.6; color: var(--text-secondary); font-size: 0.95rem;"><strong>🔬 원인:</strong> ${disease.cause}</p>`;
                html += '</div>';
            }
            
            if (disease.treatment) {
                html += '<div style="margin-bottom: 0.8rem; padding: 0.8rem; background: var(--background); border-radius: 6px;">';
                html += `<p style="line-height: 1.6; color: var(--text-secondary); font-size: 0.95rem;"><strong>💊 치료:</strong> ${disease.treatment}</p>`;
                html += '</div>';
            }
            
            if (disease.prevention) {
                html += '<div style="margin-bottom: 0.8rem; padding: 0.8rem; background: var(--background); border-radius: 6px;">';
                html += `<p style="line-height: 1.6; color: var(--text-secondary); font-size: 0.95rem;"><strong>🛡️ 예방:</strong> ${disease.prevention}</p>`;
                html += '</div>';
            }
            
            html += '</div>'; // disease-detail 닫기
            html += '</div>';
            
            html += '</div>';
        });
        html += '</div>';
    }
    
    // 보호자 안내 메시지
    if (recommendation.userFriendlyMessage) {
        html += '<div class="user-message" style="margin-top: 2rem; padding: 2rem; background: linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(245, 166, 35, 0.1) 100%); border-radius: 12px; border-left: 4px solid var(--primary-color);">';
        html += '<h3 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1.5rem;">💬 보호자 안내</h3>';
        html += `<p style="line-height: 1.8; color: var(--text-secondary); font-size: 1.05rem; margin-bottom: 1.5rem;">${recommendation.userFriendlyMessage}</p>`;
        
        if (recommendation.immediateActions) {
            html += '<div style="margin-top: 1.5rem; padding: 1.5rem; background: var(--white); border-radius: 8px;">';
            html += '<h4 style="margin-bottom: 1rem; color: var(--primary-color);">⚡ 즉시 취해야 할 조치</h4>';
            html += `<p style="line-height: 1.8; color: var(--text-secondary); white-space: pre-line;">${recommendation.immediateActions}</p>`;
            html += '</div>';
        }
        
        if (recommendation.watchFor) {
            html += '<div style="margin-top: 1.5rem; padding: 1.5rem; background: var(--white); border-radius: 8px;">';
            html += '<h4 style="margin-bottom: 1rem; color: var(--warning);">👀 주의 깊게 관찰해야 할 증상</h4>';
            html += `<p style="line-height: 1.8; color: var(--text-secondary); white-space: pre-line;">${recommendation.watchFor}</p>`;
            html += '</div>';
        }
        
        html += '</div>';
    }
    
    // 병원 추천 섹션 (바로 표시)
    console.log('추천 병원 수:', recommendation.recommendedHospitals ? recommendation.recommendedHospitals.length : 0);
    console.log('추천 병원 데이터:', recommendation.recommendedHospitals);
    
    if (recommendation.recommendedHospitals && recommendation.recommendedHospitals.length > 0) {
        html += '<div class="hospital-recommendation-section" style="margin-top: 2rem;">';
        html += '<h3 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1.5rem;">🏥 추천 병원</h3>';
        html += '<div class="hospital-list">';
        
        recommendation.recommendedHospitals.forEach((recHospital, index) => {
            console.log(`병원 ${index + 1}:`, recHospital.hospital ? recHospital.hospital.name : '병원 정보 없음');
            const hospital = recHospital.hospital;
            html += '<div class="hospital-card">';
            html += `<h3 style="cursor: pointer;" onclick="viewHospitalDetail('${hospital.id}')">${index + 1}. ${hospital.name}</h3>`;
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
            if (recHospital.recommendationReason) {
                html += `<div class="recommendation-reason">💡 ${recHospital.recommendationReason}</div>`;
            }
            // 지도 링크 추가 (위도/경도 우선, 없으면 병원 이름+주소 사용)
            let googleMapsUrl = null;
            if (hospital.latitude && hospital.longitude) {
                // 위도/경도가 있으면 더 정확하게 특정 위치로 이동
                googleMapsUrl = `https://www.google.com/maps?q=${hospital.latitude},${hospital.longitude}&ll=${hospital.latitude},${hospital.longitude}&z=17`;
            } else if (hospital.name && hospital.address) {
                // 위도/경도가 없으면 병원 이름과 주소로 검색
                const hospitalName = encodeURIComponent(hospital.name);
                const hospitalAddress = encodeURIComponent(hospital.address);
                googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${hospitalName}+${hospitalAddress}`;
            }
            
            if (googleMapsUrl) {
                html += `<div style="margin-top: 1rem;"><a href="${googleMapsUrl}" target="_blank" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="event.stopPropagation();">🗺️ 지도에서 보기</a></div>`;
            }
            html += '</div>';
        });
        
        html += '</div>';
        html += '</div>';
    } else {
        // 추천 병원이 없으면 전체 병원 목록으로 이동하는 버튼
        html += '<div class="action-buttons" style="margin-top: 2rem;">';
        html += '<button class="btn btn-primary" onclick="viewHospitalList()">전체 병원 목록 보기</button>';
        html += '</div>';
    }
    
    container.innerHTML = html;
    
    // 병원 추천 데이터를 로컬 스토리지에 저장
    localStorage.setItem('hospitalRecommendation', JSON.stringify(recommendation));
}

function getUrgencyClass(urgency) {
    switch(urgency?.toLowerCase()) {
        case 'low': return 'urgency-low';
        case 'medium': return 'urgency-medium';
        case 'high': return 'urgency-high';
        case 'emergency': return 'urgency-emergency';
        default: return 'urgency-medium';
    }
}

function getUrgencyText(urgency) {
    switch(urgency?.toLowerCase()) {
        case 'low': return '낮음';
        case 'medium': return '중간';
        case 'high': return '높음';
        case 'emergency': return '응급';
        default: return '중간';
    }
}

function viewHospitalDetail(hospitalId) {
    localStorage.setItem('selectedHospitalId', hospitalId);
    location.href = 'hospital-detail.html';
}

function viewHospitalList() {
    location.href = 'hospital-list.html';
}

function toggleDiseaseDetail(index) {
    const detailDiv = document.getElementById(`disease-detail-${index}`);
    const button = event.target;
    
    if (detailDiv.style.display === 'none') {
        detailDiv.style.display = 'block';
        button.textContent = '📋 상세 정보 숨기기';
    } else {
        detailDiv.style.display = 'none';
        button.textContent = '📋 상세 정보 보기';
    }
}
