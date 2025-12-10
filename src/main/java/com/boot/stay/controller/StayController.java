package com.boot.stay.controller;

import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.boot.stay.service.StayService;

@RestController
@RequestMapping("/api/stay")
public class StayController {

    @Autowired
    private StayService stayService;

    // 1. 목록 동기화 (Python 스크립트 역할)
    @GetMapping("/sync-tour-data")
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

    // 3. 상세 정보 조회 (DB + Solr에서 조회)
    @GetMapping("/view/{id}")
    public ResponseEntity<Map<String, Object>> getStayDetail(@PathVariable String id) {
        try {
            // 1. 조회수 증가 (Solr에 반영)
            stayService.increaseViewCount(id);

            // 2. 상세 데이터 가져오기 (DB에서 상세정보, Solr에서 조회수)
            Map<String, Object> stay = stayService.getStayDetail(id);

            if (stay != null) {
                return ResponseEntity.ok(stay);
            } else {
                // 데이터가 없을 경우 404 NOT FOUND 반환
                return ResponseEntity.status(404).body(null);
            }
        } catch (Exception e) {
            e.printStackTrace();
            // 서버 내부 에러 발생 시 500 INTERNAL SERVER ERROR 반환
            return ResponseEntity.internalServerError().body(null);
        }
    }
}