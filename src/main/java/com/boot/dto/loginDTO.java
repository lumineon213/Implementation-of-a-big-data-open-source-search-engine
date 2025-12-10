package com.boot.dto;

import lombok.Data;

@Data
public class loginDTO {

	
	 private String accountId;
	    private String accountPw;
	    private String accountName;
	    private String email;
	    private String phoneNumber;
	    private String accountRole;
	    private String regDate;
	    
	    private String socialType;  
	    private String socialId;
	    
	
	    private String status;                // WAIT or ACTIVE

	    private String resetToken;            // 비밀번호 변경 토큰
	    private String resetTokenExpire;      // 토큰 만료시간

	    private String emailVerifyToken;      // 이메일 인증 토큰
	    private String emailVerifyExpire;     // 토큰 만료시간
	    
}