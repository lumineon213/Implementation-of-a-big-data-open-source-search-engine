package com.boot.reservation.dao;

import com.boot.reservation.dto.ReservationDTO;
import com.boot.reservation.dto.ReservationHistoryDTO;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ReservationDAO {
	void insertReservation(ReservationDTO reservationDTO);
	List<ReservationHistoryDTO> selectReservationHistoryByAccountId(String accountId);
}
