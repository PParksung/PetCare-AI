package com.petcare.service;

import com.petcare.model.Hospital;
import com.petcare.util.FileDataManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HospitalService {
    
    private static final String HOSPITALS_FILE = "hospitals.json";
    
    @Autowired
    private FileDataManager fileDataManager;
    
    public HospitalService() {
        // hospitals.json 파일에서 병원 데이터를 로드합니다.
    }
    
    public List<Hospital> getAllHospitals() throws IOException {
        List<Hospital> hospitals = fileDataManager.loadListFromFile(HOSPITALS_FILE, Hospital.class);
        if (hospitals.isEmpty()) {
            // 초기 데이터가 없으면 샘플 데이터 생성
            hospitals = createSampleHospitals();
            fileDataManager.saveListToFile(HOSPITALS_FILE, hospitals);
        }
        return hospitals;
    }
    
    public Hospital getHospitalById(String id) throws IOException {
        return getAllHospitals().stream()
                .filter(h -> h.getId().equals(id))
                .findFirst()
                .orElse(null);
    }
    
    public List<Hospital> getHospitalsByDepartment(String department) throws IOException {
        return getAllHospitals().stream()
                .filter(h -> h.getDepartments().contains(department))
                .collect(Collectors.toList());
    }
    
    public List<Hospital> getHospitalsByCity(String city) throws IOException {
        return getAllHospitals().stream()
                .filter(h -> h.getCity().equals(city))
                .collect(Collectors.toList());
    }
    
    /**
     * 두 좌표 간의 거리 계산 (Haversine 공식)
     * @return 거리 (km)
     */
    public static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // 지구 반지름 (km)
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }
    
    private List<Hospital> createSampleHospitals() {
        List<Hospital> hospitals = new java.util.ArrayList<>();
        
        hospitals.add(new Hospital(
            "hosp_001",
            "강남 24시 동물병원",
            "서울특별시 강남구 테헤란로 123",
            "서울특별시 강남구",
            37.5012,
            127.0395,
            List.of("내과", "외과", "응급의학과"),
            "24시간",
            "02-1234-5678",
            "24시간 응급 진료 가능, 내시경 장비 보유",
            0.0
        ));
        
        hospitals.add(new Hospital(
            "hosp_002",
            "서초 동물의료센터",
            "서울특별시 서초구 서초대로 456",
            "서울특별시 서초구",
            37.4838,
            127.0324,
            List.of("내과", "정형외과", "피부과"),
            "09:00~19:00",
            "02-2345-6789",
            "정형외과 전문, CT/MRI 장비 보유",
            0.0
        ));
        
        hospitals.add(new Hospital(
            "hosp_003",
            "대전 유성 동물병원",
            "대전광역시 유성구 대학로 789",
            "대전광역시 유성구",
            36.3628,
            127.3566,
            List.of("내과", "외과"),
            "09:00~18:00",
            "042-3456-7890",
            "소화기 내과 전문",
            0.0
        ));
        
        return hospitals;
    }
}

