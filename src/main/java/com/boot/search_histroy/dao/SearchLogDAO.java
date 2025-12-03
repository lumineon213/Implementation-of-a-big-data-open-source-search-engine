package com.boot.search_histroy.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.boot.search_histroy.dto.SearchLogDTO;

@Mapper
public interface SearchLogDAO {
    void insertSearchLog(SearchLogDTO dto);
    List<SearchLogDTO> selectRecentSearches(@Param("accountId") String accountId, @Param("limit") int limit);
    void deleteSearchLog(Long logId);
    void deleteAllSearchLogs(@Param("accountId") String accountId);
}