package com.boot.login.service;

import com.boot.login.dto.loginDTO;
import java.util.Map;

public interface loginService {

	 int signup(loginDTO dto);
    boolean emailCheck(String email); 
    boolean phoneCheck(String phoneNumber);  
    loginDTO login(String accountId, String accountPw);
    
    // 네이버 로그인 처리
    loginDTO processNaverLogin(Map<String, Object> userInfo);
}