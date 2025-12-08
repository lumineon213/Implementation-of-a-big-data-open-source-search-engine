package com.boot.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class SocialLoginServiceImpl implements SocialLoginService {

    @Value("${kakao.token.url}")
    private String kakaoTokenUrl;

    @Value("${kakao.userinfo.url}")
    private String kakaoUserInfoUrl;

    @Value("${google.token.url}")
    private String googleTokenUrl;

    @Value("${google.userinfo.url}")
    private String googleUserInfoUrl;

    @Value("${naver.token.url}")
    private String naverTokenUrl;

    @Value("${naver.userinfo.url}")
    private String naverUserInfoUrl;

    @Override
    public String kakaoLogin(String code) {
        log.info("카카오 인증 코드: {}", code);
        // TODO: 코드 기반 토큰 요청
        return "카카오 로그인 처리 완료";
    }

    @Override
    public String googleLogin(String code) {
        log.info("구글 인증 코드: {}", code);
        // TODO: 코드 기반 토큰 요청
        return "구글 로그인 처리 완료";
    }

    @Override
    public String naverLogin(String code) {
        log.info("네이버 인증 코드: {}", code);
        // TODO: 코드 기반 토큰 요청
        return "네이버 로그인 처리 완료";
    }
}
