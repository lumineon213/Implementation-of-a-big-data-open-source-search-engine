package com.boot.service;

public interface SocialLoginService {

    String kakaoLogin(String code);

    String googleLogin(String code);

    String naverLogin(String code);

}
