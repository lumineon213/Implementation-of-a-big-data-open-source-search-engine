package com.boot.Event.controller;

import com.boot.Event.dto.EventDTO;
import com.boot.Event.dto.EventHistoryDTO;
import com.boot.Event.service.EventService;
import com.boot.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService service;
    private final JwtUtil jwtUtil;

    /**
     * 회원별 이벤트 보유 현황 조회
     * GET /api/events
     */
    @GetMapping
    public ResponseEntity<?> getEvents(
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            String accountId = extractAccountIdFromToken(token);
            
            List<EventDTO> events = service.getEventsByAccountId(accountId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "events", events,
                "count", events.size()
            ));
            
        } catch (RuntimeException e) {
            log.error("이벤트 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "msg", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("이벤트 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "이벤트 조회에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 특정 타입의 이벤트 조회
     * GET /api/events/type/{eventType}
     */
    @GetMapping("/type/{eventType}")
    public ResponseEntity<?> getEventsByType(
            @PathVariable("eventType") String eventType,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            String accountId = extractAccountIdFromToken(token);
            
            List<EventDTO> events = service.getEventsByType(accountId, eventType.toUpperCase());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "events", events,
                "count", events.size()
            ));
            
        } catch (RuntimeException e) {
            log.error("이벤트 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "msg", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("이벤트 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "이벤트 조회에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 스템프 추가
     * POST /api/events/stamp
     */
    @PostMapping("/stamp")
    public ResponseEntity<?> addStamp(
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            String accountId = extractAccountIdFromToken(token);
            String eventName = payload.get("eventName");
            String actionType = payload.get("actionType");
            String description = payload.get("description");
            
            if (eventName == null || eventName.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "msg", "이벤트 이름이 필요합니다."
                ));
            }
            
            EventDTO event = service.addStamp(accountId, eventName, 
                    actionType != null ? actionType : "MANUAL", 
                    description != null ? description : "");
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "event", event,
                "msg", "스템프가 추가되었습니다."
            ));
            
        } catch (RuntimeException e) {
            log.error("스템프 추가 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "msg", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("스템프 추가 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "스템프 추가에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 기프트 추가
     * POST /api/events/gift
     */
    @PostMapping("/gift")
    public ResponseEntity<?> addGift(
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            String accountId = extractAccountIdFromToken(token);
            String eventName = payload.get("eventName");
            String actionType = payload.get("actionType");
            String description = payload.get("description");
            
            if (eventName == null || eventName.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "msg", "이벤트 이름이 필요합니다."
                ));
            }
            
            EventDTO event = service.addGift(accountId, eventName,
                    actionType != null ? actionType : "MANUAL",
                    description != null ? description : "");
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "event", event,
                "msg", "기프트가 추가되었습니다."
            ));
            
        } catch (RuntimeException e) {
            log.error("기프트 추가 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "msg", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("기프트 추가 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "기프트 추가에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 배지 추가
     * POST /api/events/badge
     */
    @PostMapping("/badge")
    public ResponseEntity<?> addBadge(
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            String accountId = extractAccountIdFromToken(token);
            String eventName = payload.get("eventName");
            String actionType = payload.get("actionType");
            String description = payload.get("description");
            
            if (eventName == null || eventName.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "msg", "이벤트 이름이 필요합니다."
                ));
            }
            
            EventDTO event = service.addBadge(accountId, eventName,
                    actionType != null ? actionType : "MANUAL",
                    description != null ? description : "");
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "event", event,
                "msg", "배지가 추가되었습니다."
            ));
            
        } catch (RuntimeException e) {
            log.error("배지 추가 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "msg", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("배지 추가 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "배지 추가에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 스템프로 기프트 교환
     * POST /api/events/exchange
     */
    @PostMapping("/exchange")
    public ResponseEntity<?> exchangeStampForGift(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            String accountId = extractAccountIdFromToken(token);
            String giftName = (String) payload.get("giftName");
            Integer requiredStamps = payload.get("requiredStamps") != null ? 
                    Integer.parseInt(payload.get("requiredStamps").toString()) : null;
            
            if (giftName == null || giftName.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "msg", "기프트 이름이 필요합니다."
                ));
            }
            
            if (requiredStamps == null || requiredStamps <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "msg", "필요한 스템프 개수가 필요합니다."
                ));
            }
            
            EventDTO event = service.exchangeStampForGift(accountId, giftName, requiredStamps);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "event", event,
                "msg", requiredStamps + "개의 스템프로 기프트를 교환했습니다."
            ));
            
        } catch (RuntimeException e) {
            log.error("기프트 교환 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "msg", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("기프트 교환 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "기프트 교환에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 이벤트 이력 조회
     * GET /api/events/history
     */
    @GetMapping("/history")
    public ResponseEntity<?> getEventHistory(
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            String accountId = extractAccountIdFromToken(token);
            
            List<EventHistoryDTO> history = service.getEventHistory(accountId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "history", history,
                "count", history.size()
            ));
            
        } catch (RuntimeException e) {
            log.error("이벤트 이력 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "msg", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("이벤트 이력 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "이벤트 이력 조회에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 이벤트 통계 조회
     * GET /api/events/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getEventStatistics(
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            String accountId = extractAccountIdFromToken(token);
            
            Map<String, Object> statistics = service.getEventStatistics(accountId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "statistics", statistics
            ));
            
        } catch (RuntimeException e) {
            log.error("이벤트 통계 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "msg", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("이벤트 통계 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "이벤트 통계 조회에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 토큰에서 accountId 추출
     */
    private String extractAccountIdFromToken(String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                throw new RuntimeException("로그인이 필요합니다.");
            }
            
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            if (token.trim().isEmpty()) {
                throw new RuntimeException("토큰이 비어있습니다.");
            }
            
            if (!jwtUtil.validate(token)) {
                throw new RuntimeException("유효하지 않거나 만료된 토큰입니다. 다시 로그인해주세요.");
            }
            
            return jwtUtil.getAccountId(token);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("토큰 검증 실패", e);
            throw new RuntimeException("토큰 검증 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}



