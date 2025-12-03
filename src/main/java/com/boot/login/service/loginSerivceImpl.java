package com.boot.login.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.boot.login.dao.loginDAO;
import com.boot.login.dto.loginDTO;

@Service 
public class loginSerivceImpl implements loginService {

    @Autowired
    private loginDAO dao;
   
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public int signup(loginDTO dto) {
        dto.setAccountPw(passwordEncoder.encode(dto.getAccountPw()));
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

        loginDTO user = dao.findById(accountId);

        if (user == null) return null; // 아이디 없음
        
        if (!passwordEncoder.matches(accountPw, user.getAccountPw()))
            return null; // 비밀번호 불일치

        return user;
    }
}
