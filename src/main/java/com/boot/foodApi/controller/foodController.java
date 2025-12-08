package com.boot.foodApi.controller;


import com.boot.foodApi.service.foodService;

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
@RequestMapping("/api/food")
public class foodController {


	@Autowired
    private foodService foodService;
	
	@GetMapping("/save-data")
    @ResponseBody
    public String saveDataToSolr() {
        try {
            foodService.syncFoodData(); 
            return "Solr 데이터 저장 성공!";
        } catch (Exception e) {
            e.printStackTrace();
            return "저장 실패: " + e.getMessage();
        }
    }	
	
	
	@GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            // ▼▼▼ 정렬, 위도, 경도 파라미터 추가 및 기본값 설정 ▼▼▼
            @RequestParam(value = "sort", defaultValue = "name") String sort, 
            @RequestParam(value = "userLat", defaultValue = "0.0") double userLat, 
            @RequestParam(value = "userLng", defaultValue = "0.0") double userLng 
    ) {
        try {
            // ✅ Service 호출 시 모든 파라미터 전달
            Map<String, Object> result = foodService.searchFood(keyword, page, size);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("검색 실패: " + e.getMessage());
        }
    }
    
	@GetMapping("/{id}")
	public ResponseEntity<?> getFoodDetail(@PathVariable("id") String id) {
	    try {
	        Map<String, Object> result = foodService.getFoodDetail(id);
	        if (result == null) {
	            return ResponseEntity.notFound().build();
	        }
	        return ResponseEntity.ok(result);
	    } catch (Exception e) {
	        return ResponseEntity.internalServerError().body("조회 실패");
	    }
	}
	
	@GetMapping("/view/{id}")
    public ResponseEntity<?> increaseView(@PathVariable("id") String id) {
        try {
            foodService.increaseViewCount(id); 
            return ResponseEntity.ok("조회수 증가 성공");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("조회수 증가 실패: " + e.getMessage());
        }
    }
}