package com.petcare.service;

import com.petcare.model.Reservation;
import com.petcare.util.FileDataManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReservationService {
    
    private static final String RESERVATIONS_FILE = "reservations.json";
    
    @Autowired
    private FileDataManager fileDataManager;
    
    public Reservation createReservation(Reservation reservation) throws IOException {
        reservation.setId(UUID.randomUUID().toString());
        reservation.setStatus("pending");
        List<Reservation> reservations = getAllReservations();
        reservations.add(reservation);
        fileDataManager.saveListToFile(RESERVATIONS_FILE, reservations);
        return reservation;
    }
    
    public Reservation getReservationById(String id) throws IOException {
        return getAllReservations().stream()
                .filter(r -> r.getId().equals(id))
                .findFirst()
                .orElse(null);
    }
    
    public List<Reservation> getAllReservations() throws IOException {
        return fileDataManager.loadListFromFile(RESERVATIONS_FILE, Reservation.class);
    }
    
    public List<Reservation> getReservationsByPetId(String petId) throws IOException {
        return getAllReservations().stream()
                .filter(r -> r.getPetId().equals(petId))
                .collect(Collectors.toList());
    }
}

