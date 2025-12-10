package com.boot.naver.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * 네이버 사용자 정보 API의 최상위 응답을 매핑하는 Wrapper DTO
 * 실제 사용자 정보는 'response' 필드에 담겨 있습니다.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NaverResponseWrapper {
    private String resultcode;
    private String message;
    
    // NaverUserInfo 객체를 담는 필드 이름을 "response"로 정확히 지정
    private NaverUserInfo response; 
}