package com.boot.mypage.service;

import com.boot.mypage.dto.MyPageDTO;
import org.springframework.web.multipart.MultipartFile;

public interface MyPageService {

    MyPageDTO getMyInfo(String accountId);

    int updateMyInfo(MyPageDTO dto, MultipartFile profileImage);
}
