package com.boot.themeApi.controller;

import com.boot.themeApi.service.ThemeService;
import com.boot.walkApi.service.WalkService;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/theme")
public class ThemeController {

    @Autowired
    private ThemeService themeService;

    @GetMapping("/save-data")
    public String save() throws Exception {
        return themeService.syncThemeData();
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "9") int size
    ) {
        try {
            return ResponseEntity.ok(
                themeService.searchTheme(keyword, page, size)
            );
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> detail(@PathVariable("id") String id) {
        try {
            Map<String, Object> result = themeService.getById(id);
            if (result == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("조회 실패: " + e.getMessage());
        }
    }

}

