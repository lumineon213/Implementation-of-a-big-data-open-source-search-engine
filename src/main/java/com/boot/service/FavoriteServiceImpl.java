package com.boot.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.dao.FavoriteDAO;
import com.boot.dto.FavoriteDTO;

@Service
public class FavoriteServiceImpl implements FavoriteService {

    @Autowired
    private FavoriteDAO favoriteDAO;

    @Override
    public List<FavoriteDTO> getFavoriteList(String userId) {
        return favoriteDAO.selectFavorites(userId);
    }

    @Override
    public void insertFavorite(FavoriteDTO favoriteDTO) {
        favoriteDAO.insertFavorite(favoriteDTO);
    }

    @Override
    public void deleteFavorite(int favId) {
<<<<<<< Updated upstream
        // 컨트롤러에서 받은 int ID를 그대로 DAO에 넘깁니다.
        favoriteDAO.deleteFavorite(favId);
=======
        // 컨트롤러에서 받은 int ID를 DTO로 변환하여 DAO에 넘깁니다.
        FavoriteDTO dto = new FavoriteDTO();
        dto.setFavId(favId);
        favoriteDAO.deleteFavorite(dto);
>>>>>>> Stashed changes
    }
}