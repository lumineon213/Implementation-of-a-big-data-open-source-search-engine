package com.boot.mypage.dao;

import org.apache.ibatis.annotations.Mapper;
import com.boot.mypage.dto.MyPageDTO;

@Mapper
public interface MyPageDAO {

    MyPageDTO getMyInfo(String accountId);

    int updateMyInfo(MyPageDTO dto);
}
