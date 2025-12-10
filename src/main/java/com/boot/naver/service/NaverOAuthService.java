package com.boot.naver.service;

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

import com.boot.naver.dto.NaverResponseWrapper;
import com.boot.naver.dto.NaverTokenResponse;
import com.boot.naver.dto.NaverUserInfo;

import lombok.extern.slf4j.Slf4j;

/**
 * 네이버 API와 실제 통신을 담당하는 서비스
 */
@Service
@Slf4j
public class NaverOAuthService {

    // application.properties에서 값 주입
    @Value("${naver.client.id}")
    private String clientId;

    @Value("${naver.client.secret}")
    private String clientSecret;

    @Value("${naver.redirect.uri}")
    private String redirectUri;

    @Value("${naver.token.url}")
    private String tokenUrl;

    @Value("${naver.userinfo.url}")
    private String userInfoUrl;

    @Autowired
    private RestTemplate restTemplate;

    /**
     * 1. (code)를 받아 (Access Token) 요청
     */
    public String getNaverAccessToken(String code) {
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
            ResponseEntity<NaverTokenResponse> responseEntity = restTemplate.postForEntity(tokenUrl, requestEntity, NaverTokenResponse.class);

            if (responseEntity.getStatusCode().is2xxSuccessful()) {
                String accessToken = responseEntity.getBody().getAccess_token();
                log.info("@# Naver Access Token: {}", accessToken);
                return accessToken;
            } else {
                log.error("@# 네이버 토큰 요청 실패: {}", responseEntity.getBody());
                throw new RuntimeException("네이버 토큰 요청에 실패했습니다.");
            }
        } catch (Exception e) {
            log.error("@# 네이버 토큰 요청 중 예외 발생", e);
            throw new RuntimeException("네이버 토큰 요청 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 2. (Access Token)으로 (사용자 정보) 요청
     */
    public NaverUserInfo getNaverUserInfo(String accessToken) {
        // 2-1. 헤더 설정 (Authorization: Bearer 토큰)
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        // 2-2. HTTP 요청 엔티티 생성
        HttpEntity<String> requestEntity = new HttpEntity<>(headers);

        // 2-3. API 요청 (GET)
        try {
            // DTO 타입을 NaverResponseWrapper.class로 변경합니다.
            ResponseEntity<NaverResponseWrapper> responseEntity = restTemplate.exchange(
                    userInfoUrl,
                    HttpMethod.GET,
                    requestEntity,
                    NaverResponseWrapper.class
            );

            if (responseEntity.getStatusCode().is2xxSuccessful()) {
                // 응답 본체에서 response 필드에 있는 NaverUserInfo를 추출합니다.
                NaverUserInfo userInfo = responseEntity.getBody().getResponse();
                
                // 만약 userInfo가 null이면 예외 처리 (네이버에서 동의 항목을 안 줬을 경우 등)
                if (userInfo == null) {
                    log.error("@# 네이버 사용자 정보 요청 실패: response 필드가 null입니다. API 권한 확인 필요.");
                    throw new RuntimeException("네이버 사용자 정보 요청에 실패했습니다. (응답 구조 오류)");
                }

                log.info("@# 네이버 사용자 정보: id={}, email={}", userInfo.getId(), userInfo.getEmail());
                return userInfo;
            } else {
                log.error("@# 네이버 사용자 정보 요청 실패: {}", responseEntity.getBody());
                throw new RuntimeException("네이버 사용자 정보 요청에 실패했습니다.");
            }
        } catch (Exception e) {
            log.error("@# 네이버 사용자 정보 요청 중 예외 발생", e);
            throw new RuntimeException("네이버 사용자 정보 요청 중 오류가 발생했습니다.", e);
        }
    }
}
