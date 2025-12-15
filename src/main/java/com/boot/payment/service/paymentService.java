package com.boot.payment.service;

import java.util.Map;

import com.boot.reservation.dto.ReservationDTO;

public interface paymentService {
	Map<String, Object> confirmPayment(ReservationDTO requestDTO);
	
	String getPlaceNameByContentId(String contentId);
}
