package com.petcare.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {
    private String id;
    private String petId;
    private String hospitalId;
    private LocalDateTime reservationDateTime;
    private String status; // pending, confirmed, cancelled
    private String notes; // 특이사항
    private String ownerName;
    private String ownerPhone;
}

