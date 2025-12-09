package com.boot.naver.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * 네이버 토큰 API (access_token) 응답을 매핑할 DTO
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true) // 모르는 필드는 무시
public class NaverTokenResponse {
    private String access_token;
    private int expires_in;
    private String scope;
    private String token_type;
    private String refresh_token;  // 네이버는 refresh_token을 반환함
}
