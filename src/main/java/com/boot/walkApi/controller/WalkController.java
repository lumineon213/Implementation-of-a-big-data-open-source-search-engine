package com.boot.walkApi.controller;

import com.boot.walkApi.service.WalkService;

import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/walk")
public class WalkController {

    @Autowired
    private WalkService walkService;

    @GetMapping("/save-data")
    public ResponseEntity<?> saveData() {
        try {
            String msg = walkService.syncWalkData();
            return ResponseEntity.ok(msg);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("저장 실패: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "9") int size
    ) {
        try {
            Map<String, Object> result = walkService.searchWalk(keyword, page, size);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("검색 실패: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> detail(@PathVariable("id") String id) {
        try {
            Map<String, Object> result = walkService.getById(id);
            if (result == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("조회 실패: " + e.getMessage());
        }
    }
}
