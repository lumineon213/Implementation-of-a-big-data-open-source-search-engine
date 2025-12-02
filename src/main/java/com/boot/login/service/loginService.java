package com.boot.login.service;

import com.boot.login.dto.loginDTO;

public interface loginService {

	 int signup(loginDTO dto);
	    boolean emailCheck(String email); 
	    boolean phoneCheck(String phoneNumber);  
	    loginDTO login(String accountId, String accountPw);
}