package com.boot.login.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.boot.login.dto.loginDTO;
import com.boot.login.service.loginService;
import com.boot.security.JwtUtil;

@RestController
@RequestMapping("/api/login")
@CrossOrigin(origins = "http://localhost:5173")
public class loginController {

    @Autowired
    private loginService service;

    @Autowired
    private JwtUtil jwtUtil;


    // 회원가입
    @PostMapping("/signup")
    public Map<String, Object> signup(@RequestBody loginDTO dto) {

        if(service.emailCheck(dto.getEmail())) {
            return Map.of("success", false, "msg", "이미 존재하는 이메일입니다.");
        }
        if(service.phoneCheck(dto.getPhoneNumber())) {
            return Map.of("success", false, "msg", "이미 존재하는 전화번호입니다.");
        }

        int result = service.signup(dto);
        return Map.of("success", result > 0);
    }


    // 로그인 (JWT 발급)
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody loginDTO dto) {

        loginDTO user = service.login(dto.getAccountId(), dto.getAccountPw());

        if (user == null) {
            return Map.of("success", false, "msg", "아이디 또는 비밀번호 오류");
        }

        // JWT 발급
        String token = jwtUtil.createToken(user.getAccountId());

        return Map.of(
                "success", true,
                "token", token,
                "user", user
        );
    }
}
