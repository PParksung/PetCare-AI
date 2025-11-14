package com.petcare.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pet {
    private String id;
    private String name;
    private String type; // dog, cat, etc.
    private Integer ageYears;
    private Double weightKg;
    private String ownerName;
    private String ownerPhone;
    private String locationCity;
    private String locationCountry;
    private String imagePath; // 이미지 파일 경로
}

