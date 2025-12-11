package com.boot.mypage.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.mypage.dao.MyPageDAO;
import com.boot.mypage.dto.MyPageDTO;
import com.boot.reservation.dao.ReservationDAO;
import com.boot.reservation.dto.ReservationHistoryDTO;

@Service
public class MyPageServiceImpl implements MyPageService {

    @Autowired
    private MyPageDAO dao;
    
    @Autowired
    private ReservationDAO reservationDAO;

    @Override
    public MyPageDTO getMyInfo(String accountId) {
        return dao.getMyInfo(accountId);
    }

    @Override
    public int updateMyInfo(MyPageDTO dto) {
        return dao.updateMyInfo(dto);
    }

	@Override
	public List<ReservationHistoryDTO> getReservationHistory(String accountId) {
		return reservationDAO.selectReservationHistoryByAccountId(accountId);	
	}
}
