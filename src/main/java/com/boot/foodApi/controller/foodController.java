package com.boot.foodApi.controller;


import com.boot.foodApi.service.foodService;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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
}
