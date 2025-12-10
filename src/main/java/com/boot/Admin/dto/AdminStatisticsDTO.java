package com.boot.Admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 관리자 - 통계/대시보드용 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatisticsDTO {
    private Long totalUsers; // 전체 회원 수
    private Long totalReviews; // 전체 리뷰 수
    private Long totalEvents; // 전체 이벤트 수
    private Long todayNewUsers; // 오늘 가입자 수
    private Long todayNewReviews; // 오늘 작성된 리뷰 수
    private Long activeUsers; // 활성 사용자 수
    private Map<String, Long> reviewsByType; // 타입별 리뷰 수
    private Map<String, Long> usersByRole; // 역할별 회원 수
    private Map<String, Long> eventsByType; // 이벤트 타입별 수
}

