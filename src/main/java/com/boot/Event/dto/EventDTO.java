package com.boot.Event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * Event DTO
 * 스템프, 기프트, 배지 이벤트 데이터 전달용
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventDTO {
    
    // 기본 정보
    private Long eventId;
    private String accountId;
    private String eventType; // STAMP, GIFT, BADGE
    private String eventName; // 이벤트 이름 (예: "첫 방문", "리뷰 작성", "기프트카드")
    private Integer count; // 보유 개수 (스템프, 기프트 등)
    private Date createdAt;
    private Date updatedAt;
    
    // 추가 정보
    private String actionType; // 이벤트 발생 액션 (예: "VISIT", "REVIEW", "STAMP_COLLECT")
    private String description; // 이벤트 설명
    private String imageUrl; // 이벤트 이미지 URL
    private Boolean isActive; // 활성화 여부
    
    // 통계/조회용
    private Integer totalCount; // 전체 보유 개수
    private Integer requiredCount; // 필요 개수 (예: 기프트 교환에 필요한 스템프 수)
}

