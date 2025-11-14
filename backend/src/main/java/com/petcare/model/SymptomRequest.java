package com.petcare.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SymptomRequest {
    private String petId;
    private String mainComplaint; // 자연어 증상 설명
    private Integer onsetHoursAgo; // 증상 시작 후 경과 시간
    private List<String> selectedSymptoms; // 선택한 증상 리스트
    private EmergencyFlags emergencyFlags;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmergencyFlags {
        private Boolean difficultyBreathing;
        private Boolean continuousVomiting;
        private Boolean cannotStand;
        private Boolean lossOfConsciousness;
        private Boolean severeBleeding;
    }
}

