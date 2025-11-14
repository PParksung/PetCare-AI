package com.petcare.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResult {
    private String petId;
    private String symptomId;
    private List<DiseaseCandidate> diseaseCandidates;
    private String urgencyLevel; // low, medium, high, emergency
    private String category; // 소화기, 호흡기, 정형외과, 피부과 등
    private String recommendedDepartment; // 추천 진료과
    private String detailedAnalysis; // 상세 분석 설명
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiseaseCandidate {
        private String name; // 질환명
        private String description; // 상세 설명
        private String symptoms; // 주요 증상들
        private String cause; // 발생 원인
        private String treatment; // 치료 방법
        private String prevention; // 예방 방법
        private Double probability; // 가능성 (0.0 ~ 1.0)
    }
}

