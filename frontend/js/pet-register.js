// API_BASE_URL은 main.js에서 선언됨
let uploadedImagePath = null;
let isEditMode = false;
let editPetId = null;
let isUploadingImage = false;

document.addEventListener('DOMContentLoaded', async () => {
    const editId = localStorage.getItem('editPetId');
    if (editId) {
        isEditMode = true;
        editPetId = editId;
        localStorage.removeItem('editPetId');
        await loadPetForEdit(editId);
    }
    
    const form = document.getElementById('petRegisterForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (isEditMode) {
        document.querySelector('.page-header h2').textContent = '반려동물 정보 수정';
        submitBtn.textContent = '수정하기';
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 이미지 파일이 선택되었지만 아직 업로드되지 않은 경우 업로드 대기
        const imageInput = document.getElementById('petImage');
        if (imageInput && imageInput.files.length > 0) {
            if (isUploadingImage) {
                console.log('이미지 업로드 진행 중, 대기...');
                // 업로드가 완료될 때까지 대기
                await new Promise((resolve) => {
                    const checkInterval = setInterval(() => {
                        if (!isUploadingImage) {
                            console.log('이미지 업로드 완료');
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                    // 최대 15초 대기
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        resolve();
                    }, 15000);
                });
            } else if (!uploadedImagePath) {
                console.log('이미지가 업로드되지 않았습니다. 업로드 대기...');
                // 업로드가 시작되고 완료될 때까지 대기
                await new Promise((resolve) => {
                    const checkInterval = setInterval(() => {
                        if (uploadedImagePath) {
                            console.log('이미지 업로드 완료, 경로:', uploadedImagePath);
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                    // 최대 15초 대기
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        if (!uploadedImagePath) {
                            console.warn('이미지 업로드 타임아웃 - 이미지 없이 진행');
                        }
                        resolve();
                    }, 15000);
                });
            }
        }
        
        const imagePathToSave = uploadedImagePath || (isEditMode ? document.getElementById('imagePreview')?.dataset.currentImage : null);
        console.log('저장할 이미지 경로:', imagePathToSave);
        console.log('업로드된 이미지 경로:', uploadedImagePath);
        
        // 주소 조합: 시/도 + 구/동
        const locationCity = document.getElementById('locationCity').value;
        const locationDetail = document.getElementById('locationDetail').value.trim();
        const fullLocation = locationDetail ? `${locationCity} ${locationDetail}` : locationCity;
        
        const formData = {
            name: document.getElementById('petName').value,
            type: document.getElementById('petType').value,
            ageYears: parseInt(document.getElementById('ageYears').value),
            weightKg: parseFloat(document.getElementById('weightKg').value),
            ownerName: document.getElementById('ownerName').value,
            ownerPhone: document.getElementById('ownerPhone').value,
            locationCity: fullLocation, // 시/도 + 구/동 조합
            locationCountry: document.getElementById('locationCountry').value,
            imagePath: imagePathToSave,
        };
        
        console.log('전송할 반려동물 데이터:', formData);
        
        try {
            let response;
            if (isEditMode) {
                // 수정 모드 - PUT 요청 (백엔드에 PUT API가 없으면 POST로 처리)
                formData.id = editPetId;
                response = await fetch(`${API_BASE_URL}/pets/${editPetId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
            } else {
                // 등록 모드
                response = await fetch(`${API_BASE_URL}/pets`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
            }
            
            if (response.ok) {
                const pet = await response.json();
                console.log('반려동물 등록/수정 성공:', pet);
                console.log('저장된 반려동물의 imagePath:', pet.imagePath);
                alert(isEditMode ? '반려동물 정보가 수정되었습니다!' : '반려동물이 성공적으로 등록되었습니다!');
                // 수정 모드면 상세 페이지로, 등록 모드면 메인페이지로
                if (isEditMode) {
                    localStorage.setItem('selectedPetId', editPetId);
                    location.href = `pet-detail.html?petId=${editPetId}&refresh=true`;
                } else {
                    // 페이지 이동 시 새로고침을 위해 파라미터 추가하고 강제 리로드
                    location.href = 'index.html?refresh=true&t=' + Date.now();
                }
            } else {
                const error = await response.text();
                alert((isEditMode ? '수정' : '등록') + '에 실패했습니다: ' + error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('서버 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
        }
    });
});

async function loadPetForEdit(petId) {
    try {
        const response = await fetch(`${API_BASE_URL}/pets/${petId}`);
        if (response.ok) {
            const pet = await response.json();
            
            // 폼에 데이터 채우기
            document.getElementById('ownerName').value = pet.ownerName || '';
            document.getElementById('ownerPhone').value = pet.ownerPhone || '';
            document.getElementById('petName').value = pet.name || '';
            document.getElementById('petType').value = pet.type || '';
            document.getElementById('ageYears').value = pet.ageYears || '';
            document.getElementById('weightKg').value = pet.weightKg || '';
            
            // 주소 분리: 시/도와 구/동 분리
            const locationCity = pet.locationCity || '';
            if (locationCity) {
                // 시/도 추출 (예: "대전광역시 유성구 궁동" → "대전광역시")
                const cityMatch = locationCity.match(/^(서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|경기도|강원도|충청북도|충청남도|전라북도|전라남도|경상북도|경상남도|제주특별자치도)/);
                if (cityMatch) {
                    document.getElementById('locationCity').value = cityMatch[1];
                    // 나머지 부분을 구/동으로 설정
                    const detail = locationCity.substring(cityMatch[1].length).trim();
                    document.getElementById('locationDetail').value = detail;
                } else {
                    // 매칭되지 않으면 전체를 시/도로 설정
                    document.getElementById('locationCity').value = locationCity;
                }
            }
            document.getElementById('locationCountry').value = pet.locationCountry || '';
            
            // 이미지 표시
            if (pet.imagePath) {
                const preview = document.getElementById('imagePreview');
                preview.src = getImageUrl(pet.imagePath);
                preview.classList.remove('hidden');
                preview.dataset.currentImage = pet.imagePath;
                uploadedImagePath = pet.imagePath;
            }
        }
    } catch (error) {
        console.error('Error loading pet:', error);
    }
}

function previewImage(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
        
        // 이미지 업로드 (비동기)
        uploadImage(file);
    }
}

async function uploadImage(file) {
    // 이전 업로드 경로 초기화
    uploadedImagePath = null;
    isUploadingImage = true;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        console.log('이미지 업로드 시작:', file.name, '크기:', file.size, 'bytes');
        const response = await fetch(`${API_BASE_URL}/images/upload`, {
            method: 'POST',
            body: formData,
        });
        
        if (response.ok) {
            const result = await response.json();
            uploadedImagePath = result.imagePath;
            console.log('이미지 업로드 성공:', uploadedImagePath);
            console.log('이미지 전체 URL:', `http://localhost:8080${uploadedImagePath}`);
            
            // 미리보기 이미지도 서버 이미지로 업데이트
            const preview = document.getElementById('imagePreview');
            if (preview) {
                preview.src = getImageUrl(uploadedImagePath);
                preview.dataset.currentImage = uploadedImagePath;
            }
        } else {
            const error = await response.json();
            console.error('이미지 업로드 실패:', error);
            alert('이미지 업로드 실패: ' + (error.error || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('이미지 업로드 오류:', error);
        alert('이미지 업로드 중 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } finally {
        isUploadingImage = false;
    }
}
