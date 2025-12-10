package com.boot.kakao.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.boot.kakao.dto.KakaoTokenResponse;
import com.boot.kakao.dto.KakaoUserInfo;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class KakaoOAuthService {

    @Value("${kakao.client.id}")
    private String clientId;

    @Value("${kakao.redirect.uri}")
    private String redirectUri;

    @Value("${kakao.token.url}")
    private String tokenUrl;

    @Value("${kakao.userinfo.url}")
    private String userInfoUrl;
    
//    @Value("${kakao.client.secret}")
//    private String clientSecret; 
    
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 1. (code)를 받아 (Access Token) 요청
     */
    public String getKakaoAccessToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
//        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<KakaoTokenResponse> response = restTemplate.postForEntity(tokenUrl, request, KakaoTokenResponse.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                String accessToken = response.getBody().getAccess_token();
                log.info("@# Kakao Access Token: {}", accessToken);
                return accessToken;
            } else {
                log.error("@# Kakao 토큰 요청 실패: {}", response.getBody());
                throw new RuntimeException("카카오 토큰 요청 실패");
            }
        } catch (Exception e) {
            log.error("@# Kakao 토큰 요청 중 예외 발생", e);
            throw new RuntimeException("카카오 토큰 요청 중 오류 발생", e);
        }
    }

    /**
     * 2. (Access Token)으로 사용자 정보 요청
     */
    public KakaoUserInfo getKakaoUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<String> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<KakaoUserInfo> response = restTemplate.exchange(
                    userInfoUrl,
                    HttpMethod.GET,
                    request,
                    KakaoUserInfo.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                KakaoUserInfo userInfo = response.getBody();
                log.info("@# Kakao User Info: id={}, email={}", userInfo.getId(), userInfo.getEmail());
                return userInfo;
            } else {
                log.error("@# Kakao 사용자 정보 요청 실패: {}", response.getBody());
                throw new RuntimeException("카카오 사용자 정보 요청 실패");
            }
        } catch (Exception e) {
            log.error("@# Kakao 사용자 정보 요청 중 예외 발생", e);
            throw new RuntimeException("카카오 사용자 정보 요청 중 오류 발생", e);
        }
    }
}