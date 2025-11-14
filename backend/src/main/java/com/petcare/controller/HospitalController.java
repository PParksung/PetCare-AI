package com.petcare.controller;

import com.petcare.model.Hospital;
import com.petcare.service.HospitalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
@CrossOrigin(origins = "*")
public class HospitalController {
    
    @Autowired
    private HospitalService hospitalService;
    
    @GetMapping
    public ResponseEntity<List<Hospital>> getAllHospitals(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String department) {
        try {
            List<Hospital> hospitals;
            if (city != null) {
                hospitals = hospitalService.getHospitalsByCity(city);
            } else if (department != null) {
                hospitals = hospitalService.getHospitalsByDepartment(department);
            } else {
                hospitals = hospitalService.getAllHospitals();
            }
            return ResponseEntity.ok(hospitals);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Hospital> getHospital(@PathVariable String id) {
        try {
            Hospital hospital = hospitalService.getHospitalById(id);
            if (hospital != null) {
                return ResponseEntity.ok(hospital);
            }
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

