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
    @ResponseBody // 화면(JSP) 없이 글자만 띄울 때 사용
    public String saveDataToSolr() {
        try {
            // 서비스에 만들어둔 저장 기능 실행!
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
            @RequestParam(value = "page", defaultValue = "1") int page,  // 기본 1페이지
            @RequestParam(value = "size", defaultValue = "10") int size  // 기본 10개씩
    ) {
        try {
            // 수정된 서비스 호출
            Map<String, Object> result = foodService.searchFood(keyword, page, size);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("검색 실패: " + e.getMessage());
        }
    }
	// [3] 상세 조회 API
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
            // Service의 increaseViewCount(id) 호출
            foodService.increaseViewCount(id); 
            return ResponseEntity.ok("조회수 증가 성공");
        } catch (Exception e) {
            e.printStackTrace();
            // Service단에서 Solr 문제가 발생했을 수 있음
            return ResponseEntity.internalServerError().body("조회수 증가 실패: " + e.getMessage());
        }
    }
}
