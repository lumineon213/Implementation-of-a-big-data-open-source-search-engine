package com.boot.mypage.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import com.boot.Event.dto.EventDTO;
import com.boot.Event.service.EventService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.boot.mypage.dto.MyPageDTO;
import com.boot.mypage.service.MyPageService;
import com.boot.reservation.dto.ReservationHistoryDTO;
import com.boot.security.JwtUtil;

import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MyPageController {

    @Autowired
    private MyPageService service;

    @Autowired
    private EventService eventService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 마이페이지 정보 조회 (이벤트 정보 포함)
     */
    @GetMapping
    public Map<String, Object> getMyPage(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("마이페이지 조회 시작 - Authorization: {}", authHeader);
        
        if (authHeader == null || authHeader.isEmpty()) {
            throw new RuntimeException("인증 토큰이 필요합니다.");
        }

        String token = authHeader.replace("Bearer ", "");
        String accountId = jwtUtil.getAccountId(token);
        log.info("accountId: {}", accountId);

        MyPageDTO myInfo = service.getMyInfo(accountId);
        
        // 이벤트 정보 조회
        List<EventDTO> allEvents = eventService.getEventsByAccountId(accountId);
        List<EventDTO> stamps = eventService.getEventsByType(accountId, "STAMP");
        List<EventDTO> badges = eventService.getEventsByType(accountId, "BADGE");
        List<EventDTO> gifts = eventService.getEventsByType(accountId, "GIFT");
        Map<String, Object> statistics = eventService.getEventStatistics(accountId);
        
        // 스템프 총 개수 계산
        Integer totalStamps = (Integer) statistics.get("totalStamps");
        
        Map<String, Object> response = new HashMap<>();
        response.put("userInfo", myInfo);
        response.put("events", allEvents);
        response.put("stamps", stamps);
        response.put("badges", badges);
        response.put("gifts", gifts);
        response.put("statistics", statistics);
        response.put("totalStamps", totalStamps);
        
        return response;
    }

    /**
     * 마이페이지 정보 수정 (프로필 이미지 포함)
     */
    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> updateMyPage(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("accountName") String accountName,
            @RequestParam("email") String email,
            @RequestParam("phoneNumber") String phoneNumber,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage) {

        try {
            String token = authHeader.replace("Bearer ", "");
            String accountId = jwtUtil.getAccountId(token);

            // MyPageDTO 생성
            MyPageDTO dto = new MyPageDTO();
            dto.setAccountId(accountId);
            dto.setAccountName(accountName);
            dto.setEmail(email);
            dto.setPhoneNumber(phoneNumber);

            // 서비스 호출
            int result = service.updateMyInfo(dto, profileImage);

            // 응답 생성
            Map<String, Object> response = new HashMap<>();
            if (result > 0) {
                // 업데이트된 정보 조회
                MyPageDTO updatedInfo = service.getMyInfo(accountId);
                log.info("📋 최종 조회한 유저 정보 - accountId: {}, profileImage: {}", accountId, updatedInfo.getProfileImage());
                
                response.put("success", true);
                response.put("message", "회원정보가 성공적으로 수정되었습니다.");
                response.put("data", updatedInfo);
                
                log.info("✅ 최종 응답: {}", response);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "회원정보 수정에 실패했습니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            log.error("회원정보 수정 중 오류 발생", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "회원정보 수정 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/reservations") 
    public ResponseEntity<List<ReservationHistoryDTO>> getMyReservations(
            // JWT 토큰에서 사용자 정보를 자동으로 가져옵니다.
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // userDetails.getUsername()이 로그인 시 사용된 accountId를 반환합니다.
        String accountId = userDetails.getUsername(); 

        List<ReservationHistoryDTO> history = service.getReservationHistory(accountId);
        
        // 예약 내역 리스트 반환
        return ResponseEntity.ok(history); 
    }
}
