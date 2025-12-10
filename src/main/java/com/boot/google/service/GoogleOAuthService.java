package com.boot.google.service;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.boot.google.dto.GoogleTokenResponse;
import com.boot.google.dto.GoogleUserInfo;

import lombok.extern.slf4j.Slf4j;

/**
 * 구글 API와 실제 통신을 담당하는 서비스
 */
@Service
@Slf4j
public class GoogleOAuthService {

    // application.properties에서 값 주입
    @Value("${google.client.id}")
    private String clientId;

    @Value("${google.client.secret}")
    private String clientSecret;

    @Value("${google.redirect.uri}")
    private String redirectUri;

    @Value("${google.token.url}")
    private String tokenUrl;

    @Value("${google.userinfo.url}")
    private String userInfoUrl;

    @Autowired
    private RestTemplate restTemplate;

    /**
     * 1. (code)를 받아 (Access Token) 요청
     */
    public String getGoogleAccessToken(String code) {
        // 1-1. 헤더 설정 (Content-Type: form-urlencoded)
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // 1-2. 바디(파라미터) 설정
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("grant_type", "authorization_code");

        // 1-3. HTTP 요청 엔티티 생성
        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, headers);

        // 1-4. API 요청 (POST)
        try {
            ResponseEntity<GoogleTokenResponse> responseEntity = restTemplate.postForEntity(tokenUrl, requestEntity, GoogleTokenResponse.class);
            
            if (responseEntity.getStatusCode().is2xxSuccessful()) {
                String accessToken = responseEntity.getBody().getAccess_token();
                log.info("@# Google Access Token: {}", accessToken);
                return accessToken;
            } else {
                log.error("@# Google 토큰 요청 실패: {}", responseEntity.getBody());
                throw new RuntimeException("구글 토큰 요청에 실패했습니다.");
            }
        } catch (Exception e) {
            log.error("@# Google 토큰 요청 중 예외 발생", e);
            throw new RuntimeException("구글 토큰 요청 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 2. (Access Token)으로 (사용자 정보) 요청
     */
    public GoogleUserInfo getGoogleUserInfo(String accessToken) {
        // 2-1. 헤더 설정 (Authorization: Bearer 토큰)
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        // 2-2. HTTP 요청 엔티티 생성
        HttpEntity<String> requestEntity = new HttpEntity<>(headers);

        // 2-3. API 요청 (GET)
        try {
            ResponseEntity<GoogleUserInfo> responseEntity = restTemplate.exchange(
                    userInfoUrl, 
                    HttpMethod.GET, 
                    requestEntity, 
                    GoogleUserInfo.class
            );

            if (responseEntity.getStatusCode().is2xxSuccessful()) {
                GoogleUserInfo userInfo = responseEntity.getBody();
                log.info("@# Google User Info: id={}, email={}", userInfo.getId(), userInfo.getEmail());
                return userInfo;
            } else {
                log.error("@# Google 사용자 정보 요청 실패: {}", responseEntity.getBody());
                throw new RuntimeException("구글 사용자 정보 요청에 실패했습니다.");
            }
        } catch (Exception e) {
            log.error("@# Google 사용자 정보 요청 중 예외 발생", e);
            throw new RuntimeException("구글 사용자 정보 요청 중 오류가 발생했습니다.", e);
        }
    }
}

