package com.boot.notice.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.boot.dao.loginDAO;
import com.boot.dto.loginDTO;
import com.boot.notice.dto.NoticeDTO;
import com.boot.notice.service.NoticeService;
import com.boot.security.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/notices")
public class NoticeController {

    @Autowired
    private NoticeService noticeService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private loginDAO loginDao;

    // 공지사항 목록 (모든 사용자 조회 가능)
    @GetMapping
    public List<NoticeDTO> getAllNotices() {
        return noticeService.getAllNotices();
    }

    // 공지사항 상세 (모든 사용자 조회 가능)
    @GetMapping("/{id}")
    public ResponseEntity<NoticeDTO> getNotice(@PathVariable("id") Long id) {
        NoticeDTO notice = noticeService.getNotice(id);
        if (notice == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(notice);
    }

    // 관리자 전용: 공지사항 등록
    @PostMapping
    public ResponseEntity<?> createNotice(@RequestBody NoticeDTO dto, HttpServletRequest request) {
        loginDTO admin = getAdminFromRequest(request);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자만 공지사항을 등록할 수 있습니다.");
        }

        // writerId를 토큰의 accountId로 강제 설정
        dto.setWriterId(admin.getAccountId());
        noticeService.saveNotice(dto);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // 관리자 전용: 공지사항 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotice(@PathVariable("id") Long id, HttpServletRequest request) {
        loginDTO admin = getAdminFromRequest(request);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자만 공지사항을 삭제할 수 있습니다.");
        }

        noticeService.deleteNotice(id);
        return ResponseEntity.noContent().build();
    }

    // 요청에서 JWT를 읽어 ADMIN 사용자만 통과시키는 헬퍼 메서드
    private loginDTO getAdminFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validate(token)) {
            return null;
        }

        String accountId = jwtUtil.getAccountId(token);
        if (accountId == null) {
            return null;
        }

        loginDTO user = loginDao.findById(accountId);
        if (user == null) {
            return null;
        }

        if (!"ADMIN".equalsIgnoreCase(user.getAccountRole())) {
            return null;
        }

        return user;
    }
}
