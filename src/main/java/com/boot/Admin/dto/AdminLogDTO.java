package com.boot.Admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * 관리자 - 로그/접속 기록용 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminLogDTO {
    private Long logId;
    private String accountId;
    private String accountName;
    private String actionType; // LOGIN, LOGOUT, DELETE, UPDATE 등
    private String targetType; // USER, REVIEW, NOTICE 등
    private Long targetId;
    private String ipAddress;
    private String userAgent;
    private Date createdAt;
    private String description;
}



