package com.boot.mypage.controller;

import com.boot.Event.dto.EventDTO;
import com.boot.Event.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.boot.mypage.dto.MyPageDTO;
import com.boot.mypage.service.MyPageService;
import com.boot.security.JwtUtil;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mypage")
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
    public Map<String, Object> getMyPage(@RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        String accountId = jwtUtil.getAccountId(token);

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

    @PutMapping
    public int updateMyPage(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody MyPageDTO dto) {

        String token = authHeader.replace("Bearer ", "");
        String accountId = jwtUtil.getAccountId(token); 

        dto.setAccountId(accountId);

        return service.updateMyInfo(dto);
    }

}
