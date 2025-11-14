package com.petcare.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalRecommendation {
    private AnalysisResult analysisResult;
    private String userFriendlyMessage; // AI2가 생성한 보호자 안내 메시지
    private String immediateActions; // 즉시 취해야 할 조치사항
    private String watchFor; // 주의 깊게 관찰해야 할 증상들
    private List<RecommendedHospital> recommendedHospitals;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendedHospital {
        private Hospital hospital;
        private String recommendationReason; // 추천 이유
        private Integer priority; // 우선순위 (1, 2, 3...)
    }
}

