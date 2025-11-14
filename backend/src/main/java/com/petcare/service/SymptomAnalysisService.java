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
        
        // 4. 사용자 위치 기반 병원 조회
        String userLocation = pet.getLocationCity();
        List<Hospital> availableHospitals = hospitalService.getHospitalsByCity(userLocation);
        
        // 추천 진료과가 있으면 해당 과목 병원 필터링
        if (analysisResult.getRecommendedDepartment() != null) {
            availableHospitals = availableHospitals.stream()
                    .filter(h -> h.getDepartments().contains(analysisResult.getRecommendedDepartment()))
                    .collect(java.util.stream.Collectors.toList());
        }
        
        // 거리 계산 (간단한 예시 - 실제로는 좌표 기반 계산 필요)
        for (Hospital hospital : availableHospitals) {
            // TODO: 실제 좌표 기반 거리 계산 구현
            hospital.setDistanceKm(Math.random() * 10); // 임시
        }
        
        // 5. AI2 호출: 병원 추천
        HospitalRecommendation recommendation = aiService.recommendHospitals(
                analysisResult, 
                userLocation, 
                availableHospitals
        );
        
        return recommendation;
    }
}

