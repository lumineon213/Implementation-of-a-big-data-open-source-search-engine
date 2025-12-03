package com.boot.login.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.boot.login.dto.loginDTO;

@Mapper
public interface loginDAO {

    int signup(loginDTO dto);

    int emailCheck(@Param("email") String email);

    int phoneCheck(@Param("phoneNumber") String phoneNumber);


    loginDTO login(@Param("accountId") String accountId,
            @Param("accountPw") String accountPw);
    
    loginDTO findById(@Param("accountId") String accountId);
}
