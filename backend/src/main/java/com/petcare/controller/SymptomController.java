package com.petcare.controller;

import com.petcare.model.HospitalRecommendation;
import com.petcare.model.SymptomRequest;
import com.petcare.service.SymptomAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/symptoms")
@CrossOrigin(origins = "*")
public class SymptomController {
    
    @Autowired
    private SymptomAnalysisService symptomAnalysisService;
    
    @PostMapping("/analyze")
    public ResponseEntity<HospitalRecommendation> analyzeSymptoms(@RequestBody SymptomRequest symptomRequest) {
        try {
            HospitalRecommendation recommendation = symptomAnalysisService.analyzeAndRecommend(symptomRequest);
            return ResponseEntity.ok(recommendation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

