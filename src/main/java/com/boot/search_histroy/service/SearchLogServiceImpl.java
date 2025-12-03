package com.boot.search_histroy.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.search_histroy.dao.SearchLogDAO;
import com.boot.search_histroy.dto.SearchLogDTO;

@Service
@Transactional
public class SearchLogServiceImpl implements SearchLogService {

    @Autowired
    private SearchLogDAO searchLogDAO;

    // 검색어 저장
    @Override
    public void saveSearchKeyword(SearchLogDTO dto) {
        // 중복 체크 로직 추가 가능 (선택사항)
        // 예: 같은 사용자가 10초 이내 동일 검색어 입력 시 저장 안함
        searchLogDAO.insertSearchLog(dto);
    }

    // 최근 검색어 조회 (기본 10개)
    @Override
    public List<SearchLogDTO> getRecentSearches(String accountId, int limit) {
        if (limit <= 0) {
            limit = 10; // 기본값
        }
        System.out.println("서비스 - 검색 기록 조회: accountId=" + accountId + ", limit=" + limit);
        List<SearchLogDTO> result = searchLogDAO.selectRecentSearches(accountId, limit);
        System.out.println("서비스 - 조회 결과 개수: " + (result != null ? result.size() : 0));
        return result;
    }

    // 개별 검색 기록 삭제
    @Override
    public void removeSearchLog(Long logId) {
        System.out.println("서비스 - 검색 기록 삭제: logId=" + logId);
        try {
            searchLogDAO.deleteSearchLog(logId);
            System.out.println("서비스 - 삭제 완료");
        } catch (Exception e) {
            System.err.println("서비스 - 삭제 중 오류: " + e.getMessage());
            throw e;
        }
    }

    // 전체 검색 기록 삭제
    @Override
    public void clearAllSearchLogs(String accountId) {
        searchLogDAO.deleteAllSearchLogs(accountId);
    }
}