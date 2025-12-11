package com.boot.mypage.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import com.boot.mypage.dto.MyPageDTO;
import com.boot.mypage.service.MyPageService;
import com.boot.reservation.dto.ReservationHistoryDTO;
import com.boot.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MyPageController {

    @Autowired
    private MyPageService service;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 마이페이지 정보 조회
     */
    @GetMapping
    public MyPageDTO getMyPage(@RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        String accountId = jwtUtil.getAccountId(token);

        return service.getMyInfo(accountId);
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
