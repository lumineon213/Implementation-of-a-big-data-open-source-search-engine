package com.boot.google.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * 구글 사용자 정보 API 응답을 매핑할 DTO
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true) // 모르는 필드는 무시
public class GoogleUserInfo {
    private String id;       // 구글의 고유 사용자 ID (이것을 socialId로 사용)
    private String email;
    private String name;
    private String picture;  // 프로필 사진 URL
}

