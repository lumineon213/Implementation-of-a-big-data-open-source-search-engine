package com.boot.controller;

import com.boot.Admin.service.AdminService;
import com.boot.dao.loginDAO;
import com.boot.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
@Slf4j
public class InquiryController {

    private final AdminService adminService;
    private final JwtUtil jwtUtil;
    private final loginDAO loginDao;

    @PostMapping
    public ResponseEntity<?> createInquiry(
            @RequestBody Map<String, String> payload,
            HttpServletRequest request
    ) {
        String title = payload.getOrDefault("title", "").trim();
        String content = payload.getOrDefault("content", "").trim();

        if (title.isEmpty() || content.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "msg", "제목과 내용을 입력해주세요."
            ));
        }

        String writerId = "admin"; // 기본 작성자 (게스트의 경우 FK 제약 충돌 방지)
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.validate(token)) {
                String accountId = jwtUtil.getAccountId(token);
                if (accountId != null && loginDao.findById(accountId) != null) {
                    writerId = accountId;
                }
            }
        }

        try {
            adminService.createInquiry(writerId, title, content);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "msg", "문의가 접수되었습니다."
            ));
        } catch (Exception e) {
            log.error("문의 접수 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "msg", "문의 접수에 실패했습니다."
            ));
        }
    }
}

