package com.boot.Admin.controller;

import com.boot.Admin.dto.*;
import com.boot.Admin.service.AdminService;
import com.boot.dao.loginDAO;
import com.boot.dto.loginDTO;
import com.boot.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final AdminService adminService;
    private final JwtUtil jwtUtil;
    private final loginDAO loginDao;

    // ============== 헬퍼 메서드: 관리자 권한 체크 ==============
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
        if (user == null || !"ADMIN".equalsIgnoreCase(user.getAccountRole())) {
            return null;
        }

        return user;
    }

    // ============== 회원 관리 ==============
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "search", required = false) String search,
            HttpServletRequest request) {
        
        loginDTO admin = getAdminFromRequest(request);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "msg", "관리자 권한이 필요합니다."
            ));
        }

        try {
            List<AdminUserDTO> users = adminService.getAllUsers(page, size, search);
            int total = adminService.countUsers(search);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "users", users,
                "total", total,
                "page", page,
                "size", size
            ));
        } catch (Exception e) {
            log.error("회원 목록 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "회원 목록 조회에 실패했습니다."
            ));
        }
    }

    @GetMapping("/users/{accountId}")
    public ResponseEntity<?> getUserById(
            @PathVariable("accountId") String accountId,
            HttpServletRequest request) {
        
        loginDTO admin = getAdminFromRequest(request);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "msg", "관리자 권한이 필요합니다."
            ));
        }

        try {
            AdminUserDTO user = adminService.getUserById(accountId);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "msg", "회원을 찾을 수 없습니다."
                ));
            }
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "user", user
            ));
        } catch (Exception e) {
            log.error("회원 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "회원 조회에 실패했습니다."
            ));
        }
    }

    @PutMapping("/users/{accountId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable("accountId") String accountId,
            @RequestBody Map<String, String> payload,
            HttpServletRequest request) {
        
        loginDTO admin = getAdminFromRequest(request);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "msg", "관리자 권한이 필요합니다."
            ));
        }

        try {
            String role = payload.get("role");
            if (role == null || (!"USER".equals(role) && !"ADMIN".equals(role))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "msg", "유효하지 않은 역할입니다."
                ));
            }

            adminService.updateUserRole(accountId, role);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "msg", "권한이 변경되었습니다."
            ));
        } catch (Exception e) {
            log.error("권한 변경 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "권한 변경에 실패했습니다."
            ));
        }
    }

    @DeleteMapping("/users/{accountId}")
    public ResponseEntity<?> deleteUser(
            @PathVariable("accountId") String accountId,
            HttpServletRequest request) {
        
        loginDTO admin = getAdminFromRequest(request);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "msg", "관리자 권한이 필요합니다."
            ));
        }

        try {
            adminService.deleteUser(accountId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "msg", "회원이 탈퇴 처리되었습니다."
            ));
        } catch (Exception e) {
            log.error("회원 탈퇴 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "회원 탈퇴에 실패했습니다."
            ));
        }
    }

    // ============== 리뷰 관리 ==============
    @GetMapping("/reviews")
    public ResponseEntity<?> getAllReviews(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "search", required = false) String search,
            HttpServletRequest request) {
        
        loginDTO admin = getAdminFromRequest(request);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "msg", "관리자 권한이 필요합니다."
            ));
        }

        try {
            List<AdminReviewDTO> reviews = adminService.getAllReviews(page, size, search);
            int total = adminService.countReviews(search);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "reviews", reviews,
                "total", total,
                "page", page,
                "size", size
            ));
        } catch (Exception e) {
            log.error("리뷰 목록 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "리뷰 목록 조회에 실패했습니다."
            ));
        }
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @PathVariable("reviewId") Long reviewId,
            HttpServletRequest request) {
        
        loginDTO admin = getAdminFromRequest(request);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "msg", "관리자 권한이 필요합니다."
            ));
        }

        try {
            adminService.deleteReview(reviewId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "msg", "리뷰가 삭제되었습니다."
            ));
        } catch (Exception e) {
            log.error("리뷰 삭제 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "리뷰 삭제에 실패했습니다."
            ));
        }
    }

    // ============== 통계/대시보드 ==============
    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics(HttpServletRequest request) {
        loginDTO admin = getAdminFromRequest(request);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "msg", "관리자 권한이 필요합니다."
            ));
        }

        try {
            AdminStatisticsDTO stats = adminService.getStatistics();
            List<Map<String, Object>> dailyStats = null;
            try {
                dailyStats = adminService.getDailyStatistics(7);
            } catch (Exception e) {
                log.warn("일별 통계 조회 실패 (무시): {}", e.getMessage());
                dailyStats = new ArrayList<>();
            }
            List<Map<String, Object>> topPlaces = adminService.getTopPlaces(10);
            List<Map<String, Object>> topUsers = adminService.getTopUsers(10);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "statistics", stats,
                "dailyStatistics", dailyStats,
                "topPlaces", topPlaces,
                "topUsers", topUsers
            ));
        } catch (Exception e) {
            log.error("통계 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "통계 조회에 실패했습니다."
            ));
        }
    }

    // ============== 문의 관리 ==============
    @GetMapping("/inquiries")
    public ResponseEntity<?> getAllInquiries(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "status", required = false) String status,
            HttpServletRequest request) {
        
        loginDTO admin = getAdminFromRequest(request);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "msg", "관리자 권한이 필요합니다."
            ));
        }

        try {
            List<AdminInquiryDTO> inquiries = adminService.getAllInquiries(page, size, status);
            int total = adminService.countInquiries(status);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "inquiries", inquiries,
                "total", total,
                "page", page,
                "size", size
            ));
        } catch (Exception e) {
            log.error("문의 목록 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "문의 목록 조회에 실패했습니다."
            ));
        }
    }

    @PostMapping("/inquiries/{inquiryId}/answer")
    public ResponseEntity<?> answerInquiry(
            @PathVariable("inquiryId") Long inquiryId,
            @RequestBody Map<String, String> payload,
            HttpServletRequest request) {
        
        loginDTO admin = getAdminFromRequest(request);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "msg", "관리자 권한이 필요합니다."
            ));
        }

        try {
            String answerContent = payload.get("answerContent");
            if (answerContent == null || answerContent.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "msg", "답변 내용을 입력해주세요."
                ));
            }

            adminService.answerInquiry(inquiryId, answerContent, admin.getAccountId());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "msg", "답변이 등록되었습니다."
            ));
        } catch (Exception e) {
            log.error("문의 답변 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "문의 답변에 실패했습니다."
            ));
        }
    }
}

