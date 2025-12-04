package com.boot.mypage.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.mypage.dao.MyPageDAO;
import com.boot.mypage.dto.MyPageDTO;

@Service
public class MyPageServiceImpl implements MyPageService {

    @Autowired
    private MyPageDAO dao;

    @Override
    public MyPageDTO getMyInfo(String accountId) {
        return dao.getMyInfo(accountId);
    }

    @Override
    public int updateMyInfo(MyPageDTO dto) {
        return dao.updateMyInfo(dto);
    }
}
