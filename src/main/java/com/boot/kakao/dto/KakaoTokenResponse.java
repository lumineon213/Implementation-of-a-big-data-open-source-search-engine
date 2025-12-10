package com.boot.kakao.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * 카카오 토큰 API 응답 DTO
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class KakaoTokenResponse {
    private String access_token;
    private String token_type;
    private int expires_in;
    private String refresh_token;
    private String scope;
}