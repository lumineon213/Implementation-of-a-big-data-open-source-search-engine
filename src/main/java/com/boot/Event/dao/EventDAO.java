package com.boot.Event.dao;

import com.boot.Event.dto.EventDTO;
import com.boot.Event.dto.EventHistoryDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface EventDAO {
    
    // ===== 이벤트 보유 현황 =====
    
    /**
     * 회원별 이벤트 보유 현황 조회
     */
    List<EventDTO> selectEventsByAccountId(@Param("accountId") String accountId);
    
    /**
     * 특정 타입의 이벤트 조회
     */
    List<EventDTO> selectEventsByType(@Param("accountId") String accountId, 
                                      @Param("eventType") String eventType);
    
    /**
     * 특정 이벤트 조회
     */
    EventDTO selectEvent(@Param("accountId") String accountId, 
                         @Param("eventType") String eventType,
                         @Param("eventName") String eventName);
    
    /**
     * 이벤트 추가 또는 업데이트
     */
    int upsertEvent(EventDTO event);
    
    /**
     * 이벤트 개수 증가
     */
    int incrementEventCount(@Param("accountId") String accountId,
                           @Param("eventType") String eventType,
                           @Param("eventName") String eventName,
                           @Param("count") Integer count);
    
    /**
     * 이벤트 개수 감소
     */
    int decrementEventCount(@Param("accountId") String accountId,
                           @Param("eventType") String eventType,
                           @Param("eventName") String eventName,
                           @Param("count") Integer count);
    
    /**
     * 이벤트 삭제
     */
    int deleteEvent(@Param("eventId") Long eventId);
    
    // ===== 이벤트 이력 =====
    
    /**
     * 이벤트 이력 추가
     */
    int insertEventHistory(EventHistoryDTO history);
    
    /**
     * 회원별 이벤트 이력 조회
     */
    List<EventHistoryDTO> selectEventHistoryByAccountId(@Param("accountId") String accountId);
    
    /**
     * 특정 타입의 이벤트 이력 조회
     */
    List<EventHistoryDTO> selectEventHistoryByType(@Param("accountId") String accountId,
                                                    @Param("eventType") String eventType);
    
    /**
     * 특정 액션의 이벤트 이력 조회
     */
    List<EventHistoryDTO> selectEventHistoryByAction(@Param("accountId") String accountId,
                                                     @Param("actionType") String actionType);
    
    // ===== 통계 =====
    
    /**
     * 회원별 이벤트 총 개수 조회
     */
    Integer countEventsByAccountId(@Param("accountId") String accountId);
    
    /**
     * 회원별 특정 타입 이벤트 총 개수 조회
     */
    Integer countEventsByType(@Param("accountId") String accountId,
                              @Param("eventType") String eventType);
}

