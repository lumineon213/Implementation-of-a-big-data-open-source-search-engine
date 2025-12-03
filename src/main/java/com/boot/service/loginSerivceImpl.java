package com.boot.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.dao.loginDAO;
import com.boot.dto.loginDTO;

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
	        return dao.emailCheck(email) > 0;  
	    }
	    
	    @Override
	    public boolean phoneCheck(String phoneNumber) {
	        return dao.phoneCheck(phoneNumber) > 0;  
	    }
	    
	    @Override
	    public loginDTO login(String accountId, String accountPw) {
	        return dao.login(accountId, accountPw);
}
}