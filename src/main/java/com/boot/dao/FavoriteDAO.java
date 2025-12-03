package com.boot.dao;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import com.boot.dto.FavoriteDTO;

@Mapper
public interface FavoriteDAO {
    // 목록 조회
    List<FavoriteDTO> selectFavorites(String accountId);
    
    // 추가
    void insertFavorite(FavoriteDTO dto);
    
    // 삭제
    void deleteFavorite(FavoriteDTO dto);
}