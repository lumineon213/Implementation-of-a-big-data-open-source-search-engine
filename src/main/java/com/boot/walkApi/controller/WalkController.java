package com.boot.walkApi.controller;

import com.boot.walkApi.service.WalkService;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/walk")
public class WalkController {

    @Autowired
    private WalkService walkService;

    @GetMapping("/save-data")
    @ResponseBody
    public String saveData() {
        try {
            walkService.syncWalkData();
            return "Solr 데이터 저장 성공";
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
            Map<String, Object> result = walkService.searchWalk(keyword, page, size);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("검색 실패: " + e.getMessage());
        }
    }

}
