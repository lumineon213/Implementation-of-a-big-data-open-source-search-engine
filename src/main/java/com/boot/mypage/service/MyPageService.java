package com.boot.mypage.service;

import java.util.List;

import com.boot.mypage.dto.MyPageDTO;
import com.boot.reservation.dto.ReservationHistoryDTO;

public interface MyPageService {

    MyPageDTO getMyInfo(String accountId);

    int updateMyInfo(MyPageDTO dto);
    
    //숙소 예약 조회
    List<ReservationHistoryDTO> getReservationHistory(String accountId);
}
