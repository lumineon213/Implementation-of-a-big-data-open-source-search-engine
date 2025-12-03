package com.boot.mypage.service;

import com.boot.mypage.dto.MyPageDTO;

public interface MyPageService {

    MyPageDTO getMyInfo(String accountId);

    int updateMyInfo(MyPageDTO dto);
}
