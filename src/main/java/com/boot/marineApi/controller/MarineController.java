package com.boot.marineApi.controller;

import com.boot.marineApi.service.MarineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/marine")
public class MarineController {

    @Autowired
    private MarineService marineService;

    /**
     * RAW 저장 + 필터 저장 모두 포함 (URL 유지)
     */
    @GetMapping("/save-data")
    public ResponseEntity<?> saveData() {
        try {
            String msg = marineService.syncMarineData(); // 내부에서 RAW + 필터처리
            return ResponseEntity.ok(msg);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("저장 실패: " + e.getMessage());
        }
    }

    /**
     * 검색
     */
    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        try {
            Map<String, Object> result = marineService.searchMarine(keyword, page, size);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("검색 실패: " + e.getMessage());
        }
    }
}
