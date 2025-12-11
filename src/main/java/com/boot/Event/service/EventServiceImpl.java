package com.boot.Event.service;

import com.boot.Event.dao.EventDAO;
import com.boot.Event.dto.EventDTO;
import com.boot.Event.dto.EventHistoryDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventDAO dao;

    @Override
    @Transactional(readOnly = true)
    public List<EventDTO> getEventsByAccountId(String accountId) {
        log.info("회원별 이벤트 조회 - accountId: {}", accountId);
        return dao.selectEventsByAccountId(accountId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventDTO> getEventsByType(String accountId, String eventType) {
        log.info("특정 타입 이벤트 조회 - accountId: {}, eventType: {}", accountId, eventType);
        return dao.selectEventsByType(accountId, eventType);
    }

    @Override
    @Transactional
    public EventDTO addStamp(String accountId, String eventName, String actionType, String description) {
        log.info("스템프 추가 - accountId: {}, eventName: {}, actionType: {}", accountId, eventName, actionType);
        
        // 기존 이벤트 조회
        EventDTO existingEvent = dao.selectEvent(accountId, "STAMP", eventName);
        
        EventDTO event;
        if (existingEvent != null) {
            // 기존 이벤트가 있으면 개수 증가
            dao.incrementEventCount(accountId, "STAMP", eventName, 1);
            event = dao.selectEvent(accountId, "STAMP", eventName);
        } else {
            // 새 이벤트 생성
            event = EventDTO.builder()
                    .accountId(accountId)
                    .eventType("STAMP")
                    .eventName(eventName)
                    .count(1)
                    .actionType(actionType)
                    .description(description)
                    .isActive(true)
                    .build();
            dao.upsertEvent(event);
            event = dao.selectEvent(accountId, "STAMP", eventName);
        }
        
        // 이력 추가
        EventHistoryDTO history = EventHistoryDTO.builder()
                .accountId(accountId)
                .eventType("STAMP")
                .eventName(eventName)
                .actionType(actionType)
                .description(description)
                .count(1)
                .build();
        dao.insertEventHistory(history);
        
        return event;
    }

    @Override
    @Transactional
    public EventDTO addGift(String accountId, String eventName, String actionType, String description) {
        log.info("기프트 추가 - accountId: {}, eventName: {}, actionType: {}", accountId, eventName, actionType);
        
        // 이미 받은 쿠폰인지 확인 (회원당 쿠폰은 하나만 받을 수 있음)
        EventDTO existingEvent = dao.selectEvent(accountId, "GIFT", eventName);
        if (existingEvent != null) {
            throw new RuntimeException("이미 발급받은 쿠폰입니다.");
        }
        
        // 새 쿠폰 발급
        EventDTO event = EventDTO.builder()
                .accountId(accountId)
                .eventType("GIFT")
                .eventName(eventName)
                .count(1)
                .actionType(actionType)
                .description(description)
                .isActive(true)
                .build();
        dao.upsertEvent(event);
        event = dao.selectEvent(accountId, "GIFT", eventName);
        
        EventHistoryDTO history = EventHistoryDTO.builder()
                .accountId(accountId)
                .eventType("GIFT")
                .eventName(eventName)
                .actionType(actionType)
                .description(description)
                .count(1)
                .build();
        dao.insertEventHistory(history);
        
        return event;
    }

    @Override
    @Transactional
    public EventDTO addBadge(String accountId, String eventName, String actionType, String description) {
        log.info("배지 추가 - accountId: {}, eventName: {}, actionType: {}", accountId, eventName, actionType);
        
        // 배지는 중복 획득 불가
        EventDTO existingEvent = dao.selectEvent(accountId, "BADGE", eventName);
        if (existingEvent != null) {
            log.warn("이미 보유한 배지입니다 - accountId: {}, eventName: {}", accountId, eventName);
            return existingEvent;
        }
        
        EventDTO event = EventDTO.builder()
                .accountId(accountId)
                .eventType("BADGE")
                .eventName(eventName)
                .count(1)
                .actionType(actionType)
                .description(description)
                .isActive(true)
                .build();
        dao.upsertEvent(event);
        event = dao.selectEvent(accountId, "BADGE", eventName);
        
        EventHistoryDTO history = EventHistoryDTO.builder()
                .accountId(accountId)
                .eventType("BADGE")
                .eventName(eventName)
                .actionType(actionType)
                .description(description)
                .count(1)
                .build();
        dao.insertEventHistory(history);
        
        return event;
    }

    @Override
    @Transactional
    public EventDTO exchangeStampForGift(String accountId, String giftName, Integer requiredStamps) {
        log.info("스템프로 기프트 교환 - accountId: {}, giftName: {}, requiredStamps: {}", 
                accountId, giftName, requiredStamps);
        
        // 전체 스템프 개수 확인
        Integer totalStamps = dao.countEventsByType(accountId, "STAMP");
        if (totalStamps == null || totalStamps < requiredStamps) {
            throw new RuntimeException("스템프가 부족합니다. 필요: " + requiredStamps + "개, 보유: " + totalStamps + "개");
        }
        
        // 스템프 차감 (가장 오래된 스템프부터)
        List<EventDTO> stamps = dao.selectEventsByType(accountId, "STAMP");
        int remaining = requiredStamps;
        for (EventDTO stamp : stamps) {
            if (remaining <= 0) break;
            int deduct = Math.min(stamp.getCount(), remaining);
            dao.decrementEventCount(accountId, "STAMP", stamp.getEventName(), deduct);
            remaining -= deduct;
        }
        
        // 기프트 추가
        return addGift(accountId, giftName, "STAMP_EXCHANGE", 
                requiredStamps + "개의 스템프로 교환한 기프트");
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventHistoryDTO> getEventHistory(String accountId) {
        log.info("이벤트 이력 조회 - accountId: {}", accountId);
        return dao.selectEventHistoryByAccountId(accountId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventHistoryDTO> getEventHistoryByType(String accountId, String eventType) {
        log.info("특정 타입 이벤트 이력 조회 - accountId: {}, eventType: {}", accountId, eventType);
        return dao.selectEventHistoryByType(accountId, eventType);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getEventStatistics(String accountId) {
        log.info("이벤트 통계 조회 - accountId: {}", accountId);
        
        Integer totalStamps = dao.countEventsByType(accountId, "STAMP");
        Integer totalGifts = dao.countEventsByType(accountId, "GIFT");
        Integer totalBadges = dao.countEventsByType(accountId, "BADGE");
        Integer totalEvents = dao.countEventsByAccountId(accountId);
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalStamps", totalStamps != null ? totalStamps : 0);
        statistics.put("totalGifts", totalGifts != null ? totalGifts : 0);
        statistics.put("totalBadges", totalBadges != null ? totalBadges : 0);
        statistics.put("totalEvents", totalEvents != null ? totalEvents : 0);
        
        return statistics;
    }
}

