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

import com.boot.login.dto.loginDTO;
import com.boot.search_histroy.dto.SearchLogDTO;
import com.boot.search_histroy.service.SearchLogService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/search-log")
@CrossOrigin(
    origins = "http://localhost:5173",
    allowCredentials = "true"
)
public class SearchLogController {
    
    @Autowired
    private SearchLogService searchLogService;
    
    // 검색 기록 저장
    @PostMapping
    public ResponseEntity<?> saveSearch(@RequestBody SearchLogDTO dto, HttpSession session) {
        loginDTO user = (loginDTO) session.getAttribute("loginUser");
        if (user != null) {
            dto.setAccountId(user.getAccountId());
            searchLogService.saveSearchKeyword(dto);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(401).build();
    }
    
    // 최근 검색어 조회
    @GetMapping
    public List<SearchLogDTO> getRecentSearches(HttpSession session) {
        loginDTO user = (loginDTO) session.getAttribute("loginUser");
        System.out.println("=== 검색 기록 조회 시작 ===");
        System.out.println("세션 ID: " + session.getId());
        System.out.println("세션의 loginUser: " + user);
        
        if (user != null) {
            System.out.println("검색 기록 조회 요청 - 사용자: " + user.getAccountId());
            try {
                List<SearchLogDTO> result = searchLogService.getRecentSearches(user.getAccountId(), 10);
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
    @DeleteMapping("/{logId}")
    public ResponseEntity<?> deleteSearch(@PathVariable("logId") Long logId, HttpSession session) {
        System.out.println("=== 검색 기록 삭제 시작 ===");
        System.out.println("삭제할 logId: " + logId);
        System.out.println("logId 타입: " + logId.getClass().getName());
        
        loginDTO user = (loginDTO) session.getAttribute("loginUser");
        System.out.println("세션의 loginUser: " + user);
        
        if (user != null) {
            try {
                System.out.println("삭제 시도 - 사용자: " + user.getAccountId() + ", logId: " + logId);
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
    @DeleteMapping("/all")
    public ResponseEntity<?> deleteAllSearches(HttpSession session) {
        loginDTO user = (loginDTO) session.getAttribute("loginUser");
        if (user != null) {
            searchLogService.clearAllSearchLogs(user.getAccountId());
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(401).build();
    }
}