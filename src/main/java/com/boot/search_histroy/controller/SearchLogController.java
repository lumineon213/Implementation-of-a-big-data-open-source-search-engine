package com.boot.search_histroy.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boot.search_histroy.dto.SearchLogDTO;
import com.boot.search_histroy.service.SearchLogService;
import com.boot.security.JwtUtil;

import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@RequestMapping("/api")
@CrossOrigin(
    origins = "http://localhost:5173",
    allowCredentials = "true"
)
public class SearchLogController {
    
    @Autowired
    private SearchLogService searchLogService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    // JWT 토큰에서 사용자 ID 추출
    private String getUserIdFromToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                if (jwtUtil.validate(token)) {
                    return jwtUtil.getAccountId(token);
                }
            } catch (Exception e) {
                System.err.println("JWT 토큰 검증 실패: " + e.getMessage());
                e.printStackTrace();
            }
        }
        return null;
    }
    
    // 로그인 상태 확인
    @GetMapping("/user/status")
    public ResponseEntity<?> getUserStatus(@RequestHeader(name = "Authorization", required = false) String authHeader) {
        String accountId = getUserIdFromToken(authHeader);
        if (accountId != null) {
            return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
                put("isLoggedIn", true);
                put("accountId", accountId);
            }});
        }
        return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
            put("isLoggedIn", false);
        }});
    }
    
    // 검색 기록 저장
    @PostMapping("/search-log")
    public ResponseEntity<?> saveSearch(@RequestBody SearchLogDTO dto, @RequestHeader(name = "Authorization", required = false) String authHeader) {
        System.out.println("=== 검색 기록 저장 시작 ===");
        System.out.println("받은 keyword: " + (dto != null ? dto.getKeyword() : "null"));
        System.out.println("Authorization 헤더: " + authHeader);
        
        String accountId = getUserIdFromToken(authHeader);
        System.out.println("JWT accountId: " + accountId);
        
        if (accountId != null) {
            dto.setAccountId(accountId);
            System.out.println("저장할 데이터 - accountId: " + dto.getAccountId() + ", keyword: " + dto.getKeyword());
            try {
                searchLogService.saveSearchKeyword(dto);
                System.out.println("검색 기록 저장 성공");
                return ResponseEntity.ok().build();
            } catch (Exception e) {
                System.err.println("검색 기록 저장 실패: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(500).body("저장 실패: " + e.getMessage());
            }
        }
        System.out.println("검색 기록 저장 실패 - JWT 인증 실패");
        return ResponseEntity.status(401).build();
    }
    
    // 최근 검색어 조회
    @GetMapping("/search-log")
    public List<SearchLogDTO> getRecentSearches(@RequestHeader(name = "Authorization", required = false) String authHeader) {
        String accountId = getUserIdFromToken(authHeader);
        System.out.println("=== 검색 기록 조회 시작 ===");
        System.out.println("JWT accountId: " + accountId);
        
        if (accountId != null) {
            System.out.println("검색 기록 조회 요청 - 사용자: " + accountId);
            try {
                List<SearchLogDTO> result = searchLogService.getRecentSearches(accountId, 10);
                System.out.println("검색 기록 조회 결과 개수: " + (result != null ? result.size() : 0));
                if (result != null && !result.isEmpty()) {
                    for (SearchLogDTO log : result) {
                        System.out.println("  - logId: " + log.getLogId() + ", keyword: " + log.getKeyword() + ", accountId: " + log.getAccountId());
                    }
                } else {
                    System.out.println("  조회 결과가 비어있습니다.");
                }
                return result != null ? result : new ArrayList<>();
            } catch (Exception e) {
                System.err.println("검색 기록 조회 중 오류 발생: " + e.getMessage());
                e.printStackTrace();
                return new ArrayList<>();
            }
        }
        System.out.println("검색 기록 조회 실패 - 로그인되지 않음");
        return new ArrayList<>();
    }
    
    // 검색 기록 삭제
    @DeleteMapping("/search-log/{logId}")
    public ResponseEntity<?> deleteSearch(@PathVariable("logId") Long logId, @RequestHeader(name = "Authorization", required = false) String authHeader) {
        System.out.println("=== 검색 기록 삭제 시작 ===");
        System.out.println("삭제할 logId: " + logId);
        
        String accountId = getUserIdFromToken(authHeader);
        System.out.println("JWT accountId: " + accountId);
        
        if (accountId != null) {
            try {
                System.out.println("삭제 시도 - 사용자: " + accountId + ", logId: " + logId);
                searchLogService.removeSearchLog(logId);
                System.out.println("삭제 성공");
                return ResponseEntity.ok().build();
            } catch (Exception e) {
                System.err.println("삭제 중 오류 발생: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(500).build();
            }
        }
        System.out.println("삭제 실패 - 로그인되지 않음");
        return ResponseEntity.status(401).build();
    }
    
    // 검색 기록 전체 삭제
    @DeleteMapping("/search-log/all")
    public ResponseEntity<?> deleteAllSearches(@RequestHeader(name = "Authorization", required = false) String authHeader) {
        String accountId = getUserIdFromToken(authHeader);
        if (accountId != null) {
            searchLogService.clearAllSearchLogs(accountId);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(401).build();
    }
}