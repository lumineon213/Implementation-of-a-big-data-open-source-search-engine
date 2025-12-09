package com.boot.urbanApi.controller;

import com.boot.urbanApi.service.UrbanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/urban")
public class UrbanController {

    @Autowired
    private UrbanService urbanService;

    @GetMapping("/save-data")
    public ResponseEntity<?> saveData() {
        try {
            String msg = urbanService.syncUrbanData();
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
            Map<String, Object> result = urbanService.searchUrban(keyword, page, size);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("검색 실패: " + e.getMessage());
        }
    }
}
