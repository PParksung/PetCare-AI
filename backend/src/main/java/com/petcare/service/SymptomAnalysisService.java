package com.petcare.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petcare.model.AnalysisResult;
import com.petcare.model.Hospital;
import com.petcare.model.HospitalRecommendation;
import com.petcare.model.Pet;
import com.petcare.model.SymptomRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class SymptomAnalysisService {
    
    @Autowired
    private AIService aiService;
    
    @Autowired
    private PetService petService;
    
    @Autowired
    private HospitalService hospitalService;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 증상 분석 요청 처리
     * 1. AI1을 호출하여 증상 분석
     * 2. AI2를 호출하여 병원 추천
     */
    public HospitalRecommendation analyzeAndRecommend(SymptomRequest symptomRequest) throws IOException {
        // 1. 반려동물 정보 조회
        Pet pet = petService.getPetById(symptomRequest.getPetId());
        if (pet == null) {
            throw new IllegalArgumentException("반려동물 정보를 찾을 수 없습니다.");
        }
        
        // 2. 반려동물 정보를 JSON으로 변환
        String petInfoJson = objectMapper.writeValueAsString(pet);
        
        // 3. AI1 호출: 증상 분석
        AnalysisResult analysisResult = aiService.analyzeSymptoms(symptomRequest, petInfoJson);
        
        // 4. 사용자 위치 기반 병원 조회 (hospitals.json에서 도시별 필터링)
        String userLocation = pet.getLocationCity();
        List<Hospital> availableHospitals;
        
        System.out.println("📍 사용자 입력 주소: " + userLocation);
        
        // 기본 병원 목록 가져오기
        availableHospitals = hospitalService.getAllHospitals();
        
        // 도시명 추출 (검색용)
        String cityName = extractCityNameForSearch(userLocation);
        System.out.println("🔍 추출된 도시명: " + cityName);
        
        // 주소에서 구 단위 추출 (예: "대전광역시 유성구 궁동" → "유성구")
        String districtName = extractDistrictName(userLocation);
        System.out.println("🔍 추출된 구명: " + (districtName != null ? districtName : "없음"));
        
        // 도시별 필터링 (도시명이 포함된 병원만 선택)
        List<Hospital> cityHospitals = availableHospitals.stream()
            .filter(h -> {
                if (h.getCity() == null) return false;
                String hospitalCity = h.getCity().toLowerCase();
                String searchCity = cityName.toLowerCase();
                String userLocationLower = userLocation.toLowerCase();
                
                // 1. 구 단위가 있으면 구 단위로 먼저 필터링
                if (districtName != null && !districtName.isEmpty()) {
                    String districtLower = districtName.toLowerCase();
                    if (hospitalCity.contains(districtLower)) {
                        return true;
                    }
                }
                
                // 2. 주소에 구가 포함되어 있으면 구로 매칭 (예: "유성구" → "대전광역시 유성구")
                if (userLocationLower.contains("구")) {
                    // 주소에서 구 추출 (예: "유성구", "중구" 등)
                    String[] parts = userLocationLower.split("구");
                    if (parts.length > 0) {
                        String extractedDistrict = parts[0].trim();
                        if (!extractedDistrict.isEmpty()) {
                            String districtWithGu = extractedDistrict + "구";
                            if (hospitalCity.contains(districtWithGu)) {
                                return true;
                            }
                        }
                    }
                }
                
                // 3. 도시명 매칭 (예: "대전" → "대전광역시", "대전 유성구" 등)
                if (hospitalCity.contains(searchCity)) {
                    return true;
                }
                
                // 4. 역방향 매칭 (예: "대전" 검색 시 "대전광역시 유성구" 매칭)
                if (searchCity.contains(hospitalCity.split(" ")[0])) {
                    return true;
                }
                
                return false;
            })
            .collect(java.util.stream.Collectors.toList());
        
        System.out.println("✅ 도시별 필터링 결과: " + cityHospitals.size() + "개 (전체 " + availableHospitals.size() + "개 중)");
        
        // 도시별 병원이 있으면 사용, 없으면 전체 병원 사용
        if (!cityHospitals.isEmpty()) {
            availableHospitals = cityHospitals;
        } else {
            System.out.println("⚠️ 해당 도시의 병원이 없어 전체 병원 목록을 사용합니다.");
        }
        
        // 사용자 좌표 계산 (거리 계산용)
        Double userLatitude = null;
        Double userLongitude = null;
        
        // 주요 도시의 대략적인 중심 좌표
        if (userLocation.contains("서울")) {
            userLatitude = 37.5665;
            userLongitude = 126.9780;
        } else if (userLocation.contains("대전")) {
            userLatitude = 36.3504;
            userLongitude = 127.3845;
        } else if (userLocation.contains("부산")) {
            userLatitude = 35.1796;
            userLongitude = 129.0756;
        } else if (userLocation.contains("인천")) {
            userLatitude = 37.4563;
            userLongitude = 126.7052;
        } else if (userLocation.contains("광주")) {
            userLatitude = 35.1595;
            userLongitude = 126.8526;
        } else if (userLocation.contains("대구")) {
            userLatitude = 35.8714;
            userLongitude = 128.6014;
        } else if (userLocation.contains("울산")) {
            userLatitude = 35.5384;
            userLongitude = 129.3114;
        } else if (userLocation.contains("세종")) {
            userLatitude = 36.4800;
            userLongitude = 127.2890;
        } else {
            // 기본값 (서울)
            userLatitude = 37.5665;
            userLongitude = 126.9780;
        }
        
        // 실제 좌표 기반 거리 계산
        String recommendedDept = analysisResult.getRecommendedDepartment();
        
        // 각 병원까지의 실제 거리 계산
        for (Hospital hospital : availableHospitals) {
            if (hospital.getLatitude() != null && hospital.getLongitude() != null) {
                // Haversine 공식으로 실제 거리 계산
                double distance = HospitalService.calculateDistance(
                    userLatitude, 
                    userLongitude, 
                    hospital.getLatitude(), 
                    hospital.getLongitude()
                );
                
                // 진료과가 일치하면 거리를 약간 줄여서 우선순위 높임
                if (recommendedDept != null && hospital.getDepartments().contains(recommendedDept)) {
                    distance = distance * 0.8; // 20% 감소
                }
                
                hospital.setDistanceKm(distance);
            } else {
                // 좌표가 없으면 큰 값으로 설정 (우선순위 낮음)
                hospital.setDistanceKm(Double.MAX_VALUE);
            }
        }
        
        // 거리순으로 정렬 (진료과 일치 병원이 앞에 오도록)
        availableHospitals.sort((h1, h2) -> {
            Double d1 = h1.getDistanceKm() != null ? h1.getDistanceKm() : Double.MAX_VALUE;
            Double d2 = h2.getDistanceKm() != null ? h2.getDistanceKm() : Double.MAX_VALUE;
            return d1.compareTo(d2);
        });
        
        // 5. AI2 호출: 병원 추천
        HospitalRecommendation recommendation = aiService.recommendHospitals(
                analysisResult, 
                userLocation, 
                availableHospitals
        );
        
        return recommendation;
    }
    
    /**
     * 주소에서 검색에 사용할 도시명 추출
     * @param locationCity 사용자가 입력한 주소 (예: "서울특별시 강남구", "세종특별자치시")
     * @return 검색에 사용할 도시명 (예: "서울", "세종")
     */
    private String extractCityNameForSearch(String locationCity) {
        if (locationCity == null || locationCity.trim().isEmpty()) {
            return "서울"; // 기본값
        }
        
        String city = locationCity.trim();
        
        // 주요 도시명 매핑
        if (city.contains("서울")) {
            return "서울";
        } else if (city.contains("부산")) {
            return "부산";
        } else if (city.contains("대구")) {
            return "대구";
        } else if (city.contains("인천")) {
            return "인천";
        } else if (city.contains("광주")) {
            return "광주";
        } else if (city.contains("대전")) {
            return "대전";
        } else if (city.contains("울산")) {
            return "울산";
        } else if (city.contains("세종")) {
            return "세종";
        } else if (city.contains("경기")) {
            return "경기";
        } else if (city.contains("강원")) {
            return "강원";
        } else if (city.contains("충북") || city.contains("충청북도")) {
            return "충북";
        } else if (city.contains("충남") || city.contains("충청남도")) {
            return "충남";
        } else if (city.contains("전북") || city.contains("전라북도")) {
            return "전북";
        } else if (city.contains("전남") || city.contains("전라남도")) {
            return "전남";
        } else if (city.contains("경북") || city.contains("경상북도")) {
            return "경북";
        } else if (city.contains("경남") || city.contains("경상남도")) {
            return "경남";
        } else if (city.contains("제주")) {
            return "제주";
        }
        
        // 매핑되지 않은 경우, "특별자치시", "광역시", "특별시", "시", "도" 등 제거
        String simplified = city.replace("특별자치시", "")
                               .replace("광역시", "")
                               .replace("특별시", "")
                               .replace("시", "")
                               .replace("도", "")
                               .trim();
        
        // 공백으로 분리하여 첫 번째 단어만 사용 (예: "서울특별시 강남구" → "서울")
        String[] parts = simplified.split("\\s+");
        if (parts.length > 0 && !parts[0].isEmpty()) {
            return parts[0];
        }
        
        return simplified.isEmpty() ? "서울" : simplified;
    }
    
    /**
     * 주소에서 구 단위 추출 (예: "대전광역시 유성구 궁동" → "유성구")
     */
    private String extractDistrictName(String locationCity) {
        if (locationCity == null || locationCity.isEmpty()) {
            return null;
        }
        
        // "구"가 포함되어 있는지 확인
        if (locationCity.contains("구")) {
            // 공백으로 분리
            String[] parts = locationCity.split("\\s+");
            for (String part : parts) {
                if (part.contains("구") && !part.equals("구")) {
                    // "구" 앞의 단어와 함께 반환 (예: "유성구")
                    return part;
                }
            }
            
            // 공백으로 분리되지 않은 경우 직접 추출
            int guIndex = locationCity.indexOf("구");
            if (guIndex > 0) {
                // "구" 앞의 몇 글자 추출 (최대 5글자)
                int startIndex = Math.max(0, guIndex - 5);
                String district = locationCity.substring(startIndex, guIndex + 1);
                // 앞뒤 공백 제거
                return district.trim();
            }
        }
        
        return null;
    }
}

