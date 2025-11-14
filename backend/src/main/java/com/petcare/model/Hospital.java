package com.petcare.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hospital {
    private String id;
    private String name;
    private String address;
    private String city;
    private Double latitude;
    private Double longitude;
    private List<String> departments; // 내과, 외과, 정형외과, 피부과 등
    private String operatingHours; // "09:00~19:00" 또는 "24시간"
    private String phone;
    private String description;
    private Double distanceKm; // 사용자로부터의 거리 (계산된 값)
}

