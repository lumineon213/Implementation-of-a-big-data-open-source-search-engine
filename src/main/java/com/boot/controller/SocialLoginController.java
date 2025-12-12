package com.boot.controller;

import java.io.IOException;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.boot.dto.loginDTO;
import com.boot.google.dto.GoogleUserInfo;
import com.boot.google.service.GoogleOAuthService;
import com.boot.kakao.dto.KakaoUserInfo;
import com.boot.kakao.service.KakaoOAuthService;
import com.boot.naver.dto.NaverUserInfo;
import com.boot.naver.service.NaverOAuthService;
import com.boot.security.JwtUtil;
import com.boot.service.loginService;

@RestController
public class SocialLoginController {

    @Autowired
    private loginService service;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private NaverOAuthService naverOAuthService;

    @Autowired
    private GoogleOAuthService googleOAuthService;

    @Autowired
    private KakaoOAuthService kakaoOAuthService;

    /* ================= NAVER ================= */
    @GetMapping("/login/oauth2/code/naver")
    public void naverCallback(@RequestParam("code") String code,
                              @RequestParam("state") String state,
                              HttpServletResponse response) throws IOException {

        String accessToken = naverOAuthService.getNaverAccessToken(code);
        NaverUserInfo naverUser = naverOAuthService.getNaverUserInfo(accessToken);

        loginDTO user = service.findOrCreateSocialUser(
                "naver",
                naverUser.getId(),
                naverUser.getEmail(),
                naverUser.getName()
        );

  
        String token = jwtUtil.createToken(
                user.getAccountId(),
                "USER",
                true
        );

        response.sendRedirect("http://localhost:5173?token=" + token);
    }

    /* ================= GOOGLE ================= */
    @GetMapping("/login/oauth2/code/google")
    public void googleCallback(@RequestParam("code") String code,
                               HttpServletResponse response) throws IOException {

        String accessToken = googleOAuthService.getGoogleAccessToken(code);
        GoogleUserInfo googleUser = googleOAuthService.getGoogleUserInfo(accessToken);

        loginDTO user = service.findOrCreateSocialUser(
                "google",
                googleUser.getId(),
                googleUser.getEmail(),
                googleUser.getName()
        );

        String token = jwtUtil.createToken(
                user.getAccountId(),
                "USER",
                true
        );

        response.sendRedirect("http://localhost:5173?token=" + token);
    }

    /* ================= KAKAO ================= */
    @GetMapping("/oauth2/callback/kakao")
    public void kakaoCallback(@RequestParam("code") String code,
                              HttpServletResponse response) throws IOException {

        String accessToken = kakaoOAuthService.getKakaoAccessToken(code);
        KakaoUserInfo kakaoUser = kakaoOAuthService.getKakaoUserInfo(accessToken);

        loginDTO user = service.findOrCreateSocialUser(
                "kakao",
                String.valueOf(kakaoUser.getId()),
                kakaoUser.getEmail(),
                kakaoUser.getName()
        );

        // ✅ 변경
        String token = jwtUtil.createToken(
                user.getAccountId(),
                "USER",
                true
        );

        response.sendRedirect("http://localhost:5173?token=" + token);
    }
}
