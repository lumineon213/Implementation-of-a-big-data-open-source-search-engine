package com.boot.Admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * 관리자 - 회원 관리용 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserDTO {
    private String accountId;
    private String accountName;
    private String email;
    private String phoneNumber;
    private String accountRole; // USER, ADMIN
    private String socialType;
    private Date regDate;
    private Integer reviewCount; // 작성한 리뷰 수
    private Integer eventCount; // 보유 이벤트 수
    private String status; // ACTIVE, INACTIVE, DELETED
}

