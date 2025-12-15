package com.boot.solr.controller;

import com.boot.solr.service.UnifiedSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/solr")
@CrossOrigin(origins = "http://localhost:5173")
public class SolrSearchController {

    @Autowired
    private UnifiedSearchService unifiedSearchService;

    /**
     * 통합 검색 API
     * 모든 Solr 코어에서 검색하고 결과를 합쳐서 반환
     */
    @GetMapping("/search")
    public ResponseEntity<?> unifiedSearch(
            @RequestParam(name = "query", required = false, defaultValue = "*:*") String query,
            @RequestParam(name = "rows", defaultValue = "100") int rows
    ) {
        try {
            Map<String, Object> result = unifiedSearchService.unifiedSearch(query, rows);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "검색 실패", "message", e.getMessage()));
        }
    }

    /**
     * 검색어 제안 API
     * 입력된 검색어로 시작하는 제목들을 반환
     */
    @GetMapping("/suggestions")
    public ResponseEntity<?> getSuggestions(
            @RequestParam(name = "q", required = false, defaultValue = "") String query,
            @RequestParam(name = "limit", defaultValue = "10") int limit
    ) {
        try {
            java.util.List<String> suggestions = unifiedSearchService.getSearchSuggestions(query, limit);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "제안 조회 실패", "message", e.getMessage()));
        }
    }
}

