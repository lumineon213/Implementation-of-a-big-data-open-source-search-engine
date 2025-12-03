package com.boot.mypage.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.boot.mypage.dto.MyPageDTO;
import com.boot.mypage.service.MyPageService;
import com.boot.security.JwtUtil;

@RestController
@RequestMapping("/api/mypage")
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

}
