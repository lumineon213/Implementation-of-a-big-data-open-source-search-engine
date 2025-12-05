package com.boot.login.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.boot.login.dto.loginDTO;
import java.util.Map;

@Mapper
public interface loginDAO {
    
  
    int signup(loginDTO dto);
    
   
    int emailCheck(@Param("email") String email);
    
    
    int phoneCheck(@Param("phoneNumber") String phoneNumber);
    
    
    loginDTO login(@Param("accountId") String accountId, 
                   @Param("accountPw") String accountPw);
    
    // 네이버 로그인을 위한 메서드 추가
    loginDTO findByEmail(@Param("email") String email);
    
    // 네이버 회원가입
    int naverSignup(@Param("accountId") String accountId,
                    @Param("accountName") String accountName,
                    @Param("email") String email,
                    @Param("provider") String provider);
}