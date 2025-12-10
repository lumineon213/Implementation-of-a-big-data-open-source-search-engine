package com.boot.google.dto;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * 구글 토큰 API (access_token) 응답을 매핑할 DTO
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true) // 모르는 필드는 무시
public class GoogleTokenResponse {
    private String access_token;
    private int expires_in;
    private String scope;
    private String token_type;
    private String id_token;
}

