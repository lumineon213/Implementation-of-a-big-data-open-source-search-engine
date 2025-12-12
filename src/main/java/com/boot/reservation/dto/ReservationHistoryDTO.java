package com.boot.reservation.dto;

import lombok.Data;
import java.util.Date;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonFormat; 


@Data
public class ReservationHistoryDTO {
    
    private Long reservationId;
    private String contentId;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd", timezone = "Asia/Seoul")
    private Date checkInDate;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd", timezone = "Asia/Seoul")
    private Date checkOutDate;
    private BigDecimal amount;
    
    private String title; 
}