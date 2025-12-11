package com.boot.Event.service;

import com.boot.Event.dto.EventDTO;
import com.boot.Event.dto.EventHistoryDTO;

import java.util.List;
import java.util.Map;

public interface EventService {
    
    /**
     * 회원별 이벤트 보유 현황 조회
     */
    List<EventDTO> getEventsByAccountId(String accountId);
    
    /**
     * 특정 타입의 이벤트 조회 (STAMP, GIFT, BADGE)
     */
    List<EventDTO> getEventsByType(String accountId, String eventType);
    
    /**
     * 스템프 추가 (예: 장소 방문, 리뷰 작성 등)
     */
    EventDTO addStamp(String accountId, String eventName, String actionType, String description);
    
    /**
     * 기프트 추가 (예: 스템프 교환)
     */
    EventDTO addGift(String accountId, String eventName, String actionType, String description);
    
    /**
     * 배지 추가 (예: 첫 방문, 리뷰 10개 작성 등)
     */
    EventDTO addBadge(String accountId, String eventName, String actionType, String description);
    
    /**
     * 스템프로 기프트 교환
     */
    EventDTO exchangeStampForGift(String accountId, String giftName, Integer requiredStamps);
    
    /**
     * 이벤트 이력 조회
     */
    List<EventHistoryDTO> getEventHistory(String accountId);
    
    /**
     * 특정 타입의 이벤트 이력 조회
     */
    List<EventHistoryDTO> getEventHistoryByType(String accountId, String eventType);
    
    /**
     * 회원별 이벤트 통계 조회
     */
    Map<String, Object> getEventStatistics(String accountId);
}

