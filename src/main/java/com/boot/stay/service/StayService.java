package com.boot.stay.service;

import java.util.Map;

public interface StayService {
    // Tour API 데이터 동기화 (기본 목록: 제목, 주소, 사진, 좌표)
    String syncStayData() throws Exception; 
    
    // 목록 조회 (검색 및 페이징)
    Map<String, Object> searchStay(String keyword, int page, int size) throws Exception;
    
    // 상세 조회 (지연 로딩: 상세 설명이 없으면 detailCommon2 API 호출 후 Solr 업데이트)
    Map<String, Object> getStayDetail(String id) throws Exception;
    
    // 조회수 증가
    void increaseViewCount(String id) throws Exception;
}