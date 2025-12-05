package com.boot.login.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class NaverLoginService {

    private static final Logger logger = LoggerFactory.getLogger(NaverLoginService.class);

    @Value("${naver.client.id}")
    private String clientId;

    @Value("${naver.client.secret}")
    private String clientSecret;

    @Value("${naver.client.redirect-uri}")
    private String redirectUri;

    private final String NAVER_TOKEN_URI = "https://nid.naver.com/oauth2.0/token";
    private final String NAVER_USER_INFO_URI = "https://openapi.naver.com/v1/nid/me";

    @Autowired
    private RestTemplate restTemplate;

    public String getAccessToken(String code, String state) {
        logger.info("Getting access token with code: {}", code);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("code", code);
        params.add("state", state);
        params.add("redirect_uri", redirectUri);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        
        ResponseEntity<Map> response = restTemplate.postForEntity(NAVER_TOKEN_URI, request, Map.class);
        
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            String accessToken = (String) response.getBody().get("access_token");
            logger.info("Successfully obtained access token");
            return accessToken;
        }
        logger.error("Failed to get access token. Response: {}", response.getBody());
        throw new RuntimeException("네이버 로그인 실패: 토큰 발급 실패");
    }

    public Map<String, Object> getUserInfo(String accessToken) {
        logger.info("Getting user info with access token");
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(
            NAVER_USER_INFO_URI,
            HttpMethod.GET,
            entity,
            Map.class
        );
        
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            Map<String, Object> userInfo = (Map<String, Object>) response.getBody().get("response");
            logger.info("Successfully retrieved user info");
            return userInfo;
        }
        logger.error("Failed to get user info. Response: {}", response.getBody());
        throw new RuntimeException("사용자 정보 조회 실패");
    }
}
