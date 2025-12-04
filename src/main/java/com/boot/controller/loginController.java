package com.boot.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
<<<<<<< Updated upstream
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boot.dto.loginDTO;
import com.boot.service.loginService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/login")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true" // ⭐ React <-> Spring 세션 공유 허용
)
=======
import org.springframework.web.bind.annotation.*;

import com.boot.dto.loginDTO;
import com.boot.security.JwtUtil;
import com.boot.service.loginService;

@RestController
@RequestMapping("/api/login")
//@CrossOrigin(origins = "http://localhost:5173") 시큐리티에서 적용
>>>>>>> Stashed changes
public class loginController {

    @Autowired
    private loginService service;

<<<<<<< Updated upstream
=======
    @Autowired
    private JwtUtil jwtUtil;


>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
    // 로그인 (세션 저장)
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody loginDTO dto, HttpSession session) {

        loginDTO user = service.login(dto.getAccountId(), dto.getAccountPw());

        if(user == null) {
            return Map.of("success", false, "msg", "아이디 또는 비밀번호 오류");
        }

        // ⭐ Spring 서버 세션에 로그인 정보 저장
        session.setAttribute("loginUser", user);
        session.setMaxInactiveInterval(60 * 60); // 1시간 유지

        return Map.of(
                "success", true,
                "user", user
        );
    }

    // 세션 기반 로그인 여부 확인
    @GetMapping("/check")
    public Map<String, Object> checkLogin(HttpSession session) {
        Object loginUser = session.getAttribute("loginUser");

        if(loginUser == null) {
            return Map.of("isLogin", false);
        }

        return Map.of(
                "isLogin", true,
                "user", loginUser
        );
    }

    // 로그아웃
    @PostMapping("/logout")
    public Map<String, Object> logout(HttpSession session) {
        session.invalidate();
        return Map.of("success", true);
    }
}
=======

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
>>>>>>> Stashed changes
