package com.boot.foodApi.service;

import java.util.Map;

public interface foodService {
	// 데이터 동기화 (기존 시그니처)
    String syncFoodData() throws Exception; 
    
    // ✅ 목록 조회: sort, userLat, userLng를 모두 받음
    Map<String, Object> searchFood(String keyword, int page, int size, String sort, double userLat, double userLng) throws Exception;    
    // 상세 조회
    Map<String, Object> getFoodDetail(String id) throws Exception;
    
    // 조회수 증가
    void increaseViewCount(String id) throws Exception;
}
