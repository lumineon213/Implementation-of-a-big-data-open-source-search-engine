package com.boot.urbanApi.service;

import java.util.Map;

public interface UrbanService {

    // Urban 데이터 Solr로 동기화
    String syncUrbanData() throws Exception;

    // Urban 관광 검색
    Map<String, Object> searchUrban(String keyword, int page, int size) throws Exception;
    
    Map<String, Object> getById(String id) throws Exception;

}
