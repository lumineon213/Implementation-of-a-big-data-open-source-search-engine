package com.boot.festival.service;

import java.util.Map;

public interface FestivalService {
	// 데이터 동기화
    String syncFestivalData() throws Exception; 
    
    // 목록 조회
    Map<String, Object> searchFestival(String keyword, int page, int size) throws Exception;    
    
    // 상세 조회
    Map<String, Object> getFestivalDetail(String id) throws Exception;
    
    // 조회수 증가 (DB 없이 Solr만 업데이트)
    void increaseViewCount(String id) throws Exception;
}