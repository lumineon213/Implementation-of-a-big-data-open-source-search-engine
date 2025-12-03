package com.boot.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.boot.dto.FavoriteDTO;
import com.boot.service.FavoriteService;

@RestController
@RequestMapping("/api/favorite")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    // 즐겨찾기 목록 조회
    @GetMapping("/list")
    public List<FavoriteDTO> getFavoriteList(@RequestParam String userId) {
        return favoriteService.getFavoriteList(userId);
    }

    // 즐겨찾기 추가
    @PostMapping("/add")
    public FavoriteDTO addFavorite(@RequestBody FavoriteDTO favoriteDTO) {
        favoriteService.insertFavorite(favoriteDTO);
        return favoriteDTO; // 생성된 PK(favId)가 담겨서 반환됨
    }

    // 즐겨찾기 삭제 (int 타입의 ID를 받아서 서비스로 넘김)
    @DeleteMapping("/delete/{favId}")
    public void deleteFavorite(@PathVariable int favId) {
        favoriteService.deleteFavorite(favId);
    }
}