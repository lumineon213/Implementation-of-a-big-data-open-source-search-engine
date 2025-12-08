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

    @GetMapping("/save-data")
    public String saveData() {
        try {
            marineService.syncMarineData();
            return "Marine Solr 데이터 저장 성공";
        } catch (Exception e) {
            return "저장 실패: " + e.getMessage();
        }
    }

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
