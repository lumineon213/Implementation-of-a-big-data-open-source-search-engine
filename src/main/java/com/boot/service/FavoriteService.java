package com.boot.service;

import java.util.List;

import com.boot.dto.FavoriteDTO;

public interface FavoriteService {
    
    // 목록 조회
    List<FavoriteDTO> getFavoriteList(String userId);
    
    // 추가
    void insertFavorite(FavoriteDTO favoriteDTO);
    
    // 삭제 (DTO가 아니라 int id만 받도록 수정)
    void deleteFavorite(int favId);

}