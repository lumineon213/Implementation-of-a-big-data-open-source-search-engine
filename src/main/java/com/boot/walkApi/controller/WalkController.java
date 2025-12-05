package com.boot.walkApi.controller;

import com.boot.walkApi.service.WalkService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/walk")
public class WalkController {

    @Autowired
    private WalkService walkService;

    @GetMapping("/save-data")
    public String saveData() {
        try {
            return walkService.syncWalkData();
        } catch (Exception e) {
            return "저장 실패: " + e.getMessage();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam(required = false) String keyword) {
        try {
            return ResponseEntity.ok(walkService.searchWalk(keyword));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("검색 실패: " + e.getMessage());
        }
    }
}
