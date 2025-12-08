package com.boot.service;

import com.boot.dto.loginDTO;

public interface loginService {

    int signup(loginDTO dto);

    boolean emailCheck(String email);

    boolean phoneCheck(String phoneNumber);

    loginDTO login(String accountId, String accountPw);
    
    loginDTO findOrCreateSocialUser(String type, String socialId, String email, String name);

}
