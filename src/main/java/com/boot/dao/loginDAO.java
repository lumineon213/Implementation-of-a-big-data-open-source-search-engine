package com.boot.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.boot.dto.loginDTO;

@Mapper
public interface loginDAO {

    int signup(loginDTO dto);

    int emailCheck(@Param("email") String email);

    int phoneCheck(@Param("phoneNumber") String phoneNumber);


    loginDTO login(@Param("accountId") String accountId,
            @Param("accountPw") String accountPw);
    
    loginDTO findById(@Param("accountId") String accountId);
    
    loginDTO findSocialUser(@Param("socialType") String socialType,
            @Param("socialId") String socialId);
    
    int insertSocial(loginDTO dto);
}
