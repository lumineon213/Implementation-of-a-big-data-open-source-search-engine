package com.boot.Admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * 관리자 - 신고 관리용 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminReportDTO {
    private Long reportId;
    private String reporterId; // 신고자 ID
    private String reporterName; // 신고자 이름
    private String targetType; // REVIEW, USER 등
    private Long targetId; // 신고 대상 ID
    private String reason; // 신고 사유
    private String status; // PENDING, PROCESSED, REJECTED
    private Date createdAt;
    private Date processedAt;
    private String processorId; // 처리자 ID
    private String processNote; // 처리 메모
}



