package com.boot.search_histroy.service;

import java.util.List;

import com.boot.search_histroy.dto.SearchLogDTO;

public interface SearchLogService {
	 // 검색어 저장
    void saveSearchKeyword(SearchLogDTO dto);
    
    // 최근 검색어 조회
    List<SearchLogDTO> getRecentSearches(String accountId, int limit);
    
    // 개별 검색 기록 삭제
    void removeSearchLog(Long logId);
    
    // 전체 검색 기록 삭제
    void clearAllSearchLogs(String accountId);
}
