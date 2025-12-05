package com.boot.login.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.login.dao.loginDAO;
import com.boot.login.dto.loginDTO;
import java.util.Map;

@Service 
public class loginSerivceImpl implements loginService {

	   @Autowired
	    private loginDAO dao;
	    
	    @Override
	    public int signup(loginDTO dto) {
	        return dao.signup(dto);
	    }
	    
	    @Override
	    public boolean emailCheck(String email) {
	        return dao.emailCheck(email) > 0;  // int를 boolean으로 변환
	    }
	    
	    @Override
	    public boolean phoneCheck(String phoneNumber) {
	        return dao.phoneCheck(phoneNumber) > 0;  // int를 boolean으로 변환
	    }
	    
	    @Override
	    public loginDTO login(String accountId, String accountPw) {
	        return dao.login(accountId, accountPw);
	    }
	    
	    @Override
	    public loginDTO processNaverLogin(Map<String, Object> userInfo) {
	        String email = (String) userInfo.get("email");
	        String name = (String) userInfo.get("name");
	        String id = (String) userInfo.get("id");
	        
	        // 이메일로 기존 사용자 확인
	        loginDTO user = dao.findByEmail(email);
	        
	        if (user == null) {
	            // 신규 사용자 - 자동 회원가입
	            String accountId = "naver_" + id;
	            dao.naverSignup(accountId, name, email, "naver");
	            user = dao.findByEmail(email);
	        }
	        
	        return user;
	    }
}