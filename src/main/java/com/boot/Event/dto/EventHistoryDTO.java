package com.boot.Event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * Event History DTO
 * 이벤트 획득 이력 데이터 전달용
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventHistoryDTO {
    
    private Long historyId;
    private String accountId;
    private String eventType; // STAMP, GIFT, BADGE
    private String eventName;
    private String actionType; // 이벤트 발생 액션
    private Date createdAt;
    
    // 추가 정보
    private String description;
    private Integer count; // 획득 개수
}

