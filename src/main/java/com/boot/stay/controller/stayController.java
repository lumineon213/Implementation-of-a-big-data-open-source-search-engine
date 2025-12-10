package com.boot.stay.controller;

import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.boot.stay.dto.stayDTO;
import com.boot.stay.service.stayService;

@RestController
@RequestMapping("/api/stay")
public class stayController {

    @Autowired
    private stayService stayService;

    // 1. 목록 동기화 (Python 스크립트 역할)
    @GetMapping("/save-data")
    public ResponseEntity<String> syncTourData() {
        try {
            String result = stayService.syncStayData();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("동기화 실패: " + e.getMessage());
        }
    }

    // 2. 목록 조회 및 검색 (Solr에서 조회)
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchStay(
            // 📌 [오류 해결] 모든 @RequestParam에 name을 명시하여 파라미터 이름을 인식시킵니다.
            @RequestParam(required = false, name = "keyword") String keyword,
            @RequestParam(defaultValue = "1", name = "page") int page,
            @RequestParam(defaultValue = "10", name = "size") int size) {
        try {
            return ResponseEntity.ok(stayService.searchStay(keyword, page, size));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<stayDTO> getStayDetail(
        @PathVariable(name = "id") String id
    ) {
        // 📌 로그 확인 (Security 문제 해결되었으므로 이제 찍힐 것임)
        System.out.println(">>> [Controller 수신] 상세 보기 요청 ID: " + id); 
        
        try {
        	stayDTO stay = stayService.getStayDetail(id);

            if (stay != null) {
                return ResponseEntity.ok(stay); 
            } else {
                return ResponseEntity.status(404).body(null);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(null);
        }
    }
}