package com.boot.shoppingApi.controller;

import com.boot.shoppingApi.service.ShoppingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/shopping")
public class ShoppingController {

    @Autowired
    private ShoppingService shoppingService;

    /**
     * 쇼핑 데이터 저장
     */
    @GetMapping("/save-data")
    public ResponseEntity<?> saveData() {
        try {
            String msg = shoppingService.syncShoppingData();
            return ResponseEntity.ok(msg);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("저장 실패: " + e.getMessage());
        }
    }

    /**
     * 쇼핑 검색
     */
    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        try {
            Map<String, Object> result = shoppingService.searchShopping(keyword, page, size);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("검색 실패: " + e.getMessage());
        }
    }
}
