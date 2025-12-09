package com.boot.festival.controller;

import com.boot.festival.service.FestivalService;

import java.util.HashMap;
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
@RequestMapping("/api/festival") 
public class FestivalController {

	@Autowired
    private FestivalService festivalService;
	
	@GetMapping("/save-data")
	public ResponseEntity<Map<String, Object>> saveDataToSolr() {
	    Map<String, Object> response = new HashMap<>();
	    try {
	        String result = festivalService.syncFestivalData();
	        response.put("success", true);
	        response.put("message", result);
	        return ResponseEntity.ok(response);  // 자동으로 application/json
	    } catch (Exception e) {
	        e.printStackTrace();
	        response.put("success", false);
	        response.put("message", "저장 실패: " + e.getMessage());
	        return ResponseEntity.status(500).body(response);
	    }
	}
	
	@GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sort", defaultValue = "date") String sort 
    ) {
        try {
            Map<String, Object> result = festivalService.searchFestival(keyword, page, size);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("축제 검색 실패: " + e.getMessage());
        }
    }
    
	@GetMapping("/{id}")
	public ResponseEntity<?> getFestivalDetail(@PathVariable("id") String id) {
	    try {
	        Map<String, Object> result = festivalService.getFestivalDetail(id);
	        if (result == null) {
	            return ResponseEntity.notFound().build();
	        }
	        return ResponseEntity.ok(result);
	    } catch (Exception e) {
	        return ResponseEntity.internalServerError().body("축제 상세 조회 실패");
	    }
	}
	
	@GetMapping("/view/{id}")
    public ResponseEntity<?> increaseView(@PathVariable("id") String id) {
        try {
            festivalService.increaseViewCount(id); 
            return ResponseEntity.ok("조회수 증가 성공");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("조회수 증가 실패: " + e.getMessage());
        }
    }
}